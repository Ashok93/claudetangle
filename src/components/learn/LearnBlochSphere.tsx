import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useLearnStore } from '../../store/learnStore';
import { phaseToHue } from '../../lib/quantumSim';
import { theme } from '../../lib/theme';

interface LearnBlochSphereProps {
  index: number;
  position: [number, number, number];
  label?: string;
  speechBubble?: string;
}

const RADIUS = 0.7;

export function LearnBlochSphere({ index, position, label, speechBubble }: LearnBlochSphereProps) {
  const arrowGroupRef = useRef<THREE.Group>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const shaftRef = useRef<THREE.Mesh>(null);
  const coneRef = useRef<THREE.Mesh>(null);
  const currentBloch = useRef(new THREE.Vector3(0, 1, 0));

  const sphereGeo = useMemo(() => new THREE.SphereGeometry(RADIUS, 32, 32), []);
  const wireGeo = useMemo(() => new THREE.SphereGeometry(RADIUS + 0.02, 16, 16), []);
  const ringGeo = useMemo(() => new THREE.TorusGeometry(RADIUS, 0.014, 16, 64), []);
  const shaftGeo = useMemo(() => new THREE.CylinderGeometry(0.025, 0.025, 1, 8), []);
  const coneGeo = useMemo(() => new THREE.ConeGeometry(0.07, 0.14, 12), []);

  const shellMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4a5580',
    transparent: true,
    opacity: 0.18,
    roughness: 0.3,
    metalness: 0.2,
    side: THREE.DoubleSide,
    envMapIntensity: 0.5,
  }), []);

  const wireMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#5a6590',
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  }), []);

  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#6878b0',
    transparent: true,
    opacity: 0.25,
  }), []);

  const arrowMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#6366f1',
    emissive: '#6366f1',
    emissiveIntensity: 0.8,
    roughness: 0.3,
    metalness: 0.5,
  }), []);

  useFrame((_, delta) => {
    const state = useLearnStore.getState();
    const q = state.qubits[index];
    if (!q) return;

    const amp = Math.max(0, Math.min(1, q.amplitude));
    const ph = q.phase;

    const theta = 2 * Math.asin(Math.sqrt(amp));
    const target = new THREE.Vector3(
      Math.sin(theta) * Math.cos(ph),
      Math.cos(theta),
      Math.sin(theta) * Math.sin(ph)
    );

    currentBloch.current.lerp(target, Math.min(1, delta * 6));

    // Color by phase
    const hue = phaseToHue(ph);
    const color = new THREE.Color().setHSL(hue / 360, 0.7, 0.55);
    arrowMat.color.copy(color);
    arrowMat.emissive.copy(color);

    updateArrow(currentBloch.current);

    // Gentle shell pulse
    if (shellRef.current) {
      const mat = shellRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.05 + Math.sin(Date.now() * 0.002) * 0.02;
      mat.emissive.set('#3040a0');
    }
  });

  function updateArrow(bloch: THREE.Vector3) {
    if (!arrowGroupRef.current) return;
    const vecLen = bloch.length() * RADIUS * 0.9;
    const dir = bloch.clone().normalize();

    if (shaftRef.current) {
      shaftRef.current.position.copy(dir.clone().multiplyScalar(vecLen * 0.5));
      shaftRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      shaftRef.current.scale.set(1, vecLen, 1);
    }
    if (coneRef.current) {
      coneRef.current.position.copy(dir.clone().multiplyScalar(vecLen));
      coneRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    }
  }

  return (
    <group position={position}>
      <mesh ref={shellRef} geometry={sphereGeo} material={shellMat} />
      <mesh geometry={wireGeo} material={wireMat} />

      {/* Axis rings */}
      <mesh geometry={ringGeo} material={ringMat} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={ringGeo} material={ringMat} />
      <mesh geometry={ringGeo} material={ringMat} rotation={[0, Math.PI / 2, 0]} />

      {/* State arrow */}
      <group ref={arrowGroupRef}>
        <mesh ref={shaftRef} geometry={shaftGeo} material={arrowMat} />
        <mesh ref={coneRef} geometry={coneGeo} material={arrowMat} />
      </group>

      {/* Pole labels — always visible */}
      <Text position={[0, RADIUS + 0.18, 0]} fontSize={0.14} color="#94a3b8" anchorX="center" anchorY="bottom">
        |0⟩
      </Text>
      <Text position={[0, -(RADIUS + 0.18), 0]} fontSize={0.14} color="#94a3b8" anchorX="center" anchorY="top">
        |1⟩
      </Text>

      {/* Label below sphere */}
      {label && (
        <Text position={[0, -(RADIUS + 0.45), 0]} fontSize={0.16} color={theme.accent.hover} anchorX="center" anchorY="top" font={undefined}>
          {label}
        </Text>
      )}

      {/* Speech bubble */}
      {speechBubble && (
        <Html position={[0, RADIUS + 0.6, 0]} center distanceFactor={5} style={{ pointerEvents: 'none' }}>
          <div style={{
            background: theme.bg.surface + 'f0',
            border: `1px solid ${theme.accent.primary}40`,
            borderRadius: 12,
            padding: '8px 14px',
            fontSize: 13,
            color: theme.text.primary,
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}>
            {speechBubble}
            <div style={{
              position: 'absolute',
              bottom: -6,
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: 10,
              height: 10,
              background: theme.bg.surface + 'f0',
              borderRight: `1px solid ${theme.accent.primary}40`,
              borderBottom: `1px solid ${theme.accent.primary}40`,
            }} />
          </div>
        </Html>
      )}
    </group>
  );
}
