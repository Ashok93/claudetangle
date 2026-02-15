import type { Algorithm } from '../types/circuit';

export const shor: Algorithm = {
  name: "Shor's Algorithm",
  description:
    'Factors the number 15 using quantum period-finding with a full inverse QFT. The algorithm that proved quantum computers could break modern encryption — exponentially faster than any known classical method.',
  qubits: 8,
  category: 'ultimate',
  qasm: `OPENQASM 2.0;
include "qelib1.inc";

qreg q[8];
creg c[8];

// === SHOR'S ALGORITHM: Factor N=15, base a=2 ===
// 4 counting qubits (q0-q3) + 4 work qubits (q4-q7)
// Counting register: value = q0*8 + q1*4 + q2*2 + q3
// Work register:     value = q4*8 + q5*4 + q6*2 + q7

// === Stage 1: Initialize work register to |1> ===
x q[7];

// === Stage 2: Superposition on counting register ===
h q[0];
h q[1];
h q[2];
h q[3];

// === Stage 3: Controlled Modular Exponentiation ===
// Computes |x>|2^x mod 15> for all x in superposition
// Uses Fredkin (CSWAP) decomposition: cx-ccx-cx

// Controlled by q3: multiply work register by 2 mod 15
// Cyclic shift: q4->q5->q6->q7->q4
// CSWAP(q3, q4, q5)
cx q[5],q[4];
ccx q[3],q[4],q[5];
cx q[5],q[4];
// CSWAP(q3, q5, q6)
cx q[6],q[5];
ccx q[3],q[5],q[6];
cx q[6],q[5];
// CSWAP(q3, q6, q7)
cx q[7],q[6];
ccx q[3],q[6],q[7];
cx q[7],q[6];

// Controlled by q2: multiply work register by 4 mod 15
// Double cyclic shift = swap pairs
// CSWAP(q2, q4, q6)
cx q[6],q[4];
ccx q[2],q[4],q[6];
cx q[6],q[4];
// CSWAP(q2, q5, q7)
cx q[7],q[5];
ccx q[2],q[5],q[7];
cx q[7],q[5];

// q1: multiply by 2^4 mod 15 = 1 (identity)
// q0: multiply by 2^8 mod 15 = 1 (identity)

// === Stage 4: Inverse Quantum Fourier Transform ===
// Full QFT-dagger on counting register q0-q3
// Extracts period information via constructive interference

// Step 4a: Bit reversal
swap q[0],q[3];
swap q[1],q[2];

// Step 4b: Inverse QFT core (qubit by qubit, MSB to LSB after swap)
h q[3];

csdg q[3],q[2];
h q[2];

ctdg q[3],q[1];
csdg q[2],q[1];
h q[1];

cr4dg q[3],q[0];
ctdg q[2],q[0];
csdg q[1],q[0];
h q[0];

// === Stage 5: Measurement ===
// Counting register reveals multiples of N/r = 16/4 = 4
// Expected peaks: counting values 0, 4, 8, 12
// Period r=4: gcd(2^2+1, 15)=5, gcd(2^2-1, 15)=3
// Therefore 15 = 3 x 5
measure q[0] -> c[0];
measure q[1] -> c[1];
measure q[2] -> c[2];
measure q[3] -> c[3];
measure q[4] -> c[4];
measure q[5] -> c[5];
measure q[6] -> c[6];
measure q[7] -> c[7];
`,
};
