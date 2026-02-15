import { useState } from 'react';
import { useCircuitStore } from '../../store/circuitStore';
import { parseQASM } from '../../parser/qasmParser';
import { BASICS, ULTIMATE } from '../../lib/algorithms';
import type { Algorithm } from '../../types/circuit';
import { theme } from '../../lib/theme';

function AlgorithmCard({ algo, onClick }: { algo: Algorithm; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left p-4 rounded-xl border transition-all duration-200 group"
      style={{
        background: theme.bg.raised,
        borderColor: theme.border.subtle,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = theme.accent.primary + '60';
        e.currentTarget.style.background = theme.bg.surface;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = theme.border.subtle;
        e.currentTarget.style.background = theme.bg.raised;
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-semibold" style={{ color: theme.text.primary }}>
          {algo.name}
        </span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded-full font-mono"
          style={{
            background: theme.accent.primary + '20',
            color: theme.accent.hover,
          }}
        >
          {algo.qubits}q
        </span>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: theme.text.tertiary }}>
        {algo.description}
      </p>
    </button>
  );
}

export function ProgramSelector() {
  const uiMode = useCircuitStore((s) => s.uiMode);
  const simulation = useCircuitStore((s) => s.simulation);
  const gates = useCircuitStore((s) => s.gates);
  const loadGates = useCircuitStore((s) => s.loadGates);
  const setUIMode = useCircuitStore((s) => s.setUIMode);
  const [fading, setFading] = useState(false);

  // Only show in explore mode when idle and no circuit loaded
  if (uiMode !== 'explore' || simulation !== 'idle' || gates.length > 0) return null;

  const handleLoadAlgorithm = (algo: Algorithm) => {
    setFading(true);
    setTimeout(() => {
      const result = parseQASM(algo.qasm);
      loadGates(result.qubits, result.gates);
    }, 250);
  };

  const handleBuildOwn = () => {
    setFading(true);
    setTimeout(() => {
      setUIMode('build');
    }, 250);
  };

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-300"
      style={{
        opacity: fading ? 0 : 1,
        background: `${theme.bg.base}cc`,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="flex flex-col items-center gap-6 max-w-[750px] w-full px-6">
        {/* Header */}
        <div className="text-center mb-2">
          <h2 className="text-xl font-bold mb-1" style={{ color: theme.text.primary }}>
            Explore Quantum Programs
          </h2>
          <p className="text-sm" style={{ color: theme.text.tertiary }}>
            Choose a quantum algorithm to visualize, or build your own circuit
          </p>
        </div>

        {/* Learn section */}
        <div className="w-full">
          <button
            onClick={() => {
              setFading(true);
              setTimeout(() => setUIMode('learn'), 250);
            }}
            className="w-full text-left p-5 rounded-xl border transition-all duration-200 relative overflow-hidden"
            style={{
              background: theme.bg.raised,
              borderColor: '#4ade8040',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#4ade8080';
              e.currentTarget.style.background = theme.bg.surface;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#4ade8040';
              e.currentTarget.style.background = theme.bg.raised;
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: theme.text.primary }}>
                  Learn Quantum Computing
                </span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: '#4ade8020', color: '#4ade80' }}
                >
                  New
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: theme.text.secondary }}>
              Interactive 3D lessons — learn qubits, gates, measurement, and entanglement from scratch. No prior knowledge needed.
            </p>
          </button>
        </div>

        {/* Basics section */}
        <div className="w-full">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: theme.text.tertiary }}
            >
              Basics
            </span>
            <div className="flex-1 h-px" style={{ background: theme.border.subtle }} />
          </div>
          <div className="grid grid-cols-3 gap-3 w-full">
            {BASICS.map((algo) => (
              <AlgorithmCard key={algo.name} algo={algo} onClick={() => handleLoadAlgorithm(algo)} />
            ))}
          </div>
        </div>

        {/* Ultimate section */}
        <div className="w-full">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: '#f59e0b' }}
            >
              Ultimate
            </span>
            <div className="flex-1 h-px" style={{ background: '#f59e0b30' }} />
          </div>
          <div className="grid grid-cols-1 gap-3 w-full">
            {ULTIMATE.map((algo) => (
              <button
                key={algo.name}
                onClick={() => handleLoadAlgorithm(algo)}
                className="text-left p-5 rounded-xl border transition-all duration-200 group relative overflow-hidden"
                style={{
                  background: theme.bg.raised,
                  borderColor: '#f59e0b30',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#f59e0b80';
                  e.currentTarget.style.background = theme.bg.surface;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#f59e0b30';
                  e.currentTarget.style.background = theme.bg.raised;
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: theme.text.primary }}>
                      {algo.name}
                    </span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: '#f59e0b20', color: '#f59e0b' }}
                    >
                      Advanced
                    </span>
                  </div>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-mono"
                    style={{ background: '#f59e0b20', color: '#f59e0b' }}
                  >
                    {algo.qubits}q
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: theme.text.secondary }}>
                  {algo.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Build Your Own button */}
        <button
          onClick={handleBuildOwn}
          className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all border"
          style={{
            background: 'transparent',
            color: theme.text.secondary,
            borderColor: theme.border.medium,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.accent.primary;
            e.currentTarget.style.color = theme.accent.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.border.medium;
            e.currentTarget.style.color = theme.text.secondary;
          }}
        >
          Build Your Own Circuit
        </button>
      </div>
    </div>
  );
}
