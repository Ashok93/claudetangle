// Simplified quantum gate math for learn mode (1-2 qubits)
// Single-qubit: operates on { amplitude, phase } (Bloch sphere params)
// Two-qubit: uses 4-element complex state vector

export interface QubitState {
  amplitude: number; // probability of |1> (0..1)
  phase: number;     // phase angle in radians
}

// Convert Bloch params to complex amplitudes [alpha_real, alpha_imag, beta_real, beta_imag]
function toComplex(q: QubitState): [number, number, number, number] {
  const theta = 2 * Math.asin(Math.sqrt(Math.max(0, Math.min(1, q.amplitude))));
  const alphaR = Math.cos(theta / 2);
  const alphaI = 0;
  const betaR = Math.sin(theta / 2) * Math.cos(q.phase);
  const betaI = Math.sin(theta / 2) * Math.sin(q.phase);
  return [alphaR, alphaI, betaR, betaI];
}

// Convert complex amplitudes back to Bloch params
function fromComplex(aR: number, aI: number, bR: number, bI: number): QubitState {
  const prob1 = bR * bR + bI * bI;
  const amplitude = Math.max(0, Math.min(1, prob1));
  let phase = Math.atan2(bI, bR);
  // Normalize by alpha phase
  const alphaPhase = Math.atan2(aI, aR);
  phase = phase - alphaPhase;
  // Keep in [0, 2pi)
  phase = ((phase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  return { amplitude, phase };
}

export function applyH(q: QubitState): QubitState {
  const [aR, aI, bR, bI] = toComplex(q);
  const inv = 1 / Math.sqrt(2);
  const newAR = inv * (aR + bR);
  const newAI = inv * (aI + bI);
  const newBR = inv * (aR - bR);
  const newBI = inv * (aI - bI);
  return fromComplex(newAR, newAI, newBR, newBI);
}

export function applyX(q: QubitState): QubitState {
  const [aR, aI, bR, bI] = toComplex(q);
  return fromComplex(bR, bI, aR, aI);
}

export function applyZ(q: QubitState): QubitState {
  const [aR, aI, bR, bI] = toComplex(q);
  return fromComplex(aR, aI, -bR, -bI);
}

export function applyS(q: QubitState): QubitState {
  const [aR, aI, bR, bI] = toComplex(q);
  // S: multiply |1> by i
  return fromComplex(aR, aI, -bI, bR);
}

export function applyT(q: QubitState): QubitState {
  const [aR, aI, bR, bI] = toComplex(q);
  // T: multiply |1> by e^{i*pi/4}
  const cos = Math.SQRT1_2;
  const sin = Math.SQRT1_2;
  const newBR = bR * cos - bI * sin;
  const newBI = bR * sin + bI * cos;
  return fromComplex(aR, aI, newBR, newBI);
}

// Two-qubit state: 4 complex amplitudes [|00>, |01>, |10>, |11>]
// Each stored as [real, imag]
export type TwoQubitState = [number, number, number, number, number, number, number, number];

export function twoQubitInit(): TwoQubitState {
  // |00>
  return [1, 0, 0, 0, 0, 0, 0, 0];
}

export function twoQubitFromSingle(a: QubitState, b: QubitState): TwoQubitState {
  const [aR, aI, bR, bI] = toComplex(a);
  const [cR, cI, dR, dI] = toComplex(b);
  // Tensor product: |ab> = a tensor b
  // |00> = alpha_a * alpha_b
  // |01> = alpha_a * beta_b
  // |10> = beta_a * alpha_b
  // |11> = beta_a * beta_b
  return [
    aR * cR - aI * cI, aR * cI + aI * cR, // |00>
    aR * dR - aI * dI, aR * dI + aI * dR, // |01>
    bR * cR - bI * cI, bR * cI + bI * cR, // |10>
    bR * dR - bI * dI, bR * dI + bI * dR, // |11>
  ];
}

export function applyHOnQubit(state: TwoQubitState, target: 0 | 1): TwoQubitState {
  const s = [...state] as TwoQubitState;
  const inv = 1 / Math.sqrt(2);
  const out: TwoQubitState = [0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    const bit = (i >> target) & 1;
    const partner = i ^ (1 << target);
    const rIdx = i * 2;
    const pIdx = partner * 2;
    if (bit === 0) {
      out[rIdx] += inv * s[rIdx];
      out[rIdx + 1] += inv * s[rIdx + 1];
      out[pIdx] += inv * s[rIdx];
      out[pIdx + 1] += inv * s[rIdx + 1];
    } else {
      out[rIdx] += -inv * s[rIdx];
      out[rIdx + 1] += -inv * s[rIdx + 1];
      out[pIdx] += inv * s[rIdx];
      out[pIdx + 1] += inv * s[rIdx + 1];
    }
  }
  return out;
}

export function applyXOnQubit(state: TwoQubitState, target: 0 | 1): TwoQubitState {
  const out: TwoQubitState = [0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    const flipped = i ^ (1 << target);
    out[flipped * 2] += state[i * 2];
    out[flipped * 2 + 1] += state[i * 2 + 1];
  }
  return out;
}

export function applyCNOT(state: TwoQubitState): TwoQubitState {
  // Control = qubit 0 (bit 0), Target = qubit 1 (bit 1)
  // Flip target when control is |1>
  const out: TwoQubitState = [0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    if ((i >> 0) & 1) {
      // Control is 1, flip target
      const flipped = i ^ (1 << 1);
      out[flipped * 2] += state[i * 2];
      out[flipped * 2 + 1] += state[i * 2 + 1];
    } else {
      out[i * 2] += state[i * 2];
      out[i * 2 + 1] += state[i * 2 + 1];
    }
  }
  return out;
}

export function measureTwoQubit(state: TwoQubitState): { a: number; b: number } {
  // Born rule sampling
  const probs = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    probs[i] = state[i * 2] * state[i * 2] + state[i * 2 + 1] * state[i * 2 + 1];
  }
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < 4; i++) {
    cumulative += probs[i];
    if (r < cumulative) {
      return { a: i & 1, b: (i >> 1) & 1 };
    }
  }
  return { a: 1, b: 1 };
}

