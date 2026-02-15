import { useState } from 'react';
import { useCircuitStore } from '../../store/circuitStore';
import { parseQASM } from '../../parser/qasmParser';
import type { Algorithm } from '../../types/circuit';
import { ALGORITHMS } from '../../lib/algorithms';
import { theme } from '../../lib/theme';

export function BlueprintMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const loadGates = useCircuitStore((s) => s.loadGates);

  const loadAlgorithm = (algo: Algorithm) => {
    const result = parseQASM(algo.qasm);
    loadGates(result.qubits, result.gates);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 text-sm rounded transition-colors border"
        style={{
          background: theme.bg.raised,
          color: theme.text.secondary,
          borderColor: theme.border.medium,
        }}
      >
        Blueprints
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className="absolute top-full mt-1 left-0 z-50 w-72 rounded-lg shadow-xl overflow-hidden border"
            style={{ background: theme.bg.raised, borderColor: theme.border.medium }}
          >
            <div className="px-3 py-2 border-b" style={{ borderColor: theme.border.subtle }}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.accent.primary }}>
                Algorithm Blueprints
              </span>
            </div>
            {ALGORITHMS.map((algo) => (
              <button
                key={algo.name}
                onClick={() => loadAlgorithm(algo)}
                className="w-full text-left px-3 py-2.5 transition-colors border-b last:border-0"
                style={{ borderColor: theme.border.subtle }}
                onMouseEnter={(e) => { e.currentTarget.style.background = theme.bg.surface; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div className="text-sm font-medium" style={{ color: theme.text.primary }}>{algo.name}</div>
                <div className="text-xs mt-0.5" style={{ color: theme.text.tertiary }}>{algo.description}</div>
                <div className="text-[10px] mt-1" style={{ color: theme.accent.hover, opacity: 0.6 }}>{algo.qubits} qubits</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
