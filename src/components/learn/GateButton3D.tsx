import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { THEME_GATE_COLORS } from '../../lib/theme';

interface GateButton3DProps {
  gate: string;
  label: string;
  position: [number, number, number];
  pulse?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function GateButton3D({ gate, label, position, pulse, onClick, disabled }: GateButton3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const color = THEME_GATE_COLORS[gate] ?? '#6366f1';

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Gentle float
    groupRef.current.position.y = position[1] + Math.sin(Date.now() * 0.002) * 0.03;

    // Rotate ring
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.8;
    }

    // Pulse emissive
    if (meshRef.current && pulse) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.4 + Math.sin(Date.now() * 0.004) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Sphere body */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onClick();
        }}
        onPointerOver={() => { if (!disabled) document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={disabled ? 0.3 : 0.9}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>

      {/* Rotating ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.24, 0.012, 8, 32]} />
        <meshBasicMaterial color={color} transparent opacity={disabled ? 0.1 : 0.3} />
      </mesh>

      {/* Label */}
      <Text
        position={[0, -0.35, 0]}
        fontSize={0.13}
        color={disabled ? '#5f6177' : color}
        anchorX="center"
        anchorY="top"
        font={undefined}
      >
        {label}
      </Text>
    </group>
  );
}
