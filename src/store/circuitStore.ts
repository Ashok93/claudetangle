import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Gate, GateType } from '../types/circuit';
import { simulateCircuit, type StepState } from '../lib/quantumSim';

export type SimulationState = 'idle' | 'running' | 'complete';
export type UIMode = 'explore' | 'build' | 'learn' | 'sandbox';

export interface OutputProbability {
  state: string;    // e.g., "|00⟩"
  probability: number; // 0-1
  label: string;    // e.g., "00"
}

interface CircuitState {
  qubits: number;
  gates: Gate[];
  selectedGateId: string | null;

  // Simulation
  simulation: SimulationState;
  simulationStep: number;      // current step being animated (-1 = not started)
  simulationMaxStep: number;
  outputProbabilities: OutputProbability[];
  detectedAlgorithm: string | null;
  stepStates: StepState[];

  // Speed controls
  simulationSpeed: number;
  simulationPaused: boolean;

  // UI mode
  uiMode: UIMode;

  // Bloch sphere interaction
  selectedBlochQubit: number | null;
  setSelectedBlochQubit: (q: number | null) => void;

  // Actions
  setUIMode: (mode: UIMode) => void;
  setQubits: (n: number) => void;
  addGate: (type: GateType, targets: number[], step: number, controls?: number[]) => string;
  removeGate: (id: string) => void;
  moveGate: (id: string, targets: number[], step: number) => void;
  selectGate: (id: string | null) => void;
  clearCircuit: () => void;
  loadGates: (qubits: number, gates: Gate[]) => void;
  getMaxStep: () => number;

  // Simulation actions
  startSimulation: () => void;
  advanceSimulation: () => void;
  resetSimulation: () => void;
  setOutputProbabilities: (probs: OutputProbability[]) => void;

  // Speed control actions
  setSimulationSpeed: (speed: number) => void;
  togglePause: () => void;
  stepForward: () => void;
  stepBackward: () => void;
}

function detectAlgorithm(qubits: number, gates: Gate[]): string | null {
  const gateTypes = gates.map((g) => g.type).join(',');
  const typeSet = new Set(gates.map((g) => g.type));

  // Shor's: 8 qubits, uses ccx + controlled phase daggers (csdg/ctdg/cr4dg) + swap
  if (qubits === 8 && typeSet.has('ccx') && typeSet.has('csdg') && typeSet.has('swap')) {
    return "Shor's Algorithm";
  }
  if (qubits === 2 && gates.length === 4 && gateTypes.includes('h') && gateTypes.includes('cx')) {
    return 'Bell State';
  }
  if (qubits === 3 && gateTypes.startsWith('h,cx,cx') && gates.length <= 6) {
    return 'GHZ State';
  }
  if (qubits === 3 && gates.length === 8 && gateTypes.includes('h,cx,cx')) {
    return 'Quantum Teleportation';
  }
  if (gateTypes.includes('ccx') && gates.filter((g) => g.type === 'h').length >= 6) {
    return "Grover's Search";
  }
  if (qubits === 3 && gateTypes.startsWith('x,') && gates.filter((g) => g.type === 'cx').length === 2) {
    return 'Deutsch-Jozsa';
  }
  if (qubits === 4 && gates.filter((g) => g.type === 'cx').length >= 6) {
    return 'Quantum Fourier Transform';
  }
  return null;
}

export const useCircuitStore = create<CircuitState>((set, get) => ({
  qubits: 5,
  gates: [],
  selectedGateId: null,
  simulation: 'idle',
  simulationStep: -1,
  simulationMaxStep: 0,
  outputProbabilities: [],
  detectedAlgorithm: null,
  stepStates: [],
  simulationSpeed: 1,
  simulationPaused: false,
  uiMode: 'explore',
  selectedBlochQubit: null,

  setSelectedBlochQubit: (q) => set({ selectedBlochQubit: q }),
  setUIMode: (mode) => set({ uiMode: mode }),

  setQubits: (n) => set({ qubits: Math.max(1, Math.min(20, n)) }),

  addGate: (type, targets, step, controls) => {
    const id = uuidv4();
    const gate: Gate = { id, type, targets, step, ...(controls ? { controls } : {}) };
    set((state) => ({
      gates: [...state.gates, gate],
      simulation: 'idle',
      outputProbabilities: [],
      stepStates: [],
    }));
    return id;
  },

  removeGate: (id) =>
    set((state) => ({
      gates: state.gates.filter((g) => g.id !== id),
      selectedGateId: state.selectedGateId === id ? null : state.selectedGateId,
      simulation: 'idle',
      outputProbabilities: [],
      stepStates: [],
    })),

  moveGate: (id, targets, step) =>
    set((state) => ({
      gates: state.gates.map((g) =>
        g.id === id ? { ...g, targets, step } : g
      ),
      simulation: 'idle',
      outputProbabilities: [],
      stepStates: [],
    })),

  selectGate: (id) => set({ selectedGateId: id }),

  clearCircuit: () => set({
    gates: [],
    selectedGateId: null,
    simulation: 'idle',
    simulationStep: -1,
    simulationMaxStep: 0,
    outputProbabilities: [],
    detectedAlgorithm: null,
    stepStates: [],
    qubits: 5,
    simulationPaused: false,
    selectedBlochQubit: null,
  }),

  loadGates: (qubits, gates) => {
    const algo = detectAlgorithm(qubits, gates);
    set({
      qubits,
      gates,
      selectedGateId: null,
      simulation: 'idle',
      simulationStep: -1,
      outputProbabilities: [],
      detectedAlgorithm: algo,
      stepStates: [],
    });
  },

  getMaxStep: () => {
    const { gates } = get();
    if (gates.length === 0) return 0;
    return Math.max(...gates.map((g) => g.step));
  },

  startSimulation: () => {
    const { gates, qubits } = get();
    if (gates.length === 0) return;

    const maxStep = Math.max(...gates.map((g) => g.step));
    const states = simulateCircuit(qubits, gates);
    const finalState = states[states.length - 1];

    set({
      simulation: 'running',
      simulationStep: 0,
      simulationMaxStep: maxStep,
      outputProbabilities: finalState.probabilities,
      stepStates: states,
      simulationPaused: false,
    });
  },

  advanceSimulation: () => {
    const { simulationStep, simulationMaxStep } = get();
    if (simulationStep >= simulationMaxStep + 1) {
      set({ simulation: 'complete' });
    } else {
      set({ simulationStep: simulationStep + 1 });
    }
  },

  resetSimulation: () => set({
    simulation: 'idle',
    simulationStep: -1,
    simulationMaxStep: 0,
    outputProbabilities: [],
    stepStates: [],
    simulationPaused: false,
    selectedBlochQubit: null,
  }),

  setOutputProbabilities: (probs) => set({ outputProbabilities: probs }),

  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),

  togglePause: () => set((state) => ({ simulationPaused: !state.simulationPaused })),

  stepForward: () => {
    const { simulationStep, simulationMaxStep } = get();
    if (simulationStep >= simulationMaxStep + 1) {
      set({ simulation: 'complete', simulationPaused: true });
    } else {
      set({ simulationStep: simulationStep + 1, simulationPaused: true });
    }
  },

  stepBackward: () => {
    const { simulationStep } = get();
    const newStep = Math.max(0, simulationStep - 1);
    set({ simulationStep: newStep, simulationPaused: true, simulation: 'running' });
  },
}));
