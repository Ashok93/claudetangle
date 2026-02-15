import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { GATE_THREE_COLORS, GATE_ROTATION_SPEED } from '../../../lib/constants';
import { useCircuitStore } from '../../../store/circuitStore';

interface HadamardGateProps {
  position: [number, number, number];
  gateId: string;
  gateStep: number;
}

export function HadamardGate({ position, gateId, gateStep }: HadamardGateProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const flashRef = useRef(0);
  const selectedId = useCircuitStore((s) => s.selectedGateId);
  const selectGate = useCircuitStore((s) => s.selectGate);
  const isSelected = selectedId === gateId;

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * GATE_ROTATION_SPEED;
      meshRef.current.rotation.x += delta * GATE_ROTATION_SPEED * 0.3;
    }
    if (wireRef.current) {
      wireRef.current.rotation.y += delta * GATE_ROTATION_SPEED;
      wireRef.current.rotation.x += delta * GATE_ROTATION_SPEED * 0.3;
    }
    const simStep = useCircuitStore.getState().simulationStep;
    const isActive = simStep === gateStep && useCircuitStore.getState().simulation === 'running';
    if (isActive) flashRef.current = 1;
    else flashRef.current = THREE.MathUtils.lerp(flashRef.current, 0, delta * 3);
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = (isSelected ? 0.8 : 0.4) + flashRef.current * 0.6;
    }
  });

  const scale = isSelected ? 1.3 : 1;

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
      <group position={position} scale={scale} onClick={(e) => { e.stopPropagation(); selectGate(gateId); }}>
        {/* Solid crystal */}
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial
            color={GATE_THREE_COLORS.h}
            emissive={GATE_THREE_COLORS.h}
            emissiveIntensity={isSelected ? 0.8 : 0.4}
            transparent
            opacity={0.6}
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
        {/* Wireframe overlay */}
        <mesh ref={wireRef}>
          <icosahedronGeometry args={[0.38, 0]} />
          <meshStandardMaterial
            color={GATE_THREE_COLORS.h}
            emissive={GATE_THREE_COLORS.h}
            emissiveIntensity={0.3}
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>
        {isSelected && (
          <mesh position={[0, 0.6, 0]}>
            <planeGeometry args={[0.3, 0.3]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        )}
      </group>
    </Float>
  );
}
