import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useCircuitStore } from '../../store/circuitStore';
import { STEP_SPACING } from '../../lib/constants';
import { phaseToHue } from '../../lib/quantumSim';
import { marginalizeWorkRegister } from '../../lib/resultInterpreter';

function WaveSurface({
  significantProbs,
  totalWidth,
  startX,
  phases,
  outputProbabilities,
}: {
  significantProbs: { probability: number; label: string; state: string }[];
  totalWidth: number;
  startX: number;
  phases: number[];
  outputProbabilities: { probability: number; label: string; state: string }[];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const animRef = useRef({ startTime: 0, started: false });

  const segmentsX = 64;
  const segmentsZ = 16;
  const width = totalWidth + 2;
  const depth = 3;

  const { geometry, columnPositions, columnData } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, depth, segmentsX, segmentsZ);

    // Pre-compute column positions and their data
    const colPositions: number[] = [];
    const colData: { probability: number; hue: number }[] = [];

    for (let i = 0; i < significantProbs.length; i++) {
      const x = startX + i * 1.2;
      colPositions.push(x);
      const origIdx = outputProbabilities.indexOf(significantProbs[i]);
      const phase = phases[origIdx] ?? 0;
      colData.push({
        probability: significantProbs[i].probability,
        hue: phaseToHue(phase),
      });
    }

    // Set vertex colors based on interpolated phase
    const posAttr = geo.getAttribute('position');
    const count = posAttr.count;
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const vx = posAttr.getX(i);

      let leftIdx = -1;
      let rightIdx = -1;
      for (let c = 0; c < colPositions.length; c++) {
        if (colPositions[c] <= vx) leftIdx = c;
        if (colPositions[c] >= vx && rightIdx === -1) rightIdx = c;
      }

      let hue = 240;
      if (leftIdx >= 0 && rightIdx >= 0 && leftIdx !== rightIdx) {
        const t = (vx - colPositions[leftIdx]) / (colPositions[rightIdx] - colPositions[leftIdx]);
        const ct = (1 - Math.cos(t * Math.PI)) / 2;
        hue = colData[leftIdx].hue * (1 - ct) + colData[rightIdx].hue * ct;
      } else if (leftIdx >= 0) {
        hue = colData[leftIdx].hue;
      } else if (rightIdx >= 0) {
        hue = colData[rightIdx].hue;
      }

      const color = new THREE.Color().setHSL(hue / 360, 0.6, 0.45);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return { geometry: geo, columnPositions: colPositions, columnData: colData };
  }, [significantProbs, totalWidth, startX, phases, outputProbabilities, width, depth]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const { simulation } = useCircuitStore.getState();
    if (simulation === 'idle') {
      animRef.current.started = false;
      return;
    }

    if (!animRef.current.started) {
      animRef.current.startTime = state.clock.elapsedTime;
      animRef.current.started = true;
    }

    const elapsed = state.clock.elapsedTime - animRef.current.startTime;
    const posAttr = geometry.getAttribute('position');
    const count = posAttr.count;

    for (let i = 0; i < count; i++) {
      const vx = posAttr.getX(i);

      let leftIdx = -1;
      let rightIdx = -1;
      for (let c = 0; c < columnPositions.length; c++) {
        if (columnPositions[c] <= vx) leftIdx = c;
        if (columnPositions[c] >= vx && rightIdx === -1) rightIdx = c;
      }

      let height = 0;
      if (leftIdx >= 0 && rightIdx >= 0 && leftIdx !== rightIdx) {
        const t = (vx - columnPositions[leftIdx]) / (columnPositions[rightIdx] - columnPositions[leftIdx]);
        const ct = (1 - Math.cos(t * Math.PI)) / 2;
        height = columnData[leftIdx].probability * (1 - ct) + columnData[rightIdx].probability * ct;
      } else if (leftIdx >= 0) {
        const dist = Math.abs(vx - columnPositions[leftIdx]);
        height = columnData[leftIdx].probability * Math.max(0, 1 - dist / 1.5);
      } else if (rightIdx >= 0) {
        const dist = Math.abs(vx - columnPositions[rightIdx]);
        height = columnData[rightIdx].probability * Math.max(0, 1 - dist / 1.5);
      }

      const targetZ = height * 5;

      const nearestCol = leftIdx >= 0 ? leftIdx : (rightIdx >= 0 ? rightIdx : 0);
      const delay = nearestCol * 0.08;
      const t = Math.max(0, Math.min(1, (elapsed - delay) / 0.8));
      const eased = 1 - Math.pow(1 - t, 3);

      posAttr.setZ(i, targetZ * eased);
    }

    posAttr.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial
        vertexColors
        transparent
        opacity={0.35}
        side={THREE.DoubleSide}
        roughness={0.6}
        metalness={0.1}
      />
    </mesh>
  );
}

