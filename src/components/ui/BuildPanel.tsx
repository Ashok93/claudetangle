import { useCircuitStore } from '../../store/circuitStore';
import { GATE_COLORS } from '../../lib/constants';
import { GATE_INFO } from '../../lib/gateInfo';
import { theme, semantic } from '../../lib/theme';
import type { GateType } from '../../types/circuit';

interface PaletteItem {
  type: GateType;
  label: string;
  description: string;
}

const SINGLE_GATES: PaletteItem[] = [
  { type: 'h', label: 'H', description: 'Hadamard' },
  { type: 'x', label: 'X', description: 'Pauli-X' },
  { type: 'y', label: 'Y', description: 'Pauli-Y' },
  { type: 'z', label: 'Z', description: 'Pauli-Z' },
  { type: 'measure', label: 'M', description: 'Measure' },
];

export function BuildPanel() {
  const qubits = useCircuitStore((s) => s.qubits);
  const gates = useCircuitStore((s) => s.gates);
  const setQubits = useCircuitStore((s) => s.setQubits);
  const addGate = useCircuitStore((s) => s.addGate);
  const clearCircuit = useCircuitStore((s) => s.clearCircuit);
  const selectedGateId = useCircuitStore((s) => s.selectedGateId);
  const removeGate = useCircuitStore((s) => s.removeGate);
  const selectGate = useCircuitStore((s) => s.selectGate);
  const selectedQubit = useCircuitStore((s) => s.selectedQubit);

  const nextStep = gates.length > 0 ? Math.max(...gates.map((g) => g.step)) + 1 : 0;

  const handleAddSingleGate = (type: GateType) => {
    addGate(type, [selectedQubit], nextStep);
  };

  const handleAddCX = () => {
    if (qubits < 2) return;
    const control = selectedQubit;
    const target = control === 0 ? 1 : 0;
    addGate('cx', [target], nextStep, [control]);
  };

  const handleAddCCX = () => {
    if (qubits < 3) return;
    const c1 = selectedQubit;
    const available = Array.from({ length: qubits }, (_, i) => i).filter((i) => i !== c1);
    const c2 = available[0];
    const target = available[1];
    addGate('ccx', [target], nextStep, [c1, c2]);
  };

  const handleDelete = () => {
    if (selectedGateId) {
      removeGate(selectedGateId);
      selectGate(null);
    }
  };

  const selectedGate = selectedGateId ? gates.find((g) => g.id === selectedGateId) : null;
  const selectedInfo = selectedGate ? GATE_INFO[selectedGate.type] : null;

  return (
    <div
      className="h-full flex flex-col overflow-hidden border-l flex-shrink-0"
      style={{ background: theme.bg.surface, borderColor: theme.border.subtle, width: 220, minWidth: 220 }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b" style={{ borderColor: theme.border.subtle }}>
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: theme.text.tertiary }}>
          Circuit Builder
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Selected Qubit indicator */}
        <div className="px-4 py-3 border-b" style={{ borderColor: theme.border.subtle }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider mb-1" style={{ color: theme.text.tertiary }}>
                Selected Qubit
              </div>
              <span className="text-lg font-mono font-bold" style={{ color: theme.accent.hover }}>
                q{selectedQubit}
              </span>
            </div>
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: theme.accent.primary, boxShadow: `0 0 8px ${theme.accent.primary}` }}
            />
          </div>
          <p className="text-[10px] mt-1 leading-relaxed" style={{ color: theme.text.tertiary }}>
            Click a qubit rail in the 3D view to select it.
          </p>
        </div>

        {/* Qubits */}
        <div className="px-4 py-3 border-b" style={{ borderColor: theme.border.subtle }}>
          <div className="text-[11px] uppercase tracking-wider mb-2" style={{ color: theme.text.tertiary }}>
            Qubits
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQubits(qubits - 1)}
              className="w-7 h-7 flex items-center justify-center text-sm rounded transition-colors"
              style={{ background: theme.bg.raised, color: theme.text.secondary }}
            >
              -
            </button>
            <span className="text-lg font-mono w-6 text-center font-bold" style={{ color: theme.text.primary }}>
              {qubits}
            </span>
            <button
              onClick={() => setQubits(qubits + 1)}
              className="w-7 h-7 flex items-center justify-center text-sm rounded transition-colors"
              style={{ background: theme.bg.raised, color: theme.text.secondary }}
            >
              +
            </button>
          </div>
        </div>

        {/* Single-Qubit Gates */}
        <div className="px-4 py-3 border-b" style={{ borderColor: theme.border.subtle }}>
          <div className="text-[11px] uppercase tracking-wider mb-2" style={{ color: theme.text.tertiary }}>
            Single-Qubit Gates
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SINGLE_GATES.map((item) => {
              const color = GATE_COLORS[item.type];
              return (
                <button
                  key={item.type}
                  onClick={() => handleAddSingleGate(item.type)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left border"
                  style={{ borderColor: color + '25', background: color + '08' }}
                  title={`Add ${item.description} on q${selectedQubit}`}
                >
                  <span
                    className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ color, background: color + '15' }}
                  >
                    {item.label}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] truncate" style={{ color: theme.text.secondary }}>
                      {item.description}
                    </span>
                    <span className="text-[10px]" style={{ color: theme.text.tertiary }}>
                      q{selectedQubit}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Multi-Qubit Gates */}
        <div className="px-4 py-3 border-b" style={{ borderColor: theme.border.subtle }}>
          <div className="text-[11px] uppercase tracking-wider mb-2" style={{ color: theme.text.tertiary }}>
            Multi-Qubit Gates
          </div>
          <div className="space-y-2">
            {/* CX */}
            {(() => {
              const color = GATE_COLORS.cx;
              const disabled = qubits < 2;
              const target = selectedQubit === 0 ? 1 : 0;
              return (
                <button
                  onClick={handleAddCX}
                  disabled={disabled}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left disabled:opacity-25 border"
                  style={{ borderColor: color + '25', background: color + '08' }}
                  title={`Add CNOT: ctrl=q${selectedQubit}, target=q${target}`}
                >
                  <span
                    className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ color, background: color + '15' }}
                  >
                    CX
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px]" style={{ color: theme.text.secondary }}>CNOT</span>
                    <span className="text-[10px]" style={{ color: theme.text.tertiary }}>
                      ctrl q{selectedQubit} → target q{target}
                    </span>
                  </div>
                </button>
              );
            })()}

            {/* CCX */}
            {(() => {
              const color = GATE_COLORS.ccx;
              const disabled = qubits < 3;
              const available = Array.from({ length: qubits }, (_, i) => i).filter((i) => i !== selectedQubit);
              return (
                <button
                  onClick={handleAddCCX}
                  disabled={disabled}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left disabled:opacity-25 border"
                  style={{ borderColor: color + '25', background: color + '08' }}
                  title="Add Toffoli gate"
                >
                  <span
                    className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ color, background: color + '15' }}
                  >
                    CCX
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px]" style={{ color: theme.text.secondary }}>Toffoli</span>
                    <span className="text-[10px]" style={{ color: theme.text.tertiary }}>
                      ctrl q{selectedQubit},q{available[0] ?? '?'} → q{available[1] ?? '?'}
                    </span>
                  </div>
                </button>
              );
            })()}
          </div>
        </div>

        {/* Selected Gate Info */}
        {selectedInfo && (
          <div className="px-4 py-3 border-b" style={{ borderColor: theme.border.subtle }}>
            <div className="text-[11px] uppercase tracking-wider mb-2" style={{ color: theme.text.tertiary }}>
              Selected Gate
            </div>
            <div className="text-xs font-medium mb-1" style={{ color: selectedInfo.color }}>
              {selectedInfo.name}
            </div>
            <p className="text-[11px] leading-relaxed mb-2" style={{ color: theme.text.secondary }}>
              {selectedInfo.oneLiner}
            </p>
            <button
              onClick={handleDelete}
              className="w-full px-3 py-2 text-[11px] rounded transition-colors"
              style={{ background: semantic.error + '15', color: semantic.error, border: `1px solid ${semantic.error + '30'}` }}
            >
              Delete Gate
            </button>
          </div>
        )}

        {/* Circuit info */}
        <div className="px-4 py-3 border-b" style={{ borderColor: theme.border.subtle }}>
          <div className="text-[11px] uppercase tracking-wider mb-2" style={{ color: theme.text.tertiary }}>
            Circuit
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono" style={{ color: theme.text.secondary }}>
              {gates.length} gate{gates.length !== 1 ? 's' : ''}
            </span>
            {gates.length > 0 && (
              <button
                onClick={clearCircuit}
                className="px-2 py-0.5 text-[11px] rounded transition-colors border"
                style={{ background: theme.bg.raised, color: theme.text.tertiary, borderColor: theme.border.subtle }}
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
