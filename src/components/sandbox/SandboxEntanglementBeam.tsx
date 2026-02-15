import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import type { EntanglementPair } from '../../lib/sandboxSim';

interface SandboxEntanglementBeamProps {
  pair: EntanglementPair;
  posA: [number, number, number];
  posB: [number, number, number];
}

export function SandboxEntanglementBeam({ pair, posA, posB }: SandboxEntanglementBeamProps) {
  const dashOffsetRef = useRef(0);

  useFrame((_, delta) => {
    dashOffsetRef.current -= delta * 2;
  });

  const midY = (posA[1] + posB[1]) / 2;
  const numPoints = 30;

  const points1: [number, number, number][] = [];
  const points2: [number, number, number][] = [];

  for (let j = 0; j <= numPoints; j++) {
    const t = j / numPoints;
    const x = posA[0] + (posB[0] - posA[0]) * t;
    const y = midY;
    const z = posA[2] + (posB[2] - posA[2]) * t;
    const wave = Math.sin(t * Math.PI * 4) * 0.15;

    points1.push([x + wave, y, z]);
    points2.push([x - wave, y, z]);
  }

  const opacity = 0.15 + pair.concurrence * 0.35;

  return (
    <group>
      <Line
        points={points1}
        color="#818cf8"
        lineWidth={1.5}
        transparent
        opacity={opacity}
        dashed
        dashSize={0.3}
        dashScale={1}
        gapSize={0.2}
      />
      <Line
        points={points2}
        color="#c084fc"
        lineWidth={1.5}
        transparent
        opacity={opacity * 0.7}
        dashed
        dashSize={0.3}
        dashScale={1}
        gapSize={0.2}
      />
    </group>
  );
}
