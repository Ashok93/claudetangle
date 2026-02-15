import type { OutputProbability } from '../store/circuitStore';

export interface ResultInterpretation {
  headline: string;
  explanation: string;
  details: { label: string; value: string; highlight?: boolean }[];
  steps: { step: number; title: string; detail: string }[];
}

/**
 * Marginalize over work register bits for Shor's algorithm.
 * Shor's uses 8 qubits: 4 counting (high bits) + 4 work (low bits).
 * Sums probabilities over work register to show only 16 counting-register bars.
 */
export function marginalizeWorkRegister(
  probs: OutputProbability[],
  countingBits: number,
  workBits: number
): OutputProbability[] {
  const countingSize = 1 << countingBits;
  const result: OutputProbability[] = [];

  for (let c = 0; c < countingSize; c++) {
    let sumProb = 0;
    const workSize = 1 << workBits;
    for (let w = 0; w < workSize; w++) {
      const idx = (c << workBits) | w;
      if (idx < probs.length) {
        sumProb += probs[idx].probability;
      }
    }
    const label = c.toString(2).padStart(countingBits, '0');
    result.push({
      state: `|${label}⟩`,
      probability: sumProb,
      label,
    });
  }

  return result;
}

function bellStateInterpreter(probs: OutputProbability[]): ResultInterpretation {
  const sig = probs.filter((p) => p.probability > 0.1);
  const states = sig.map((p) => p.label).join(', ');
  const isCorrelated = sig.every((p) => p.label[0] === p.label[1]);
  const isAntiCorrelated = sig.every((p) => p.label[0] !== p.label[1]);

  return {
    headline: 'Entangled pair created',
    explanation: isCorrelated
      ? 'Both qubits always agree \u2014 measuring one instantly determines the other, no matter the distance.'
      : isAntiCorrelated
      ? 'Qubits always disagree \u2014 one is 0 when the other is 1, perfectly anti-correlated.'
      : 'Two qubits are now quantum entangled.',
    details: [
      { label: 'Possible outcomes', value: states, highlight: true },
      { label: 'Correlation', value: isCorrelated ? 'Perfect (same)' : isAntiCorrelated ? 'Perfect (opposite)' : 'Entangled' },
      { label: 'Classical equivalent', value: 'Impossible \u2014 no hidden variables can explain this' },
    ],
    steps: [
      { step: 1, title: 'Start with |00\u27E9', detail: 'Both qubits begin in the ground state \u2014 100% chance of measuring 0 for each.' },
      { step: 2, title: 'Hadamard on q0', detail: 'Puts q0 into superposition: equal chance of 0 or 1. q1 is still definitely 0. State: (|00\u27E9 + |10\u27E9)/\u221A2' },
      { step: 3, title: 'CNOT (q0 controls q1)', detail: 'If q0 is 1, flip q1. Now they are entangled: |00\u27E9 + |11\u27E9. Both 0 or both 1 \u2014 measuring one instantly determines the other.' },
      { step: 4, title: 'Result', detail: 'This is a Bell state \u2014 the simplest entangled state. Einstein called this "spooky action at a distance". No classical system can reproduce these correlations.' },
    ],
  };
}

function ghzInterpreter(probs: OutputProbability[]): ResultInterpretation {
  const sig = probs.filter((p) => p.probability > 0.1);
  const states = sig.map((p) => p.label).join(', ');

  return {
    headline: 'Three-way entanglement',
    explanation: 'All three qubits are entangled \u2014 all 0 or all 1, never a mix. This is the GHZ state, a key resource for quantum error correction.',
    details: [
      { label: 'Possible outcomes', value: states, highlight: true },
      { label: 'Entanglement type', value: 'Genuine multipartite (GHZ)' },
      { label: 'Key property', value: 'Maximally entangled \u2014 measuring any qubit collapses all three' },
    ],
    steps: [
      { step: 1, title: 'Start with |000\u27E9', detail: 'All three qubits in the ground state.' },
      { step: 2, title: 'Hadamard on q0', detail: 'q0 enters superposition. State: (|000\u27E9 + |100\u27E9)/\u221A2' },
      { step: 3, title: 'CNOT chain', detail: 'q0 controls q1, then q1 controls q2. Each CNOT spreads the entanglement one qubit further. Final state: (|000\u27E9 + |111\u27E9)/\u221A2' },
      { step: 4, title: 'Result', detail: 'This is the GHZ state \u2014 all three qubits are maximally entangled. They are ALL 0 or ALL 1, never a mix. Used in quantum error correction and demonstrating quantum non-locality.' },
    ],
  };
}

