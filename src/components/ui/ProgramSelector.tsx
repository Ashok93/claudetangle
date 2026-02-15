import { useState, useEffect } from 'react';
import { useCircuitStore } from '../../store/circuitStore';
import { parseQASM } from '../../parser/qasmParser';
import { BASICS, ULTIMATE } from '../../lib/algorithms';
import type { Algorithm } from '../../types/circuit';
import { theme, semantic } from '../../lib/theme';

function AlgorithmCard({ algo, onClick }: { algo: Algorithm; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left px-5 py-4 rounded-xl border transition-all duration-200 group"
      style={{
        background: theme.bg.surface,
        borderColor: theme.border.medium,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = theme.accent.primary + '60';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.10)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = theme.border.medium;
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-[15px] font-semibold" style={{ color: theme.text.primary }}>
          {algo.name}
        </span>
        <span
          className="text-[11px] px-2 py-0.5 rounded-full font-mono ml-2 shrink-0"
          style={{
            background: theme.accent.primary + '12',
            color: theme.accent.primary,
          }}
        >
          {algo.qubits}q
        </span>
      </div>
      <p className="text-[13px] leading-relaxed" style={{ color: theme.text.secondary }}>
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

  const isVisible = uiMode === 'explore' && simulation === 'idle' && gates.length === 0;

  // Reset fading when the selector becomes visible again (e.g. back button)
  useEffect(() => {
    if (isVisible) setFading(false);
  }, [isVisible]);

  // Only show in explore mode when idle and no circuit loaded
  if (!isVisible) return null;

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
      className="absolute inset-0 z-20 flex justify-center overflow-y-auto transition-opacity duration-300"
      style={{
        opacity: fading ? 0 : 1,
        background: theme.bg.base,
      }}
    >
      <div className="flex flex-col items-center gap-5 max-w-[780px] w-full px-4 sm:px-8 py-6 sm:py-8 my-auto">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: theme.text.primary }}>
            Explore Quantum Programs
          </h2>
          <p className="text-[15px]" style={{ color: theme.text.tertiary }}>
            Choose a quantum algorithm to visualize, or build your own circuit
          </p>
        </div>

        {/* Learn section */}
        <button
          onClick={() => {
            setFading(true);
            setTimeout(() => setUIMode('learn'), 250);
          }}
          className="w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 relative overflow-hidden"
          style={{
            background: theme.bg.surface,
            borderColor: semantic.success + '50',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = semantic.success + '80';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.10)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = semantic.success + '50';
            e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[16px] font-bold" style={{ color: theme.text.primary }}>
              Learn Quantum Computing
            </span>
            <span
              className="text-[11px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: semantic.success + '15', color: semantic.success }}
            >
              New
            </span>
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: theme.text.secondary }}>
            Interactive 3D lessons — learn qubits, gates, measurement, and entanglement from scratch.
          </p>
        </button>

        {/* Sandbox section */}
        <button
          onClick={() => {
            setFading(true);
            setTimeout(() => setUIMode('sandbox'), 250);
          }}
          className="w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 relative overflow-hidden"
          style={{
            background: theme.bg.surface,
            borderColor: '#0891b2' + '50',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#0891b2' + '80';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.10)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#0891b2' + '50';
            e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[16px] font-bold" style={{ color: theme.text.primary }}>
              Think in Quantum
            </span>
            <span
              className="text-[11px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: '#0891b2' + '15', color: '#0891b2' }}
            >
              Sandbox
            </span>
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: theme.text.secondary }}>
            Build quantum intuition — apply gates, see Bloch spheres animate, and explore entanglement with 1-4 qubits in real time.
          </p>
        </button>

        {/* Basics section */}
        <div className="w-full">
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: theme.text.tertiary }}
            >
              Basics
            </span>
            <div className="flex-1 h-px" style={{ background: theme.border.subtle }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
            {BASICS.map((algo) => (
              <AlgorithmCard key={algo.name} algo={algo} onClick={() => handleLoadAlgorithm(algo)} />
            ))}
          </div>
        </div>

        {/* Ultimate section */}
        <div className="w-full">
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: '#b45309' }}
            >
              Ultimate
            </span>
            <div className="flex-1 h-px" style={{ background: '#b4530930' }} />
          </div>
          <div className="grid grid-cols-1 gap-3 w-full">
            {ULTIMATE.map((algo) => (
              <button
                key={algo.name}
                onClick={() => handleLoadAlgorithm(algo)}
                className="text-left px-5 py-4 rounded-xl border transition-all duration-200 group relative overflow-hidden"
                style={{
                  background: theme.bg.surface,
                  borderColor: '#b4530930',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#b4530980';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.10)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#b4530930';
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[16px] font-bold" style={{ color: theme.text.primary }}>
                      {algo.name}
                    </span>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: '#b4530912', color: '#b45309' }}
                    >
                      Advanced
                    </span>
                  </div>
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full font-mono"
                    style={{ background: '#b4530912', color: '#b45309' }}
                  >
                    {algo.qubits}q
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: theme.text.secondary }}>
                  {algo.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Build Your Own button */}
        <button
          onClick={handleBuildOwn}
          className="px-8 py-3 rounded-xl text-[14px] font-medium transition-all border"
          style={{
            background: 'transparent',
            color: theme.text.secondary,
            borderColor: theme.border.medium,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.accent.primary;
            e.currentTarget.style.color = theme.accent.primary;
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
