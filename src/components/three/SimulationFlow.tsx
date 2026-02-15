import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCircuitStore } from '../../store/circuitStore';
import { QUBIT_SPACING, STEP_SPACING } from '../../lib/constants';
import { phaseToHue } from '../../lib/quantumSim';

function qubitToY(qubitIndex: number, totalQubits: number): number {
  return (totalQubits - 1) / 2 * QUBIT_SPACING - qubitIndex * QUBIT_SPACING;
}

const PULSE_SPEED = 4;
const PULSE_SIZE = 0.15;

interface PulseData {
  qubit: number;
  startZ: number;
  endZ: number;
  color: THREE.Color;
  delay: number;
  split: boolean;
}

export function SimulationFlow() {
  const qubits = useCircuitStore((s) => s.qubits);
  const gates = useCircuitStore((s) => s.gates);
  const simulation = useCircuitStore((s) => s.simulation);
  const advanceSimulation = useCircuitStore((s) => s.advanceSimulation);

  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const glowRefs = useRef<(THREE.Mesh | null)[]>([]);
  const timeRef = useRef(0);
  const lastAdvanceRef = useRef(-1);
  const prevStepRef = useRef(-1);

  // Build pulse paths based on circuit
  const pulses = useMemo<PulseData[]>(() => {
    if (simulation === 'idle') return [];

    const result: PulseData[] = [];
    const maxStep = gates.length > 0 ? Math.max(...gates.map((g) => g.step)) : 0;

    const inSuperposition = new Set<number>();

    for (let q = 0; q < qubits; q++) {
      const hGates = gates.filter((g) => g.type === 'h' && g.targets.includes(q));
      if (hGates.length > 0) {
        inSuperposition.add(q);
      }

      result.push({
        qubit: q,
        startZ: -2,
        endZ: (maxStep + 2) * STEP_SPACING,
        color: new THREE.Color(inSuperposition.has(q) ? '#22d3ee' : '#64748b'),
        delay: q * 0.15,
        split: inSuperposition.has(q),
      });
    }

    return result;
  }, [simulation, gates, qubits]);

  useFrame((_, delta) => {
    if (simulation !== 'running' && simulation !== 'complete') {
      timeRef.current = 0;
      lastAdvanceRef.current = -1;
      return;
    }

    // Read speed and paused state
    const { simulationSpeed, simulationPaused, walkthroughPaused, guidedMode, stepStates, simulationStep } = useCircuitStore.getState();

    const effectivelyPaused = simulationPaused || walkthroughPaused;

    // Detect manual step change (user clicked Previous or Next while paused)
    if (simulationStep !== prevStepRef.current && effectivelyPaused) {
      const startZ = -2;
      const maxDelay = (qubits - 1) * 0.15;
      timeRef.current = (simulationStep * STEP_SPACING + startZ + STEP_SPACING * 0.5) / PULSE_SPEED + maxDelay;
      lastAdvanceRef.current = simulationStep;
    }
    prevStepRef.current = simulationStep;

    if (!effectivelyPaused) {
      timeRef.current += delta * simulationSpeed;
    }

    // Advance simulation step based on pulse position
    const maxStep = gates.length > 0 ? Math.max(...gates.map((g) => g.step)) : 0;
    const currentZ = timeRef.current * PULSE_SPEED - 2;
    const currentStep = Math.floor(currentZ / STEP_SPACING);

    if (currentStep > lastAdvanceRef.current && currentStep <= maxStep + 1 && !effectivelyPaused) {
      lastAdvanceRef.current = currentStep;
      advanceSimulation();

      // In guided mode, auto-pause at each new step boundary
      if (guidedMode && currentStep <= maxStep) {
        useCircuitStore.setState({ walkthroughPaused: true });
      }
    }

    // Get current step state for amplitude and phase
    const currentState = stepStates.find((s) => s.step === simulationStep)
      ?? stepStates.find((s) => s.step <= simulationStep && s.step >= 0)
      ?? stepStates[0];

    // Update pulse positions
    for (let i = 0; i < pulses.length; i++) {
      const pulse = pulses[i];
      const mesh = meshRefs.current[i * 2];
      const meshSplit = meshRefs.current[i * 2 + 1];
      const glow = glowRefs.current[i * 2];
      const glowSplit = glowRefs.current[i * 2 + 1];

      if (!mesh) continue;

      const y = qubitToY(pulse.qubit, qubits);
      const z = (timeRef.current - pulse.delay) * PULSE_SPEED + pulse.startZ;
      const progress = Math.max(0, Math.min(1, (z - pulse.startZ) / (pulse.endZ - pulse.startZ)));

      const clampedZ = Math.max(pulse.startZ, Math.min(pulse.endZ, z));

      // Amplitude modulates pulse size
      const amplitude = currentState?.qubitAmplitudes[pulse.qubit] ?? 0.5;
      const phaseAngle = currentState?.qubitPhases[pulse.qubit] ?? 0;
      const sizeMultiplier = 0.5 + amplitude * 1.5;

      // Phase drives color
      const hue = phaseToHue(phaseAngle);
      const phaseColor = new THREE.Color().setHSL(hue / 360, 0.7, 0.55);

      // Main pulse
      mesh.position.set(0, y, clampedZ);
      const scale = progress > 0 && progress < 1 ? PULSE_SIZE * sizeMultiplier : 0.001;
      mesh.scale.setScalar(scale);
      const mainMat = mesh.material as THREE.MeshStandardMaterial;
      mainMat.color.copy(phaseColor);
      mainMat.emissive.copy(phaseColor);

      if (glow) {
        glow.position.set(0, y, clampedZ);
        glow.scale.setScalar(scale * 3);
        const glowMat = glow.material as THREE.MeshStandardMaterial;
        glowMat.opacity = 0.12 + Math.sin(timeRef.current * 8) * 0.03;
        glowMat.color.copy(phaseColor);
        glowMat.emissive.copy(phaseColor);
      }

      // Split pulse (for superposition) — complementary phase color
      if (meshSplit && pulse.split) {
        const hGate = gates.find((g) => g.type === 'h' && g.targets.includes(pulse.qubit));
        const hStep = hGate ? hGate.step : 0;
        const splitZ = hStep * STEP_SPACING;

        if (clampedZ > splitZ) {
          const offset = Math.sin(timeRef.current * 3 + pulse.qubit) * 0.25;
          meshSplit.position.set(offset, y + offset * 0.3, clampedZ - 0.3);
          meshSplit.scale.setScalar(scale * 0.7);

          // Complementary phase color
          const compHue = (hue + 180) % 360;
          const compColor = new THREE.Color().setHSL(compHue / 360, 0.6, 0.5);
          const splitMat = meshSplit.material as THREE.MeshStandardMaterial;
          splitMat.color.copy(compColor);
          splitMat.emissive.copy(compColor);

          if (glowSplit) {
            glowSplit.position.set(offset, y + offset * 0.3, clampedZ - 0.3);
            glowSplit.scale.setScalar(scale * 2);
            const glowSplitMat = glowSplit.material as THREE.MeshStandardMaterial;
            glowSplitMat.opacity = 0.08 + Math.sin(timeRef.current * 6 + 1) * 0.03;
            glowSplitMat.color.copy(compColor);
            glowSplitMat.emissive.copy(compColor);
          }
        } else {
          meshSplit.scale.setScalar(0.001);
          if (glowSplit) glowSplit.scale.setScalar(0.001);
        }
      } else if (meshSplit) {
        meshSplit.scale.setScalar(0.001);
        if (glowSplit) glowSplit.scale.setScalar(0.001);
      }
    }
  });

  if (simulation === 'idle') return null;

  return (
    <group>
      {pulses.map((pulse, i) => (
        <group key={i}>
          {/* Main pulse */}
          <mesh ref={(el) => { meshRefs.current[i * 2] = el; }}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial
              color={pulse.color}
              emissive={pulse.color}
              emissiveIntensity={2}
              transparent
              opacity={0.85}
            />
          </mesh>
          {/* Main glow */}
          <mesh ref={(el) => { glowRefs.current[i * 2] = el; }}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial
              color={pulse.color}
              emissive={pulse.color}
              emissiveIntensity={0.6}
              transparent
              opacity={0.12}
            />
          </mesh>
          {/* Split pulse (superposition) */}
          <mesh ref={(el) => { meshRefs.current[i * 2 + 1] = el; }}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial
              color="#94a3b8"
              emissive="#94a3b8"
              emissiveIntensity={1.2}
              transparent
              opacity={0.45}
            />
          </mesh>
          {/* Split glow */}
          <mesh ref={(el) => { glowRefs.current[i * 2 + 1] = el; }}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial
              color="#94a3b8"
              emissive="#94a3b8"
              emissiveIntensity={0.4}
              transparent
              opacity={0.08}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
