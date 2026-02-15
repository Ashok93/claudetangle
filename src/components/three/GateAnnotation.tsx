import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useCircuitStore } from '../../store/circuitStore';
import { GATE_INFO } from '../../lib/gateInfo';
import { QUBIT_SPACING, STEP_SPACING } from '../../lib/constants';
import type { Gate } from '../../types/circuit';

function qubitToY(qubitIndex: number, totalQubits: number): number {
  return (totalQubits - 1) / 2 * QUBIT_SPACING - qubitIndex * QUBIT_SPACING;
}

interface AnnotationProps {
  gate: Gate;
  totalQubits: number;
  simulationStep: number;
  isActive: boolean;
}

function Annotation({ gate, totalQubits, simulationStep, isActive }: AnnotationProps) {
  const opacityRef = useRef(0);
  const textRef = useRef<any>(null);
  const bgRef = useRef<any>(null);

  const info = GATE_INFO[gate.type];
  const label = info ? `${info.icon} — ${info.quantumConcept}` : gate.type.toUpperCase();

  const y = qubitToY(gate.targets[0], totalQubits) + 0.8;
  const z = gate.step * STEP_SPACING;

  useFrame((_, delta) => {
    const target = isActive ? 1 : 0;
    opacityRef.current += (target - opacityRef.current) * Math.min(1, delta * 8);

    if (textRef.current) {
      textRef.current.fillOpacity = opacityRef.current;
    }
    if (bgRef.current) {
      bgRef.current.material.opacity = opacityRef.current * 0.7;
    }
  });

  // Don't render if step is far away
  if (Math.abs(gate.step - simulationStep) > 1 && opacityRef.current < 0.01) return null;

  return (
    <group position={[0, y, z]}>
      {/* Background plane for readability */}
      <mesh ref={bgRef} position={[0, 0, 0]}>
        <planeGeometry args={[label.length * 0.09 + 0.3, 0.25]} />
        <meshBasicMaterial color="#0f1117" transparent opacity={0} side={2} />
      </mesh>
      <Text
        ref={textRef}
        position={[0, 0, 0.01]}
        fontSize={0.15}
        color="#e8e9ed"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0}
        font={undefined}
      >
        {label}
      </Text>
    </group>
  );
}

export function GateAnnotation() {
  const gates = useCircuitStore((s) => s.gates);
  const qubits = useCircuitStore((s) => s.qubits);
  const simulation = useCircuitStore((s) => s.simulation);
  const simulationStep = useCircuitStore((s) => s.simulationStep);

  if (simulation !== 'running') return null;

  return (
    <group>
      {gates.filter((g) => g.type !== 'measure').map((gate) => (
        <Annotation
          key={gate.id}
          gate={gate}
          totalQubits={qubits}
          simulationStep={simulationStep}
          isActive={gate.step === simulationStep}
        />
      ))}
    </group>
  );
}
