export interface ChapterStep {
  narration: string;
  interaction: 'none' | 'click-state' | 'click-gate' | 'click-measure' | 'click-run100' | 'click-continue' | 'multi-gate';
  hint?: string;
  character?: 'qubit';
  gateToHighlight?: string;
}

export interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  steps: ChapterStep[];
}

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: 'Meet the Qubit',
    subtitle: 'From classical bits to quantum superposition',
    steps: [
      {
        narration: 'Computers use **bits** — switches that are OFF (0) or ON (1). Click the cube to toggle it!',
        interaction: 'click-state',
        hint: 'Click the cube to toggle 0/1',
      },
      {
        narration: 'Now meet a **qubit**. The arrow shows its state. Right now it\'s |0\u27E9 — pointing to the north pole of the **Bloch sphere**, the map of all possible qubit states.',
        interaction: 'none',
        character: 'qubit',
      },
      {
        narration: 'Try it! Click **|0\u27E9** or **|1\u27E9** to set my state. Watch the arrow jump between the poles — these are the two classical states a qubit can be in.',
        interaction: 'click-state',
        hint: 'Click |0\u27E9 or |1\u27E9',
        character: 'qubit',
      },
      {
        narration: 'Now the magic! A qubit can be BOTH 0 and 1 at the same time — that\'s **superposition**. Like a coin spinning in the air: not heads, not tails, but genuinely both until you look. Click the **H gate** to put me in superposition!',
        interaction: 'click-gate',
        hint: 'Click the H gate',
        gateToHighlight: 'h',
        character: 'qubit',
      },
      {
        narration: 'The arrow is on the equator — **50% chance of 0, 50% chance of 1**. See the wave below? That shows my **probability amplitudes** — the strength of each possibility. Try the phase buttons to rotate my color!',
        interaction: 'click-state',
        hint: 'Try the phase buttons',
      },
      {
        narration: 'See how the **color** changes but probabilities stay the same? That\'s **phase** — a hidden property invisible when you measure, but it controls how quantum waves **interfere** with each other. Phase is the secret sauce of quantum computing!',
        interaction: 'none',
      },
      {
        narration: '**Free play!** Experiment with everything: set states, apply H, rotate phase. Notice how H always creates equal superposition, and phase only changes the color. Click Next when you\'re ready!',
        interaction: 'none',
        character: 'qubit',
      },
    ],
  },
  {
    id: 2,
    title: 'Quantum Gates',
    subtitle: 'Transformations that control qubits',
    steps: [
      {
        narration: 'Quantum gates transform my state, just like logic gates in regular computers — but with superpowers! Let\'s try them one by one.',
        interaction: 'none',
        character: 'qubit',
      },
      {
        narration: '**X gate** flips the qubit — like a NOT gate. Watch: |0\u27E9 becomes |1\u27E9. The arrow flips from north pole to south pole, and the probability amplitude waves swap too!',
        interaction: 'click-gate',
        hint: 'Click the X gate',
        gateToHighlight: 'x',
      },
      {
        narration: '**H gate** (Hadamard) creates superposition from any definite state. The most important gate in quantum computing! Watch both wave components become equal — 50/50.',
        interaction: 'click-gate',
        hint: 'Click the H gate',
        gateToHighlight: 'h',
      },
      {
        narration: '**Z gate** — the **probabilities** stay the same (still 50/50!), but the **phase** (color) flips by 180\u00B0. Phase is invisible when measuring a single qubit, but crucial for quantum algorithms.',
        interaction: 'click-gate',
        hint: 'Click the Z gate',
        gateToHighlight: 'z',
      },
      {
        narration: '**S** and **T** gates apply smaller phase rotations. S rotates phase by 90\u00B0, T by 45\u00B0. These fine-grained rotations are essential for precise quantum algorithms!',
        interaction: 'click-gate',
        hint: 'Click the S gate',
        gateToHighlight: 's',
      },
      {
        narration: 'Now try Z on a **basis state** (|0\u27E9 or |1\u27E9). Click Z — nothing visible happens! Phase gates rotate around the Z-axis. When you\'re AT a pole, you\'re already on that axis — like spinning a top that\'s standing on its point. Phase only matters in **superposition**.',
        interaction: 'click-gate',
        hint: 'Click the Z gate',
        gateToHighlight: 'z',
      },
      {
        narration: 'Here\'s the mind-bending part: **quantum interference**! Apply **H**, then **Z**, then **H** again. The qubit ends up at |1\u27E9 instead of back at |0\u27E9! Phase became visible through interference — this is how quantum algorithms work.',
        interaction: 'multi-gate',
        hint: 'Click H, then Z, then H',
      },
      {
        narration: '**Free play!** Try any combination. H+H undoes itself. X+X undoes itself. Try phase gates on superposition vs basis states. Discover your own patterns!',
        interaction: 'none',
      },
    ],
  },
  {
    id: 3,
    title: 'Measurement',
    subtitle: 'Collapsing superposition into definite outcomes',
    steps: [
      {
        narration: 'I\'m in **superposition** now — both 0 and 1 at once. But what happens when you actually **look** at a qubit? In quantum mechanics, observation changes the system!',
        interaction: 'none',
        character: 'qubit',
      },
      {
        narration: '**Measure** me! The superposition must collapse — like the spinning coin finally landing. Once measured, I\'m forced to choose: |0\u27E9 or |1\u27E9.',
        interaction: 'click-measure',
        hint: 'Click Measure',
        character: 'qubit',
      },
      {
        narration: 'One measurement is random. Run **100 measurements** and watch the statistics build up in real time! Each run resets me to superposition, measures, and records the result.',
        interaction: 'click-run100',
        hint: 'Click Run 100\u00D7',
      },
      {
        narration: 'About **50/50**! This is the **Born rule**: the position on the Bloch sphere determines probability. Equator = 50/50. But what if the qubit ISN\'T on the equator?',
        interaction: 'none',
      },
      {
        narration: 'Click **Nudge** to tilt the qubit toward |1\u27E9. Watch the arrow move off the equator — the probability amplitudes are no longer equal!',
        interaction: 'click-gate',
        hint: 'Click Nudge',
      },
      {
        narration: 'Now run **100 measurements** again! The results should be skewed — more |1\u27E9 than |0\u27E9. The closer to a pole, the more certain the outcome.',
        interaction: 'click-run100',
        hint: 'Click Run 100\u00D7',
      },
      {
        narration: '**Free play!** Apply gates to set any state, then measure. Equator = 50/50. Poles = 100% certain. Everything in between = somewhere in between. That\'s the Born rule in action!',
        interaction: 'none',
      },
    ],
  },
  {
    id: 4,
    title: 'Two Qubits & Entanglement',
    subtitle: 'The spooky power of quantum correlations',
    steps: [
      {
        narration: 'One qubit is interesting. But the real power of quantum computing comes from **multiple qubits** working together. Here are two independent qubits.',
        interaction: 'none',
      },
      {
        narration: 'Right now they\'re **independent**. Apply **X** to Qubit A — notice B doesn\'t change at all. They don\'t know about each other yet.',
        interaction: 'click-gate',
        hint: 'Click X on Qubit A',
        gateToHighlight: 'x',
      },
      {
        narration: 'Now let\'s **entangle** them! First apply **H** to Qubit A (superposition), then **CNOT** to link them. CNOT flips B only when A is |1\u27E9 — creating a quantum correlation.',
        interaction: 'multi-gate',
        hint: 'Click H on A, then CNOT',
      },
      {
        narration: 'They\'re entangled! **Measure both** — they ALWAYS agree. Einstein called this "spooky action at a distance." You can\'t copy a qubit (no-cloning theorem), but you CAN correlate them!',
        interaction: 'click-measure',
        hint: 'Click Measure Both',
      },
      {
        narration: '**Free play!** Try different combinations: X on A then entangle, or entangle then X on B. Each time you measure, the correlation holds. Entanglement survives until measurement!',
        interaction: 'none',
      },
      {
        narration: 'You now understand **qubits, gates, measurement, and entanglement** — the four pillars of quantum computing! One more step: putting it all together in **circuits**.',
        interaction: 'none',
      },
    ],
  },
  {
    id: 5,
    title: 'Your First Circuit',
    subtitle: 'From gates to algorithms',
    steps: [
      {
        narration: 'Everything you\'ve learned — qubits, gates, measurement, entanglement — comes together in **quantum circuits**. A circuit is a recipe: apply gates left-to-right, one step at a time.',
        interaction: 'none',
      },
      {
        narration: 'Here\'s the **Bell circuit**. Each line is a qubit wire. Boxes are gates. The \u2022 and \u2295 are a **CNOT**. Let\'s trace through it step by step!',
        interaction: 'none',
      },
      {
        narration: 'Both qubits start at **|0\u27E9**. Watch the Bloch spheres — both arrows point up (north pole). Click **H** to apply the first gate.',
        interaction: 'click-gate',
        hint: 'Click the H gate',
        gateToHighlight: 'h',
      },
      {
        narration: 'Qubit 0 is in **superposition**! The state is now (|00\u27E9+|10\u27E9)/\u221A2. Qubit 1 hasn\'t changed yet. Click **CNOT** to link them.',
        interaction: 'click-gate',
        hint: 'Click CNOT',
        gateToHighlight: 'cx',
      },
      {
        narration: 'They\'re **entangled**! The state is (|00\u27E9+|11\u27E9)/\u221A2 — the **Bell state**. This 2-gate circuit is the foundation of quantum teleportation and superdense coding!',
        interaction: 'none',
      },
      {
        narration: '**Challenge!** Can you turn |0\u27E9 into |1\u27E9 using ONLY **H** and **Z** gates? Hint: you discovered this in Chapter 2! Apply gates in the right order.',
        interaction: 'multi-gate',
        hint: 'Apply H, then Z, then H',
        character: 'qubit',
      },
      {
        narration: 'You built **H\u2192Z\u2192H = X** using interference! The H gate created superposition, Z flipped the phase, and the second H made the phase difference visible. This is the core trick of ALL quantum algorithms.',
        interaction: 'none',
      },
      {
        narration: 'Real algorithms use these same building blocks: **Grover\'s search** finds a needle in a haystack in \u221AN steps (instead of N). **Shor\'s algorithm** breaks encryption. **Quantum teleportation** transfers states instantly. Ready to build your own?',
        interaction: 'click-continue',
        hint: 'Continue to Circuit Explorer',
      },
    ],
  },
];

export function getChapter(id: number): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

export function getStepCount(chapterId: number): number {
  return getChapter(chapterId)?.steps.length ?? 0;
}
