import { useRef, useMemo, useCallback } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useSandboxStore } from '../../store/sandboxStore';
import { phaseToHue } from '../../lib/quantumSim';

interface SandboxBlochSphereProps {
  index: number;
  position: [number, number, number];
}

const RADIUS = 0.7;

export function SandboxBlochSphere({ index, position }: SandboxBlochSphereProps) {
  const arrowGroupRef = useRef<THREE.Group>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const shaftRef = useRef<THREE.Mesh>(null);
  const coneRef = useRef<THREE.Mesh>(null);
  const glowRingRef = useRef<THREE.Mesh>(null);
  const currentBloch = useRef(new THREE.Vector3(0, 1, 0));

  const sphereGeo = useMemo(() => new THREE.SphereGeometry(RADIUS, 32, 32), []);
  const wireGeo = useMemo(() => new THREE.SphereGeometry(RADIUS + 0.02, 16, 16), []);
  const ringGeo = useMemo(() => new THREE.TorusGeometry(RADIUS, 0.014, 16, 64), []);
  const shaftGeo = useMemo(() => new THREE.CylinderGeometry(0.025, 0.025, 1, 8), []);
  const coneGeo = useMemo(() => new THREE.ConeGeometry(0.07, 0.14, 12), []);
  const glowRingGeo = useMemo(() => new THREE.TorusGeometry(RADIUS + 0.08, 0.03, 16, 64), []);

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

  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#0891b2',
    transparent: true,
    opacity: 0,
  }), []);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    useSandboxStore.getState().selectQubit(index);
  }, [index]);

  useFrame((_, delta) => {
    const state = useSandboxStore.getState();
    const bc = state.blochCoords[index];
    if (!bc) return;

    const isSelected = state.selectedQubit === index;

    // Target Bloch vector
    const target = new THREE.Vector3(bc.x, bc.z, bc.y); // map sim coords to 3D
    currentBloch.current.lerp(target, Math.min(1, delta * 6));

    // Arrow color from dominant phase
    const basis = state.basisStates;
    let dominantPhase = 0;
    let maxProb = 0;
    for (const b of basis) {
      if (b.probability > maxProb) {
        // Find phase contribution for this qubit being |1⟩
        const bit = (b.index >> index) & 1;
        if (bit === 1) {
          maxProb = b.probability;
          dominantPhase = b.phase;
        }
      }
    }
    const hue = phaseToHue(dominantPhase);
    const color = new THREE.Color().setHSL(hue / 360, 0.7, 0.55);
    arrowMat.color.copy(color);
    arrowMat.emissive.copy(color);

    // Purity indicator: shorten arrow and tint purple when entangled
    const purity = bc.purity;
    if (purity < 0.95) {
      shellMat.color.set('#5a4580');
      shellMat.opacity = 0.18 + (1 - purity) * 0.08;
    } else {
      shellMat.color.set('#4a5580');
      shellMat.opacity = 0.18;
    }

    updateArrow(currentBloch.current);

    // Selection glow
    if (glowRingRef.current) {
      const targetOpacity = isSelected ? 0.6 : 0;
      glowMat.opacity += (targetOpacity - glowMat.opacity) * Math.min(1, delta * 10);
    }

    // Shell pulse
    if (shellRef.current) {
      const mat = shellRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.05 + Math.sin(Date.now() * 0.002) * 0.02;
      mat.emissive.set('#3040a0');
    }
  });

  function updateArrow(bloch: THREE.Vector3) {
    if (!arrowGroupRef.current) return;
    const len = bloch.length();
    if (len < 0.001) return;

    const vecLen = len * RADIUS * 0.9;
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

  const selectedQubit = useSandboxStore((s) => s.selectedQubit);
  const isSelected = selectedQubit === index;

  return (
    <group position={position} onClick={handleClick}>
      <mesh ref={shellRef} geometry={sphereGeo} material={shellMat} />
      <mesh geometry={wireGeo} material={wireMat} />

      {/* Axis rings */}
      <mesh geometry={ringGeo} material={ringMat} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={ringGeo} material={ringMat} />
      <mesh geometry={ringGeo} material={ringMat} rotation={[0, Math.PI / 2, 0]} />

      {/* Selection glow ring */}
      <mesh ref={glowRingRef} geometry={glowRingGeo} material={glowMat} rotation={[Math.PI / 2, 0, 0]} />

      {/* State arrow */}
      <group ref={arrowGroupRef}>
        <mesh ref={shaftRef} geometry={shaftGeo} material={arrowMat} />
        <mesh ref={coneRef} geometry={coneGeo} material={arrowMat} />
      </group>

      {/* Pole labels */}
      <Text position={[0, RADIUS + 0.18, 0]} fontSize={0.14} color="#94a3b8" anchorX="center" anchorY="bottom">
        |0⟩
      </Text>
      <Text position={[0, -(RADIUS + 0.18), 0]} fontSize={0.14} color="#94a3b8" anchorX="center" anchorY="top">
        |1⟩
      </Text>

      {/* Qubit label */}
      <Text
        position={[0, -(RADIUS + 0.45), 0]}
        fontSize={0.16}
        color={isSelected ? '#0891b2' : '#818cf8'}
        anchorX="center"
        anchorY="top"
        font={undefined}
      >
        {`q${index}${isSelected ? ' (selected)' : ''}`}
      </Text>
    </group>
  );
}
