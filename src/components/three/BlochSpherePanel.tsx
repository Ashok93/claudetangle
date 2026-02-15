import { Text } from '@react-three/drei';
import { BlochSphere } from './BlochSphere';
import { useCircuitStore } from '../../store/circuitStore';
import { QUBIT_SPACING } from '../../lib/constants';

export function BlochSpherePanel() {
  const simulation = useCircuitStore((s) => s.simulation);
  const qubits = useCircuitStore((s) => s.qubits);

  if (simulation === 'idle') return null;

  const xPos = -2.5;
  const zPos = -4;

  return (
    <group position={[xPos, 0, zPos]}>
      {/* Title */}
      <Text
        position={[0, ((qubits - 1) / 2) * QUBIT_SPACING + 1.2, 0]}
        fontSize={0.2}
        color="#5f6177"
        anchorX="center"
        anchorY="bottom"
      >
        Qubit States
      </Text>

      {/* One Bloch sphere per qubit */}
      {Array.from({ length: qubits }, (_, i) => {
        const yPos = (qubits - 1) / 2 * QUBIT_SPACING - i * QUBIT_SPACING;
        return (
          <BlochSphere
            key={i}
            qubitIndex={i}
            totalQubits={qubits}
            position={[0, yPos, 0]}
          />
        );
      })}
    </group>
  );
}
