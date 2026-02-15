// Sandbox simulation engine — pure math, no UI dependencies
// Operates on 1-4 qubit state vectors stored as Float64Array pairs (real, imag)

export type SandboxGate = 'h' | 'x' | 'y' | 'z' | 's' | 't' | 'cx' | 'cz' | 'swap';

export interface StateVector {
  numQubits: number;
  real: Float64Array;
  imag: Float64Array;
}

export interface BasisState {
  index: number;
  label: string;      // e.g. "01"
  ket: string;         // e.g. "|01⟩"
  probability: number;
  phase: number;       // angle in radians
}

export interface BlochCoords {
  x: number;
  y: number;
  z: number;
  purity: number;      // 0 = maximally mixed, 1 = pure
}

export interface EntanglementPair {
  q1: number;
  q2: number;
  concurrence: number; // 0 = separable, 1 = maximally entangled
}

// ---------------------------------------------------------------------------
// State initialization
// ---------------------------------------------------------------------------

export function initState(n: number): StateVector {
  const size = 1 << n;
  const real = new Float64Array(size);
  const imag = new Float64Array(size);
  real[0] = 1.0; // |00...0⟩
  return { numQubits: n, real, imag };
}

export function cloneState(sv: StateVector): StateVector {
  return {
    numQubits: sv.numQubits,
    real: new Float64Array(sv.real),
    imag: new Float64Array(sv.imag),
  };
}

// ---------------------------------------------------------------------------
// Gate application
// ---------------------------------------------------------------------------

const INV_SQRT2 = 1 / Math.sqrt(2);

export function applyGateImmediate(
  sv: StateVector,
  gate: SandboxGate,
  target: number,
  control?: number,
): StateVector {
  const n = sv.numQubits;
  const size = 1 << n;
  const { real: sr, imag: si } = sv;
  const nr = new Float64Array(size);
  const ni = new Float64Array(size);

  switch (gate) {
    case 'h': {
      for (let i = 0; i < size; i++) {
        const bit = (i >> target) & 1;
        const partner = i ^ (1 << target);
        if (bit === 0) {
          nr[i] += INV_SQRT2 * sr[i];
          ni[i] += INV_SQRT2 * si[i];
          nr[partner] += INV_SQRT2 * sr[i];
          ni[partner] += INV_SQRT2 * si[i];
        } else {
          nr[i] += -INV_SQRT2 * sr[i];
          ni[i] += -INV_SQRT2 * si[i];
          nr[partner] += INV_SQRT2 * sr[i];
          ni[partner] += INV_SQRT2 * si[i];
        }
      }
      break;
    }
    case 'x': {
      for (let i = 0; i < size; i++) {
        const flipped = i ^ (1 << target);
        nr[flipped] += sr[i];
        ni[flipped] += si[i];
      }
      break;
    }
    case 'y': {
      for (let i = 0; i < size; i++) {
        const bit = (i >> target) & 1;
        const flipped = i ^ (1 << target);
        if (bit === 0) {
          // |0⟩ → i|1⟩
          nr[flipped] += -si[i];
          ni[flipped] += sr[i];
        } else {
          // |1⟩ → -i|0⟩
          nr[flipped] += si[i];
          ni[flipped] += -sr[i];
        }
      }
      break;
    }
    case 'z': {
      for (let i = 0; i < size; i++) {
        const bit = (i >> target) & 1;
        if (bit === 0) {
          nr[i] += sr[i];
          ni[i] += si[i];
        } else {
          nr[i] += -sr[i];
          ni[i] += -si[i];
        }
      }
      break;
    }
    case 's': {
      // Phase π/2 on |1⟩: multiply by i
      for (let i = 0; i < size; i++) {
        const bit = (i >> target) & 1;
        if (bit === 0) {
          nr[i] += sr[i];
          ni[i] += si[i];
        } else {
          nr[i] += -si[i];
          ni[i] += sr[i];
        }
      }
      break;
    }
    case 't': {
      // Phase π/4 on |1⟩
      const cos = INV_SQRT2;
      const sin = INV_SQRT2;
      for (let i = 0; i < size; i++) {
        const bit = (i >> target) & 1;
        if (bit === 0) {
          nr[i] += sr[i];
          ni[i] += si[i];
        } else {
          nr[i] += sr[i] * cos - si[i] * sin;
          ni[i] += sr[i] * sin + si[i] * cos;
        }
      }
      break;
    }
    case 'cx': {
      const c = control ?? 0;
      for (let i = 0; i < size; i++) {
        if ((i >> c) & 1) {
          const flipped = i ^ (1 << target);
          nr[flipped] += sr[i];
          ni[flipped] += si[i];
        } else {
          nr[i] += sr[i];
          ni[i] += si[i];
        }
      }
      break;
    }
    case 'cz': {
      const c = control ?? 0;
      for (let i = 0; i < size; i++) {
        if (((i >> c) & 1) && ((i >> target) & 1)) {
          nr[i] += -sr[i];
          ni[i] += -si[i];
        } else {
          nr[i] += sr[i];
          ni[i] += si[i];
        }
      }
      break;
    }
    case 'swap': {
      const a = target;
      const b = control ?? 0;
      for (let i = 0; i < size; i++) {
        const bitA = (i >> a) & 1;
        const bitB = (i >> b) & 1;
        let j = i;
        if (bitA !== bitB) {
          j = i ^ (1 << a) ^ (1 << b);
        }
        nr[j] += sr[i];
        ni[j] += si[i];
      }
      break;
    }
  }

  return { numQubits: n, real: nr, imag: ni };
}

