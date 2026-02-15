import { useSandboxStore } from '../../store/sandboxStore';
import { THEME_GATE_COLORS } from '../../lib/theme';
import { phaseToColor } from '../../lib/quantumSim';
import type { SandboxGate } from '../../lib/sandboxSim';

const SINGLE_GATES: { gate: SandboxGate; label: string }[] = [
  { gate: 'h', label: 'H' },
  { gate: 'x', label: 'X' },
  { gate: 'y', label: 'Y' },
  { gate: 'z', label: 'Z' },
  { gate: 's', label: 'S' },
  { gate: 't', label: 'T' },
];

const TWO_QUBIT_GATES: { gate: SandboxGate; label: string }[] = [
  { gate: 'cx', label: 'CX' },
  { gate: 'cz', label: 'CZ' },
  { gate: 'swap', label: 'SWAP' },
];

function GateButton({ gate, label, disabled }: { gate: SandboxGate; label: string; disabled?: boolean }) {
  const applyGate = useSandboxStore((s) => s.applyGate);
  const color = THEME_GATE_COLORS[gate] ?? '#6366f1';

  return (
    <button
      onClick={() => applyGate(gate)}
      disabled={disabled}
      className="min-w-[44px] h-[44px] px-3 rounded-lg text-[13px] font-bold transition-all border flex items-center justify-center shrink-0"
      style={{
        background: disabled ? 'rgba(30, 35, 50, 0.5)' : 'rgba(14, 21, 37, 0.8)',
        color: disabled ? '#475569' : color,
        borderColor: disabled ? 'rgba(71, 85, 105, 0.2)' : color + '40',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = color;
          e.currentTarget.style.background = color + '20';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = disabled ? 'rgba(71, 85, 105, 0.2)' : color + '40';
        e.currentTarget.style.background = disabled ? 'rgba(30, 35, 50, 0.5)' : 'rgba(14, 21, 37, 0.8)';
      }}
    >
      {label}
    </button>
  );
}

function ActionButton({ onClick, label, color, disabled }: {
  onClick: () => void;
  label: string;
  color: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="min-w-[44px] h-[44px] px-3 rounded-lg text-[12px] font-medium transition-all border flex items-center justify-center shrink-0"
      style={{
        background: disabled ? 'rgba(30, 35, 50, 0.5)' : 'rgba(14, 21, 37, 0.8)',
        color: disabled ? '#475569' : color,
        borderColor: disabled ? 'rgba(71, 85, 105, 0.2)' : color + '30',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = color;
          e.currentTarget.style.background = color + '15';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = disabled ? 'rgba(71, 85, 105, 0.2)' : color + '30';
        e.currentTarget.style.background = disabled ? 'rgba(30, 35, 50, 0.5)' : 'rgba(14, 21, 37, 0.8)';
      }}
    >
      {label}
    </button>
  );
}

