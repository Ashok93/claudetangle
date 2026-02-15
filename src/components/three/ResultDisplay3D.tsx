import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useCircuitStore } from '../../store/circuitStore';
import { STEP_SPACING } from '../../lib/constants';
import { interpretResult } from '../../lib/resultInterpreter';

export function ResultDisplay3D() {
  const simulation = useCircuitStore((s) => s.simulation);
  const simulationMaxStep = useCircuitStore((s) => s.simulationMaxStep);
  const outputProbabilities = useCircuitStore((s) => s.outputProbabilities);
  const detectedAlgorithm = useCircuitStore((s) => s.detectedAlgorithm);
  const textRef = useRef<any>(null);
  const opacityRef = useRef(0);

  useFrame((_, delta) => {
    if (!textRef.current) return;

    const target = simulation === 'complete' ? 1 : 0;
    opacityRef.current += (target - opacityRef.current) * Math.min(1, delta * 3);
    textRef.current.fillOpacity = opacityRef.current;

    // Subtle float animation
    if (simulation === 'complete') {
      textRef.current.position.y = 7.5 + Math.sin(Date.now() * 0.001) * 0.1;
    }
  });

  if (simulation !== 'complete' || outputProbabilities.length === 0) return null;

  const interpretation = interpretResult(detectedAlgorithm, outputProbabilities);
  const zBase = (simulationMaxStep + 3) * STEP_SPACING;

  return (
    <group position={[0, 0, zBase]}>
      <Text
        ref={textRef}
        position={[0, 7.5, 0]}
        fontSize={0.5}
        color="#818cf8"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0}
        maxWidth={12}
      >
        {interpretation.headline}
        <meshStandardMaterial
          color="#818cf8"
          emissive="#6366f1"
          emissiveIntensity={0.6}
          transparent
          toneMapped={false}
        />
      </Text>
    </group>
  );
}
