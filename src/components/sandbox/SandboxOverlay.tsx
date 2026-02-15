import { useCircuitStore } from '../../store/circuitStore';
import { useSandboxStore } from '../../store/sandboxStore';
import { theme } from '../../lib/theme';
import { SandboxBottomPanel } from './SandboxBottomPanel';

export function SandboxOverlay() {
  const setUIMode = useCircuitStore((s) => s.setUIMode);
  const numQubits = useSandboxStore((s) => s.numQubits);
  const setNumQubits = useSandboxStore((s) => s.setNumQubits);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 pointer-events-auto">
        <button
          onClick={() => setUIMode('explore')}
          className="px-3 py-1.5 text-[12px] rounded-lg transition-colors border"
          style={{
            background: 'rgba(14, 21, 37, 0.7)',
            color: '#94a3b8',
            borderColor: 'rgba(100, 116, 139, 0.3)',
            backdropFilter: 'blur(8px)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#0891b2';
            e.currentTarget.style.color = '#0891b2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.3)';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          &larr; Back
        </button>

        <div
          className="px-3 py-1.5 rounded-lg text-[13px] font-medium"
          style={{
            background: 'rgba(14, 21, 37, 0.7)',
            color: '#e2e8f0',
            backdropFilter: 'blur(8px)',
          }}
        >
          Think in Quantum
        </div>

        {/* Qubit count controls */}
        <div
          className="flex items-center gap-1 rounded-lg px-2 py-1"
          style={{
            background: 'rgba(14, 21, 37, 0.7)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <button
            onClick={() => setNumQubits(numQubits - 1)}
            disabled={numQubits <= 1}
            className="w-7 h-7 rounded text-[14px] font-bold transition-colors flex items-center justify-center"
            style={{
              color: numQubits <= 1 ? '#475569' : '#94a3b8',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              if (numQubits > 1) e.currentTarget.style.color = '#0891b2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = numQubits <= 1 ? '#475569' : '#94a3b8';
            }}
          >
            -
          </button>
          <span className="text-[13px] font-mono min-w-[20px] text-center" style={{ color: '#e2e8f0' }}>
            {numQubits}q
          </span>
          <button
            onClick={() => setNumQubits(numQubits + 1)}
            disabled={numQubits >= 4}
            className="w-7 h-7 rounded text-[14px] font-bold transition-colors flex items-center justify-center"
            style={{
              color: numQubits >= 4 ? '#475569' : '#94a3b8',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              if (numQubits < 4) e.currentTarget.style.color = '#0891b2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = numQubits >= 4 ? '#475569' : '#94a3b8';
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom panel */}
      <SandboxBottomPanel />
    </div>
  );
}
