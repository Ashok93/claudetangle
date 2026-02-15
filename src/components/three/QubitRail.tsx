import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { QUBIT_SPACING, RAIL_RADIUS, STEP_SPACING, RAIL_MIN_LENGTH, RAIL_PADDING_STEPS, RAIL_COLOR, RAIL_EMISSIVE } from '../../lib/constants';
import { useCircuitStore } from '../../store/circuitStore';
import { phaseToHue } from '../../lib/quantumSim';

interface QubitRailProps {
  index: number;
  totalQubits: number;
}

export function QubitRail({ index, totalQubits }: QubitRailProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const gates = useCircuitStore((s) => s.gates);

  const yPos = (totalQubits - 1) / 2 * QUBIT_SPACING - index * QUBIT_SPACING;

  // Dynamic rail length based on circuit size
  const railEnd = useMemo(() => {
    const maxStep = gates.length > 0 ? Math.max(...gates.map((g) => g.step)) : 0;
    return Math.max(RAIL_MIN_LENGTH, (maxStep + RAIL_PADDING_STEPS) * STEP_SPACING);
  }, [gates]);

  const curve = useMemo(() => {
    return new THREE.LineCurve3(
      new THREE.Vector3(0, yPos, -2),
      new THREE.Vector3(0, yPos, railEnd)
    );
  }, [yPos, railEnd]);

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 64, RAIL_RADIUS, 8, false);
  }, [curve]);

  // Reactive to simulation state — amplitude drives brightness, phase drives color
  useFrame(() => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;

    const { simulation, simulationStep, stepStates } = useCircuitStore.getState();

    if (simulation === 'running' || simulation === 'complete') {
      const currentState = stepStates.find((s) => s.step === simulationStep)
        ?? stepStates.find((s) => s.step <= simulationStep && s.step >= 0)
        ?? stepStates[0];

      if (currentState) {
        const amplitude = currentState.qubitAmplitudes[index] ?? 0;
        const phase = currentState.qubitPhases[index] ?? 0;
        mat.emissiveIntensity = 0.2 + amplitude * 1.2;
        const hue = phaseToHue(phase);
        mat.emissive.setHSL(hue / 360, 0.6, 0.35);
        return;
      }
    }

    // Default idle state — subtle, muted
    mat.emissiveIntensity = 0.3 + Math.sin(Date.now() * 0.001 + index * 0.5) * 0.05;
    mat.emissive.set(RAIL_EMISSIVE);
  });

  return (
    <group>
      <mesh ref={meshRef} geometry={tubeGeometry}>
        <meshStandardMaterial
          color={RAIL_COLOR}
          emissive={RAIL_EMISSIVE}
          emissiveIntensity={0.3}
          transparent
          opacity={0.75}
          roughness={0.4}
          metalness={0.5}
        />
      </mesh>
      <Text
        position={[-0.5, yPos, -2.5]}
        fontSize={0.35}
        color="#9b9db0"
        anchorX="right"
        anchorY="middle"
        font={undefined}
      >
        {`q[${index}]`}
      </Text>
    </group>
  );
}