// ---------------------------------------------------------------------------
// Measurement
// ---------------------------------------------------------------------------

/** Born-rule collapse — return outcome string + collapsed state */
export function measureAll(sv: StateVector): { outcome: string; collapsed: StateVector } {
  const size = 1 << sv.numQubits;
  const r = Math.random();
  let cumulative = 0;
  let chosen = 0;

  for (let i = 0; i < size; i++) {
    cumulative += sv.real[i] * sv.real[i] + sv.imag[i] * sv.imag[i];
    if (r < cumulative) {
      chosen = i;
      break;
    }
  }

  const outcome = chosen.toString(2).padStart(sv.numQubits, '0');
  const real = new Float64Array(size);
  const imag = new Float64Array(size);
  real[chosen] = 1.0;

  return { outcome, collapsed: { numQubits: sv.numQubits, real, imag } };
}

/** Run N measurements without collapsing — return outcome distribution */
export function runMeasurements(sv: StateVector, count: number): Map<string, number> {
  const size = 1 << sv.numQubits;
  const probs: number[] = [];
  for (let i = 0; i < size; i++) {
    probs.push(sv.real[i] * sv.real[i] + sv.imag[i] * sv.imag[i]);
  }

  // Build cumulative distribution
  const cumDist: number[] = new Array(size);
  cumDist[0] = probs[0];
  for (let i = 1; i < size; i++) {
    cumDist[i] = cumDist[i - 1] + probs[i];
  }

  const results = new Map<string, number>();
  for (let m = 0; m < count; m++) {
    const r = Math.random();
    let chosen = 0;
    for (let i = 0; i < size; i++) {
      if (r < cumDist[i]) {
        chosen = i;
        break;
      }
    }
    const label = chosen.toString(2).padStart(sv.numQubits, '0');
    results.set(label, (results.get(label) ?? 0) + 1);
  }

  return results;
}

// ---------------------------------------------------------------------------
// Derived state
// ---------------------------------------------------------------------------

export function getBasisStates(sv: StateVector): BasisState[] {
  const size = 1 << sv.numQubits;
  const states: BasisState[] = [];
  for (let i = 0; i < size; i++) {
    const re = sv.real[i];
    const im = sv.imag[i];
    const prob = re * re + im * im;
    const phase = Math.atan2(im, re);
    const label = i.toString(2).padStart(sv.numQubits, '0');
    states.push({
      index: i,
      label,
      ket: `|${label}\u27E9`,
      probability: prob,
      phase,
    });
  }
  return states;
}

