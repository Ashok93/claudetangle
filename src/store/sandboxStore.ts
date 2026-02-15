import { create } from 'zustand';
import {
  initState, cloneState, applyGateImmediate, measureAll, runMeasurements,
  getBasisStates, getBlochCoords, getEntanglementInfo, toKetNotation, describeState,
  type StateVector, type SandboxGate, type BasisState, type BlochCoords, type EntanglementPair,
} from '../lib/sandboxSim';

export interface GateHistoryEntry {
  gate: SandboxGate;
  target: number;
  control?: number;
  stateBefore: StateVector;
}

interface SandboxState {
  // Core
  numQubits: number;
  stateVector: StateVector;
  selectedQubit: number;

  // Derived (recomputed on every state change)
  basisStates: BasisState[];
  blochCoords: BlochCoords[];
  entanglementInfo: EntanglementPair[];
  ketNotation: string;
  stateDescription: string;

  // History
  gateHistory: GateHistoryEntry[];

  // Measurements
  measurementHistory: string[];
  histogram: Map<string, number>;
  lastOutcome: string | null;

  // Actions
  setNumQubits: (n: number) => void;
  selectQubit: (q: number) => void;
  applyGate: (gate: SandboxGate) => void;
  measure: () => void;
  runMany: (count: number) => void;
  undo: () => void;
  reset: () => void;
}

function computeDerived(sv: StateVector) {
  return {
    basisStates: getBasisStates(sv),
    blochCoords: getBlochCoords(sv),
    entanglementInfo: getEntanglementInfo(sv),
    ketNotation: toKetNotation(sv),
    stateDescription: describeState(sv),
  };
}

export const useSandboxStore = create<SandboxState>((set, get) => {
  const initial = initState(1);
  return {
    numQubits: 1,
    stateVector: initial,
    selectedQubit: 0,
    ...computeDerived(initial),
    gateHistory: [],
    measurementHistory: [],
    histogram: new Map(),
    lastOutcome: null,

    setNumQubits: (n: number) => {
      const clamped = Math.max(1, Math.min(4, n));
      const sv = initState(clamped);
      set({
        numQubits: clamped,
        stateVector: sv,
        selectedQubit: 0,
        ...computeDerived(sv),
        gateHistory: [],
        measurementHistory: [],
        histogram: new Map(),
        lastOutcome: null,
      });
    },

    selectQubit: (q: number) => {
      set({ selectedQubit: Math.max(0, Math.min(get().numQubits - 1, q)) });
    },

    applyGate: (gate: SandboxGate) => {
      const { stateVector, selectedQubit, numQubits, gateHistory } = get();
      const isTwoQubit = gate === 'cx' || gate === 'cz' || gate === 'swap';

      if (isTwoQubit && numQubits < 2) return;

      const control = isTwoQubit ? selectedQubit : undefined;
      const target = isTwoQubit
        ? (selectedQubit + 1) % numQubits
        : selectedQubit;

      const entry: GateHistoryEntry = {
        gate,
        target,
        control,
        stateBefore: cloneState(stateVector),
      };

      const newSv = applyGateImmediate(stateVector, gate, target, control);

      set({
        stateVector: newSv,
        ...computeDerived(newSv),
        gateHistory: [...gateHistory, entry],
      });
    },

    measure: () => {
      const { stateVector, measurementHistory } = get();
      const { outcome, collapsed } = measureAll(stateVector);

      set({
        stateVector: collapsed,
        ...computeDerived(collapsed),
        measurementHistory: [...measurementHistory, outcome].slice(-20),
        lastOutcome: outcome,
      });
    },

    runMany: (count: number) => {
      const { stateVector } = get();
      const results = runMeasurements(stateVector, count);

      set({
        histogram: results,
      });
    },

    undo: () => {
      const { gateHistory } = get();
      if (gateHistory.length === 0) return;

      const newHistory = gateHistory.slice(0, -1);
      const last = gateHistory[gateHistory.length - 1];
      const restored = last.stateBefore;

      set({
        stateVector: restored,
        ...computeDerived(restored),
        gateHistory: newHistory,
      });
    },

    reset: () => {
      const { numQubits } = get();
      const sv = initState(numQubits);
      set({
        stateVector: sv,
        ...computeDerived(sv),
        gateHistory: [],
        measurementHistory: [],
        histogram: new Map(),
        lastOutcome: null,
      });
    },
  };
});
