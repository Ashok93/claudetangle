import type { GateType } from '../types/circuit';
import { THEME_GATE_COLORS } from './theme';

export interface GateExplanation {
  name: string;
  icon: string;
  color: string;
  oneLiner: string;
  analogy: string;
  whatYouSee: string;
  quantumConcept: string;
  stateEffect: string;
}

export const GATE_INFO: Record<GateType, GateExplanation> = {
  h: {
    name: 'Hadamard Gate',
    icon: 'H',
    color: THEME_GATE_COLORS.h,
    oneLiner: 'Puts a qubit into superposition — both 0 and 1 at once.',
    analogy: 'Like flipping a coin and freezing it mid-air. It\'s not heads or tails — it\'s genuinely both until you look.',
    whatYouSee: 'The spinning crystal splits the rail\'s energy into two paths. This is superposition — the qubit now explores both possibilities simultaneously.',
    quantumConcept: 'Superposition',
    stateEffect: 'Transforms |0⟩ to (|0⟩+|1⟩)/√2',
  },
  x: {
    name: 'Pauli-X Gate (NOT)',
    icon: 'X',
    color: THEME_GATE_COLORS.x,
    oneLiner: 'Flips the qubit — turns 0 into 1 and 1 into 0.',
    analogy: 'Like a light switch. If it was on, it\'s now off. The simplest quantum move.',
    whatYouSee: 'The red orb rotates the qubit\'s state 180°. If the rail was "off" (|0⟩), it\'s now fully "on" (|1⟩).',
    quantumConcept: 'Bit Flip',
    stateEffect: 'Transforms |0⟩ ↔ |1⟩',
  },
  y: {
    name: 'Pauli-Y Gate',
    icon: 'Y',
    color: THEME_GATE_COLORS.y,
    oneLiner: 'Flips the qubit AND rotates its phase.',
    analogy: 'Like flipping a coin and also spinning it — changes both the state and the "direction" of the quantum wave.',
    whatYouSee: 'The green orb applies a combined rotation. It flips the qubit while also shifting its internal phase — the hidden "direction" of quantum states.',
    quantumConcept: 'Bit + Phase Flip',
    stateEffect: 'Transforms |0⟩ to i|1⟩, |1⟩ to -i|0⟩',
  },
  z: {
    name: 'Pauli-Z Gate',
    icon: 'Z',
    color: THEME_GATE_COLORS.z,
    oneLiner: 'Flips the phase — invisible but powerful.',
    analogy: 'Imagine two waves meeting. The Z gate flips one wave upside-down, so when they meet, they cancel out instead of reinforcing. That\'s quantum interference.',
    whatYouSee: 'The blue orb doesn\'t visibly change the rail, but it flips the phase of the |1⟩ component. This hidden change determines which answers get amplified or cancelled later.',
    quantumConcept: 'Phase Flip',
    stateEffect: 'Transforms |1⟩ to -|1⟩ (phase flip)',
  },
  s: {
    name: 'S Gate (Phase π/2)',
    icon: 'S',
    color: THEME_GATE_COLORS.s,
    oneLiner: 'Rotates the phase by 90° — a quarter turn in quantum space.',
    analogy: 'Like turning a compass needle 90°. The qubit doesn\'t flip, but its "direction" shifts — crucial for precision in algorithms like QFT.',
    whatYouSee: 'The violet orb applies a quarter-phase rotation. Essential building block of the Quantum Fourier Transform.',
    quantumConcept: 'Phase Rotation',
    stateEffect: '|1⟩ → i|1⟩ (π/2 phase shift)',
  },
  sdg: {
    name: 'S† Gate (Phase -π/2)',
    icon: 'S†',
    color: THEME_GATE_COLORS.sdg,
    oneLiner: 'Rotates the phase by -90° — the reverse of S.',
    analogy: 'Undoes the S gate. Like turning the compass needle back. Used in inverse QFT to decode period information.',
    whatYouSee: 'The violet orb reverses a quarter-phase rotation. Key component of the inverse QFT in Shor\'s algorithm.',
    quantumConcept: 'Inverse Phase Rotation',
    stateEffect: '|1⟩ → -i|1⟩ (-π/2 phase shift)',
  },
  t: {
    name: 'T Gate (Phase π/4)',
    icon: 'T',
    color: THEME_GATE_COLORS.t,
    oneLiner: 'Rotates the phase by 45° — fine-grained quantum control.',
    analogy: 'An even finer phase adjustment than S. Like adjusting a telescope\'s focus by a tiny amount — small changes that matter enormously.',
    whatYouSee: 'The purple orb applies a precise eighth-turn phase shift. This fine-grained control is what makes quantum computers powerful.',
    quantumConcept: 'Fine Phase Rotation',
    stateEffect: '|1⟩ → e^{iπ/4}|1⟩ (π/4 phase shift)',
  },
  tdg: {
    name: 'T† Gate (Phase -π/4)',
    icon: 'T†',
    color: THEME_GATE_COLORS.tdg,
    oneLiner: 'Rotates the phase by -45° — the reverse of T.',
    analogy: 'Reverses the T gate\'s fine rotation. Used in inverse QFT for precise frequency extraction.',
    whatYouSee: 'The purple orb reverses a fine phase rotation. Essential for decoding quantum frequency information.',
    quantumConcept: 'Inverse Fine Phase Rotation',
    stateEffect: '|1⟩ → e^{-iπ/4}|1⟩ (-π/4 phase shift)',
  },
  cx: {
    name: 'CNOT Gate (Controlled-NOT)',
    icon: 'CX',
    color: THEME_GATE_COLORS.cx,
    oneLiner: 'Links two qubits — the key to entanglement.',
    analogy: 'Like a quantum buddy system: "If I\'m 1, you flip. If I\'m 0, stay put." After this, their fates are linked forever.',
    whatYouSee: 'The bridge connects a control qubit (dot) to a target qubit (⊕). If the control is |1⟩, the target flips. When applied after a Hadamard, this creates entanglement.',
    quantumConcept: 'Entanglement',
    stateEffect: 'If control=|1⟩, flips target',
  },
  ccx: {
    name: 'Toffoli Gate (Double-Controlled NOT)',
    icon: 'CCX',
    color: THEME_GATE_COLORS.ccx,
    oneLiner: 'Three-qubit gate — flips the target only if BOTH controls are 1.',
    analogy: 'Like a two-key lock: both keys must be turned to open. This is the quantum version of the AND logic gate.',
    whatYouSee: 'The triple-bridge connects two control qubits to one target. Both controls must be |1⟩ for the target to flip.',
    quantumConcept: 'Controlled Logic',
    stateEffect: 'If both controls=|1⟩, flips target',
  },
  swap: {
    name: 'SWAP Gate',
    icon: '×',
    color: THEME_GATE_COLORS.swap,
    oneLiner: 'Exchanges the states of two qubits.',
    analogy: 'Like two people swapping seats. Whatever state qubit A had, qubit B now has, and vice versa.',
    whatYouSee: 'The teal × marks on two rails with a connecting bridge show the qubits exchanging their quantum states.',
    quantumConcept: 'State Exchange',
    stateEffect: 'Swaps |a,b⟩ → |b,a⟩',
  },
  cz: {
    name: 'Controlled-Z Gate',
    icon: 'CZ',
    color: THEME_GATE_COLORS.cz,
    oneLiner: 'Applies a phase flip only when both qubits are |1⟩.',
    analogy: 'Both qubits must agree to be "on" for anything to happen. A selective phase kick that creates entanglement without flipping any bit.',
    whatYouSee: 'Control dot linked to a Z-labeled target. The phase changes invisibly but powerfully shapes interference patterns.',
    quantumConcept: 'Controlled Phase',
    stateEffect: '|11⟩ → -|11⟩',
  },
  cs: {
    name: 'Controlled-S Gate',
    icon: 'CS',
    color: THEME_GATE_COLORS.cs,
    oneLiner: 'Applies π/2 phase rotation controlled by another qubit.',
    analogy: 'A conditional fine-tuning. The control qubit decides whether to apply a quarter-turn phase. Used in QFT to encode frequency relationships.',
    whatYouSee: 'Control dot linked to an S-labeled target sphere. This controlled rotation is a building block of the Quantum Fourier Transform.',
    quantumConcept: 'Controlled Phase Rotation',
    stateEffect: '|11⟩ → i|11⟩ (π/2 phase if both |1⟩)',
  },
  csdg: {
    name: 'Controlled-S† Gate',
    icon: 'CS†',
    color: THEME_GATE_COLORS.csdg,
    oneLiner: 'Applies -π/2 phase rotation controlled by another qubit.',
    analogy: 'The reverse of Controlled-S. Used in the inverse QFT to decode the frequency spectrum of a quantum state.',
    whatYouSee: 'Control dot linked to S†-labeled target. This gate peels back layers of phase encoding to reveal the hidden period.',
    quantumConcept: 'Inverse Controlled Phase',
    stateEffect: '|11⟩ → -i|11⟩ (-π/2 phase if both |1⟩)',
  },
  ct: {
    name: 'Controlled-T Gate',
    icon: 'CT',
    color: THEME_GATE_COLORS.ct,
    oneLiner: 'Applies π/4 phase rotation controlled by another qubit.',
    analogy: 'An even finer conditional rotation. The deeper into the QFT, the smaller the angles get, encoding increasingly subtle frequency components.',
    whatYouSee: 'Control dot linked to T-labeled target. Part of the QFT\'s precision machinery.',
    quantumConcept: 'Fine Controlled Phase',
    stateEffect: '|11⟩ → e^{iπ/4}|11⟩',
  },
  ctdg: {
    name: 'Controlled-T† Gate',
    icon: 'CT†',
    color: THEME_GATE_COLORS.ctdg,
    oneLiner: 'Applies -π/4 phase rotation controlled by another qubit.',
    analogy: 'Reverses the Controlled-T. Another piece of the inverse QFT puzzle that extracts period information in Shor\'s algorithm.',
    whatYouSee: 'Control dot linked to T†-labeled target. Decodes fine frequency structure from the quantum state.',
    quantumConcept: 'Inverse Fine Controlled Phase',
    stateEffect: '|11⟩ → e^{-iπ/4}|11⟩',
  },
  cr4: {
    name: 'Controlled-R4 Gate',
    icon: 'CR4',
    color: THEME_GATE_COLORS.cr4,
    oneLiner: 'Applies π/8 phase rotation controlled by another qubit.',
    analogy: 'The finest controlled rotation in our QFT. Like calibrating a radio to exactly the right frequency — this tiny phase shift completes the full Fourier Transform.',
    whatYouSee: 'Control dot linked to R4-labeled target. The subtlest phase gate, completing the full-precision inverse QFT.',
    quantumConcept: 'Ultra-Fine Controlled Phase',
    stateEffect: '|11⟩ → e^{iπ/8}|11⟩',
  },
  cr4dg: {
    name: 'Controlled-R4† Gate',
    icon: 'CR4†',
    color: THEME_GATE_COLORS.cr4dg,
    oneLiner: 'Applies -π/8 phase rotation controlled by another qubit.',
    analogy: 'The finest reverse rotation. Extracts the most subtle frequency component from the quantum state. Without this, the period-finding would lose resolution.',
    whatYouSee: 'Control dot linked to R4†-labeled target. Provides full-precision frequency extraction in the inverse QFT.',
    quantumConcept: 'Inverse Ultra-Fine Phase',
    stateEffect: '|11⟩ → e^{-iπ/8}|11⟩',
  },
  measure: {
    name: 'Measurement',
    icon: 'M',
    color: THEME_GATE_COLORS.measure,
    oneLiner: 'Collapses superposition — forces the qubit to choose 0 or 1.',
    analogy: 'The spinning coin finally lands. Whatever it was exploring in superposition, measurement forces a definite answer. But which answer? That\'s probabilistic.',
    whatYouSee: 'The amber detector "observes" the qubit. The split paths collapse into one solid state. The outcome is random but weighted.',
    quantumConcept: 'Measurement / Wave Function Collapse',
    stateEffect: 'Collapses to |0⟩ or |1⟩ probabilistically',
  },
};

