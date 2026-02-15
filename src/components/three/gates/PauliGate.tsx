import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import { GATE_THREE_COLORS, GATE_ROTATION_SPEED } from '../../../lib/constants';
import { useCircuitStore } from '../../../store/circuitStore';
import type { GateType } from '../../../types/circuit';

interface PauliGateProps {
  position: [number, number, number];
  gateId: string;
  variant: 'x' | 'y' | 'z' | 's' | 'sdg' | 't' | 'tdg';
  gateStep: number;
}

const LABELS: Record<string, string> = {
  x: 'X', y: 'Y', z: 'Z',
  s: 'S', sdg: 'S\u2020', t: 'T', tdg: 'T\u2020',
};

export function PauliGate({ position, gateId, variant, gateStep }: PauliGateProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const flashRef = useRef(0);
  const selectedId = useCircuitStore((s) => s.selectedGateId);
  const selectGate = useCircuitStore((s) => s.selectGate);
  const isSelected = selectedId === gateId;
  const color = GATE_THREE_COLORS[variant as GateType] ?? new THREE.Color('#888');

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.x += delta * GATE_ROTATION_SPEED * 1.5;
      ringRef.current.rotation.z += delta * GATE_ROTATION_SPEED * 0.5;
    }
    const simStep = useCircuitStore.getState().simulationStep;
    const isActive = simStep === gateStep && useCircuitStore.getState().simulation === 'running';
    if (isActive) flashRef.current = 1;
    else flashRef.current = THREE.MathUtils.lerp(flashRef.current, 0, delta * 3);
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = (isSelected ? 0.8 : 0.4) + flashRef.current * 0.6;
    }
  });

  const scale = isSelected ? 1.3 : 1;

  return (
    <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.15}>
      <group position={position} scale={scale} onClick={(e) => { e.stopPropagation(); selectGate(gateId); }}>
        {/* Core sphere */}
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.25, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 0.8 : 0.4}
            roughness={0.2}
            metalness={0.7}
          />
        </mesh>
        {/* Rotating ring */}
        <mesh ref={ringRef}>
          <torusGeometry args={[0.38, 0.03, 16, 48]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            transparent
            opacity={0.7}
          />
        </mesh>
        {/* Label */}
        <Text
          position={[0, 0, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {LABELS[variant] ?? variant.toUpperCase()}
        </Text>
      </group>
    </Float>
  );
}
