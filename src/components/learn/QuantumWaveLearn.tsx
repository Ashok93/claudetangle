import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useLearnStore } from '../../store/learnStore';
import { phaseToHue } from '../../lib/quantumSim';

interface QuantumWaveLearnProps {
  index: number;
  position: [number, number, number];
}

const WAVE_OFFSET = 0.18; // Vertical gap between the two waves
const NUM_POINTS = 60;
const WAVE_LENGTH = 2.4;
const MAX_AMP = 0.25;
const WAVE_LINE_WIDTH = 4;

export function QuantumWaveLearn({ index, position }: QuantumWaveLearnProps) {
  const timeRef = useRef(0);
  const points0Ref = useRef<THREE.Vector3[]>([]);
  const points1Ref = useRef<THREE.Vector3[]>([]);
  const color1Ref = useRef(new THREE.Color('#f87171'));

  // Initialize point arrays
  useMemo(() => {
    points0Ref.current = Array.from({ length: NUM_POINTS }, () => new THREE.Vector3());
    points1Ref.current = Array.from({ length: NUM_POINTS }, () => new THREE.Vector3());
  }, []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    const state = useLearnStore.getState();
    const q = state.qubits[index];
    if (!q) return;

    const amp0 = Math.sqrt(Math.max(0, 1 - q.amplitude));
    const amp1 = Math.sqrt(Math.max(0, q.amplitude));
    const phase = q.phase;

    // |1⟩ wave color: offset phaseToHue by 120° so it starts warm/red instead of blue
    const hue = (phaseToHue(phase) + 120) % 360;
    color1Ref.current.setHSL(hue / 360, 0.85, 0.6);

    // Generate wave points — vertically separated
    for (let i = 0; i < NUM_POINTS; i++) {
      const frac = i / (NUM_POINTS - 1);
      const x = -WAVE_LENGTH / 2 + frac * WAVE_LENGTH;

      // |0⟩ component wave — upper track
      const y0 = WAVE_OFFSET + amp0 * MAX_AMP * Math.sin(frac * Math.PI * 4 - t * 3);
      points0Ref.current[i].set(x, y0, 0);

      // |1⟩ component wave — lower track
      const y1 = -WAVE_OFFSET + amp1 * MAX_AMP * Math.sin(frac * Math.PI * 4 - t * 3 + phase);
      points1Ref.current[i].set(x, y1, 0);
    }
  });

  return (
    <group position={position}>
      {/* Title */}
      <Text position={[0, WAVE_OFFSET + MAX_AMP + 0.14, 0]} fontSize={0.08} color="#94a3b8" anchorX="center" anchorY="bottom" font={undefined}>
        Probability Amplitudes
      </Text>

      {/* |0⟩ wave label */}
      <Text position={[-WAVE_LENGTH / 2 - 0.1, WAVE_OFFSET, 0]} fontSize={0.08} color="#818cf8" anchorX="right" anchorY="middle" font={undefined}>
        |0⟩
      </Text>

      {/* |1⟩ wave label */}
      <Text position={[-WAVE_LENGTH / 2 - 0.1, -WAVE_OFFSET, 0]} fontSize={0.08} color="#fca5a5" anchorX="right" anchorY="middle" font={undefined}>
        |1⟩
      </Text>

      {/* Phase indicator note */}
      <Text position={[WAVE_LENGTH / 2 + 0.1, -WAVE_OFFSET, 0]} fontSize={0.06} color="#94a3b8" anchorX="left" anchorY="middle" font={undefined}>
        color = phase
      </Text>

      {/* |0⟩ wave — always indigo */}
      <ThickWaveLine pointsRef={points0Ref} color="#818cf8" lineWidth={WAVE_LINE_WIDTH} />
      {/* |0⟩ baseline */}
      <Line
        points={[[-WAVE_LENGTH / 2, WAVE_OFFSET, 0], [WAVE_LENGTH / 2, WAVE_OFFSET, 0]]}
        color="#334155"
        lineWidth={1.5}
        transparent
        opacity={0.5}
      />

      {/* |1⟩ wave — warm color, shifts with phase */}
      <ThickWaveLine pointsRef={points1Ref} colorRef={color1Ref} color="#f87171" lineWidth={WAVE_LINE_WIDTH} />
      {/* |1⟩ baseline */}
      <Line
        points={[[-WAVE_LENGTH / 2, -WAVE_OFFSET, 0], [WAVE_LENGTH / 2, -WAVE_OFFSET, 0]]}
        color="#334155"
        lineWidth={1.5}
        transparent
        opacity={0.5}
      />
    </group>
  );
}

/**
 * Thick animated wave line using drei's Line (Line2 internally).
 * Unlike raw THREE.Line, Line2 supports actual lineWidth on all platforms.
 */
function ThickWaveLine({
  pointsRef,
  color,
  colorRef,
  lineWidth = 4,
}: {
  pointsRef: React.MutableRefObject<THREE.Vector3[]>;
  color?: string;
  colorRef?: React.MutableRefObject<THREE.Color>;
  lineWidth?: number;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineRef = useRef<any>(null);
  const posArr = useRef(new Float32Array(NUM_POINTS * 3));

  useFrame(() => {
    if (!lineRef.current) return;
    const pts = pointsRef.current;
    const arr = posArr.current;
    for (let i = 0; i < pts.length; i++) {
      arr[i * 3] = pts[i].x;
      arr[i * 3 + 1] = pts[i].y;
      arr[i * 3 + 2] = pts[i].z;
    }
    lineRef.current.geometry.setPositions(arr);

    if (colorRef && lineRef.current.material) {
      lineRef.current.material.color.copy(colorRef.current);
    }
  });

  const initialPoints = useMemo(
    () =>
      Array.from({ length: NUM_POINTS }, (_, i) => {
        const frac = i / (NUM_POINTS - 1);
        return new THREE.Vector3(-WAVE_LENGTH / 2 + frac * WAVE_LENGTH, 0, 0);
      }),
    [],
  );

  return (
    <Line
      ref={lineRef}
      points={initialPoints}
      color={color ?? '#ffffff'}
      lineWidth={lineWidth}
    />
  );
}
