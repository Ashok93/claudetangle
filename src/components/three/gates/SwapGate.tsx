import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { GATE_THREE_COLORS } from '../../../lib/constants';
import { useCircuitStore } from '../../../store/circuitStore';

interface SwapGateProps {
  y1: number;
  y2: number;
  zPos: number;
  gateId: string;
  gateStep: number;
}

export function SwapGate({ y1, y2, zPos, gateId, gateStep }: SwapGateProps) {
  const ref1 = useRef<THREE.Group>(null);
  const ref2 = useRef<THREE.Group>(null);
  const flashRef = useRef(0);
  const selectedId = useCircuitStore((s) => s.selectedGateId);
  const selectGate = useCircuitStore((s) => s.selectGate);
  const isSelected = selectedId === gateId;
  const color = GATE_THREE_COLORS.swap ?? new THREE.Color('#2dd4bf');

  useFrame((_, delta) => {
    const simStep = useCircuitStore.getState().simulationStep;
    const isActive = simStep === gateStep && useCircuitStore.getState().simulation === 'running';
    if (isActive) flashRef.current = 1;
    else flashRef.current = THREE.MathUtils.lerp(flashRef.current, 0, delta * 3);
  });

  const points = useMemo(() => {
    const p: [number, number, number][] = [];
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      p.push([0, minY + (maxY - minY) * t, zPos]);
    }
    return p;
  }, [y1, y2, zPos]);

  const scale = isSelected ? 1.2 : 1;
  const s = 0.15;

  return (
    <group onClick={(e) => { e.stopPropagation(); selectGate(gateId); }}>
      {/* Bridge line */}
      <Line points={points} color="#2dd4bf" lineWidth={isSelected ? 3 : 2} transparent opacity={0.8} />

      {/* X mark at y1 */}
      <group ref={ref1} position={[0, y1, zPos]} scale={scale}>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.04, s * 2.5, 0.04]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 0.8 : 0.4} />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.04, s * 2.5, 0.04]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 0.8 : 0.4} />
        </mesh>
      </group>

      {/* X mark at y2 */}
      <group ref={ref2} position={[0, y2, zPos]} scale={scale}>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.04, s * 2.5, 0.04]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 0.8 : 0.4} />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.04, s * 2.5, 0.04]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 0.8 : 0.4} />
        </mesh>
      </group>
    </group>
  );
}
