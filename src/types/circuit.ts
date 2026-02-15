export type GateType =
  | 'h' | 'x' | 'y' | 'z'
  | 's' | 'sdg' | 't' | 'tdg'
  | 'cx' | 'ccx'
  | 'swap'
  | 'cz' | 'cs' | 'csdg' | 'ct' | 'ctdg' | 'cr4' | 'cr4dg'
  | 'measure';

export interface Gate {
  id: string;
  type: GateType;
  targets: number[];
  controls?: number[];
  step: number;
}

export interface Measurement {
  qubit: number;
  cbit: number;
  step: number;
}

export interface Algorithm {
  name: string;
  description: string;
  qubits: number;
  qasm: string;
  category?: 'basics' | 'ultimate';
}
