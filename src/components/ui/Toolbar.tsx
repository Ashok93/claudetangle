import { useCircuitStore } from '../../store/circuitStore';
import { theme } from '../../lib/theme';

export function Toolbar() {
  const gates = useCircuitStore((s) => s.gates);
  const clearCircuit = useCircuitStore((s) => s.clearCircuit);
  const detectedAlgorithm = useCircuitStore((s) => s.detectedAlgorithm);
  const uiMode = useCircuitStore((s) => s.uiMode);
  const setUIMode = useCircuitStore((s) => s.setUIMode);
  const resetSimulation = useCircuitStore((s) => s.resetSimulation);

  const handleBackToPrograms = () => {
    resetSimulation();
    clearCircuit();
    setUIMode('explore');
  };

  const handleBuildYourOwn = () => {
    resetSimulation();
    clearCircuit();
    setUIMode('build');
  };

  return (
    <div
      className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0"
      style={{ background: theme.bg.surface, borderColor: theme.border.subtle }}
    >
      <div className="flex items-center gap-4">
        {/* Back to Programs — visible when a circuit is loaded or in build mode */}
        {(gates.length > 0 || uiMode === 'build') && (
          <button
            onClick={handleBackToPrograms}
            className="px-2 py-1 text-xs rounded transition-colors border"
            style={{
              background: theme.bg.raised,
              color: theme.text.secondary,
              borderColor: theme.border.subtle,
            }}
          >
            ← Programs
          </button>
        )}

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: theme.accent.primary }}
          >
            Q
          </div>
          <span className="text-sm font-bold tracking-wide" style={{ color: theme.text.primary }}>Q-Flux</span>
        </div>

        {/* Detected algorithm badge */}
        {detectedAlgorithm && (
          <>
            <div className="w-px h-5" style={{ background: theme.border.subtle }} />
            <span
              className="text-xs px-2 py-0.5 rounded-full border"
              style={{
                background: theme.accent.primary + '15',
                color: theme.accent.hover,
                borderColor: theme.accent.primary + '30',
              }}
            >
              {detectedAlgorithm}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {uiMode === 'explore' && (
          <>
            <button
              onClick={() => setUIMode('learn')}
              className="px-3 py-1 text-xs rounded-lg transition-colors border"
              style={{
                background: '#4ade8010',
                color: '#4ade80',
                borderColor: '#4ade8030',
              }}
            >
              Learn
            </button>
            <button
              onClick={handleBuildYourOwn}
              className="px-3 py-1 text-xs rounded-lg transition-colors border"
              style={{
                background: theme.bg.raised,
                color: theme.text.secondary,
                borderColor: theme.border.medium,
              }}
            >
              Build Your Own
            </button>
          </>
        )}

        {uiMode === 'build' && (
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: theme.accent.primary + '20', color: theme.accent.hover }}>
            Build Mode
          </span>
        )}
      </div>
    </div>
  );
}
