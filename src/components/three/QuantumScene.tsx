import { useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { QubitRail } from './QubitRail';
import { GateFactory } from './gates/GateFactory';
import { EntanglementBeam } from './EntanglementBeam';
import { ParticleFlow } from './ParticleFlow';
import { SimulationFlow } from './SimulationFlow';
import { InterferencePattern } from './InterferencePattern';
import { GateAnnotation } from './GateAnnotation';
import { BlochSpherePanel } from './BlochSpherePanel';
import { ProbabilityWave } from './ProbabilityWave';
import { ResultDisplay3D } from './ResultDisplay3D';
import { useCircuitStore } from '../../store/circuitStore';
import {
  BACKGROUND_COLOR,
  BLOOM_INTENSITY,
  BLOOM_LUMINANCE_THRESHOLD,
  BLOOM_LUMINANCE_SMOOTHING,
  QUBIT_SPACING,
  STEP_SPACING,
} from '../../lib/constants';

function qubitToY(qubitIndex: number, totalQubits: number): number {
  return ((totalQubits - 1) / 2) * QUBIT_SPACING - qubitIndex * QUBIT_SPACING;
}

function CameraController() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const simulation = useCircuitStore((s) => s.simulation);
  const simulationMaxStep = useCircuitStore((s) => s.simulationMaxStep);
  const targetRef = useRef(new THREE.Vector3(0, 0, 8));
  const camPosRef = useRef<THREE.Vector3 | null>(null);
  const animating = useRef(false);
  const lastFocusedStep = useRef(-1);

  useEffect(() => {
    if (simulation === 'complete') {
      const endZ = (simulationMaxStep + 3) * STEP_SPACING;
      targetRef.current.set(0, 0, endZ * 0.6);
      camPosRef.current = null;
      animating.current = true;
      lastFocusedStep.current = -1;
    } else if (simulation === 'idle') {
      targetRef.current.set(0, 0, 8);
      camPosRef.current = null;
      animating.current = true;
      lastFocusedStep.current = -1;
    }
  }, [simulation, simulationMaxStep]);

  // Guided mode: focus camera on active gate once per step change
  useFrame(() => {
    const {
      guidedMode,
      walkthroughPaused,
      simulation: sim,
      simulationStep,
      gates,
      qubits,
    } = useCircuitStore.getState();

    if (guidedMode && walkthroughPaused && sim === 'running' && simulationStep !== lastFocusedStep.current) {
      lastFocusedStep.current = simulationStep;
      const gatesAtStep = gates.filter((g) => g.step === simulationStep);
      if (gatesAtStep.length > 0) {
        const allTargets = gatesAtStep.flatMap((g) => [
          ...g.targets,
          ...(g.controls ?? []),
        ]);
        const avgQubit =
          allTargets.reduce((sum, q) => sum + q, 0) / allTargets.length;
        const gateY = qubitToY(avgQubit, qubits);
        const gateZ = simulationStep * STEP_SPACING;

        targetRef.current.set(0, gateY, gateZ);
        camPosRef.current = new THREE.Vector3(8, gateY + 3, gateZ - 5);
        animating.current = true;
      }
    }

    // Lerp controls target
    if (animating.current && controlsRef.current?.target) {
      const controls = controlsRef.current;
      controls.target.lerp(targetRef.current, 0.05);

      if (camPosRef.current) {
        camera.position.lerp(camPosRef.current, 0.05);
      }

      const dist = controls.target.distanceTo(targetRef.current);
      const camDist = camPosRef.current
        ? camera.position.distanceTo(camPosRef.current)
        : 0;
      if (dist < 0.05 && camDist < 0.05) {
        controls.target.copy(targetRef.current);
        if (camPosRef.current) camera.position.copy(camPosRef.current);
        animating.current = false;
      }
      controls.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      minDistance={1}
      maxDistance={500}
      enablePan
      target={[0, 0, 8]}
      touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
    />
  );
}

function SceneContent() {
  const qubits = useCircuitStore((s) => s.qubits);
  const gates = useCircuitStore((s) => s.gates);

  return (
    <>
      {/* Lighting — balanced for dark canvas */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, -5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-10, -5, 15]} intensity={0.4} color="#c8d0f0" />
      <pointLight position={[0, 5, 10]} intensity={0.3} color="#a0b0e0" />

      {/* No Stars background */}

      {/* Qubit rails */}
      {Array.from({ length: qubits }, (_, i) => (
        <QubitRail key={i} index={i} totalQubits={qubits} />
      ))}

      {/* Particle flow along rails */}
      {Array.from({ length: qubits }, (_, i) => (
        <ParticleFlow key={`p-${i}`} qubitIndex={i} totalQubits={qubits} />
      ))}

      {/* Gates */}
      {gates.map((gate) => (
        <GateFactory key={gate.id} gate={gate} totalQubits={qubits} />
      ))}

      {/* Entanglement beams */}
      <EntanglementBeam gates={gates} totalQubits={qubits} />

      {/* Probability waves along rails */}
      {Array.from({ length: qubits }, (_, i) => (
        <ProbabilityWave key={`w-${i}`} qubitIndex={i} totalQubits={qubits} />
      ))}

      {/* Simulation flow */}
      <SimulationFlow />

      {/* 3D Gate Annotations */}
      <GateAnnotation />

      {/* Bloch sphere panel */}
      <BlochSpherePanel />

      {/* 3D Interference pattern */}
      <InterferencePattern />

      {/* 3D Result headline */}
      <ResultDisplay3D />

      {/* Controls */}
      <CameraController />
    </>
  );
}

function KeyboardHandler() {
  const selectedGateId = useCircuitStore((s) => s.selectedGateId);
  const removeGate = useCircuitStore((s) => s.removeGate);
  const selectGate = useCircuitStore((s) => s.selectGate);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.target as HTMLElement)?.closest?.('.cm-editor')) return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedGateId) {
        e.preventDefault();
        removeGate(selectedGateId);
        selectGate(null);
      }
      if (e.key === 'Escape') {
        selectGate(null);
      }

      // Space key: continue walkthrough if paused in guided mode
      if (e.key === ' ' || e.code === 'Space') {
        const { walkthroughPaused, guidedMode } = useCircuitStore.getState();
        if (guidedMode && walkthroughPaused) {
          e.preventDefault();
          useCircuitStore.getState().continueWalkthrough();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGateId, removeGate, selectGate]);

  return null;
}

export function QuantumScene() {
  return (
    <>
      <KeyboardHandler />
      <Canvas
        camera={{ position: [12, 9, -6], fov: 50 }}
        gl={{ antialias: true, toneMapping: 3 }}
        style={{ background: BACKGROUND_COLOR }}
        onPointerMissed={() => {
          const store = useCircuitStore.getState();
          store.selectGate(null);
          store.setSelectedBlochQubit(null);
        }}
      >
        <SceneContent />
        <EffectComposer>
          <Bloom
            intensity={BLOOM_INTENSITY}
            luminanceThreshold={BLOOM_LUMINANCE_THRESHOLD}
            luminanceSmoothing={BLOOM_LUMINANCE_SMOOTHING}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </>
  );
}