/** Per-qubit Bloch coordinates via partial trace (reduced density matrix) */
export function getBlochCoords(sv: StateVector): BlochCoords[] {
  const n = sv.numQubits;
  const size = 1 << n;
  const coords: BlochCoords[] = [];

  for (let q = 0; q < n; q++) {
    // Reduced density matrix for qubit q: ρ = [[ρ00, ρ01], [ρ10, ρ11]]
    let rho00_re = 0, rho00_im = 0;
    let rho01_re = 0, rho01_im = 0;
    let rho11_re = 0, rho11_im = 0;

    for (let i = 0; i < size; i++) {
      const bit = (i >> q) & 1;
      const partner = i ^ (1 << q); // flip qubit q

      const re_i = sv.real[i];
      const im_i = sv.imag[i];

      if (bit === 0) {
        // |0⟩ contribution to ρ00
        rho00_re += re_i * re_i + im_i * im_i;

        // Off-diagonal: ρ01 = sum over env |<0,env|ψ><ψ|1,env>|
        const re_p = sv.real[partner];
        const im_p = sv.imag[partner];
        rho01_re += re_i * re_p + im_i * im_p;
        rho01_im += im_i * re_p - re_i * im_p;
      } else {
        // |1⟩ contribution to ρ11
        rho11_re += re_i * re_i + im_i * im_i;
      }
    }

    // Bloch vector: x = 2*Re(ρ01), y = 2*Im(ρ01), z = ρ00 - ρ11
    const bx = 2 * rho01_re;
    const by = 2 * rho01_im;
    const bz = rho00_re - rho11_re;
    const purity = bx * bx + by * by + bz * bz;

    coords.push({ x: bx, y: by, z: bz, purity: Math.min(1, purity) });
  }

  return coords;
}

