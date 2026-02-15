import { useCircuitStore } from '../../store/circuitStore';
import { GATE_INFO } from '../../lib/gateInfo';
import { theme, semantic } from '../../lib/theme';

export function GateInfo() {
  const selectedGateId = useCircuitStore((s) => s.selectedGateId);
  const gates = useCircuitStore((s) => s.gates);
  const removeGate = useCircuitStore((s) => s.removeGate);
  const selectGate = useCircuitStore((s) => s.selectGate);

  if (!selectedGateId) return null;

  const gate = gates.find((g) => g.id === selectedGateId);
  if (!gate) return null;

  const info = GATE_INFO[gate.type];
  if (!info) return null;

  return (
    <div
      className="absolute top-14 right-4 z-40 w-72 rounded-xl shadow-2xl overflow-hidden border"
      style={{ background: theme.bg.surface + 'f8', borderColor: theme.border.medium, backdropFilter: 'blur(12px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: theme.border.subtle }}>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold border"
          style={{
            color: info.color,
            borderColor: info.color + '40',
            backgroundColor: info.color + '15',
          }}
        >
          {info.icon}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold" style={{ color: theme.text.primary }}>{info.name}</div>
          <div className="text-[11px] uppercase tracking-wider" style={{ color: info.color }}>
            {info.quantumConcept}
          </div>
        </div>
        <button
          onClick={() => selectGate(null)}
          className="text-lg leading-none" style={{ color: theme.text.tertiary }}
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        <p className="text-sm font-medium leading-snug" style={{ color: theme.text.primary }}>{info.oneLiner}</p>

        <div>
          <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: theme.text.tertiary }}>Think of it as...</div>
          <p className="text-xs leading-relaxed" style={{ color: theme.text.secondary }}>{info.analogy}</p>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: theme.text.tertiary }}>What you see in 3D</div>
          <p className="text-xs leading-relaxed" style={{ color: theme.text.secondary }}>{info.whatYouSee}</p>
        </div>

        <div className="flex items-center gap-3 pt-1 border-t" style={{ borderColor: theme.border.subtle }}>
          <div className="text-[11px]" style={{ color: theme.text.tertiary }}>
            Target: q[{gate.targets.join(', ')}]
            {gate.controls && ` | Control: q[${gate.controls.join(', ')}]`}
            {' | '}Step {gate.step}
          </div>
          <div className="flex-1" />
          <button
            onClick={() => { removeGate(selectedGateId); selectGate(null); }}
            className="text-[11px] transition-colors"
            style={{ color: semantic.error + '80' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = semantic.error; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = semantic.error + '80'; }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
