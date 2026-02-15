import type { Gate } from '../types/circuit';
import type { OutputProbability } from '../store/circuitStore';

export interface StepState {
  step: number;
  stateReal: Float64Array;
  stateImag: Float64Array;
  qubitAmplitudes: number[];  // per-qubit |1⟩ marginal probability
  qubitPhases: number[];      // per-qubit dominant phase angle
  probabilities: OutputProbability[];
}

function computeProbabilities(n: number, stateReal: Float64Array, stateImag: Float64Array): OutputProbability[] {
  const size = stateReal.length;
  const probs: OutputProbability[] = [];
  for (let i = 0; i < size; i++) {
    const prob = stateReal[i] * stateReal[i] + stateImag[i] * stateImag[i];
    const label = i.toString(2).padStart(n, '0');
    probs.push({ state: `|${label}⟩`, probability: prob, label });
  }
  return probs;
}

function computeQubitAmplitudes(n: number, stateReal: Float64Array, stateImag: Float64Array): number[] {
  const size = stateReal.length;
  const amps: number[] = [];
  for (let q = 0; q < n; q++) {
    let prob1 = 0;
    for (let i = 0; i < size; i++) {
      if ((i >> q) & 1) {
        prob1 += stateReal[i] * stateReal[i] + stateImag[i] * stateImag[i];
      }
    }
    amps.push(prob1);
  }
  return amps;
}

function computeQubitPhases(n: number, stateReal: Float64Array, stateImag: Float64Array): number[] {
  const size = stateReal.length;
  const phases: number[] = [];
  for (let q = 0; q < n; q++) {
    let maxProb = 0;
    let dominantPhase = 0;
    for (let i = 0; i < size; i++) {
      if ((i >> q) & 1) {
        const prob = stateReal[i] * stateReal[i] + stateImag[i] * stateImag[i];
        if (prob > maxProb) {
          maxProb = prob;
          dominantPhase = Math.atan2(stateImag[i], stateReal[i]);
        }
      }
    }
    phases.push(dominantPhase);
  }
  return phases;
}

// Apply phase e^{iθ} to |1⟩ component of target qubit
function applyPhase(target: number, cosTheta: number, sinTheta: number, size: number, stateReal: Float64Array, stateImag: Float64Array, newReal: Float64Array, newImag: Float64Array) {
  for (let i = 0; i < size; i++) {
    const bit = (i >> target) & 1;
    if (bit === 0) {
      newReal[i] += stateReal[i];
      newImag[i] += stateImag[i];
    } else {
      newReal[i] += stateReal[i] * cosTheta - stateImag[i] * sinTheta;
      newImag[i] += stateReal[i] * sinTheta + stateImag[i] * cosTheta;
    }
  }
}

// Apply controlled phase: e^{iθ} only when both control AND target are |1⟩
function applyControlledPhase(control: number, target: number, cosTheta: number, sinTheta: number, size: number, stateReal: Float64Array, stateImag: Float64Array, newReal: Float64Array, newImag: Float64Array) {
  for (let i = 0; i < size; i++) {
    if (((i >> control) & 1) && ((i >> target) & 1)) {
      newReal[i] += stateReal[i] * cosTheta - stateImag[i] * sinTheta;
      newImag[i] += stateReal[i] * sinTheta + stateImag[i] * cosTheta;
    } else {
      newReal[i] += stateReal[i];
      newImag[i] += stateImag[i];
    }
  }
}

// Precomputed trig values
const COS_PI_2 = 0;                          // cos(π/2)
const SIN_PI_2 = 1;                          // sin(π/2)
const COS_PI_4 = Math.SQRT1_2;              // cos(π/4) = 1/√2
const SIN_PI_4 = Math.SQRT1_2;              // sin(π/4) = 1/√2
const COS_PI_8 = Math.cos(Math.PI / 8);     // cos(π/8)
const SIN_PI_8 = Math.sin(Math.PI / 8);     // sin(π/8)

