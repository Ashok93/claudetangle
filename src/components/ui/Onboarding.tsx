import { useState } from 'react';
import { theme } from '../../lib/theme';
import { GATE_COLORS } from '../../lib/constants';

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    title: 'Welcome to claudetangle',
    subtitle: 'See quantum computing come alive in 3D',
    body: `Regular computers use bits — tiny switches that are either OFF (0) or ON (1).

Quantum computers use **qubits** — which can be both 0 AND 1 at the same time. Weird? Absolutely. But this weirdness gives quantum computers incredible power.

claudetangle lets you **see** how quantum circuits work, step by step, in a way that finally makes sense.`,
    visual: 'intro',
  },
  {
    title: 'The Glowing Rails',
    subtitle: 'Each rail is a qubit — your quantum building block',
    body: `See those lines of light? Each one is a **qubit** — a quantum bit.

Unlike a normal bit (just 0 or 1), a qubit can exist in a **superposition** — imagine a coin spinning in the air before it lands. It's both heads AND tails until you look at it.

The **brightness** of a rail shows how "active" that qubit is. Watch how it changes as gates transform the quantum state.`,
    visual: 'rails',
  },
  {
    title: 'Gates = Quantum Moves',
    subtitle: 'Each shape transforms the quantum state',
    body: `The 3D shapes on the rails are **quantum gates** — they change what a qubit is doing:

**Hadamard (spinning crystal)** — Puts a qubit into superposition. Like tossing that coin into the air.

**CNOT (bridge between rails)** — Links two qubits together in "entanglement." Change one, the other reacts instantly.

**Measurement (amber detector)** — Forces the quantum coin to land. Superposition collapses to a definite 0 or 1.`,
    visual: 'gates',
  },
  {
    title: 'Run & See the Magic',
    subtitle: 'Watch quantum states flow through your circuit',
    body: `Click the **Run** button and watch:

A pulse of light enters from the left. At each gate, something happens — the pulse splits, entangles, or transforms. At the end, you see the **output pattern** — the probabilities of each possible result.

This is how quantum algorithms work: they amplify the right answers and cancel out the wrong ones. It's like choreographing waves to create the pattern you want.

**Try it now — click the Run button and watch the Bell State come alive.**`,
    visual: 'run',
  },
];

