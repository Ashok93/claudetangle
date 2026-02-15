/**
 * Physics-accurate probability wave visualization with per-vertex phase coloring.
 *
 * Each qubit's state α|0⟩ + β|1⟩ is shown as two waves along the rail:
 *   Real part:      |β| · cos(k·z + φ)   — primary, brighter
 *   Imaginary part: |β| · sin(k·z + φ)   — secondary, fainter
 *
 * Where β = √(amplitude) · e^(iφ) is the |1⟩ coefficient.
 *
 * This means:
 *   - |0⟩ state → flat line (β = 0)
 *   - After H gate → wave appears (|β| = 1/√2, φ = 0)
 *   - After S gate → wave shifts by quarter wavelength (φ → π/2)
 *   - After Z gate → wave inverts (φ → π)
 *   - After T gate → wave shifts by eighth wavelength (φ → π/4)
 *
 * Phase shifts are VISIBLE as:
 *   1. Lateral wave displacement (the wave slides along z)
 *   2. Per-vertex color change (blue→green→red→yellow as phase rotates)
 *
 * Gate boundaries produce abrupt color changes along the rail —
 * this IS physically correct: quantum gates apply instantaneously.
 */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { useCircuitStore } from '../../store/circuitStore';
import { QUBIT_SPACING, STEP_SPACING, RAIL_LENGTH } from '../../lib/constants';
import { phaseToHue, type StepState } from '../../lib/quantumSim';

interface ProbabilityWaveProps {
  qubitIndex: number;
  totalQubits: number;
}

const POINT_COUNT = 300;
const K = (2 * Math.PI * 1.5) / STEP_SPACING; // 1.5 wavelengths per step spacing
const WAVE_SCALE = 0.4; // max displacement from rail

/**
 * Get the quantum state at a given z-position along the rail.
 * Returns the state from the most recent gate that has been passed.
 * State changes are abrupt at gate boundaries — this IS how quantum gates work.
 */
function getStateAtZ(
  z: number,
  qubitIndex: number,
  stepStates: StepState[],
  simulationStep: number
): { amplitude: number; phase: number } {
  if (stepStates.length === 0) return { amplitude: 0, phase: 0 };

  const zStep = z / STEP_SPACING;
  let best = stepStates[0]; // initial state (step = -1)

  for (const state of stepStates) {
    if (state.step <= zStep && state.step <= simulationStep) {
      best = state;
    }
  }

  return {
    amplitude: best.qubitAmplitudes[qubitIndex] ?? 0,
    phase: best.qubitPhases[qubitIndex] ?? 0,
  };
}

