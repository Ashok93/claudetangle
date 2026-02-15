import { useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Gate } from '../../types/circuit';
import { QUBIT_SPACING, STEP_SPACING } from '../../lib/constants';
import { GateFactory } from './gates/GateFactory';

interface MacroCubeProps {
  gates: Gate[];
  label: string;
  totalQubits: number;
  color?: string;
}

function qubitToY(qubitIndex: number, totalQubits: number): number {
  return (totalQubits - 1) / 2 * QUBIT_SPACING - qubitIndex * QUBIT_SPACING;
}

export function MacroCube({ gates, label, totalQubits, color = '#7c4dff' }: MacroCubeProps) {
  const [expanded, setExpanded] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const expandProgress = useRef(0);

  // Calculate bounding box for the gates
  const bounds = useMemo(() => {
    if (gates.length === 0) return { minStep: 0, maxStep: 0, minQubit: 0, maxQubit: 0 };

    const allQubits = gates.flatMap((g) => [...g.targets, ...(g.controls ?? [])]);
    return {
      minStep: Math.min(...gates.map((g) => g.step)),
      maxStep: Math.max(...gates.map((g) => g.step)),
      minQubit: Math.min(...allQubits),
      maxQubit: Math.max(...allQubits),
    };
  }, [gates]);

  const centerZ = ((bounds.minStep + bounds.maxStep) / 2) * STEP_SPACING;
  const centerY = (qubitToY(bounds.minQubit, totalQubits) + qubitToY(bounds.maxQubit, totalQubits)) / 2;
  const width = (bounds.maxStep - bounds.minStep + 1) * STEP_SPACING + 1;
  const height = (bounds.maxQubit - bounds.minQubit + 1) * QUBIT_SPACING + 1;

  useFrame((_, delta) => {
    const target = expanded ? 1 : 0;
    expandProgress.current += (target - expandProgress.current) * delta * 5;

    if (meshRef.current) {
      // Cube fades and shrinks when expanded
      const opacity = 1 - expandProgress.current;
      const scale = 1 - expandProgress.current * 0.5;
      meshRef.current.scale.setScalar(scale);
      (meshRef.current.material as THREE.MeshStandardMaterial).opacity = opacity * 0.3;
      meshRef.current.rotation.y += delta * 0.2 * (1 - expandProgress.current);
    }

    // Gates spread out when expanded
    if (groupRef.current) {
      groupRef.current.children.forEach((child, _i) => {
        const targetScale = expandProgress.current;
        child.scale.setScalar(targetScale);
      });
    }
  });

  const threeColor = new THREE.Color(color);

  return (
    <group>
      {/* Collapsed cube */}
      <mesh
        ref={meshRef}
        position={[0, centerY, centerZ]}
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
      >
        <boxGeometry args={[1.5, height, width]} />
        <meshStandardMaterial
          color={threeColor}
          emissive={threeColor}
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.8}
          wireframe={false}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh position={[0, centerY, centerZ]}>
        <boxGeometry args={[1.6, height + 0.1, width + 0.1]} />
        <meshStandardMaterial
          color={threeColor}
          emissive={threeColor}
          emissiveIntensity={0.3}
          transparent
          opacity={expanded ? 0.1 : 0.4}
          wireframe
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, centerY + height / 2 + 0.4, centerZ]}
        fontSize={0.3}
        color={color}
        anchorX="center"
        anchorY="bottom"
        font={undefined}
      >
        {label}
      </Text>

      {/* Expanded gates */}
      <group ref={groupRef}>
        {gates.map((gate) => (
          <GateFactory key={gate.id} gate={gate} totalQubits={totalQubits} />
        ))}
      </group>
    </group>
  );
}
