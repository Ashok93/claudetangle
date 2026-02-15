import type { Gate } from '../../../types/circuit';
import { QUBIT_SPACING, STEP_SPACING } from '../../../lib/constants';
import { HadamardGate } from './HadamardGate';
import { PauliGate } from './PauliGate';
import { CNOTGate } from './CNOTGate';
import { ToffoliGate } from './ToffoliGate';
import { MeasureGate } from './MeasureGate';
import { ControlledPhaseGate } from './ControlledPhaseGate';
import { SwapGate } from './SwapGate';

interface GateFactoryProps {
  gate: Gate;
  totalQubits: number;
}

function qubitToY(qubitIndex: number, totalQubits: number): number {
  return (totalQubits - 1) / 2 * QUBIT_SPACING - qubitIndex * QUBIT_SPACING;
}

function stepToZ(step: number): number {
  return step * STEP_SPACING;
}

export function GateFactory({ gate, totalQubits }: GateFactoryProps) {
  const z = stepToZ(gate.step);

  switch (gate.type) {
    case 'h': {
      const y = qubitToY(gate.targets[0], totalQubits);
      return <HadamardGate position={[0, y, z]} gateId={gate.id} gateStep={gate.step} />;
    }
    case 'x':
    case 'y':
    case 'z':
    case 's':
    case 'sdg':
    case 't':
    case 'tdg': {
      const y = qubitToY(gate.targets[0], totalQubits);
      return <PauliGate position={[0, y, z]} gateId={gate.id} variant={gate.type} gateStep={gate.step} />;
    }
    case 'cx': {
      const controlQubit = gate.controls?.[0] ?? gate.targets[0];
      const targetQubit = gate.controls ? gate.targets[0] : gate.targets[1];
      const controlY = qubitToY(controlQubit, totalQubits);
      const targetY = qubitToY(targetQubit, totalQubits);
      return <CNOTGate controlY={controlY} targetY={targetY} zPos={z} gateId={gate.id} gateStep={gate.step} />;
    }
    case 'ccx': {
      const controls = gate.controls ?? [gate.targets[0], gate.targets[1]];
      const target = gate.controls ? gate.targets[0] : gate.targets[2];
      const c1Y = qubitToY(controls[0], totalQubits);
      const c2Y = qubitToY(controls[1], totalQubits);
      const tY = qubitToY(target, totalQubits);
      return <ToffoliGate control1Y={c1Y} control2Y={c2Y} targetY={tY} zPos={z} gateId={gate.id} gateStep={gate.step} />;
    }
    case 'swap': {
      const y1 = qubitToY(gate.targets[0], totalQubits);
      const y2 = qubitToY(gate.targets[1], totalQubits);
      return <SwapGate y1={y1} y2={y2} zPos={z} gateId={gate.id} gateStep={gate.step} />;
    }
    case 'cz':
    case 'cs':
    case 'csdg':
    case 'ct':
    case 'ctdg':
    case 'cr4':
    case 'cr4dg': {
      const controlQubit = gate.controls?.[0] ?? 0;
      const targetQubit = gate.targets[0];
      const controlY = qubitToY(controlQubit, totalQubits);
      const targetY = qubitToY(targetQubit, totalQubits);
      return <ControlledPhaseGate controlY={controlY} targetY={targetY} zPos={z} gateId={gate.id} gateStep={gate.step} gateType={gate.type} />;
    }
    case 'measure': {
      const y = qubitToY(gate.targets[0], totalQubits);
      return <MeasureGate position={[0, y, z]} gateId={gate.id} gateStep={gate.step} />;
    }
    default:
      return null;
  }
}