export function SandboxBottomPanel() {
  const numQubits = useSandboxStore((s) => s.numQubits);
  const ketNotation = useSandboxStore((s) => s.ketNotation);
  const stateDescription = useSandboxStore((s) => s.stateDescription);
  const basisStates = useSandboxStore((s) => s.basisStates);
  const measurementHistory = useSandboxStore((s) => s.measurementHistory);
  const histogram = useSandboxStore((s) => s.histogram);
  const gateHistory = useSandboxStore((s) => s.gateHistory);
  const measure = useSandboxStore((s) => s.measure);
  const runMany = useSandboxStore((s) => s.runMany);
  const undo = useSandboxStore((s) => s.undo);
  const reset = useSandboxStore((s) => s.reset);

  const hasTwoQubits = numQubits >= 2;
  const hasHistory = gateHistory.length > 0;
  const maxProb = Math.max(...basisStates.map((b) => b.probability), 0.01);

  // Get histogram total
  let histogramTotal = 0;
  const histogramEntries: [string, number][] = [];
  histogram.forEach((count, label) => {
    histogramTotal += count;
    histogramEntries.push([label, count]);
  });
  histogramEntries.sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div
      className="pointer-events-auto max-h-[40vh] overflow-y-auto"
      style={{
        background: 'rgba(14, 21, 37, 0.85)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(100, 116, 139, 0.15)',
      }}
    >
      {/* Gate toolbar */}
      <div className="px-4 py-3 flex flex-wrap gap-2 items-center">
        {/* Single-qubit gates */}
        {SINGLE_GATES.map((g) => (
          <GateButton key={g.gate} gate={g.gate} label={g.label} />
        ))}

        {/* Separator */}
        <div className="w-px h-8 mx-1" style={{ background: 'rgba(100, 116, 139, 0.2)' }} />

        {/* Two-qubit gates */}
        {TWO_QUBIT_GATES.map((g) => (
          <GateButton key={g.gate} gate={g.gate} label={g.label} disabled={!hasTwoQubits} />
        ))}

        {/* Separator */}
        <div className="w-px h-8 mx-1" style={{ background: 'rgba(100, 116, 139, 0.2)' }} />

        {/* Actions */}
        <ActionButton onClick={measure} label="Measure" color="#d97706" />
        <ActionButton onClick={() => runMany(100)} label="Run 100" color="#d97706" />
        <ActionButton onClick={undo} label="Undo" color="#94a3b8" disabled={!hasHistory} />
        <ActionButton onClick={reset} label="Reset" color="#94a3b8" />
      </div>

      {/* State panel */}
      <div className="px-4 pb-4 space-y-3">
        {/* Ket notation */}
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: '#64748b' }}>
            State
          </span>
          <div
            className="mt-1 text-[14px] font-mono px-3 py-2 rounded-lg"
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              color: '#e2e8f0',
            }}
          >
            |&psi;&rang; = {ketNotation}
          </div>
        </div>

        {/* Description */}
        <p className="text-[13px]" style={{ color: '#94a3b8' }}>
          {stateDescription}
        </p>

        {/* Probability bars */}
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: '#64748b' }}>
            Probabilities
          </span>
          <div className="mt-1 space-y-1">
            {basisStates.map((b) => (
              <div key={b.label} className="flex items-center gap-2">
                <span className="text-[12px] font-mono w-12 shrink-0" style={{ color: '#94a3b8' }}>
                  {b.ket}
                </span>
                <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: 'rgba(30, 41, 59, 0.5)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(b.probability / maxProb) * 100}%`,
                      background: phaseToColor(b.phase),
                      opacity: b.probability < 0.001 ? 0.2 : 0.8,
                    }}
                  />
                </div>
                <span className="text-[11px] font-mono w-12 text-right shrink-0" style={{ color: '#94a3b8' }}>
                  {(b.probability * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Measurement history */}
        {measurementHistory.length > 0 && (
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: '#64748b' }}>
              Measurements
            </span>
            <div className="mt-1 flex flex-wrap gap-1">
              {measurementHistory.map((outcome, i) => (
                <span
                  key={i}
                  className="text-[11px] font-mono px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(30, 41, 59, 0.5)', color: '#e2e8f0' }}
                >
                  {outcome}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Histogram */}
        {histogramEntries.length > 0 && (
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: '#64748b' }}>
              Histogram ({histogramTotal} shots)
            </span>
            <div className="mt-1 space-y-1">
              {histogramEntries.map(([label, count]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-[12px] font-mono w-12 shrink-0" style={{ color: '#94a3b8' }}>
                    |{label}&rang;
                  </span>
                  <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: 'rgba(30, 41, 59, 0.5)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${(count / histogramTotal) * 100}%`,
                        background: '#0891b2',
                        opacity: 0.8,
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-mono w-16 text-right shrink-0" style={{ color: '#94a3b8' }}>
                    {count} ({((count / histogramTotal) * 100).toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