/** Pairwise concurrence between all qubit pairs */
export function getEntanglementInfo(sv: StateVector): EntanglementPair[] {
  const n = sv.numQubits;
  if (n < 2) return [];

  const pairs: EntanglementPair[] = [];

  for (let q1 = 0; q1 < n; q1++) {
    for (let q2 = q1 + 1; q2 < n; q2++) {
      // Two-qubit reduced density matrix via partial trace
      // For qubits q1, q2: trace over all other qubits
      // 4x4 matrix indexed by (b1, b2) pairs: 00, 01, 10, 11
      const rho_re = new Float64Array(16); // [row * 4 + col]
      const rho_im = new Float64Array(16);

      const size = 1 << n;
      for (let i = 0; i < size; i++) {
        const b1 = (i >> q1) & 1;
        const b2 = (i >> q2) & 1;
        const row = b1 * 2 + b2;

        for (let j = 0; j < size; j++) {
          // j must match i on all qubits except q1, q2
          const mask = ((1 << n) - 1) ^ (1 << q1) ^ (1 << q2);
          if ((i & mask) !== (j & mask)) continue;

          const b1j = (j >> q1) & 1;
          const b2j = (j >> q2) & 1;
          const col = b1j * 2 + b2j;

          // ρ[row][col] += |i⟩⟨j|
          rho_re[row * 4 + col] += sv.real[i] * sv.real[j] + sv.imag[i] * sv.imag[j];
          rho_im[row * 4 + col] += sv.imag[i] * sv.real[j] - sv.real[i] * sv.imag[j];
        }
      }

      // Concurrence via Wootters formula for 2-qubit density matrix
      // σ_y ⊗ σ_y = [[0,0,0,-1],[0,0,1,0],[0,1,0,0],[-1,0,0,0]]
      // R = ρ (σ_y⊗σ_y) ρ* (σ_y⊗σ_y)

      // For practical purposes with small states, use a simpler check:
      // Concurrence ≈ 2|det(reshaped state)| for pure states of the pair
      // Use linear entropy as proxy: C ≈ sqrt(2(1 - Tr(ρ_q1²)))
      // But since we already have the 2-qubit ρ, compute proper concurrence

      // Simplified: use the purity-based entanglement measure
      // Trace of ρ²
      let trRhoSq = 0;
      for (let r = 0; r < 4; r++) {
        for (let k = 0; k < 4; k++) {
          trRhoSq += rho_re[r * 4 + k] * rho_re[k * 4 + r] - rho_im[r * 4 + k] * rho_im[k * 4 + r];
        }
      }

      // For 2-qubit subsystem from a pure overall state:
      // Concurrence = sqrt(2(1 - Tr(ρ_reduced²)))
      // where ρ_reduced is the single-qubit reduced density matrix
      // But we use the 2-qubit ρ purity as entanglement indicator

      // Single qubit reduced from the pair — just trace over q2
      let rho_q1_00 = rho_re[0 * 4 + 0] + rho_re[1 * 4 + 1]; // |0><0| terms
      let rho_q1_11 = rho_re[2 * 4 + 2] + rho_re[3 * 4 + 3]; // |1><1| terms
      let rho_q1_01_re = rho_re[0 * 4 + 2] + rho_re[1 * 4 + 3];
      let rho_q1_01_im = rho_im[0 * 4 + 2] + rho_im[1 * 4 + 3];

      const purity_q1 = rho_q1_00 * rho_q1_00 + rho_q1_11 * rho_q1_11 +
        2 * (rho_q1_01_re * rho_q1_01_re + rho_q1_01_im * rho_q1_01_im);

      // concurrence from linear entropy: C = sqrt(2(1 - purity))
      const concurrence = Math.sqrt(Math.max(0, 2 * (1 - purity_q1)));

      if (concurrence > 0.01) {
        pairs.push({ q1, q2, concurrence: Math.min(1, concurrence) });
      }
    }
  }

  return pairs;
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

export function toKetNotation(sv: StateVector): string {
  const basis = getBasisStates(sv);
  const threshold = 1e-6;
  const terms: string[] = [];

  // Find global phase from first nonzero term to make display cleaner
  let globalPhase = 0;
  for (const b of basis) {
    if (b.probability > threshold) {
      globalPhase = b.phase;
      break;
    }
  }

  for (const b of basis) {
    if (b.probability < threshold) continue;
    const amp = Math.sqrt(b.probability);
    const relPhase = b.phase - globalPhase;

    // Normalize relative phase to [-π, π]
    const normPhase = ((relPhase + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;

    let coeff: string;
    if (Math.abs(normPhase) < 0.01) {
      // Positive real
      coeff = amp > 0.999 ? '' : amp.toFixed(2);
    } else if (Math.abs(normPhase - Math.PI) < 0.01 || Math.abs(normPhase + Math.PI) < 0.01) {
      // Negative real
      coeff = amp > 0.999 ? '-' : `-${amp.toFixed(2)}`;
    } else if (Math.abs(normPhase - Math.PI / 2) < 0.01) {
      coeff = amp > 0.999 ? 'i' : `${amp.toFixed(2)}i`;
    } else if (Math.abs(normPhase + Math.PI / 2) < 0.01) {
      coeff = amp > 0.999 ? '-i' : `-${amp.toFixed(2)}i`;
    } else {
      coeff = amp.toFixed(2);
    }

    const term = `${coeff}|${b.label}\u27E9`;
    terms.push(term);
  }

  if (terms.length === 0) return '|' + '0'.repeat(sv.numQubits) + '\u27E9';

  let result = terms[0];
  for (let i = 1; i < terms.length; i++) {
    const t = terms[i];
    if (t.startsWith('-')) {
      result += ` - ${t.slice(1)}`;
    } else {
      result += ` + ${t}`;
    }
  }

  return result;
}

export function describeState(sv: StateVector): string {
  const n = sv.numQubits;
  const basis = getBasisStates(sv);
  const nonZero = basis.filter((b) => b.probability > 0.01);
  const entanglement = getEntanglementInfo(sv);

  if (nonZero.length === 1) {
    const b = nonZero[0];
    if (b.label === '0'.repeat(n)) {
      return n === 1
        ? 'Qubit is in the ground state |0\u27E9'
        : `All ${n} qubits are in the ground state |${'0'.repeat(n)}\u27E9`;
    }
    return `Definite state ${b.ket} \u2014 measurement will always give "${b.label}"`;
  }

  if (entanglement.length > 0) {
    const maxC = Math.max(...entanglement.map((e) => e.concurrence));
    if (maxC > 0.9) {
      return 'Qubits are maximally entangled \u2014 measuring one instantly determines the other';
    }
    return 'Qubits are entangled \u2014 measuring one affects the other';
  }

  if (n === 1) {
    const p0 = basis[0].probability;
    if (Math.abs(p0 - 0.5) < 0.05) {
      return 'Equal superposition \u2014 50/50 chance of |0\u27E9 or |1\u27E9';
    }
    return `Superposition \u2014 ${(p0 * 100).toFixed(0)}% chance of |0\u27E9, ${((1 - p0) * 100).toFixed(0)}% chance of |1\u27E9`;
  }

  return `Superposition of ${nonZero.length} basis states`;
}