function StepVisual({ visual }: { visual: string }) {
  switch (visual) {
    case 'intro':
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl font-bold text-white"
              style={{ background: theme.accent.primary }}
            >
              Q
            </div>
          </div>
        </div>
      );
    case 'rails':
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center gap-5 px-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="relative w-full">
              <div
                className="h-0.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${theme.text.tertiary} 20%, ${theme.text.tertiary} 80%, transparent 100%)`,
                }}
              />
              <span className="absolute -left-10 top-1/2 -translate-y-1/2 text-xs font-mono" style={{ color: theme.text.tertiary }}>
                q[{i}]
              </span>
            </div>
          ))}
          <p className="text-xs mt-2" style={{ color: theme.text.tertiary }}>Each rail carries quantum information through the circuit</p>
        </div>
      );
    case 'gates':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex gap-8 items-end">
            {/* Hadamard */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rotate-45 border" style={{ borderColor: GATE_COLORS.h + '60', background: GATE_COLORS.h + '15' }} />
              <span className="text-[11px] font-medium" style={{ color: GATE_COLORS.h }}>Hadamard</span>
              <span className="text-[10px]" style={{ color: theme.text.tertiary }}>Superposition</span>
            </div>
            {/* CNOT */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-12 h-16">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full" style={{ background: GATE_COLORS.cx }} />
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2" style={{ background: GATE_COLORS.cx + '60' }} />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs" style={{ borderColor: GATE_COLORS.cx, color: GATE_COLORS.cx }}>+</div>
              </div>
              <span className="text-[11px] font-medium" style={{ color: GATE_COLORS.cx }}>CNOT</span>
              <span className="text-[10px]" style={{ color: theme.text.tertiary }}>Entanglement</span>
            </div>
            {/* Measure */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border flex items-center justify-center" style={{ borderColor: GATE_COLORS.measure + '60', background: GATE_COLORS.measure + '15' }}>
                <div className="w-3 h-3 rounded-full" style={{ background: GATE_COLORS.measure }} />
              </div>
              <span className="text-[11px] font-medium" style={{ color: GATE_COLORS.measure }}>Measure</span>
              <span className="text-[10px]" style={{ color: theme.text.tertiary }}>Collapse</span>
            </div>
          </div>
        </div>
      );
    case 'run':
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
          {/* Simulated output bars */}
          <div className="flex items-end gap-3 h-24">
            {[
              { label: '|00⟩', height: 48, active: true },
              { label: '|01⟩', height: 4, active: false },
              { label: '|10⟩', height: 4, active: false },
              { label: '|11⟩', height: 48, active: true },
            ].map((bar) => (
              <div key={bar.label} className="flex flex-col items-center gap-1">
                <div
                  className="w-10 rounded-t transition-all duration-1000"
                  style={{
                    height: bar.height,
                    background: bar.active ? theme.accent.primary : theme.bg.raised,
                    opacity: bar.active ? 0.9 : 0.3,
                  }}
                />
                <span className="text-[11px] font-mono" style={{ color: theme.text.tertiary }}>{bar.label}</span>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-center max-w-[200px]" style={{ color: theme.text.secondary }}>
            Bell State: always <span style={{ color: theme.accent.hover }}>|00⟩</span> or <span style={{ color: theme.accent.hover }}>|11⟩</span> — never mismatched. That's entanglement!
          </p>
        </div>
      );
    default:
      return null;
  }
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center" style={{ background: theme.bg.base + 'f0', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-2xl mx-4">
        <div className="rounded-2xl overflow-hidden shadow-2xl border" style={{ background: theme.bg.surface, borderColor: theme.border.medium }}>
          {/* Visual area */}
          <div className="h-52 relative overflow-hidden border-b" style={{ background: theme.bg.base, borderColor: theme.border.subtle }}>
            <StepVisual visual={current.visual} />
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold" style={{ color: theme.text.primary }}>{current.title}</h2>
            </div>
            <p className="text-sm mb-4" style={{ color: theme.accent.hover }}>{current.subtitle}</p>
            <div className="text-base leading-relaxed whitespace-pre-line [&>p]:mb-3" style={{ color: theme.text.secondary }}>
              {current.body.split('\n\n').map((para, i) => (
                <p key={i}>
                  {para.split(/(\*\*.*?\*\*)/).map((part, j) =>
                    part.startsWith('**') && part.endsWith('**') ? (
                      <strong key={j} className="font-semibold" style={{ color: theme.text.primary }}>{part.slice(2, -2)}</strong>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
                </p>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="px-8 pb-6 flex items-center justify-between">
            {/* Progress dots */}
            <div className="flex gap-2">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: i === step ? 24 : 8,
                    background: i === step ? theme.accent.primary : i < step ? theme.accent.primary + '60' : theme.border.medium,
                  }}
                />
              ))}
            </div>

            <div className="flex gap-3">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-sm transition-colors"
                  style={{ color: theme.text.tertiary }}
                >
                  Back
                </button>
              )}
              {!isLast ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-5 py-2 text-sm text-white rounded-lg transition-colors"
                  style={{ background: theme.accent.primary }}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={onComplete}
                  className="px-5 py-2 text-sm text-white rounded-lg transition-all font-medium"
                  style={{ background: theme.accent.primary }}
                >
                  Start Exploring
                </button>
              )}
            </div>
          </div>

          {/* Skip link */}
          {!isLast && (
            <div className="px-8 pb-4 text-center">
              <button onClick={onComplete} className="text-[13px] transition-colors" style={{ color: theme.text.tertiary }}>
                Skip intro — I know quantum computing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
