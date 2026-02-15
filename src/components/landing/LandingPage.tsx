import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// ─── Particle System ────────────────────────────────

const PARTICLE_COUNT = 800;

// Layer distribution: pushed outward so center stays clear for text
const LAYER_CONFIG = [
  { count: 60,  rMin: 3.0, rMax: 4.5,  speed: [0.25, 0.5],  size: [0.03, 0.06], colors: [3, 6] },
  { count: 160, rMin: 4.5, rMax: 6.5,  speed: [0.15, 0.32], size: [0.025, 0.05], colors: [0, 3, 6] },
  { count: 240, rMin: 6.0, rMax: 9.0,  speed: [0.07, 0.19], size: [0.02, 0.04], colors: [0, 1, 4] },
  { count: 200, rMin: 8.5, rMax: 12.0, speed: [0.035, 0.1], size: [0.015, 0.03], colors: [2, 5, 4] },
  { count: 140, rMin: 11.0, rMax: 16.0, speed: [0.018, 0.06], size: [0.01, 0.025], colors: [2, 5] },
];

// Quantum color palette — RGB components for instance colors
// Multiplied by bright base material (2.5x) to create HDR bloom
const PALETTE: [number, number, number][] = [
  [0.39, 0.40, 0.95],  // 0: indigo
  [0.51, 0.55, 0.97],  // 1: light indigo
  [0.66, 0.33, 0.97],  // 2: purple
  [0.13, 0.83, 0.93],  // 3: cyan
  [0.23, 0.51, 0.96],  // 4: blue
  [0.75, 0.52, 0.99],  // 5: light purple
  [0.22, 0.74, 0.97],  // 6: sky blue
];

interface ParticleData {
  radius: number;
  speed: number;
  phase: number;
  tiltAngle: number;
  tiltAxis: THREE.Vector3;
  size: number;
  colorIdx: number;
  birthTime: number;
  yOscAmp: number;
  yOscSpeed: number;
  rOscAmp: number;
  rOscSpeed: number;
}

// ─── 3D Components ──────────────────────────────────