// --- Walkthrough types and content for guided mode ---

export interface StepWalkthrough {
  title: string;
  description: string;
  stateChange: string;
  visualHint: string;
}

export interface AlgorithmWalkthrough {
  intro: string;
  steps: Record<number, StepWalkthrough>;
  conclusion: string;
}

export const WALKTHROUGH_CONTENT: Record<string, AlgorithmWalkthrough> = {
  'Bell State': {
    intro:
      "This is the Bell State — the simplest circuit that creates quantum entanglement. Two qubits will become mysteriously linked so that measuring one instantly determines the other.",
    steps: {
      0: {
        title: 'Hadamard: Creating Superposition',
        description:
          'The Hadamard gate puts qubit 0 into an equal superposition of |0⟩ and |1⟩. Before this gate, q0 is definitely 0. After, it has a 50/50 chance of being measured as either — it is genuinely both at once.',
        stateChange: '|00⟩ → (|00⟩ + |10⟩)/√2',
        visualHint:
          "Watch q0's Bloch sphere arrow move from the north pole to the equator — that's superposition.",
      },
      1: {
        title: 'CNOT: Creating Entanglement',
        description:
          'The CNOT (controlled-NOT) gate uses q0 as a control: if q0 is |1⟩, it flips q1. Since q0 is in superposition, this creates entanglement — the two qubits become correlated in a way that has no classical explanation.',
        stateChange: '(|00⟩ + |10⟩)/√2 → (|00⟩ + |11⟩)/√2',
        visualHint:
          'The entanglement beam appears between the qubits — their fates are now linked.',
      },
      2: {
        title: 'Measurement: Collapsing the State',
        description:
          "Measurement forces each qubit to choose a definite value. Because they're entangled, they always agree: you'll get |00⟩ or |11⟩, each with 50% probability. You'll never see |01⟩ or |10⟩.",
        stateChange: '(|00⟩ + |11⟩)/√2 → |00⟩ or |11⟩',
        visualHint:
          'Watch the probability bars — only 00 and 11 appear, never 01 or 10.',
      },
    },
    conclusion:
      "You've created the Bell state! The qubits are entangled — they always agree. This is the foundation of quantum teleportation and quantum cryptography.",
  },
};

