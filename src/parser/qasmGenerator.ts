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

    const t = gate.targets[0];
    const ctrl = gate.controls?.[0] ?? 0;
    const ctrls = gate.controls ?? [0, 1];

    switch (gate.type) {
      // Single-qubit gates
      case 'h':    lines.push(`h q[${t}];`);    break;
      case 'x':    lines.push(`x q[${t}];`);    break;
      case 'y':    lines.push(`y q[${t}];`);    break;
      case 'z':    lines.push(`z q[${t}];`);    break;
      case 's':    lines.push(`s q[${t}];`);    break;
      case 'sdg':  lines.push(`sdg q[${t}];`);  break;
      case 't':    lines.push(`t q[${t}];`);    break;
      case 'tdg':  lines.push(`tdg q[${t}];`);  break;

      // Two-qubit controlled gates
      case 'cx':   lines.push(`cx q[${ctrl}],q[${t}];`);   break;
      case 'cz':   lines.push(`cz q[${ctrl}],q[${t}];`);   break;
      case 'cs':   lines.push(`cs q[${ctrl}],q[${t}];`);   break;
      case 'csdg': lines.push(`csdg q[${ctrl}],q[${t}];`); break;
      case 'ct':   lines.push(`ct q[${ctrl}],q[${t}];`);   break;
      case 'ctdg': lines.push(`ctdg q[${ctrl}],q[${t}];`); break;
      case 'cr4':  lines.push(`cr4 q[${ctrl}],q[${t}];`);  break;
      case 'cr4dg': lines.push(`cr4dg q[${ctrl}],q[${t}];`); break;
      case 'swap':  lines.push(`swap q[${gate.targets[0]}],q[${gate.targets[1] ?? ctrl}];`); break;

      // Three-qubit gates
      case 'ccx':  lines.push(`ccx q[${ctrls[0]}],q[${ctrls[1]}],q[${t}];`); break;

      // Measurement
      case 'measure': lines.push(`measure q[${t}] -> c[${t}];`); break;
    }
  }

  lines.push('');
  return lines.join('\n');
}