function applyGate(gate: Gate, size: number, stateReal: Float64Array, stateImag: Float64Array): { real: Float64Array; imag: Float64Array } {
  const newReal = new Float64Array(size);
  const newImag = new Float64Array(size);

  if (gate.type === 'h') {
    const target = gate.targets[0];
    const inv = 1 / Math.sqrt(2);
    for (let i = 0; i < size; i++) {
      const bit = (i >> target) & 1;
      const partner = i ^ (1 << target);
      if (bit === 0) {
        newReal[i] += inv * stateReal[i];
        newImag[i] += inv * stateImag[i];
        newReal[partner] += inv * stateReal[i];
        newImag[partner] += inv * stateImag[i];
      } else {
        newReal[i] += -inv * stateReal[i];
        newImag[i] += -inv * stateImag[i];
        newReal[partner] += inv * stateReal[i];
        newImag[partner] += inv * stateImag[i];
      }
    }
  } else if (gate.type === 'x') {
    const target = gate.targets[0];
    for (let i = 0; i < size; i++) {
      const flipped = i ^ (1 << target);
      newReal[flipped] += stateReal[i];
      newImag[flipped] += stateImag[i];
    }
  } else if (gate.type === 'y') {
    const target = gate.targets[0];
    for (let i = 0; i < size; i++) {
      const bit = (i >> target) & 1;
      const flipped = i ^ (1 << target);
      if (bit === 0) {
        newReal[flipped] += -stateImag[i];
        newImag[flipped] += stateReal[i];
      } else {
        newReal[flipped] += stateImag[i];
        newImag[flipped] += -stateReal[i];
      }
    }
  } else if (gate.type === 'z') {
    const target = gate.targets[0];
    applyPhase(target, -1, 0, size, stateReal, stateImag, newReal, newImag);
  } else if (gate.type === 's') {
    // S gate: phase π/2 on |1⟩ → multiply by i
    const target = gate.targets[0];
    applyPhase(target, COS_PI_2, SIN_PI_2, size, stateReal, stateImag, newReal, newImag);
  } else if (gate.type === 'sdg') {
    // S†: phase -π/2 on |1⟩ → multiply by -i
    const target = gate.targets[0];
    applyPhase(target, COS_PI_2, -SIN_PI_2, size, stateReal, stateImag, newReal, newImag);
  } else if (gate.type === 't') {
    // T gate: phase π/4 on |1⟩
    const target = gate.targets[0];
    applyPhase(target, COS_PI_4, SIN_PI_4, size, stateReal, stateImag, newReal, newImag);
  } else if (gate.type === 'tdg') {
    // T†: phase -π/4 on |1⟩
    const target = gate.targets[0];
    applyPhase(target, COS_PI_4, -SIN_PI_4, size, stateReal, stateImag, newReal, newImag);
  } else if (gate.type === 'cx') {
    const control = gate.controls?.[0] ?? 0;
    const target = gate.targets[0];
    for (let i = 0; i < size; i++) {
      if ((i >> control) & 1) {
        const flipped = i ^ (1 << target);
        newReal[flipped] += stateReal[i];
        newImag[flipped] += stateImag[i];
      } else {
        newReal[i] += stateReal[i];
        newImag[i] += stateImag[i];
      }
    }
  } else if (gate.type === 'ccx') {
    const c1 = gate.controls?.[0] ?? 0;
    const c2 = gate.controls?.[1] ?? 1;
    const target = gate.targets[0];
    for (let i = 0; i < size; i++) {
      if (((i >> c1) & 1) && ((i >> c2) & 1)) {
        const flipped = i ^ (1 << target);
        newReal[flipped] += stateReal[i];
        newImag[flipped] += stateImag[i];
      } else {
        newReal[i] += stateReal[i];
        newImag[i] += stateImag[i];
      }
    }
  } else if (gate.type === 'swap') {
    const a = gate.targets[0];
    const b = gate.targets[1];
    for (let i = 0; i < size; i++) {
      const bitA = (i >> a) & 1;
      const bitB = (i >> b) & 1;
      let j = i;
      if (bitA !== bitB) {
        j = i ^ (1 << a) ^ (1 << b);
      }
      newReal[j] += stateReal[i];
      newImag[j] += stateImag[i];
    }
  } else if (gate.type === 'cz') {
    // Controlled-Z: phase π when both control and target are |1⟩
    const control = gate.controls?.[0] ?? 0;
    const target = gate.targets[0];
    applyControlledPhase(control, target, -1, 0, size, stateReal, stateImag, newReal, newImag);
  } else if (gate.type === 'cs') {
    // Controlled-S: phase π/2 when both are |1⟩
    const control = gate.controls?.[0] ?? 0;
    const target = gate.targets[0];
    applyControlledPhase(control, target, COS_PI_2, SIN_PI_2, size, stateReal, stateImag, newReal, newImag);
  } else if (gate.type === 'csdg') {
    // Controlled-S†: phase -π/2
    const control = gate.controls?.[0] ?? 0;
    const target = gate.targets[0];
    applyControlledPhase(control, target, COS_PI_2, -SIN_PI_2, size, stateReal, stateImag, newReal, newImag);
  } else if (gate.type === 'ct') {
    // Controlled-T: phase π/4
    const control = gate.controls?.[0] ?? 0;
    const target = gate.targets[0];
    applyControlledPhase(control, target, COS_PI_4, SIN_PI_4, size, stateReal, stateImag, newReal, newImag);
  } else if (gate.type === 'ctdg') {
    // Controlled-T†: phase -π/4
    const control = gate.controls?.[0] ?? 0;
    const target = gate.targets[0];
    applyControlledPhase(control, target, COS_PI_4, -SIN_PI_4, size, stateReal, stateImag, newReal, newImag);
  } else if (gate.type === 'cr4') {
    // Controlled-R4: phase π/8
    const control = gate.controls?.[0] ?? 0;
    const target = gate.targets[0];
    applyControlledPhase(control, target, COS_PI_8, SIN_PI_8, size, stateReal, stateImag, newReal, newImag);
  } else if (gate.type === 'cr4dg') {
    // Controlled-R4†: phase -π/8
    const control = gate.controls?.[0] ?? 0;
    const target = gate.targets[0];
    applyControlledPhase(control, target, COS_PI_8, -SIN_PI_8, size, stateReal, stateImag, newReal, newImag);
  } else {
    // Unknown / measure — pass through
    for (let i = 0; i < size; i++) {
      newReal[i] += stateReal[i];
      newImag[i] += stateImag[i];
    }
  }

  return { real: newReal, imag: newImag };
}

