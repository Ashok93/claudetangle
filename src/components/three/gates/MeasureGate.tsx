import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { GATE_THREE_COLORS } from '../../../lib/constants';
import { useCircuitStore } from '../../../store/circuitStore';

interface MeasureGateProps {
  position: [number, number, number];
  gateId: string;
  gateStep: number;
}

export function MeasureGate({ position, gateId, gateStep }: MeasureGateProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const flashRef = useRef(0);
  const selectedId = useCircuitStore((s) => s.selectedGateId);
  const selectGate = useCircuitStore((s) => s.selectGate);
  const isSelected = selectedId === gateId;
  const color = GATE_THREE_COLORS.measure;

  useFrame((_, delta) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      const simStep = useCircuitStore.getState().simulationStep;
      const isActive = simStep === gateStep && useCircuitStore.getState().simulation === 'running';
      if (isActive) flashRef.current = 1;
      else flashRef.current = THREE.MathUtils.lerp(flashRef.current, 0, delta * 3);
      mat.emissiveIntensity = (isSelected ? 0.6 : 0.3) + Math.sin(Date.now() * 0.003) * 0.1 + flashRef.current * 0.6;
    }
  });

  const scale = isSelected ? 1.3 : 1;

  return (
    <Float speed={1} rotationIntensity={0.02} floatIntensity={0.1}>
      <group position={position} scale={scale} onClick={(e) => { e.stopPropagation(); selectGate(gateId); }}>
        {/* Detector cone */}
        <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.3, 0.5, 6]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>
        {/* Lens sphere */}
        <mesh position={[0, -0.15, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={color}
            emissiveIntensity={0.5}
            transparent
            opacity={0.9}
          />
        </mesh>
        {/* Dial arc */}
        <mesh position={[0, 0.15, 0]}>
          <torusGeometry args={[0.2, 0.02, 8, 16, Math.PI]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
          />
        </mesh>
      </group>
    </Float>
  );
}