function QuantumVortex({ exitingRef }: { exitingRef: React.MutableRefObject<boolean> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const colorObj = useMemo(() => new THREE.Color(), []);
  const colorsSet = useRef(false);
  const exitStart = useRef<number | null>(null);

  const particles = useMemo<ParticleData[]>(() => {
    const result: ParticleData[] = [];

    for (const layer of LAYER_CONFIG) {
      for (let i = 0; i < layer.count; i++) {
        const radius = layer.rMin + Math.random() * (layer.rMax - layer.rMin);
        const speed = layer.speed[0] + Math.random() * (layer.speed[1] - layer.speed[0]);
        const phase = Math.random() * Math.PI * 2;
        const tiltAngle = Math.random() * Math.PI * 0.7;
        const tiltPhase = Math.random() * Math.PI * 2;
        const tiltAxis = new THREE.Vector3(
          Math.sin(tiltPhase),
          Math.cos(tiltAngle * 0.5),
          Math.cos(tiltPhase)
        ).normalize();
        const size = layer.size[0] + Math.random() * (layer.size[1] - layer.size[0]);
        const colorIdx = layer.colors[Math.floor(Math.random() * layer.colors.length)];
        const yOscAmp = 0.2 + Math.random() * 0.8;
        const yOscSpeed = 0.2 + Math.random() * 0.4;
        const rOscAmp = 0.1 + Math.random() * 0.4;
        const rOscSpeed = 0.15 + Math.random() * 0.3;

        result.push({
          radius, speed, phase, tiltAngle, tiltAxis, size, colorIdx,
          birthTime: 0, yOscAmp, yOscSpeed, rOscAmp, rOscSpeed,
        });
      }
    }

    // Shuffle and assign staggered birth times
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    result.forEach((p, i) => {
      p.birthTime = (i / PARTICLE_COUNT) * 2.2 + Math.random() * 0.3;
    });

    return result;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // Set instance colors once
    if (!colorsSet.current && meshRef.current.instanceColor) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const c = PALETTE[particles[i].colorIdx];
        colorObj.setRGB(c[0], c[1], c[2]);
        meshRef.current.setColorAt(i, colorObj);
      }
      meshRef.current.instanceColor.needsUpdate = true;
      colorsSet.current = true;
    }

    // Exit animation
    let exitT = 0;
    if (exitingRef.current) {
      if (exitStart.current === null) exitStart.current = t;
      exitT = t - exitStart.current;
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 1 - exitT * 1.2);
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];

      // Birth fade-in
      const age = t - p.birthTime;
      if (age < 0) {
        dummy.scale.setScalar(0);
        dummy.position.set(0, 0, 0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        continue;
      }
      const birthFade = Math.min(1, age / 0.8);

      // Orbital position with perturbation
      const angle = p.phase + t * p.speed;
      let r = p.radius + Math.sin(t * p.rOscSpeed + i * 0.037) * p.rOscAmp;

      if (exitT > 0) r *= (1 + exitT * 3.5);

      tempVec.set(r * Math.cos(angle), 0, r * Math.sin(angle));
      tempVec.applyAxisAngle(p.tiltAxis, p.tiltAngle);
      tempVec.y += Math.sin(t * p.yOscSpeed + i * 1.7) * p.yOscAmp;

      let scale = p.size * birthFade * (0.7 + 0.4 * Math.sin(t * 1.5 + i * 0.3));
      if (exitT > 0) scale *= Math.max(0, 1 - exitT * 1.5);

      dummy.position.copy(tempVec);
      dummy.scale.setScalar(Math.max(0, scale));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        color={new THREE.Color(1.8, 1.8, 1.8)}
        toneMapped={false}
        transparent
        opacity={1}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

function OrbitalRings() {
  const groupRef = useRef<THREE.Group>(null);

  const rings = useMemo(() => [
    { radius: 3,   rotation: [Math.PI / 6, 0, 0] as const, color: '#6366f1', opacity: 0.12 },
    { radius: 4.5, rotation: [0, Math.PI / 4, Math.PI / 3] as const, color: '#818cf8', opacity: 0.08 },
    { radius: 6,   rotation: [Math.PI / 3, 0, Math.PI / 6] as const, color: '#a855f7', opacity: 0.06 },
    { radius: 2,   rotation: [Math.PI / 4, Math.PI / 6, 0] as const, color: '#22d3ee', opacity: 0.15 },
    { radius: 5.5, rotation: [0, Math.PI / 3, 0] as const, color: '#3b82f6', opacity: 0.08 },
    { radius: 8,   rotation: [Math.PI / 5, 0, Math.PI / 4] as const, color: '#c084fc', opacity: 0.04 },
  ], []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <mesh key={i} rotation={[ring.rotation[0], ring.rotation[1], ring.rotation[2]]}>
          <torusGeometry args={[ring.radius, 0.006, 16, 120]} />
          <meshBasicMaterial
            color={ring.color}
            transparent
            opacity={ring.opacity}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function CentralOrb() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      const scale = 0.15 + Math.sin(t * 0.6) * 0.02;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial
        color={new THREE.Color(0.8, 0.9, 2)}
        toneMapped={false}
        transparent
        opacity={0.4}
      />
    </mesh>
  );
}

function AutoCamera() {
  const { camera } = useThree();

  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.12;
    camera.position.x = Math.cos(t) * 14;
    camera.position.z = Math.sin(t) * 14;
    camera.position.y = 3 + Math.sin(t * 0.7) * 1.5;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ─── Landing Page ───────────────────────────────────

interface LandingPageProps {
  onEnter: (mode?: string) => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  const exitingRef = useRef(false);
  const [exiting, setExiting] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setShowTitle(true), 600),
      setTimeout(() => setShowSubtitle(true), 1400),
      setTimeout(() => setShowButtons(true), 2000),
      setTimeout(() => setShowTagline(true), 2600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleEnter = (mode?: string) => {
    if (exiting) return;
    exitingRef.current = true;
    setExiting(true);
    setTimeout(() => onEnter(mode), 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        opacity: exiting ? 0 : 1,
        transition: 'opacity 1s ease-in',
        background: '#050510',
      }}
    >
      {/* 3D Quantum Field */}
      <Canvas
        camera={{ position: [0, 3, 14], fov: 50 }}
        gl={{ antialias: true }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <QuantumVortex exitingRef={exitingRef} />
        <OrbitalRings />
        <CentralOrb />
        <AutoCamera />
        <EffectComposer>
          <Bloom
            intensity={1.0}
            luminanceThreshold={0.4}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      {/* Content Overlay with dark gradient backdrop for readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, rgba(5,5,16,0.85) 0%, rgba(5,5,16,0.4) 50%, transparent 75%)',
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 300,
            letterSpacing: '0.14em',
            color: '#ffffff',
            margin: 0,
            opacity: showTitle ? 1 : 0,
            transform: showTitle ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            textShadow: '0 0 60px rgba(99, 102, 241, 0.5), 0 2px 4px rgba(0,0,0,0.8)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          claudetangle
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 'clamp(15px, 2.2vw, 22px)',
            fontWeight: 300,
            color: '#c8ceda',
            margin: 0,
            marginTop: 20,
            opacity: showSubtitle ? 1 : 0,
            transform: showSubtitle ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
            textShadow: '0 1px 3px rgba(0,0,0,0.6)',
          }}
        >
          Your journey into quantum computing begins here
        </p>

        {/* Button */}
        <div
          style={{
            marginTop: 44,
            opacity: showButtons ? 1 : 0,
            transform: showButtons ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: showButtons ? 'auto' : 'none',
          }}
        >
          <button
            onClick={() => handleEnter('learn')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#4f46e5';
              e.currentTarget.style.boxShadow = '0 0 50px rgba(99, 102, 241, 0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#6366f1';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(99, 102, 241, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            style={{
              background: '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: 14,
              padding: '16px 44px',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)',
              transition: 'all 0.3s ease-out',
              letterSpacing: '0.04em',
            }}
          >
            Start Learning
          </button>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: 13,
            color: '#7a8194',
            margin: 0,
            marginTop: 32,
            opacity: showTagline ? 1 : 0,
            transition: 'opacity 1.2s ease-out',
            letterSpacing: '0.08em',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          Interactive simulations &bull; Visual learning &bull; No PhD required
        </p>
      </div>
    </div>
  );
}