export function ProbabilityWave({ qubitIndex, totalQubits }: ProbabilityWaveProps) {
  const yPos = (totalQubits - 1) / 2 * QUBIT_SPACING - qubitIndex * QUBIT_SPACING;

  const realRef = useRef<any>(null);
  const imagRef = useRef<any>(null);

  // Pre-allocated flat arrays for position updates
  const realPositions = useRef(new Float32Array(POINT_COUNT * 3));
  const imagPositions = useRef(new Float32Array(POINT_COUNT * 3));
  // Pre-allocated flat arrays for color updates (RGB per vertex)
  const realColors = useRef(new Float32Array(POINT_COUNT * 3));
  const imagColors = useRef(new Float32Array(POINT_COUNT * 3));
  const tempColor = useRef(new THREE.Color());

  // Initial flat positions along rail
  const initialPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < POINT_COUNT; i++) {
      const t = i / (POINT_COUNT - 1);
      const z = -2 + t * (RAIL_LENGTH + 2);
      pts.push([0, yPos, z]);
    }
    return pts;
  }, [yPos]);

  // Initial vertex colors (default indigo)
  const initialColors = useMemo(() => {
    const defaultColor = new THREE.Color('#6366f1');
    const colors: [number, number, number][] = [];
    for (let i = 0; i < POINT_COUNT; i++) {
      colors.push([defaultColor.r, defaultColor.g, defaultColor.b]);
    }
    return colors;
  }, []);

  useFrame(() => {
    const { simulation, simulationStep, stepStates } = useCircuitStore.getState();
    if (simulation === 'idle' || stepStates.length === 0) return;
    if (!realRef.current || !imagRef.current) return;

    const rArr = realPositions.current;
    const iArr = imagPositions.current;
    const rCol = realColors.current;
    const iCol = imagColors.current;

    // Wave only extends to where the simulation has computed
    const showZ = simulation === 'complete'
      ? RAIL_LENGTH
      : simulationStep * STEP_SPACING + STEP_SPACING * 0.5;

    for (let i = 0; i < POINT_COUNT; i++) {
      const t = i / (POINT_COUNT - 1);
      const z = -2 + t * (RAIL_LENGTH + 2);

      let realY = yPos;
      let imagY = yPos;
      let hue = 240; // default blue
      let satReal = 0.3;
      let satImag = 0.2;
      let lightReal = 0.3;
      let lightImag = 0.25;

      if (z <= showZ && z >= 0) {
        const { amplitude, phase } = getStateAtZ(z, qubitIndex, stepStates, simulationStep);
        // |β| = sqrt(P(|1⟩))
        const beta = Math.sqrt(Math.max(0, Math.min(1, amplitude)));

        if (beta > 0.001) {
          // Real part of β·e^(ikz) = |β|·cos(kz + φ)
          realY = yPos + beta * WAVE_SCALE * Math.cos(K * z + phase);
          // Imaginary part = |β|·sin(kz + φ)
          imagY = yPos + beta * WAVE_SCALE * Math.sin(K * z + phase);
        }

        // Per-vertex color based on phase at this z position
        hue = phaseToHue(phase);
        satReal = 0.7;
        satImag = 0.5;
        lightReal = 0.55 + beta * 0.1; // brighter with more amplitude
        lightImag = 0.45 + beta * 0.1;
      }

      rArr[i * 3] = 0;
      rArr[i * 3 + 1] = realY;
      rArr[i * 3 + 2] = z;

      iArr[i * 3] = 0;
      iArr[i * 3 + 1] = imagY;
      iArr[i * 3 + 2] = z;

      // Real wave color
      tempColor.current.setHSL(hue / 360, satReal, lightReal);
      rCol[i * 3] = tempColor.current.r;
      rCol[i * 3 + 1] = tempColor.current.g;
      rCol[i * 3 + 2] = tempColor.current.b;

      // Imaginary wave color (slightly different saturation/lightness)
      tempColor.current.setHSL(hue / 360, satImag, lightImag);
      iCol[i * 3] = tempColor.current.r;
      iCol[i * 3 + 1] = tempColor.current.g;
      iCol[i * 3 + 2] = tempColor.current.b;
    }

    // Update Line2 geometries via interleaved buffer
    updateLineBuffer(realRef.current, rArr);
    updateLineBuffer(imagRef.current, iArr);

    // Update vertex colors
    updateLineColors(realRef.current, rCol);
    updateLineColors(imagRef.current, iCol);
  });

  const simulation = useCircuitStore((s) => s.simulation);
  if (simulation === 'idle') return null;

  return (
    <>
      <Line
        ref={realRef}
        points={initialPoints}
        vertexColors={initialColors}
        lineWidth={2.5}
        transparent
        opacity={0.7}
      />
      <Line
        ref={imagRef}
        points={initialPoints}
        vertexColors={initialColors}
        lineWidth={1.5}
        transparent
        opacity={0.35}
      />
    </>
  );
}

/** Update a drei Line (Line2) geometry's interleaved position buffer in-place. */
function updateLineBuffer(lineObj: any, positions: Float32Array) {
  if (!lineObj) return;
  const geo = lineObj.geometry;
  if (!geo) return;

  const startAttr = geo.getAttribute('instanceStart');
  const endAttr = geo.getAttribute('instanceEnd');

  if (startAttr && endAttr && startAttr.data) {
    const arr = startAttr.data.array;
    const n = positions.length / 3; // number of points

    for (let i = 0; i < n - 1; i++) {
      const s = i * 3;
      const e = (i + 1) * 3;
      const off = i * 6;
      arr[off] = positions[s];         // start x
      arr[off + 1] = positions[s + 1]; // start y
      arr[off + 2] = positions[s + 2]; // start z
      arr[off + 3] = positions[e];     // end x
      arr[off + 4] = positions[e + 1]; // end y
      arr[off + 5] = positions[e + 2]; // end z
    }

    startAttr.data.needsUpdate = true;
    geo.computeBoundingSphere();
  }

  lineObj.computeLineDistances();
}

/** Update a drei Line (Line2) geometry's interleaved color buffer in-place. */
function updateLineColors(lineObj: any, colors: Float32Array) {
  if (!lineObj) return;
  const geo = lineObj.geometry;
  if (!geo) return;

  const startColorAttr = geo.getAttribute('instanceColorStart');
  const endColorAttr = geo.getAttribute('instanceColorEnd');

  if (startColorAttr && endColorAttr && startColorAttr.data) {
    const arr = startColorAttr.data.array;
    const n = colors.length / 3;

    for (let i = 0; i < n - 1; i++) {
      const s = i * 3;
      const e = (i + 1) * 3;
      const off = i * 6;
      arr[off] = colors[s];         // start r
      arr[off + 1] = colors[s + 1]; // start g
      arr[off + 2] = colors[s + 2]; // start b
      arr[off + 3] = colors[e];     // end r
      arr[off + 4] = colors[e + 1]; // end g
      arr[off + 5] = colors[e + 2]; // end b
    }

    startColorAttr.data.needsUpdate = true;
  }
}
