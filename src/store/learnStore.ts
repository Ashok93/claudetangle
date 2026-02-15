import { create } from 'zustand';
import {
  applyH, applyX, applyZ, applyS, applyT, measureSingle,
  twoQubitInit, twoQubitFromSingle, applyHOnQubit, applyXOnQubit,
  applyCNOT, measureTwoQubit, twoQubitMarginals,
  type QubitState, type TwoQubitState,
} from '../lib/learnSim';

const STORAGE_KEY = 'qflux-learn-progress';

function loadProgress(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProgress(chapters: number[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chapters));
  } catch { /* ignore */ }
}

export interface LearnState {
  // Navigation
  currentChapter: number;       // 1-4, 0 = chapter select
  currentStep: number;          // 0-indexed within chapter
  completedChapters: number[];
  showChapterSelect: boolean;

  // Qubit state (1 qubit for ch1-3, 2 for ch4)
  qubits: QubitState[];
  twoQubitState: TwoQubitState | null;
  measurementResult: number | null;
  measurementHistory: number[];
  isEntangled: boolean;

  // Two-qubit measurement results
  twoQubitResults: { a: number; b: number } | null;
  twoQubitHistory: { a: number; b: number }[];

  // Interaction tracking
  interactionCompleted: boolean;

  // Sub-step tracking for multi-action steps (e.g., Ch4 step 3: H then CNOT)
  subStep: number;

  // Actions
  startChapter: (chapter: number) => void;
  advanceStep: () => void;
  previousStep: () => void;
  completeInteraction: () => void;
  applyGate: (gate: 'h' | 'x' | 'z' | 's' | 't' | 'cx', target?: number) => void;
  setQubitState: (index: number, amplitude: number, phase: number) => void;
  measureQubit: (index: number) => void;
  runManyMeasurements: (count: number) => void;
  addSingleMeasurement: (prob1?: number) => void;
  resetQubits: () => void;
  exitLearnMode: () => void;
}

