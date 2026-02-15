import { useLearnStore } from '../../store/learnStore';
import { useCircuitStore } from '../../store/circuitStore';
import { getChapter, getStepCount } from './chapters/chapterData';
import { theme } from '../../lib/theme';

function parseBold(text: string) {
  return text.split(/(\*\*.*?\*\*)/).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} style={{ color: theme.text.primary, fontWeight: 600 }}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export function LearnOverlay() {
  const currentChapter = useLearnStore((s) => s.currentChapter);
  const currentStep = useLearnStore((s) => s.currentStep);
  const interactionCompleted = useLearnStore((s) => s.interactionCompleted);
  const advanceStep = useLearnStore((s) => s.advanceStep);
  const previousStep = useLearnStore((s) => s.previousStep);
  const exitLearnMode = useLearnStore((s) => s.exitLearnMode);
  const setUIMode = useCircuitStore((s) => s.setUIMode);

  const chapter = getChapter(currentChapter);
  if (!chapter) return null;

  const totalSteps = getStepCount(currentChapter);
  const step = chapter.steps[currentStep];
  if (!step) return null;

  const isLastStep = currentStep >= totalSteps - 1;
  const isLastChapter = currentChapter === 5;

  const needsInteraction = step.interaction !== 'none' && step.interaction !== 'click-continue';
  const canAdvance = !needsInteraction || interactionCompleted;

  const handleNext = () => {
    if (isLastStep) {
      if (isLastChapter) {
        exitLearnMode();
        setUIMode('explore');
      } else {
        exitLearnMode();
      }
    } else {
      advanceStep();
    }
  };

  const handleExit = () => {
    exitLearnMode();
    setUIMode('explore');
  };

  const handleContinueToCircuits = () => {
    exitLearnMode();
    setUIMode('explore');
  };

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      {/* Top HUD — compact strip */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        pointerEvents: 'auto',
        background: `${theme.bg.base}dd`,
        borderBottom: `1px solid ${theme.border.subtle}`,
      }}>
        <button
          onClick={handleExit}
          style={{
            background: theme.bg.raised,
            color: theme.text.secondary,
            border: `1px solid ${theme.border.subtle}`,
            borderRadius: 6,
            padding: '3px 8px',
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          &larr; Exit
        </button>

        <span style={{ fontSize: 12, fontWeight: 600, color: theme.text.primary }}>
          Ch.{currentChapter}: {chapter.title}
        </span>

        <div style={{ display: 'flex', gap: 4 }}>
          {chapter.steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentStep ? 16 : 6,
                height: 6,
                borderRadius: 3,
                background: i === currentStep
                  ? theme.accent.primary
                  : i < currentStep
                    ? theme.accent.primary + '60'
                    : theme.border.medium,
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom bar — compact, full-width, non-blocking */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        pointerEvents: 'auto',
        background: `${theme.bg.surface}f0`,
        borderTop: `1px solid ${theme.border.medium}`,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{
          maxWidth: 740,
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          {/* Narration text — takes remaining space */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {step.character === 'qubit' && (
              <span style={{
                fontSize: 10,
                color: theme.accent.hover,
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase' as const,
                marginRight: 6,
              }}>
                Qubit:
              </span>
            )}
            <span style={{
              fontSize: 15,
              lineHeight: 1.5,
              color: theme.text.secondary,
            }}>
              {parseBold(step.narration)}
            </span>
            {/* Inline interaction hint */}
            {step.hint && !interactionCompleted && needsInteraction && (
              <span style={{
                display: 'inline-block',
                background: theme.accent.primary + '20',
                color: theme.accent.hover,
                borderRadius: 12,
                padding: '2px 10px',
                fontSize: 12,
                fontWeight: 500,
                marginLeft: 8,
                animation: 'learnPulse 2s infinite',
                verticalAlign: 'middle',
              }}>
                {step.hint}
              </span>
            )}
          </div>

          {/* Navigation buttons — right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {step.interaction === 'click-continue' ? (
              <button
                onClick={handleContinueToCircuits}
                style={{
                  background: theme.accent.primary,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Continue &rarr;
              </button>
            ) : (
              <>
                {currentStep > 0 && (
                  <button
                    onClick={previousStep}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: theme.text.tertiary,
                      fontSize: 13,
                      cursor: 'pointer',
                      padding: '4px 6px',
                    }}
                  >
                    &larr;
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!canAdvance}
                  style={{
                    background: canAdvance ? theme.accent.primary : theme.bg.raised,
                    color: canAdvance ? '#fff' : theme.text.tertiary,
                    border: canAdvance ? 'none' : `1px solid ${theme.border.subtle}`,
                    borderRadius: 7,
                    padding: '6px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: canAdvance ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isLastStep ? (isLastChapter ? 'Finish' : 'Done') : 'Next \u203A'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes learnPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