function teleportationInterpreter(_probs: OutputProbability[]): ResultInterpretation {
  return {
    headline: 'Quantum state teleported',
    explanation: "q0's quantum state has been transferred to q2 using entanglement and classical communication \u2014 without physically moving the qubit.",
    details: [
      { label: 'Source', value: 'q0', highlight: true },
      { label: 'Destination', value: 'q2', highlight: true },
      { label: 'Channel', value: 'q1-q2 entangled pair' },
      { label: 'Key insight', value: 'State moved, not copied (no-cloning theorem)' },
    ],
    steps: [
      { step: 1, title: 'Prepare the state to teleport', detail: 'q0 holds the quantum state we want to send to q2. It could be any superposition.' },
      { step: 2, title: 'Create entangled channel', detail: 'q1 and q2 are entangled via Hadamard + CNOT, creating a Bell pair \u2014 the quantum "telephone line".' },
      { step: 3, title: 'Bell measurement on q0, q1', detail: 'CNOT + Hadamard + Measurement on q0 and q1. This entangles q0 with the channel and collapses q2 into a state related to q0\'s original state.' },
      { step: 4, title: 'Result', detail: 'q0\'s state has been transferred to q2 without them ever interacting directly. The original at q0 is destroyed (no-cloning theorem). This is the basis of quantum networks.' },
    ],
  };
}

function groverInterpreter(probs: OutputProbability[]): ResultInterpretation {
  const sorted = [...probs].sort((a, b) => b.probability - a.probability);
  const winner = sorted[0];
  const winnerPct = (winner.probability * 100).toFixed(0);
  const n = winner.label.length;
  const uniformPct = (100 / Math.pow(2, n)).toFixed(1);
  const searchSpace = Math.pow(2, n);

  return {
    headline: `Found: ${winner.state}`,
    explanation: `Grover's algorithm amplified the marked item from ${uniformPct}% to ${winnerPct}% probability \u2014 a quadratic speedup over classical search.`,
    details: [
      { label: 'Target state', value: winner.state, highlight: true },
      { label: 'Success probability', value: `${winnerPct}%`, highlight: true },
      { label: 'Search space', value: `${searchSpace} items` },
      { label: 'Speedup', value: `\u221A${searchSpace} vs ${searchSpace} classical queries` },
    ],
    steps: [
      { step: 1, title: 'Equal superposition', detail: `Hadamard gates put all ${n} qubits into superposition \u2014 every possible answer (${searchSpace} items) has equal ${uniformPct}% probability.` },
      { step: 2, title: 'Oracle marks the target', detail: `A quantum oracle flips the phase of the target state ${winner.state}. This phase flip is invisible if you measure now, but it sets up interference.` },
      { step: 3, title: 'Amplification (diffusion)', detail: 'The diffusion operator reflects all amplitudes about their average. The marked state (with negative phase) gets boosted while unmarked states shrink. Like waves focusing energy at one point.' },
      { step: 4, title: 'Result', detail: `After \u221A${searchSpace} \u2248 ${Math.round(Math.sqrt(searchSpace))} iterations, the target has ~${winnerPct}% probability. Classical search needs ${searchSpace}/2 tries on average \u2014 quantum is quadratically faster.` },
    ],
  };
}

