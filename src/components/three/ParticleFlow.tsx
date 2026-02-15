import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { QUBIT_SPACING, RAIL_LENGTH } from '../../lib/constants';
import { useCircuitStore } from '../../store/circuitStore';
import { phaseToHue } from '../../lib/quantumSim';

interface ParticleFlowProps {
  qubitIndex: number;
  totalQubits: number;
}

const PARTICLE_COUNT = 15;

export function ParticleFlow({ qubitIndex, totalQubits }: ParticleFlowProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const yPos = (totalQubits - 1) / 2 * QUBIT_SPACING - qubitIndex * QUBIT_SPACING;

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const speeds = useMemo(() =>
    Array.from({ length: PARTICLE_COUNT }, () => 0.5 + Math.random() * 2),
    []
  );
  const offsets = useMemo(() =>
    Array.from({ length: PARTICLE_COUNT }, () => Math.random() * RAIL_LENGTH),
    []
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    const { simulation, simulationStep, stepStates } = useCircuitStore.getState();

    // Get amplitude and phase for this qubit from simulation
    let amplitude = 0.3;
    let hue = 210; // default blue-ish
    if ((simulation === 'running' || simulation === 'complete') && stepStates.length > 0) {
      const currentState = stepStates.find((s) => s.step === simulationStep)
        ?? stepStates.find((s) => s.step <= simulationStep && s.step >= 0)
        ?? stepStates[0];
      if (currentState) {
        amplitude = currentState.qubitAmplitudes[qubitIndex] ?? 0.3;
        const phase = currentState.qubitPhases[qubitIndex] ?? 0;
        hue = phaseToHue(phase);
      }
    }

    // Modulate particle opacity/scale by amplitude
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.opacity = 0.2 + amplitude * 0.5;
    mat.emissive.setHSL(hue / 360, 0.5, 0.3);
    mat.color.setHSL(hue / 360, 0.4, 0.5);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const z = ((offsets[i] + time * speeds[i]) % (RAIL_LENGTH + 2)) - 2;
      const wobble = Math.sin(time * 3 + i) * 0.05;
      dummy.position.set(wobble, yPos + wobble * 0.5, z);
      const baseScale = 0.02 + Math.sin(time * 2 + i * 0.5) * 0.01;
      const scale = baseScale * (0.5 + amplitude * 1.5);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#64748b"
        emissive="#475569"
        emissiveIntensity={1}
        transparent
        opacity={0.4}
      />
    </instancedMesh>
  );
}
