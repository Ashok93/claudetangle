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

const WAVE_OFFSET = 0.15; // Vertical gap between the two waves

export function QuantumWaveLearn({ index, position }: QuantumWaveLearnProps) {
  const timeRef = useRef(0);
  const points0Ref = useRef<THREE.Vector3[]>([]);
  const points1Ref = useRef<THREE.Vector3[]>([]);
  const color1Ref = useRef(new THREE.Color('#f87171'));

  const NUM_POINTS = 60;
  const WAVE_LENGTH = 2.4;
  const MAX_AMP = 0.18;

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
    color1Ref.current.setHSL(hue / 360, 0.75, 0.55);

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
      <Text position={[0, WAVE_OFFSET + MAX_AMP + 0.14, 0]} fontSize={0.07} color="#6a6d85" anchorX="center" anchorY="bottom" font={undefined}>
        Probability Amplitudes
      </Text>

      {/* |0⟩ wave label */}
      <Text position={[-WAVE_LENGTH / 2 - 0.1, WAVE_OFFSET, 0]} fontSize={0.07} color="#6366f1" anchorX="right" anchorY="middle" font={undefined}>
        |0⟩
      </Text>

      {/* |1⟩ wave label */}
      <Text position={[-WAVE_LENGTH / 2 - 0.1, -WAVE_OFFSET, 0]} fontSize={0.07} color="#f87171" anchorX="right" anchorY="middle" font={undefined}>
        |1⟩
      </Text>

      {/* Phase indicator note */}
      <Text position={[WAVE_LENGTH / 2 + 0.1, -WAVE_OFFSET, 0]} fontSize={0.05} color="#6a6d85" anchorX="left" anchorY="middle" font={undefined}>
        color = phase
      </Text>

      {/* |0⟩ wave — always blue */}
      <WaveLine pointsRef={points0Ref} color="#6366f1" opacity={0.7} />
      {/* |0⟩ baseline */}
      <Line
        points={[[-WAVE_LENGTH / 2, WAVE_OFFSET, 0], [WAVE_LENGTH / 2, WAVE_OFFSET, 0]]}
        color="#3a3d52"
        lineWidth={0.5}
        transparent
        opacity={0.15}
      />

      {/* |1⟩ wave — warm color, shifts with phase */}
      <WaveLine pointsRef={points1Ref} colorRef={color1Ref} opacity={0.7} />
      {/* |1⟩ baseline */}
      <Line
        points={[[-WAVE_LENGTH / 2, -WAVE_OFFSET, 0], [WAVE_LENGTH / 2, -WAVE_OFFSET, 0]]}
        color="#3a3d52"
        lineWidth={0.5}
        transparent
        opacity={0.15}
      />
    </group>
  );
}

// Animated wave line that reads from a ref
function WaveLine({
  pointsRef,
  color,
  colorRef,
  opacity,
}: {
  pointsRef: React.MutableRefObject<THREE.Vector3[]>;
  color?: string;
  colorRef?: React.MutableRefObject<THREE.Color>;
  opacity: number;
}) {
  const lineRef = useRef<THREE.Line>(null);

  useFrame(() => {
    if (!lineRef.current) return;
    const geom = lineRef.current.geometry;
    const positions = geom.attributes.position;
    if (!positions) return;

    const pts = pointsRef.current;
    for (let i = 0; i < pts.length && i < positions.count; i++) {
      positions.setXYZ(i, pts[i].x, pts[i].y, pts[i].z);
    }
    positions.needsUpdate = true;

    // Update color if using ref
    if (colorRef && lineRef.current.material) {
      const mat = lineRef.current.material as THREE.LineBasicMaterial;
      mat.color.copy(colorRef.current);
    }
  });

  // Create initial points for the Line geometry
  const initialPoints = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => {
      const frac = i / 59;
      return new THREE.Vector3(-1.2 + frac * 2.4, 0, 0);
    }),
  []);

  return (
    <line ref={lineRef as React.Ref<THREE.Line>}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={initialPoints.length}
          array={new Float32Array(initialPoints.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={color ?? '#ffffff'}
        transparent
        opacity={opacity}
        linewidth={1}
      />
    </line>
  );
}
