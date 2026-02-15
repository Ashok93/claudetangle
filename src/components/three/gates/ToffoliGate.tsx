import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { GATE_THREE_COLORS } from '../../../lib/constants';
import { useCircuitStore } from '../../../store/circuitStore';

interface ToffoliGateProps {
  control1Y: number;
  control2Y: number;
  targetY: number;
  zPos: number;
  gateId: string;
  gateStep: number;
}

export function ToffoliGate({ control1Y, control2Y, targetY, zPos, gateId, gateStep }: ToffoliGateProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const flashRef = useRef(0);
  const selectedId = useCircuitStore((s) => s.selectedGateId);
  const selectGate = useCircuitStore((s) => s.selectGate);
  const isSelected = selectedId === gateId;
  const color = GATE_THREE_COLORS.ccx;

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.8;
      const mat = ringRef.current.material as THREE.MeshStandardMaterial;
      const simStep = useCircuitStore.getState().simulationStep;
      const isActive = simStep === gateStep && useCircuitStore.getState().phase === 'running';
      if (isActive) flashRef.current = 1;
      else flashRef.current = THREE.MathUtils.lerp(flashRef.current, 0, delta * 3);
      mat.emissiveIntensity = (isSelected ? 0.8 : 0.4) + flashRef.current * 0.6;
    }
  });

  const allYs = [control1Y, control2Y, targetY];
  const minY = Math.min(...allYs);
  const maxY = Math.max(...allYs);

  const linePoints = useMemo(() => {
    const p: [number, number, number][] = [];
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      p.push([0, minY + (maxY - minY) * t, zPos]);
    }
    return p;
  }, [minY, maxY, zPos]);

  const scale = isSelected ? 1.2 : 1;

  return (
    <group onClick={(e) => { e.stopPropagation(); selectGate(gateId); }}>
      {/* Control dots */}
      {[control1Y, control2Y].map((cy, i) => (
        <mesh key={i} position={[0, cy, zPos]} scale={scale}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 0.8 : 0.4} />
        </mesh>
      ))}

      {/* Bridge line */}
      <Line points={linePoints} color="#c084fc" lineWidth={isSelected ? 3 : 2} transparent opacity={0.8} />

      {/* Target */}
      <group position={[0, targetY, zPos]} scale={scale}>
        <mesh ref={ringRef}>
          <torusGeometry args={[0.3, 0.04, 16, 32]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 0.8 : 0.4} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.04, 0.6, 0.04]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.04, 0.6, 0.04]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
        </mesh>
      </group>
    </group>
  );
}
