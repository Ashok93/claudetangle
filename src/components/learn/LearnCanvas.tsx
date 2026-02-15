import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useLearnStore } from '../../store/learnStore';
import { Chapter1Scene } from './chapters/Chapter1Scene';
import { Chapter2Scene } from './chapters/Chapter2Scene';
import { Chapter3Scene } from './chapters/Chapter3Scene';
import { Chapter4Scene } from './chapters/Chapter4Scene';
import { Chapter5Scene } from './chapters/Chapter5Scene';

export function LearnCanvas() {
  const chapter = useLearnStore((s) => s.currentChapter);

  return (
    <Canvas
      camera={{ position: [0, 1, 4], fov: 50 }}
      gl={{ antialias: true, toneMapping: 3 }}
      style={{ background: '#0e1525' }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, -5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-10, -5, 15]} intensity={0.4} color="#c8d0f0" />
      <pointLight position={[0, 5, 10]} intensity={0.3} color="#a0b0e0" />

      {chapter === 1 && <Chapter1Scene />}
      {chapter === 2 && <Chapter2Scene />}
      {chapter === 3 && <Chapter3Scene />}
      {chapter === 4 && <Chapter4Scene />}
      {chapter === 5 && <Chapter5Scene />}

      <OrbitControls
        enablePan={false}
        minDistance={2}
        maxDistance={8}
        enableDamping
        dampingFactor={0.05}
      />

      <EffectComposer>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.6}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
