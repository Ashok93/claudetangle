import { useEffect, useState, useMemo } from 'react';
import { useCircuitStore } from '../../store/circuitStore';
import { StateVector } from './StateVector';
import { theme, semantic } from '../../lib/theme';
import { interpretResult, marginalizeWorkRegister } from '../../lib/resultInterpreter';

export function OutputPanel() {
  const simulation = useCircuitStore((s) => s.simulation);
  const outputProbabilities = useCircuitStore((s) => s.outputProbabilities);
  const detectedAlgorithm = useCircuitStore((s) => s.detectedAlgorithm);
  const gates = useCircuitStore((s) => s.gates);
  const [animatedProbs, setAnimatedProbs] = useState<number[]>([]);

  // For Shor's, marginalize work register to show 16 counting-register states
  const displayProbs = useMemo(() => {
    if (detectedAlgorithm === "Shor's Algorithm" && outputProbabilities.length === 256) {
      return marginalizeWorkRegister(outputProbabilities, 4, 4);
    }
    return outputProbabilities;
  }, [outputProbabilities, detectedAlgorithm]);

  // Animate probability bars
  useEffect(() => {
    if (simulation === 'idle') {
      setAnimatedProbs([]);
      return;
    }

    if (displayProbs.length === 0) return;

    if (simulation === 'running' || simulation === 'complete') {
      const targetProbs = displayProbs.map((p) => p.probability);
      const zeros = targetProbs.map(() => 0);
      setAnimatedProbs(zeros);

      const timer = setTimeout(() => {
        setAnimatedProbs(targetProbs);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [simulation, displayProbs]);

  if (simulation === 'idle') return null;

  const significantProbs = displayProbs.filter((p) => p.probability > 0.001);
  const maxProb = Math.max(...displayProbs.map((p) => p.probability), 0.01);

  return (
    <div
      className="absolute bottom-4 right-4 z-30 w-80 max-h-[60vh] overflow-hidden flex flex-col rounded-xl shadow-2xl border"
      style={{
        background: theme.bg.surface + 'f8',
        borderColor: theme.border.medium,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex items-center gap-2 flex-shrink-0"
        style={{ borderColor: theme.border.subtle }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: simulation === 'running' ? semantic.success :
              simulation === 'complete' ? theme.accent.primary :
              theme.text.tertiary,
          }}
        />
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: theme.text.primary }}>
          {simulation === 'running' ? 'Simulating...' :
           simulation === 'complete' ? 'Output Pattern' :
           'Ready'}
        </span>
        {detectedAlgorithm && (
          <span
            className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full border"
            style={{
              background: theme.accent.primary + '15',
              color: theme.accent.hover,
              borderColor: theme.accent.primary + '30',
            }}
          >
            {detectedAlgorithm}
          </span>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* State Vector display */}
        {(simulation === 'running' || simulation === 'complete') && (
          <StateVector />
        )}

        {/* Probability bars */}
        {(simulation === 'running' || simulation === 'complete') && significantProbs.length > 0 && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: theme.text.tertiary }}>
                Measurement Probabilities
              </span>
              {detectedAlgorithm === "Shor's Algorithm" && (
                <span className="text-[8px] px-1 py-0.5 rounded" style={{ background: theme.accent.primary + '20', color: theme.accent.hover }}>
                  Counting Register
                </span>
              )}
            </div>
            <div className="space-y-2">
              {significantProbs.map((prob, i) => {
                const animatedValue = animatedProbs[displayProbs.indexOf(prob)] ?? 0;
                const pct = (animatedValue * 100);
                const barWidth = (animatedValue / maxProb) * 100;
                const decimalValue = parseInt(prob.label, 2);

                return (
                  <div key={prob.label}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="flex items-baseline gap-1 w-16 shrink-0">
                        <span className="text-[12px] font-mono" style={{ color: theme.accent.hover }}>{prob.state}</span>
                        <span className="text-[10px] font-mono" style={{ color: theme.text.tertiary }}>={decimalValue}</span>
                      </div>
                      <div
                        className="flex-1 h-4 rounded-sm overflow-hidden relative"
                        style={{ background: theme.bg.raised }}
                      >
                        <div
                          className="h-full rounded-sm transition-all duration-1000 ease-out"
                          style={{
                            width: `${barWidth}%`,
                            background: theme.accent.primary,
                            transitionDelay: `${i * 80}ms`,
                          }}
                        />
                        <span
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-mono"
                          style={{ color: theme.text.tertiary }}
                        >
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Phase color legend */}
            <div className="mt-2 pt-2 border-t flex items-center gap-2 flex-wrap" style={{ borderColor: theme.border.subtle }}>
              <span className="text-[9px]" style={{ color: theme.text.tertiary }}>Phase:</span>
              {[
                { label: '0', color: 'hsl(240, 70%, 55%)' },
                { label: '\u03C0/2', color: 'hsl(150, 70%, 55%)' },
                { label: '\u03C0', color: 'hsl(0, 70%, 55%)' },
                { label: '3\u03C0/2', color: 'hsl(60, 70%, 55%)' },
              ].map(({ label, color }) => (
                <span key={label} className="flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                  <span className="text-[9px]" style={{ color: theme.text.tertiary }}>{label}</span>
                </span>
              ))}
            </div>

            {/* Result Interpretation */}
            {simulation === 'complete' && outputProbabilities.length > 0 && (
              <ResultInterpretationSection
                algorithmName={detectedAlgorithm}
                outputProbabilities={outputProbabilities}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultInterpretationSection({
  algorithmName,
  outputProbabilities,
}: {
  algorithmName: string | null;
  outputProbabilities: { state: string; probability: number; label: string }[];
}) {
  const interpretation = useMemo(
    () => interpretResult(algorithmName, outputProbabilities),
    [algorithmName, outputProbabilities]
  );

  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <div className="mt-2 pt-2 border-t" style={{ borderColor: theme.border.subtle }}>
      {/* Headline */}
      <p
        className="text-[14px] font-bold leading-tight mb-1"
        style={{ color: theme.accent.hover }}
      >
        {interpretation.headline}
      </p>

      {/* Explanation */}
      <p className="text-[12px] leading-relaxed mb-2" style={{ color: theme.text.secondary }}>
        {interpretation.explanation}
      </p>

      {/* Detail rows */}
      <div className="space-y-1">
        {interpretation.details.map((detail) => (
          <div key={detail.label} className="flex items-start gap-1.5">
            <span className="text-[10px] shrink-0" style={{ color: theme.text.tertiary }}>
              {detail.label}:
            </span>
            <span
              className="text-[10px] font-mono"
              style={{ color: detail.highlight ? theme.accent.hover : theme.text.secondary }}
            >
              {detail.value}
            </span>
          </div>
        ))}
      </div>

      {/* Educational walkthrough steps */}
      {interpretation.steps.length > 0 && (
        <div className="mt-3 pt-2 border-t" style={{ borderColor: theme.border.subtle }}>
          <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: theme.text.tertiary }}>
            How it works
          </div>
          <div className="space-y-1">
            {interpretation.steps.map((s) => (
              <div
                key={s.step}
                className="rounded-md cursor-pointer transition-colors"
                style={{
                  background: expandedStep === s.step ? theme.bg.raised : 'transparent',
                }}
                onClick={() => setExpandedStep(expandedStep === s.step ? null : s.step)}
              >
                <div className="flex items-start gap-1.5 px-1.5 py-1">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5"
                    style={{
                      background: theme.accent.primary + '25',
                      color: theme.accent.hover,
                    }}
                  >
                    {s.step}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: theme.text.primary }}
                    >
                      {s.title}
                    </span>
                    {expandedStep === s.step && (
                      <p
                        className="text-[10px] leading-relaxed mt-0.5"
                        style={{ color: theme.text.secondary }}
                      >
                        {s.detail}
                      </p>
                    )}
                  </div>
                  <span
                    className="text-[9px] shrink-0 mt-1"
                    style={{ color: theme.text.tertiary }}
                  >
                    {expandedStep === s.step ? '\u25B2' : '\u25BC'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