function deutschJozsaInterpreter(probs: OutputProbability[]): ResultInterpretation {
  const sig = probs.filter((p) => p.probability > 0.1);
  const allZero = sig.length === 1 && sig[0].label.replace(/0/g, '').length === 0;
  const result = allZero ? 'CONSTANT' : 'BALANCED';

  return {
    headline: `Function is ${result}`,
    explanation: result === 'CONSTANT'
      ? 'The function returns the same value for all inputs. Quantum parallelism determined this with just 1 query instead of checking half the inputs + 1.'
      : 'The function returns 0 for exactly half the inputs and 1 for the other half. Determined with certainty in a single query.',
    details: [
      { label: 'Verdict', value: result, highlight: true },
      { label: 'Quantum queries', value: '1' },
      { label: 'Classical queries needed', value: '2^(n-1) + 1 (worst case)' },
      { label: 'Speedup', value: 'Exponential' },
    ],
    steps: [
      { step: 1, title: 'Quantum parallelism', detail: 'Hadamard gates create a superposition of all possible inputs simultaneously \u2014 the function is queried on ALL inputs at once.' },
      { step: 2, title: 'Query the oracle once', detail: 'The oracle evaluates f(x) on every input in superposition. The output qubit accumulates phase kicks that encode whether f is constant or balanced.' },
      { step: 3, title: 'Interference reveals the answer', detail: 'Final Hadamard gates cause interference. If f is constant, all input qubits return to |0\u27E9 (constructive interference). If balanced, at least one qubit is |1\u27E9 (destructive interference).' },
      { step: 4, title: 'Result', detail: `The function is ${result}. One quantum query accomplished what would classically require checking more than half the inputs. This is an exponential speedup!` },
    ],
  };
}

function qftInterpreter(probs: OutputProbability[]): ResultInterpretation {
  const sig = probs.filter((p) => p.probability > 0.05);

  return {
    headline: 'Frequency spectrum extracted',
    explanation: 'The Quantum Fourier Transform converts quantum amplitudes into frequency components \u2014 like a prism splitting light into colors. This is the key subroutine inside Shor\'s algorithm.',
    details: [
      { label: 'Output states', value: `${sig.length} significant frequencies` },
      { label: 'Analogy', value: 'Quantum version of the Fast Fourier Transform' },
      { label: 'Applications', value: 'Period finding, phase estimation, cryptography' },
    ],
    steps: [
      { step: 1, title: 'Input state encoding', detail: 'The input quantum state encodes a signal \u2014 like a waveform containing hidden frequencies.' },
      { step: 2, title: 'Hadamard + controlled rotations', detail: 'Each qubit gets a Hadamard gate followed by increasingly fine controlled phase rotations. These gates decompose the signal into its frequency components.' },
      { step: 3, title: 'Qubit swap', detail: 'Final swap reverses the qubit order so the output reads correctly \u2014 like flipping a spectrum to read left-to-right.' },
      { step: 4, title: 'Result', detail: 'The output encodes the frequency spectrum. Peaks correspond to dominant frequencies in the input. This is exponentially faster than classical FFT for large inputs.' },
    ],
  };
}

