import { v4 as uuidv4 } from 'uuid';
import type { Gate, GateType } from '../types/circuit';

interface ParseResult {
  qubits: number;
  gates: Gate[];
  errors: { line: number; message: string }[];
}

export function parseQASM(code: string): ParseResult {
  const lines = code.split('\n');
  const gates: Gate[] = [];
  const errors: { line: number; message: string }[] = [];
  let qubits = 0;

  // Track which qubits are busy at which step to auto-assign steps
  const qubitNextStep: Record<number, number> = {};

  function getNextStep(involvedQubits: number[]): number {
    let maxStep = 0;
    for (const q of involvedQubits) {
      maxStep = Math.max(maxStep, qubitNextStep[q] ?? 0);
    }
    for (const q of involvedQubits) {
      qubitNextStep[q] = maxStep + 1;
    }
    return maxStep;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('//') || line.startsWith('OPENQASM') || line.startsWith('include')) {
      continue;
    }

    // qreg q[N];
    const qregMatch = line.match(/^qreg\s+\w+\[(\d+)\]\s*;/);
    if (qregMatch) {
      qubits = Math.max(qubits, parseInt(qregMatch[1]));
      continue;
    }

    // creg c[N]; - skip
    if (line.match(/^creg\s+/)) continue;

    // barrier - skip
    if (line.match(/^barrier\s*/)) continue;

    // Single-qubit gates: h, x, y, z, s, sdg, t, tdg
    const singleMatch = line.match(/^(h|x|y|z|s|sdg|t|tdg)\s+\w+\[(\d+)\]\s*;/);
    if (singleMatch) {
      const type = singleMatch[1] as GateType;
      const target = parseInt(singleMatch[2]);
      qubits = Math.max(qubits, target + 1);
      const s = getNextStep([target]);
      gates.push({ id: uuidv4(), type, targets: [target], step: s });
      continue;
    }

    // Two-qubit controlled gates: cx, cz, cs, csdg, ct, ctdg, cr4, cr4dg
    const ctrlMatch = line.match(/^(cx|cz|cs|csdg|ct|ctdg|cr4|cr4dg)\s+\w+\[(\d+)\]\s*,\s*\w+\[(\d+)\]\s*;/);
    if (ctrlMatch) {
      const type = ctrlMatch[1] as GateType;
      const control = parseInt(ctrlMatch[2]);
      const target = parseInt(ctrlMatch[3]);
      qubits = Math.max(qubits, control + 1, target + 1);
      const s = getNextStep([control, target]);
      gates.push({ id: uuidv4(), type, targets: [target], controls: [control], step: s });
      continue;
    }

    // swap q[a],q[b];
    const swapMatch = line.match(/^swap\s+\w+\[(\d+)\]\s*,\s*\w+\[(\d+)\]\s*;/);
    if (swapMatch) {
      const a = parseInt(swapMatch[1]);
      const b = parseInt(swapMatch[2]);
      qubits = Math.max(qubits, a + 1, b + 1);
      const s = getNextStep([a, b]);
      gates.push({ id: uuidv4(), type: 'swap', targets: [a, b], step: s });
      continue;
    }

    // ccx q[0],q[1],q[2];
    const ccxMatch = line.match(/^ccx\s+\w+\[(\d+)\]\s*,\s*\w+\[(\d+)\]\s*,\s*\w+\[(\d+)\]\s*;/);
    if (ccxMatch) {
      const c1 = parseInt(ccxMatch[1]);
      const c2 = parseInt(ccxMatch[2]);
      const target = parseInt(ccxMatch[3]);
      qubits = Math.max(qubits, c1 + 1, c2 + 1, target + 1);
      const s = getNextStep([c1, c2, target]);
      gates.push({ id: uuidv4(), type: 'ccx', targets: [target], controls: [c1, c2], step: s });
      continue;
    }

    // measure q[0] -> c[0];
    const measureMatch = line.match(/^measure\s+\w+\[(\d+)\]\s*->\s*\w+\[(\d+)\]\s*;/);
    if (measureMatch) {
      const qubit = parseInt(measureMatch[1]);
      qubits = Math.max(qubits, qubit + 1);
      const s = getNextStep([qubit]);
      gates.push({ id: uuidv4(), type: 'measure', targets: [qubit], step: s });
      continue;
    }

    // Unknown line - record error but continue
    if (line.endsWith(';')) {
      errors.push({ line: i + 1, message: `Unsupported gate: ${line}` });
    }
  }

  // Ensure at least 1 qubit
  if (qubits === 0 && gates.length > 0) qubits = 1;

  return { qubits: Math.max(qubits, 1), gates, errors };
}
