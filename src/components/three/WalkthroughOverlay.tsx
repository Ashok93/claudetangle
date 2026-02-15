import { useCircuitStore } from '../../store/circuitStore';
import {
  WALKTHROUGH_CONTENT,
  getWalkthroughForStep,
} from '../../lib/gateInfo';
import { theme } from '../../lib/theme';

/**
 * Walkthrough overlay — renders as a DOM overlay on top of the 3D canvas.
 * Mobile: bottom-anchored full-width card.
 * Desktop: floating card in the lower-right area.
 */
export function WalkthroughOverlay() {
  const simulation = useCircuitStore((s) => s.simulation);
  const guidedMode = useCircuitStore((s) => s.guidedMode);
  const walkthroughPaused = useCircuitStore((s) => s.walkthroughPaused);
  const simulationStep = useCircuitStore((s) => s.simulationStep);
  const simulationMaxStep = useCircuitStore((s) => s.simulationMaxStep);
  const gates = useCircuitStore((s) => s.gates);
  const qubits = useCircuitStore((s) => s.qubits);
  const detectedAlgorithm = useCircuitStore((s) => s.detectedAlgorithm);
  const continueWalkthrough = useCircuitStore((s) => s.continueWalkthrough);

  if (!guidedMode || !walkthroughPaused || simulation !== 'running') return null;

  const walkthroughData = detectedAlgorithm
    ? WALKTHROUGH_CONTENT[detectedAlgorithm]
    : undefined;
  const stepContent = getWalkthroughForStep(
    detectedAlgorithm,
    simulationStep,
    gates,
    qubits,
  );

  const showIntro = walkthroughData && simulationStep === 0;
  const isLastStep = simulationStep >= simulationMaxStep;

  const totalSteps = simulationMaxStep + 1;
  const currentStepDisplay = Math.min(simulationStep + 1, totalSteps);

  return (
    <div
      className="absolute z-40 bottom-3 left-3 right-3 sm:left-auto sm:bottom-4 sm:right-4 sm:w-80"
      style={{
        animation: 'walkthroughFadeIn 0.3s ease-out',
        pointerEvents: 'auto',
      }}
    >
      <div
        className="rounded-xl overflow-hidden border"
        style={{
          background: theme.bg.surface + 'f0',
          borderColor: 'rgba(100, 120, 180, 0.25)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Scrollable content area for small screens */}
        <div
          className="px-4 pt-3 pb-3 sm:px-5 sm:pt-4 sm:pb-4 overflow-y-auto"
          style={{ maxHeight: '45vh' }}
        >
          {/* Step badge */}
          <div
            className="inline-block text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full mb-2"
            style={{
              background: 'rgba(99, 102, 241, 0.7)',
              color: '#fff',
              letterSpacing: '0.02em',
            }}
          >
            Step {currentStepDisplay} of {totalSteps}
          </div>

          {/* Intro text */}
          {showIntro && (
            <p
              className="text-[11px] sm:text-xs leading-relaxed mb-2"
              style={{ color: theme.text.tertiary, fontStyle: 'italic' }}
            >
              {walkthroughData.intro}
            </p>
          )}

          {/* Step content */}
          {stepContent && (
            <>
              <h3
                className="text-[13px] sm:text-[15px] font-bold mb-1"
                style={{ color: theme.text.primary }}
              >
                {stepContent.title}
              </h3>

              <p
                className="text-[11px] sm:text-xs leading-relaxed mb-2"
                style={{ color: theme.text.secondary }}
              >
                {stepContent.description}
              </p>

              {/* State change */}
              <div
                className="text-[11px] sm:text-xs font-mono px-2.5 py-1.5 rounded-md mb-2"
                style={{
                  background: 'rgba(99, 102, 241, 0.12)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  color: '#a5b4fc',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                }}
              >
                {stepContent.stateChange}
              </div>

              {/* Visual hint */}
              <p
                className="text-[10px] sm:text-[11px] leading-snug mb-1"
                style={{ color: theme.text.tertiary }}
              >
                {stepContent.visualHint}
              </p>
            </>
          )}
        </div>

        {/* Continue button — always at bottom, not scrollable */}
        <div
          className="px-4 pb-3 sm:px-5 sm:pb-4"
          style={{
            paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
          }}
        >
          <button
            onClick={continueWalkthrough}
            className="w-full py-2.5 sm:py-2 rounded-lg text-xs sm:text-[13px] font-semibold transition-colors"
            style={{
              background: 'rgba(99, 102, 241, 0.8)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            {isLastStep ? 'Finish' : 'Continue'} →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes walkthroughFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
