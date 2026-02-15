import type { Algorithm } from '../types/circuit';

export const bellState: Algorithm = {
  name: 'Bell State',
  description: 'Creates maximum entanglement between two qubits. The simplest example of quantum entanglement.',
  qubits: 2,
  qasm: `OPENQASM 2.0;
include "qelib1.inc";

qreg q[2];
creg c[2];

h q[0];
cx q[0],q[1];

measure q[0] -> c[0];
measure q[1] -> c[1];
`,
};
