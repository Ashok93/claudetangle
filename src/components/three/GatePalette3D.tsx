import { useCircuitStore } from '../../store/circuitStore';
import { GATE_COLORS } from '../../lib/constants';
import { theme } from '../../lib/theme';
import type { GateType } from '../../types/circuit';

interface PaletteItem {
  type: GateType;
  label: string;
  description: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  { type: 'h', label: 'H', description: 'Hadamard' },
  { type: 'x', label: 'X', description: 'Pauli-X' },
  { type: 'y', label: 'Y', description: 'Pauli-Y' },
  { type: 'z', label: 'Z', description: 'Pauli-Z' },
  { type: 'cx', label: 'CX', description: 'CNOT' },
  { type: 'ccx', label: 'CCX', description: 'Toffoli' },
  { type: 'measure', label: 'M', description: 'Measure' },
];

export function GatePalette3D() {
  const addGate = useCircuitStore((s) => s.addGate);
  const qubits = useCircuitStore((s) => s.qubits);
  const gates = useCircuitStore((s) => s.gates);

  const handleAddGate = (type: GateType) => {
    const maxStep = gates.length > 0 ? Math.max(...gates.map((g) => g.step)) + 1 : 0;

    switch (type) {
      case 'cx':
        if (qubits >= 2) {
          addGate('cx', [1], maxStep, [0]);
        }
        break;
      case 'ccx':
        if (qubits >= 3) {
          addGate('ccx', [2], maxStep, [0, 1]);
        }
        break;
      default:
        addGate(type, [0], maxStep);
        break;
    }
  };

  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2 px-3 py-2 rounded-xl border"
      style={{
        background: theme.bg.surface + 'e6',
        borderColor: theme.border.subtle,
        backdropFilter: 'blur(8px)',
      }}
    >
      {PALETTE_ITEMS.map((item) => {
        const color = GATE_COLORS[item.type];
        const disabled = (item.type === 'cx' && qubits < 2) || (item.type === 'ccx' && qubits < 3);

        return (
          <button
            key={item.type}
            onClick={() => handleAddGate(item.type)}
            disabled={disabled}
            className="group relative flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-colors disabled:opacity-30"
            title={item.description}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border transition-all group-hover:scale-110"
              style={{
                color,
                borderColor: color + '40',
                backgroundColor: color + '10',
              }}
            >
              {item.label}
            </div>
            <span className="text-[9px]" style={{ color: theme.text.tertiary }}>{item.description}</span>
          </button>
        );
      })}
    </div>
  );
}
