import type { Gate } from '../types/circuit';

export function generateQASM(qubits: number, gates: Gate[]): string {
  const lines: string[] = [
    'OPENQASM 2.0;',
    'include "qelib1.inc";',
    '',
    `qreg q[${qubits}];`,
    `creg c[${qubits}];`,
    '',
  ];

  // Sort gates by step for readable output
  const sorted = [...gates].sort((a, b) => a.step - b.step);

  let lastStep = -1;
  for (const gate of sorted) {
    // Add blank line between steps for readability
    if (gate.step !== lastStep && lastStep !== -1) {
      lines.push('');
    }
    lastStep = gate.step;

    switch (gate.type) {
      case 'h':
        lines.push(`h q[${gate.targets[0]}];`);
        break;
      case 'x':
        lines.push(`x q[${gate.targets[0]}];`);
        break;
      case 'y':
        lines.push(`y q[${gate.targets[0]}];`);
        break;
      case 'z':
        lines.push(`z q[${gate.targets[0]}];`);
        break;
      case 'cx': {
        const control = gate.controls?.[0] ?? 0;
        lines.push(`cx q[${control}],q[${gate.targets[0]}];`);
        break;
      }
      case 'ccx': {
        const controls = gate.controls ?? [0, 1];
        lines.push(`ccx q[${controls[0]}],q[${controls[1]}],q[${gate.targets[0]}];`);
        break;
      }
      case 'measure':
        lines.push(`measure q[${gate.targets[0]}] -> c[${gate.targets[0]}];`);
        break;
    }
  }

  lines.push('');
  return lines.join('\n');
}
