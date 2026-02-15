import type { Algorithm } from '../types/circuit';

export const grover: Algorithm = {
  name: "Grover's Search",
  description: 'Quantum search algorithm that finds a marked item in an unsorted database quadratically faster than classical search.',
  qubits: 3,
  qasm: `OPENQASM 2.0;
include "qelib1.inc";

qreg q[3];
creg c[3];

h q[0];
h q[1];
h q[2];

x q[0];
x q[1];
h q[2];
ccx q[0],q[1],q[2];
h q[2];
x q[0];
x q[1];

h q[0];
h q[1];
h q[2];
x q[0];
x q[1];
x q[2];
h q[2];
ccx q[0],q[1],q[2];
h q[2];
x q[0];
x q[1];
x q[2];
h q[0];
h q[1];
h q[2];

measure q[0] -> c[0];
measure q[1] -> c[1];
measure q[2] -> c[2];
`,
};