/**
 * Get walkthrough content for a specific step.
 * Uses custom content if available, otherwise generates from GATE_INFO.
 */
export function getWalkthroughForStep(
  algorithmName: string | null,
  step: number,
  gates: { type: string; targets: number[]; step: number }[],
  _qubits: number,
): StepWalkthrough | null {
  // Try custom content first
  if (algorithmName && WALKTHROUGH_CONTENT[algorithmName]?.steps[step]) {
    return WALKTHROUGH_CONTENT[algorithmName].steps[step];
  }

  // Generic fallback from GATE_INFO
  const gatesAtStep = gates.filter((g) => g.step === step);
  if (gatesAtStep.length === 0) return null;

  const gate = gatesAtStep[0];
  const info = GATE_INFO[gate.type as keyof typeof GATE_INFO];
  if (!info) return null;

  return {
    title: `${info.name}: ${info.quantumConcept}`,
    description: info.oneLiner + ' ' + info.analogy,
    stateChange: info.stateEffect,
    visualHint: info.whatYouSee,
  };
}

export const ALGORITHM_NARRATIVES: Record<string, string[]> = {
  'Bell State': [
    'This is the simplest quantum circuit that creates entanglement.',
    'Step 1: The Hadamard gate puts qubit 0 into superposition — it\'s now both |0⟩ and |1⟩.',
    'Step 2: The CNOT gate links qubit 0 to qubit 1. Now they\'re entangled — their fates are tied.',
    'Result: When you measure, you\'ll get either |00⟩ or |11⟩, each with 50% probability. Never |01⟩ or |10⟩. The qubits always agree — that\'s the magic of entanglement.',
  ],
  'GHZ State': [
    'The GHZ state extends entanglement to three qubits — a quantum three-way handshake.',
    'First, qubit 0 enters superposition. Then CNOTs cascade the entanglement to qubits 1 and 2.',
    'Result: All three qubits are now entangled. You\'ll measure |000⟩ or |111⟩ — all agree or all disagree. Never a mix.',
  ],
  'Quantum Teleportation': [
    'Quantum teleportation transfers a quantum state from one qubit to another — without physically moving it!',
    'First, qubits 1 and 2 are entangled (the "quantum phone line"). Then qubit 0\'s state is encoded via a CNOT and Hadamard.',
    'After measuring qubits 0 and 1, their results tell us what corrections to apply to qubit 2.',
    'The end result? Qubit 2 now holds the original state of qubit 0. The state was "teleported" through entanglement.',
  ],
  "Grover's Search": [
    'Grover\'s algorithm finds a needle in a haystack — quadratically faster than checking one by one.',
    'First, all qubits enter superposition — exploring all possibilities at once.',
    'The oracle (Toffoli gate) "marks" the correct answer by flipping its phase.',
    'The diffusion step amplifies the marked answer and suppresses wrong ones. Like waves reinforcing in the right spot.',
    'After enough rounds, measurement gives the correct answer with high probability.',
  ],
  'Deutsch-Jozsa': [
    'Deutsch-Jozsa answers a simple question with exponential speedup: "Is this function constant or balanced?"',
    'Classically, you\'d need to check half the inputs. Quantumly? One single query.',
    'The circuit puts all inputs into superposition, queries the function, then uses interference to distinguish constant from balanced.',
  ],
  'Quantum Fourier Transform': [
    'The QFT is the quantum version of the Fourier transform — it decomposes quantum states into frequency components.',
    'It\'s the heart of Shor\'s algorithm (which can break encryption) and many other quantum algorithms.',
    'Each Hadamard creates superposition, and the CNOTs encode the "frequency" relationships between qubits.',
    'The result is a quantum state where amplitudes represent the frequency spectrum of the input.',
  ],
  "Shor's Algorithm": [
    'Shor\'s algorithm — the most powerful quantum algorithm ever invented. It factors numbers exponentially faster than any classical method, threatening all RSA encryption.',
    'Stage 1 — Initialize: The work register is set to |1⟩. Four counting qubits enter superposition, exploring ALL exponents 0 through 15 simultaneously.',
    'Stage 2 — Modular Exponentiation: Controlled-SWAP gates compute 2^x mod 15 for every x in parallel. This is quantum parallelism at its finest — 16 computations in one step.',
    'Stage 3 — Inverse QFT: The inverse Quantum Fourier Transform uses precise phase rotations (S†, T†, R4†) to extract the hidden period from the quantum state through constructive interference.',
    'Stage 4 — The counting register collapses to multiples of 4 (values 0, 4, 8, 12). This reveals period r=4 of the function 2^x mod 15.',
    'From period r=4: compute gcd(2² + 1, 15) = 5 and gcd(2² - 1, 15) = 3. The number 15 has been factored into 3 × 5. RSA broken.',
  ],
};