export const useLearnStore = create<LearnState>((set, get) => ({
  currentChapter: 0,
  currentStep: 0,
  completedChapters: loadProgress(),
  showChapterSelect: true,

  qubits: [{ amplitude: 0, phase: 0 }],
  twoQubitState: null,
  measurementResult: null,
  measurementHistory: [],
  isEntangled: false,
  twoQubitResults: null,
  twoQubitHistory: [],

  interactionCompleted: false,
  subStep: 0,

  startChapter: (chapter) => {
    const isTwoQubit = chapter === 4 || chapter === 5;
    const qubits: QubitState[] = isTwoQubit
      ? [{ amplitude: 0, phase: 0 }, { amplitude: 0, phase: 0 }]
      : [{ amplitude: 0, phase: 0 }];
    set({
      currentChapter: chapter,
      currentStep: 0,
      showChapterSelect: false,
      qubits,
      twoQubitState: isTwoQubit ? twoQubitInit() : null,
      measurementResult: null,
      measurementHistory: [],
      isEntangled: false,
      twoQubitResults: null,
      twoQubitHistory: [],
      interactionCompleted: false,
      subStep: 0,
    });
  },

  advanceStep: () => {
    set((state) => ({
      currentStep: state.currentStep + 1,
      interactionCompleted: false,
      measurementResult: null,
      subStep: 0,
    }));
  },

  previousStep: () => {
    set((state) => ({
      currentStep: Math.max(0, state.currentStep - 1),
      interactionCompleted: false,
      subStep: 0,
    }));
  },

  completeInteraction: () => {
    set({ interactionCompleted: true });
  },

  applyGate: (gate, target = 0) => {
    const state = get();
    if (state.currentChapter === 4 && state.twoQubitState) {
      // Two-qubit mode
      let newState = state.twoQubitState;
      if (gate === 'h') {
        newState = applyHOnQubit(newState, target as 0 | 1);
      } else if (gate === 'x') {
        newState = applyXOnQubit(newState, target as 0 | 1);
      } else if (gate === 'cx') {
        newState = applyCNOT(newState);
      }
      const marginals = twoQubitMarginals(newState);
      // Check if entangled: if state can't be factored (approximate check)
      const isEnt = gate === 'cx' || state.isEntangled;
      set({
        twoQubitState: newState,
        qubits: [
          { amplitude: marginals.ampA, phase: marginals.phaseA },
          { amplitude: marginals.ampB, phase: marginals.phaseB },
        ],
        isEntangled: isEnt,
        interactionCompleted: true,
      });
    } else {
      // Single-qubit mode
      const q = state.qubits[0];
      let newQ: QubitState;
      switch (gate) {
        case 'h': newQ = applyH(q); break;
        case 'x': newQ = applyX(q); break;
        case 'z': newQ = applyZ(q); break;
        case 's': newQ = applyS(q); break;
        case 't': newQ = applyT(q); break;
        default: newQ = q;
      }
      set({
        qubits: [newQ],
        interactionCompleted: true,
      });
    }
  },

  setQubitState: (index, amplitude, phase) => {
    set((state) => {
      const qubits = [...state.qubits];
      qubits[index] = { amplitude, phase };
      return { qubits, interactionCompleted: true };
    });
  },

  measureQubit: (_index) => {
    const state = get();
    if (state.currentChapter === 4 && state.twoQubitState) {
      const result = measureTwoQubit(state.twoQubitState);
      // Collapse state
      const newQubits: QubitState[] = [
        { amplitude: result.a, phase: 0 },
        { amplitude: result.b, phase: 0 },
      ];
      // Reset two-qubit state to collapsed product state
      const newTwoQubit = twoQubitFromSingle(newQubits[0], newQubits[1]);
      set({
        twoQubitResults: result,
        twoQubitHistory: [...state.twoQubitHistory, result],
        qubits: newQubits,
        twoQubitState: newTwoQubit,
        isEntangled: false,
        interactionCompleted: true,
      });
    } else {
      const q = state.qubits[0];
      const result = measureSingle(q);
      const newQ: QubitState = { amplitude: result, phase: 0 };
      set({
        measurementResult: result,
        measurementHistory: [...state.measurementHistory, result],
        qubits: [newQ],
        interactionCompleted: true,
      });
    }
  },

  runManyMeasurements: (count) => {
    const state = get();
    if (state.currentChapter === 4 && state.twoQubitState) {
      const results: { a: number; b: number }[] = [];
      for (let i = 0; i < count; i++) {
        results.push(measureTwoQubit(state.twoQubitState));
      }
      set({
        twoQubitHistory: [...state.twoQubitHistory, ...results],
        interactionCompleted: true,
      });
    } else {
      const q = state.qubits[0];
      const results: number[] = [];
      for (let i = 0; i < count; i++) {
        results.push(measureSingle(q));
      }
      set({
        measurementHistory: [...state.measurementHistory, ...results],
        interactionCompleted: true,
      });
    }
  },

  addSingleMeasurement: (prob1?: number) => {
    const state = get();
    const p = prob1 ?? state.qubits[0]?.amplitude ?? 0.5;
    const result = Math.random() < p ? 1 : 0;
    set({
      measurementHistory: [...state.measurementHistory, result],
    });
  },

  resetQubits: () => {
    const state = get();
    const isTwoQubit = state.currentChapter === 4 || state.currentChapter === 5;
    const qubits: QubitState[] = isTwoQubit
      ? [{ amplitude: 0, phase: 0 }, { amplitude: 0, phase: 0 }]
      : [{ amplitude: 0, phase: 0 }];
    set({
      qubits,
      twoQubitState: isTwoQubit ? twoQubitInit() : null,
      measurementResult: null,
      measurementHistory: [],
      isEntangled: false,
      twoQubitResults: null,
      twoQubitHistory: [],
    });
  },

  exitLearnMode: () => {
    const state = get();
    const { currentChapter, completedChapters } = state;
    const updated = completedChapters.includes(currentChapter)
      ? completedChapters
      : [...completedChapters, currentChapter];
    saveProgress(updated);
    set({
      currentChapter: 0,
      currentStep: 0,
      showChapterSelect: true,
      completedChapters: updated,
      interactionCompleted: false,
      subStep: 0,
    });
  },
}));