function shorInterpreter(probs: OutputProbability[]): ResultInterpretation {
  // Marginalize to counting register for display
  const margProbs = probs.length === 256
    ? marginalizeWorkRegister(probs, 4, 4)
    : probs;
  const sig = margProbs.filter((p) => p.probability > 0.01);

  // Find peaks (for N=15, a=2: period r=4, peaks at 0, 4, 8, 12)
  const peaks = sig
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 6)
    .map((p) => parseInt(p.label, 2));
  peaks.sort((a, b) => a - b);

  const peakLabels = peaks.map((p) => p.toString()).join(', ');
  const spacing = peaks.length >= 2 ? peaks[1] - peaks[0] : 0;

  return {
    headline: '15 = 3 \u00d7 5',
    explanation: "Shor's algorithm found the prime factors of 15 by discovering a hidden period in modular exponentiation. This is the algorithm that threatens RSA encryption.",
    details: [
      { label: 'Number factored', value: 'N = 15', highlight: true },
      { label: 'Factors found', value: '3 and 5', highlight: true },
      { label: 'Period discovered', value: 'r = 4' },
      { label: 'Peak positions', value: peakLabels, highlight: true },
      { label: 'Method', value: 'gcd(2\u00b2+1, 15) = 5, gcd(2\u00b2\u22121, 15) = 3' },
    ],
    steps: [
      {
        step: 1,
        title: 'Choose a random base',
        detail: 'Pick a = 2 (any number coprime to 15). We want to find how often 2^x mod 15 repeats \u2014 its "period".',
      },
      {
        step: 2,
        title: 'Create superposition of all inputs',
        detail: 'Hadamard gates on counting register (q0\u2013q3) create equal superposition of values 0\u201315. Each value will be evaluated in parallel.',
      },
      {
        step: 3,
        title: 'Compute 2^x mod 15 in quantum parallel',
        detail: 'For each x in superposition, compute 2^x mod 15 on the work register (q4\u2013q7). Results: x=0\u21921, x=1\u21922, x=2\u21924, x=3\u21928, x=4\u21921, ... The pattern repeats every 4 steps!',
      },
      {
        step: 4,
        title: 'Quantum Fourier Transform reveals the period',
        detail: 'QFT on the counting register converts the periodic pattern into sharp frequency peaks. Constructive interference amplifies states that are multiples of 16/period = 16/4 = 4.',
      },
      {
        step: 5,
        title: 'Read the peaks: 0, 4, 8, 12',
        detail: `The 4 probability peaks are evenly spaced by ${spacing || 4}. From 16 slots with spacing 4: period r = 16/${spacing || 4} = 4. This tells us 2^x mod 15 repeats every 4 steps.`,
      },
      {
        step: 6,
        title: 'Convert period to factors',
        detail: 'With period r = 4: compute a^(r/2) = 2^2 = 4. Then: gcd(4 + 1, 15) = gcd(5, 15) = 5 and gcd(4 \u2212 1, 15) = gcd(3, 15) = 3.',
      },
      {
        step: 7,
        title: 'Factors found: 15 = 3 \u00d7 5',
        detail: 'The prime factors are 3 and 5. For large numbers (hundreds of digits), this quantum approach is exponentially faster than any known classical algorithm \u2014 this is why quantum computers threaten RSA encryption.',
      },
    ],
  };
}

function genericInterpreter(probs: OutputProbability[]): ResultInterpretation {
  const sig = probs.filter((p) => p.probability > 0.1);
  const sorted = [...probs].sort((a, b) => b.probability - a.probability);
  const top = sorted[0];

  if (sig.length === 1) {
    return {
      headline: `Deterministic: ${top.state}`,
      explanation: 'The circuit produces a single outcome with near-certainty.',
      details: [
        { label: 'Output', value: top.state, highlight: true },
        { label: 'Probability', value: `${(top.probability * 100).toFixed(1)}%` },
      ],
      steps: [],
    };
  }

  if (sig.length === 2) {
    return {
      headline: 'Entangled output',
      explanation: 'Two outcomes are equally likely and quantumly correlated.',
      details: [
        { label: 'Outcomes', value: sig.map((p) => p.state).join(' and '), highlight: true },
        { label: 'Probabilities', value: sig.map((p) => `${(p.probability * 100).toFixed(0)}%`).join(', ') },
      ],
      steps: [],
    };
  }

  return {
    headline: `${sig.length} outcome superposition`,
    explanation: 'The quantum state is spread across multiple measurement outcomes.',
    details: [
      { label: 'Most likely', value: `${top.state} at ${(top.probability * 100).toFixed(1)}%`, highlight: true },
      { label: 'Significant outcomes', value: `${sig.length} of ${probs.length}` },
    ],
    steps: [],
  };
}

const interpreters: Record<string, (probs: OutputProbability[]) => ResultInterpretation> = {
  'Bell State': bellStateInterpreter,
  'GHZ State': ghzInterpreter,
  'Quantum Teleportation': teleportationInterpreter,
  "Grover's Search": groverInterpreter,
  'Deutsch-Jozsa': deutschJozsaInterpreter,
  'Quantum Fourier Transform': qftInterpreter,
  "Shor's Algorithm": shorInterpreter,
};

export function interpretResult(
  algorithmName: string | null,
  probs: OutputProbability[]
): ResultInterpretation {
  if (algorithmName && interpreters[algorithmName]) {
    return interpreters[algorithmName](probs);
  }
  return genericInterpreter(probs);
}
