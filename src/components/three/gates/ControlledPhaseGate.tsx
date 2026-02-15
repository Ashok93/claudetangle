import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { GATE_THREE_COLORS } from '../../../lib/constants';
import { useCircuitStore } from '../../../store/circuitStore';
import type { GateType } from '../../../types/circuit';

const LABELS: Record<string, string> = {
  cz: 'Z', cs: 'S', csdg: 'S\u2020', ct: 'T', ctdg: 'T\u2020', cr4: 'R4', cr4dg: 'R4\u2020',
};

interface ControlledPhaseGateProps {
  controlY: number;
  targetY: number;
  zPos: number;
  gateId: string;
  gateStep: number;
  gateType: GateType;
}

export function ControlledPhaseGate({ controlY, targetY, zPos, gateId, gateStep, gateType }: ControlledPhaseGateProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const flashRef = useRef(0);
  const selectedId = useCircuitStore((s) => s.selectedGateId);
  const selectGate = useCircuitStore((s) => s.selectGate);
  const isSelected = selectedId === gateId;
  const color = GATE_THREE_COLORS[gateType] ?? new THREE.Color('#fb7185');
  const label = LABELS[gateType] ?? gateType.toUpperCase();

  useFrame((_, delta) => {
    const simStep = useCircuitStore.getState().simulationStep;
    const isActive = simStep === gateStep && useCircuitStore.getState().simulation === 'running';
    if (isActive) flashRef.current = 1;
    else flashRef.current = THREE.MathUtils.lerp(flashRef.current, 0, delta * 3);
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = (isSelected ? 0.8 : 0.4) + flashRef.current * 0.6;
    }
  });

  const points = useMemo(() => {
    const p: [number, number, number][] = [];
    const minY = Math.min(controlY, targetY);
    const maxY = Math.max(controlY, targetY);
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      p.push([0, minY + (maxY - minY) * t, zPos]);
    }
    return p;
  }, [controlY, targetY, zPos]);

  const scale = isSelected ? 1.2 : 1;
  const hexColor = `#${color.getHexString()}`;

  return (
    <group onClick={(e) => { e.stopPropagation(); selectGate(gateId); }}>
      {/* Control dot */}
      <mesh position={[0, controlY, zPos]} scale={scale}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 0.8 : 0.4} />
      </mesh>

      {/* Bridge line */}
      <Line points={points} color={hexColor} lineWidth={isSelected ? 3 : 2} transparent opacity={0.8} />

      {/* Target: labeled sphere */}
      <group position={[0, targetY, zPos]} scale={scale}>
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 0.8 : 0.4}
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>
        <Text
          position={[0, 0, 0]}
          fontSize={0.14}
          color="white"
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {label}
        </Text>
      </group>
    </group>
  );
}