export function measureSingle(q: QubitState): number {
  return Math.random() < q.amplitude ? 1 : 0;
}

// Get per-qubit marginals from two-qubit state
// State encoding: [|00⟩_r, |00⟩_i, |01⟩_r, |01⟩_i, |10⟩_r, |10⟩_i, |11⟩_r, |11⟩_i]
// Index bits: A = bit 0, B = bit 1
// Index 0 (00): A=0,B=0  Index 1 (01): A=1,B=0  Index 2 (10): A=0,B=1  Index 3 (11): A=1,B=1
export function twoQubitMarginals(state: TwoQubitState): { ampA: number; phaseA: number; ampB: number; phaseB: number } {
  // Qubit A (bit 0): |1⟩ at indices 1,3 → array positions [2,3] and [6,7]
  const prob1A = state[2] * state[2] + state[3] * state[3] + state[6] * state[6] + state[7] * state[7];
  // Qubit B (bit 1): |1⟩ at indices 2,3 → array positions [4,5] and [6,7]
  const prob1B = state[4] * state[4] + state[5] * state[5] + state[6] * state[6] + state[7] * state[7];

  // Dominant phase for A: largest |1⟩_A component (indices 1 and 3)
  let phaseA = 0;
  const probA_idx1 = state[2] * state[2] + state[3] * state[3]; // index 1: A=1,B=0
  const probA_idx3 = state[6] * state[6] + state[7] * state[7]; // index 3: A=1,B=1
  if (probA_idx1 > probA_idx3) {
    phaseA = Math.atan2(state[3], state[2]);
  } else if (probA_idx3 > 0) {
    phaseA = Math.atan2(state[7], state[6]);
  }

  // Dominant phase for B: largest |1⟩_B component (indices 2 and 3)
  let phaseB = 0;
  const probB_idx2 = state[4] * state[4] + state[5] * state[5]; // index 2: A=0,B=1
  const probB_idx3 = state[6] * state[6] + state[7] * state[7]; // index 3: A=1,B=1
  if (probB_idx2 > probB_idx3) {
    phaseB = Math.atan2(state[5], state[4]);
  } else if (probB_idx3 > 0) {
    phaseB = Math.atan2(state[7], state[6]);
  }

  return {
    ampA: Math.max(0, Math.min(1, prob1A)),
    phaseA: ((phaseA % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI),
    ampB: Math.max(0, Math.min(1, prob1B)),
    phaseB: ((phaseB % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI),
  };
}
