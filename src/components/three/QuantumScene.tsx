import { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
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
  STEP_SPACING,
} from '../../lib/constants';

function CameraController() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const simulation = useCircuitStore((s) => s.simulation);
  const simulationMaxStep = useCircuitStore((s) => s.simulationMaxStep);
  const targetRef = useRef(new THREE.Vector3(0, 0, 8));
  const animating = useRef(false);

  useEffect(() => {
    if (simulation === 'complete') {
      const endZ = (simulationMaxStep + 3) * STEP_SPACING;
      targetRef.current.set(0, 0, endZ * 0.6);
      animating.current = true;
    } else if (simulation === 'idle') {
      targetRef.current.set(0, 0, 8);
      animating.current = true;
    }
  }, [simulation, simulationMaxStep]);

  // Smooth lerp to target
  useEffect(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    let animId: number;

    const animate = () => {
      if (animating.current && controls.target) {
        controls.target.lerp(targetRef.current, 0.03);
        const dist = controls.target.distanceTo(targetRef.current);
        if (dist < 0.05) {
          controls.target.copy(targetRef.current);
          animating.current = false;
        }
        controls.update();
      }
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

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
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedGateId) {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        if ((e.target as HTMLElement)?.closest?.('.cm-editor')) return;
        e.preventDefault();
        removeGate(selectedGateId);
        selectGate(null);
      }
      if (e.key === 'Escape') {
        selectGate(null);
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
        camera={{ position: [8, 6, -4], fov: 50 }}
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
