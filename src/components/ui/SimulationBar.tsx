import { useCircuitStore } from '../../store/circuitStore';
import { ALGORITHM_NARRATIVES, GATE_INFO } from '../../lib/gateInfo';
import { theme } from '../../lib/theme';

const SPEED_PRESETS = [0.25, 0.5, 1, 2, 4];

function getStepExplanation(
  simulationStep: number,
  simulationMaxStep: number,
  detectedAlgorithm: string | null,
  gates: { type: string; step: number }[],
): string {
  if (detectedAlgorithm) {
    const narratives = ALGORITHM_NARRATIVES[detectedAlgorithm] ?? [];
    if (narratives.length > 0) {
      const idx = simulationMaxStep > 0
        ? Math.min(narratives.length - 1, Math.floor((simulationStep / simulationMaxStep) * narratives.length))
        : 0;
      return narratives[idx] ?? '';
    }
  }

  const gatesAtStep = gates.filter((g) => g.step === simulationStep);
  if (gatesAtStep.length > 0) {
    const gate = gatesAtStep[0];
    const info = GATE_INFO[gate.type as keyof typeof GATE_INFO];
    if (info) {
      return `${info.name}: ${info.stateEffect}`;
    }
  }

  return '';
}

export function SimulationBar() {
  const simulation = useCircuitStore((s) => s.simulation);
  const gates = useCircuitStore((s) => s.gates);
  const simulationStep = useCircuitStore((s) => s.simulationStep);
  const simulationMaxStep = useCircuitStore((s) => s.simulationMaxStep);
  const simulationSpeed = useCircuitStore((s) => s.simulationSpeed);
  const simulationPaused = useCircuitStore((s) => s.simulationPaused);
  const detectedAlgorithm = useCircuitStore((s) => s.detectedAlgorithm);
  const setSimulationSpeed = useCircuitStore((s) => s.setSimulationSpeed);
  const togglePause = useCircuitStore((s) => s.togglePause);
  const stepForward = useCircuitStore((s) => s.stepForward);
  const stepBackward = useCircuitStore((s) => s.stepBackward);
  const startSimulation = useCircuitStore((s) => s.startSimulation);
  const resetSimulation = useCircuitStore((s) => s.resetSimulation);
  const guidedMode = useCircuitStore((s) => s.guidedMode);
  const walkthroughPaused = useCircuitStore((s) => s.walkthroughPaused);
  const setGuidedMode = useCircuitStore((s) => s.setGuidedMode);
  const continueWalkthrough = useCircuitStore((s) => s.continueWalkthrough);

  if (gates.length === 0) return null;

  const isIdle = simulation === 'idle';
  const isComplete = simulation === 'complete';
  const isRunning = simulation === 'running';
  const progress = simulationMaxStep > 0 ? Math.min(1, simulationStep / simulationMaxStep) : 0;

  const explanation = isRunning
    ? getStepExplanation(simulationStep, simulationMaxStep, detectedAlgorithm, gates)
    : isComplete
    ? 'Simulation complete — press play to restart'
    : '';

  const handlePlay = () => {
    if (isIdle) {
      startSimulation();
    } else if (isComplete) {
      resetSimulation();
      setTimeout(startSimulation, 30);
    } else if (simulationPaused) {
      togglePause();
    }
  };

  const handlePause = () => {
    if (isRunning && !simulationPaused) {
      togglePause();
    }
  };

  const showPlayIcon = isIdle || isComplete || (isRunning && simulationPaused);

  return (
    <div
      className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 border-b flex-shrink-0"
      style={{
        background: theme.bg.surface,
        borderColor: theme.border.subtle,
      }}
    >
      {/* Transport controls */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Previous */}
        <button
          onClick={stepBackward}
          disabled={isIdle || simulationStep <= 0}
          className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center rounded transition-colors disabled:opacity-25"
          style={{ background: theme.bg.raised, color: theme.text.secondary }}
          title="Step backward"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
            <rect x="0" width="2.5" height="12" />
            <path d="M12 0L4 6l8 6z" />
          </svg>
        </button>

        {/* Play / Pause */}
        <button
          onClick={showPlayIcon ? handlePlay : handlePause}
          className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center rounded transition-colors"
          style={{
            background: theme.accent.primary,
            color: '#fff',
          }}
          title={showPlayIcon ? (isIdle ? 'Run' : isComplete ? 'Replay' : 'Resume') : 'Pause'}
        >
          {showPlayIcon ? (
            <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
              <path d="M0 0l10 6-10 6z" />
            </svg>
          ) : (
            <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
              <rect x="0" width="3" height="12" />
              <rect x="7" width="3" height="12" />
            </svg>
          )}
        </button>

        {/* Next */}
        <button
          onClick={stepForward}
          disabled={isIdle || isComplete}
          className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center rounded transition-colors disabled:opacity-25"
          style={{ background: theme.bg.raised, color: theme.text.secondary }}
          title="Step forward"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
            <path d="M0 0l8 6-8 6z" />
            <rect x="9.5" width="2.5" height="12" />
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-5 flex-shrink-0" style={{ background: theme.border.subtle }} />

      {/* Step indicator + progress */}
      {!isIdle ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] font-mono whitespace-nowrap" style={{ color: theme.text.tertiary }}>
            {isComplete ? `${simulationMaxStep} / ${simulationMaxStep}` : `${Math.max(0, simulationStep)} / ${simulationMaxStep}`}
          </span>
          <div className="w-14 h-1 rounded-full overflow-hidden" style={{ background: theme.bg.raised }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${(isComplete ? 1 : progress) * 100}%`, background: theme.accent.primary }}
            />
          </div>
        </div>
      ) : (
        <span className="text-[11px] whitespace-nowrap" style={{ color: theme.text.tertiary }}>
          {detectedAlgorithm ?? `${gates.length} gates`}
        </span>
      )}

      {/* Divider */}
      <div className="w-px h-5 flex-shrink-0" style={{ background: theme.border.subtle }} />

      {/* Explanation text — hidden on mobile */}
      <div className="hidden sm:block flex-1 min-w-0">
        <p
          className="text-xs truncate"
          style={{ color: isComplete ? theme.accent.hover : theme.text.primary }}
          title={explanation}
        >
          {explanation || (isIdle && detectedAlgorithm ? `Ready to run ${detectedAlgorithm}` : isIdle ? 'Press play to simulate' : '')}
        </p>
      </div>

      {/* Continue button for walkthrough pause — hidden on mobile (overlay has one) */}
      {isRunning && walkthroughPaused && guidedMode && (
        <button
          onClick={continueWalkthrough}
          className="hidden sm:block px-3 py-1 text-xs font-semibold rounded transition-colors flex-shrink-0"
          style={{
            background: theme.accent.primary,
            color: '#fff',
            minHeight: 32,
          }}
        >
          Continue →
        </button>
      )}

      {/* Speed pills — hidden on mobile */}
      {!isIdle && (
        <div className="hidden sm:flex gap-1 flex-shrink-0">
          {SPEED_PRESETS.map((speed) => (
            <button
              key={speed}
              onClick={() => setSimulationSpeed(speed)}
              className="px-1.5 py-0.5 text-[11px] font-mono rounded transition-colors"
              style={{
                background: simulationSpeed === speed ? theme.accent.primary : theme.bg.raised,
                color: simulationSpeed === speed ? '#fff' : theme.text.tertiary,
              }}
            >
              {speed}x
            </button>
          ))}
        </div>
      )}

      {/* Divider — hidden on mobile */}
      <div className="hidden sm:block w-px h-5 flex-shrink-0" style={{ background: theme.border.subtle }} />

      {/* Guided mode toggle — compact on mobile */}
      <button
        onClick={() => setGuidedMode(!guidedMode)}
        className="w-9 h-9 sm:w-auto sm:h-auto sm:px-2 sm:py-0.5 text-[11px] rounded transition-colors flex-shrink-0 flex items-center justify-center"
        style={{
          background: guidedMode ? 'rgba(99, 102, 241, 0.25)' : theme.bg.raised,
          color: guidedMode ? '#a5b4fc' : theme.text.tertiary,
          border: guidedMode ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
        }}
        title={guidedMode ? 'Guided mode on — pauses at each step with explanations' : 'Guided mode off — simulation runs continuously'}
      >
        {/* Icon on mobile, text on desktop */}
        <span className="sm:hidden">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </span>
        <span className="hidden sm:inline">Guide</span>
      </button>
    </div>
  );
}
