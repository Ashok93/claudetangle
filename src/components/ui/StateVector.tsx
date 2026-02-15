import { useCircuitStore } from '../../store/circuitStore';
import { phaseToColor } from '../../lib/quantumSim';
import { theme } from '../../lib/theme';

export function StateVector() {
  const simulationStep = useCircuitStore((s) => s.simulationStep);
  const simulationMaxStep = useCircuitStore((s) => s.simulationMaxStep);
  const stepStates = useCircuitStore((s) => s.stepStates);

  // Find the step state matching current simulation step
  const currentState = stepStates.find((s) => s.step === simulationStep)
    ?? stepStates.find((s) => s.step <= simulationStep && s.step >= 0)
    ?? stepStates[0];

  if (!currentState || stepStates.length <= 1) return null;

  const probs = currentState.probabilities;
  const maxProb = Math.max(...probs.map((p) => p.probability), 0.01);

  // Get phases from the full state vector for coloring
  const phases: number[] = probs.map((_, i) => {
    const re = currentState.stateReal[i];
    const im = currentState.stateImag[i];
    return Math.atan2(im, re);
  });

  const stepsWithGates = stepStates.filter((s) => s.step >= 0).length;
  const currentIdx = stepStates.filter((s) => s.step >= 0 && s.step <= simulationStep).length;

  return (
    <div className="px-4 py-3 border-b" style={{ borderColor: theme.border.subtle }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] uppercase tracking-wider" style={{ color: theme.text.tertiary }}>
          State Vector
        </span>
        <span className="text-[11px] font-mono" style={{ color: theme.text.tertiary }}>
          Step {currentIdx} of {stepsWithGates}
        </span>
      </div>
      <div className="flex items-end gap-px" style={{ height: 40 }}>
        {probs.map((prob, i) => {
          const height = Math.max(1, (prob.probability / maxProb) * 36);
          const color = prob.probability > 0.001 ? phaseToColor(phases[i]) : theme.bg.raised;
          return (
            <div
              key={prob.label}
              className="flex-1 rounded-t transition-all duration-300"
              style={{
                height,
                backgroundColor: color,
                opacity: prob.probability > 0.001 ? 0.8 : 0.2,
              }}
              title={`${prob.state}: ${(prob.probability * 100).toFixed(1)}%`}
            />
          );
        })}
      </div>
      <div className="flex gap-px mt-0.5">
        {probs.map((prob) => (
          <div
            key={prob.label}
            className="flex-1 text-center truncate"
            style={{ fontSize: probs.length > 8 ? 0 : 10, color: theme.text.tertiary }}
          >
            {probs.length <= 8 ? prob.label : ''}
          </div>
        ))}
      </div>
    </div>
  );
}
