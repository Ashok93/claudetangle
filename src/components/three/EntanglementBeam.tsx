import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import type { Gate } from '../../types/circuit';
import { QUBIT_SPACING, STEP_SPACING } from '../../lib/constants';
import { useCircuitStore } from '../../store/circuitStore';

interface EntanglementBeamProps {
  gates: Gate[];
  totalQubits: number;
}

function qubitToY(qubitIndex: number, totalQubits: number): number {
  return (totalQubits - 1) / 2 * QUBIT_SPACING - qubitIndex * QUBIT_SPACING;
}

export function EntanglementBeam({ gates, totalQubits }: EntanglementBeamProps) {
  const dashOffsetRef = useRef(0);

  const entangledPairs = useMemo(() => {
    const pairs: { q1: number; q2: number; fromStep: number; maxStep: number }[] = [];
    const maxStep = gates.length > 0 ? Math.max(...gates.map((g) => g.step)) : 0;

    for (const gate of gates) {
      if (gate.type === 'cx') {
        const control = gate.controls?.[0] ?? gate.targets[0];
        const target = gate.controls ? gate.targets[0] : gate.targets[1];
        pairs.push({ q1: control, q2: target, fromStep: gate.step, maxStep });
      }
    }
    return pairs;
  }, [gates]);

  useFrame((_, delta) => {
    dashOffsetRef.current -= delta * 2;
  });

  const simulation = useCircuitStore((s) => s.simulation);
  const simulationStep = useCircuitStore((s) => s.simulationStep);

  if (entangledPairs.length === 0) return null;

  return (
    <>
      {entangledPairs.map((pair, i) => {
        // Only show beams after simulation reaches the entangling step
        if (simulation === 'running' && simulationStep < pair.fromStep) return null;

        const y1 = qubitToY(pair.q1, totalQubits);
        const y2 = qubitToY(pair.q2, totalQubits);
        const startZ = pair.fromStep * STEP_SPACING + 0.5;
        const endZ = (pair.maxStep + 1) * STEP_SPACING;

        const points: [number, number, number][] = [];
        const midY = (y1 + y2) / 2;
        const numPoints = 30;
        for (let j = 0; j <= numPoints; j++) {
          const t = j / numPoints;
          const z = startZ + (endZ - startZ) * t;
          const wave = Math.sin(t * Math.PI * 4) * 0.15;
          points.push([wave, midY, z]);
        }

        const points2: [number, number, number][] = points.map(([x, y, z]) => [-x, y, z]);

        // Beam intensity reflects being active
        const isActive = simulation === 'running' || simulation === 'complete';
        const opacity1 = isActive ? 0.35 : 0.15;
        const opacity2 = isActive ? 0.25 : 0.1;

        return (
          <group key={i}>
            <Line
              points={points}
              color="#818cf8"
              lineWidth={1.5}
              transparent
              opacity={opacity1}
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
              opacity={opacity2}
              dashed
              dashSize={0.3}
              dashScale={1}
              gapSize={0.2}
            />
          </group>
        );
      })}
    </>
  );
}