export function InterferencePattern() {
  const simulation = useCircuitStore((s) => s.simulation);
  const outputProbabilities = useCircuitStore((s) => s.outputProbabilities);
  const simulationMaxStep = useCircuitStore((s) => s.simulationMaxStep);
  const simulationStep = useCircuitStore((s) => s.simulationStep);
  const stepStates = useCircuitStore((s) => s.stepStates);
  const detectedAlgorithm = useCircuitStore((s) => s.detectedAlgorithm);
  const groupRef = useRef<THREE.Group>(null);
  const columnsRef = useRef<(THREE.Mesh | null)[]>([]);
  const animRef = useRef({ startTime: 0, started: false });

  const zBase = (simulationMaxStep + 3) * STEP_SPACING;

  // For Shor's, marginalize work register to show only counting-register bars
  const displayProbs = useMemo(() => {
    if (detectedAlgorithm === "Shor's Algorithm" && outputProbabilities.length === 256) {
      return marginalizeWorkRegister(outputProbabilities, 4, 4);
    }
    return outputProbabilities;
  }, [outputProbabilities, detectedAlgorithm]);

  // During running, use current step probabilities; on complete, use final
  const currentProbs = useMemo(() => {
    if (simulation === 'complete') return displayProbs;
    if (simulation === 'running' && stepStates.length > 0) {
      const currentState = stepStates.find((s) => s.step === simulationStep)
        ?? stepStates.find((s) => s.step <= simulationStep && s.step >= 0)
        ?? stepStates[0];
      if (currentState) {
        const probs = currentState.probabilities;
        if (detectedAlgorithm === "Shor's Algorithm" && probs.length === 256) {
          return marginalizeWorkRegister(probs, 4, 4);
        }
        return probs;
      }
    }
    return displayProbs;
  }, [simulation, simulationStep, stepStates, displayProbs, detectedAlgorithm]);

  // Get phases from the final state (or current state during running)
  const phases = useMemo(() => {
    if (stepStates.length === 0) return [];
    const stateToUse = simulation === 'complete'
      ? stepStates[stepStates.length - 1]
      : (stepStates.find((s) => s.step === simulationStep)
        ?? stepStates.find((s) => s.step <= simulationStep && s.step >= 0)
        ?? stepStates[0]);
    if (!stateToUse) return [];

    if (detectedAlgorithm === "Shor's Algorithm" && stateToUse.stateReal.length === 256) {
      // Compute phases for marginalized counting register
      const countingBits = 4;
      const workBits = 4;
      const countingSize = 1 << countingBits;
      const workSize = 1 << workBits;
      const result: number[] = [];
      for (let c = 0; c < countingSize; c++) {
        let maxProb = 0;
        let bestPhase = 0;
        for (let w = 0; w < workSize; w++) {
          const idx = (c << workBits) | w;
          const re = stateToUse.stateReal[idx];
          const im = stateToUse.stateImag[idx];
          const prob = re * re + im * im;
          if (prob > maxProb) {
            maxProb = prob;
            bestPhase = Math.atan2(im, re);
          }
        }
        result.push(bestPhase);
      }
      return result;
    }

    return currentProbs.map((_, i) => {
      if (i >= stateToUse.stateReal.length) return 0;
      const re = stateToUse.stateReal[i];
      const im = stateToUse.stateImag[i];
      return Math.atan2(im, re);
    });
  }, [stepStates, currentProbs, simulation, simulationStep, detectedAlgorithm]);

  const significantProbs = useMemo(
    () => currentProbs.filter((p) => p.probability > 0.001),
    [currentProbs]
  );

  // Check for period peaks in Shor's
  const shorAnnotation = useMemo(() => {
    if (detectedAlgorithm !== "Shor's Algorithm") return null;
    // Peaks at 0, 4, 8, 12 for period r=4
    const peaks = [0, 4, 8, 12];
    const peakLabels = peaks.map((p) => p.toString(2).padStart(4, '0'));
    const peakProbs = significantProbs.filter((p) => peakLabels.includes(p.label));
    if (peakProbs.length >= 3) {
      return 'Period = 4';
    }
    return null;
  }, [detectedAlgorithm, significantProbs]);

  useFrame((state) => {
    if (simulation === 'idle') {
      animRef.current.started = false;
      return;
    }

    if (!animRef.current.started) {
      animRef.current.startTime = state.clock.elapsedTime;
      animRef.current.started = true;
    }

    const elapsed = state.clock.elapsedTime - animRef.current.startTime;

    for (let i = 0; i < significantProbs.length; i++) {
      const mesh = columnsRef.current[i];
      if (!mesh) continue;

      const prob = significantProbs[i].probability;
      const targetHeight = prob * 5;
      const delay = i * 0.08;
      const t = Math.max(0, Math.min(1, (elapsed - delay) / 0.6));
      const eased = 1 - Math.pow(1 - t, 3);
      const currentHeight = targetHeight * eased;

      mesh.scale.set(1, Math.max(0.001, currentHeight), 1);
      mesh.position.y = currentHeight / 2;
    }
  });

  // Show during running and complete (progressive visibility)
  if (simulation === 'idle' || significantProbs.length === 0) return null;

  const totalWidth = significantProbs.length * 1.2;
  const startX = -totalWidth / 2 + 0.6;

  return (
    <group ref={groupRef} position={[0, -1.5, zBase]}>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[totalWidth + 2, 3]} />
        <meshStandardMaterial
          color="#161820"
          transparent
          opacity={0.6}
          roughness={0.9}
        />
      </mesh>

      {/* Wave surface */}
      <WaveSurface
        significantProbs={significantProbs}
        totalWidth={totalWidth}
        startX={startX}
        phases={phases}
        outputProbabilities={currentProbs}
      />

      {/* Title */}
      <Text
        position={[0, 6, 0]}
        fontSize={0.35}
        color="#9b9db0"
        anchorX="center"
        anchorY="bottom"
        font={undefined}
      >
        Measurement Outcome Probabilities
      </Text>

      {/* Shor's period annotation */}
      {shorAnnotation && (
        <Text
          position={[0, 5.5, 0]}
          fontSize={0.25}
          color="#818cf8"
          anchorX="center"
          anchorY="bottom"
          font={undefined}
        >
          {shorAnnotation}
        </Text>
      )}

      {/* Columns */}
      {significantProbs.map((prob, i) => {
        const x = startX + i * 1.2;
        const origIdx = currentProbs.indexOf(prob);
        const phase = phases[origIdx] ?? 0;
        const hue = phaseToHue(phase);
        const color = new THREE.Color(`hsl(${hue}, 65%, 50%)`);
        const emissiveIntensity = 0.3 + prob.probability * 0.8;

        return (
          <group key={prob.label} position={[x, 0, 0]}>
            {/* Column */}
            <mesh
              ref={(el) => { columnsRef.current[i] = el; }}
              position={[0, 0, 0]}
            >
              <cylinderGeometry args={[0.35, 0.35, 1, 24]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={emissiveIntensity}
                transparent
                opacity={0.85}
                roughness={0.4}
                metalness={0.3}
              />
            </mesh>

            {/* Base label */}
            <Text
              position={[0, -0.3, 0.5]}
              fontSize={0.22}
              color="#9b9db0"
              anchorX="center"
              anchorY="top"
              font={undefined}
            >
              {prob.state}
            </Text>

            {/* Percentage above column */}
            <Text
              position={[0, prob.probability * 5 + 0.3, 0]}
              fontSize={0.2}
              color="#e8e9ed"
              anchorX="center"
              anchorY="bottom"
              font={undefined}
            >
              {`${(prob.probability * 100).toFixed(1)}%`}
            </Text>
          </group>
        );
      })}
    </group>
  );
}
