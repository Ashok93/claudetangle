import type { Algorithm } from '../types/circuit';

export const ghzState: Algorithm = {
  name: 'GHZ State',
  description: 'Greenberger-Horne-Zeilinger state: three-qubit entanglement where all qubits are correlated.',
  qubits: 3,
  qasm: `OPENQASM 2.0;
include "qelib1.inc";

qreg q[3];
creg c[3];

h q[0];
cx q[0],q[1];
cx q[0],q[2];

measure q[0] -> c[0];
measure q[1] -> c[1];
measure q[2] -> c[2];
`,
};
