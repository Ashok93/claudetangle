import { useSandboxStore } from '../../store/sandboxStore';
import { SandboxBlochSphere } from './SandboxBlochSphere';
import { SandboxEntanglementBeam } from './SandboxEntanglementBeam';

function getSpacing(n: number): number {
  if (n <= 2) return 2.6;
  if (n === 3) return 2.0;
  return 1.6;
}

export function SandboxScene() {
  const numQubits = useSandboxStore((s) => s.numQubits);
  const entanglementInfo = useSandboxStore((s) => s.entanglementInfo);

  const spacing = getSpacing(numQubits);
  const totalWidth = (numQubits - 1) * spacing;

  const positions: [number, number, number][] = [];
  for (let i = 0; i < numQubits; i++) {
    positions.push([i * spacing - totalWidth / 2, 0, 0]);
  }

  return (
    <>
      {positions.map((pos, i) => (
        <SandboxBlochSphere key={i} index={i} position={pos} />
      ))}

      {entanglementInfo
        .filter((p) => p.concurrence > 0.1)
        .map((pair, i) => (
          <SandboxEntanglementBeam
            key={`ent-${pair.q1}-${pair.q2}-${i}`}
            pair={pair}
            posA={positions[pair.q1]}
            posB={positions[pair.q2]}
          />
        ))}
    </>
  );
}
