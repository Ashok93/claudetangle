import type { Algorithm } from '../types/circuit';

export const deutschJozsa: Algorithm = {
  name: 'Deutsch-Jozsa',
  description: 'Determines if a function is constant or balanced with a single query - exponential speedup over classical.',
  qubits: 3,
  qasm: `OPENQASM 2.0;
include "qelib1.inc";

qreg q[3];
creg c[3];

x q[2];

h q[0];
h q[1];
h q[2];

cx q[0],q[2];
cx q[1],q[2];

h q[0];
h q[1];

measure q[0] -> c[0];
measure q[1] -> c[1];
`,
};
