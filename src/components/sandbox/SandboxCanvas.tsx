import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { SandboxScene } from './SandboxScene';

export function SandboxCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 6], fov: 50 }}
      gl={{ antialias: true, toneMapping: 3 }}
      style={{ background: '#0e1525' }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, -5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-10, -5, 15]} intensity={0.4} color="#c8d0f0" />
      <pointLight position={[0, 5, 10]} intensity={0.3} color="#a0b0e0" />

      <SandboxScene />

      <OrbitControls
        enablePan
        enableDamping
        dampingFactor={0.05}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
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