export function simulateCircuit(qubits: number, gates: Gate[]): StepState[] {
  const n = qubits;
  const size = 1 << n;
  let stateReal = new Float64Array(size);
  let stateImag = new Float64Array(size);
  stateReal[0] = 1.0; // |00...0⟩

  const sorted = [...gates].sort((a, b) => a.step - b.step);

  // Group gates by step
  const stepMap = new Map<number, Gate[]>();
  for (const gate of sorted) {
    if (gate.type === 'measure') continue;
    const list = stepMap.get(gate.step) ?? [];
    list.push(gate);
    stepMap.set(gate.step, list);
  }

  const steps = [...stepMap.keys()].sort((a, b) => a - b);
  const result: StepState[] = [];

  // Initial state (step -1)
  result.push({
    step: -1,
    stateReal: new Float64Array(stateReal),
    stateImag: new Float64Array(stateImag),
    qubitAmplitudes: computeQubitAmplitudes(n, stateReal, stateImag),
    qubitPhases: computeQubitPhases(n, stateReal, stateImag),
    probabilities: computeProbabilities(n, stateReal, stateImag),
  });

  for (const step of steps) {
    const gatesAtStep = stepMap.get(step)!;
    for (const gate of gatesAtStep) {
      const { real, imag } = applyGate(gate, size, stateReal, stateImag);
      stateReal = real;
      stateImag = imag;
    }

    result.push({
      step,
      stateReal: new Float64Array(stateReal),
      stateImag: new Float64Array(stateImag),
      qubitAmplitudes: computeQubitAmplitudes(n, stateReal, stateImag),
      qubitPhases: computeQubitPhases(n, stateReal, stateImag),
      probabilities: computeProbabilities(n, stateReal, stateImag),
    });
  }

  return result;
}

// Convert phase angle to HSL color: 0→blue, π/2→green, π→red, 3π/2→yellow
export function phaseToColor(phase: number): string {
  let normalized = ((phase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const hue = (240 - (normalized / (2 * Math.PI)) * 360 + 360) % 360;
  return `hsl(${hue}, 70%, 55%)`;
}

export function phaseToHue(phase: number): number {
  let normalized = ((phase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  return (240 - (normalized / (2 * Math.PI)) * 360 + 360) % 360;
}
