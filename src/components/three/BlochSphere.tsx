import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useCircuitStore } from '../../store/circuitStore';
import { phaseToHue } from '../../lib/quantumSim';
import { theme } from '../../lib/theme';

interface BlochSphereProps {
  qubitIndex: number;
  totalQubits: number;
  position: [number, number, number];
}

const TRAIL_COUNT = 3;
const TRAIL_OPACITIES = [0.3, 0.15, 0.05];

/** Describe the qubit state in plain English. */
function describeState(amplitude: number, phase: number): { label: string; detail: string } {
  const phaseDeg = ((phase * 180 / Math.PI) % 360 + 360) % 360;

  if (amplitude < 0.01) {
    return {
      label: 'Ground state |0\u27E9',
      detail: 'Will always measure as 0. The arrow points to the north pole.',
    };
  }
  if (amplitude > 0.99) {
    return {
      label: 'Excited state |1\u27E9',
      detail: 'Will always measure as 1. The arrow points to the south pole.',
    };
  }
  if (Math.abs(amplitude - 0.5) < 0.05) {
    const phaseNote = phaseDeg < 2 || phaseDeg > 358
      ? '' : ` Phase shifted by ${phaseDeg.toFixed(0)}\u00B0.`;
    return {
      label: 'Equal superposition',
      detail: `50/50 chance of 0 or 1 \u2014 like a quantum coin flip. The arrow lies on the equator.${phaseNote}`,
    };
  }
  if (amplitude < 0.5) {
    return {
      label: 'Mostly |0\u27E9',
      detail: `${((1 - amplitude) * 100).toFixed(0)}% chance of measuring 0. Arrow tilted toward the north pole.`,
    };
  }
  return {
    label: 'Mostly |1\u27E9',
    detail: `${(amplitude * 100).toFixed(0)}% chance of measuring 1. Arrow tilted toward the south pole.`,
  };
}

function formatPhase(phase: number): string {
  const deg = ((phase * 180 / Math.PI) % 360 + 360) % 360;
  if (deg < 1 || deg > 359) return '0\u00B0 (none)';
  if (Math.abs(deg - 90) < 1) return '90\u00B0 (\u03C0/2)';
  if (Math.abs(deg - 180) < 1) return '180\u00B0 (\u03C0)';
  if (Math.abs(deg - 270) < 1) return '270\u00B0 (3\u03C0/2)';
  return `${deg.toFixed(0)}\u00B0`;
}

export function BlochSphere({ qubitIndex, totalQubits, position }: BlochSphereProps) {
  const arrowGroupRef = useRef<THREE.Group>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const shaftRef = useRef<THREE.Mesh>(null);
  const coneRef = useRef<THREE.Mesh>(null);
  const trailRefs = useRef<THREE.Group[]>([]);
  const trailPositions = useRef<THREE.Vector3[]>(
    Array.from({ length: TRAIL_COUNT }, () => new THREE.Vector3(0, 1, 0))
  );
  const currentBloch = useRef(new THREE.Vector3(0, 1, 0));
  const flashRef = useRef(0);
  const hoverRef = useRef(false);

  // Store-driven selection
  const isSelected = useCircuitStore((s) => s.selectedBlochQubit === qubitIndex);
  const setSelectedBlochQubit = useCircuitStore((s) => s.setSelectedBlochQubit);

  // Snapshot state for tooltip (read from store reactively)
  const simulation = useCircuitStore((s) => s.simulation);
  const simulationStep = useCircuitStore((s) => s.simulationStep);
  const stepStates = useCircuitStore((s) => s.stepStates);

  const currentState = stepStates.find((s) => s.step === simulationStep)
    ?? stepStates.find((s) => s.step <= simulationStep && s.step >= 0)
    ?? stepStates[0];

  const amplitude = currentState?.qubitAmplitudes[qubitIndex] ?? 0;
  const phase = currentState?.qubitPhases[qubitIndex] ?? 0;

  const radius = totalQubits <= 4 ? 0.5 : 0.35;
  const showRings = totalQubits <= 6;
  const showLabels = totalQubits <= 4;

  // Geometries
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(radius, 32, 32), [radius]);
  const wireGeo = useMemo(() => new THREE.SphereGeometry(radius + 0.02, 16, 16), [radius]);
  const ringGeo = useMemo(() => new THREE.TorusGeometry(radius, 0.008, 16, 64), [radius]);
  const shaftGeo = useMemo(() => new THREE.CylinderGeometry(0.02, 0.02, 1, 8), []);
  const coneGeo = useMemo(() => new THREE.ConeGeometry(0.06, 0.12, 12), []);

  const shellMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1c1e28',
    transparent: true,
    opacity: 0.15,
    roughness: 0.8,
    metalness: 0.1,
    side: THREE.DoubleSide,
  }), []);

  const wireMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#3a3d52',
    wireframe: true,
    transparent: true,
    opacity: 0.08,
  }), []);

  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#4a4d62',
    transparent: true,
    opacity: 0.12,
  }), []);

  const arrowMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#6366f1',
    emissive: '#6366f1',
    emissiveIntensity: 0.8,
    roughness: 0.3,
    metalness: 0.5,
  }), []);

  const trailMats = useMemo(() =>
    TRAIL_OPACITIES.map((op) => new THREE.MeshStandardMaterial({
      color: '#6366f1',
      emissive: '#6366f1',
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: op,
      roughness: 0.5,
      metalness: 0.3,
    })),
  []);

  useFrame((_, delta) => {
    const store = useCircuitStore.getState();
    const { simulation: sim, simulationStep: step, stepStates: states, gates } = store;

    if (sim === 'idle') {
      if (shellRef.current) {
        const mat = shellRef.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.02 + Math.sin(Date.now() * 0.002) * 0.01;
        mat.emissive.set('#1c1e28');
      }
      currentBloch.current.set(0, 1, 0);
      updateArrow(currentBloch.current);
      return;
    }

    const cs = states.find((s) => s.step === step)
      ?? states.find((s) => s.step <= step && s.step >= 0)
      ?? states[0];
    if (!cs) return;

    const amp = cs.qubitAmplitudes[qubitIndex] ?? 0;
    const ph = cs.qubitPhases[qubitIndex] ?? 0;

    const theta = 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, amp))));
    const phi = ph;

    const target = new THREE.Vector3(
      Math.sin(theta) * Math.cos(phi),
      Math.cos(theta),
      Math.sin(theta) * Math.sin(phi)
    );

    const prev = currentBloch.current.clone();
    currentBloch.current.lerp(target, Math.min(1, delta * 6));

    if (prev.distanceTo(currentBloch.current) > 0.01) {
      for (let i = TRAIL_COUNT - 1; i > 0; i--) {
        trailPositions.current[i].copy(trailPositions.current[i - 1]);
      }
      trailPositions.current[0].copy(prev);
    }

    const hue = phaseToHue(ph);
    const color = new THREE.Color().setHSL(hue / 360, 0.7, 0.55);
    arrowMat.color.copy(color);
    arrowMat.emissive.copy(color);
    arrowMat.emissiveIntensity = 0.8;

    for (const mat of trailMats) {
      mat.color.copy(color);
      mat.emissive.copy(color);
    }

    updateArrow(currentBloch.current);

    for (let i = 0; i < TRAIL_COUNT; i++) {
      const trail = trailRefs.current[i];
      if (!trail) continue;
      const tp = trailPositions.current[i];
      const len = tp.length() * radius * 0.9;
      if (len < 0.01) { trail.visible = false; continue; }
      trail.visible = true;
      const dir = tp.clone().normalize();
      trail.position.copy(dir.clone().multiplyScalar(len * 0.5));
      trail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      trail.scale.set(0.5, len, 0.5);
    }

    const activeGate = gates.find(
      (g) => g.step === step &&
        (g.targets.includes(qubitIndex) || (g.controls?.includes(qubitIndex)))
    );
    if (activeGate && sim === 'running') flashRef.current = 1;
    else flashRef.current = THREE.MathUtils.lerp(flashRef.current, 0, delta * 3);

    if (shellRef.current) {
      const mat = shellRef.current.material as THREE.MeshStandardMaterial;
      const highlight = isSelected || hoverRef.current ? 0.08 : 0;
      mat.emissiveIntensity = 0.02 + flashRef.current * 0.3 + highlight;
      if (flashRef.current > 0.05 || isSelected) {
        mat.emissive.copy(color);
      } else {
        mat.emissive.set('#1c1e28');
      }
      mat.opacity = isSelected ? 0.25 : 0.15;
    }
  });

  function updateArrow(bloch: THREE.Vector3) {
    if (!arrowGroupRef.current) return;
    const vecLen = bloch.length() * radius * 0.9;
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

  const stateDesc = describeState(amplitude, phase);

  return (
    <group position={position}>
      {/* Clickable sphere shell */}
      <mesh
        ref={shellRef}
        geometry={sphereGeo}
        material={shellMat}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedBlochQubit(isSelected ? null : qubitIndex);
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; hoverRef.current = true; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; hoverRef.current = false; }}
      />

      {/* Wireframe overlay */}
      <mesh geometry={wireGeo} material={wireMat} />

      {/* Axis rings */}
      {showRings && (
        <>
          <mesh geometry={ringGeo} material={ringMat} rotation={[Math.PI / 2, 0, 0]} />
          <mesh geometry={ringGeo} material={ringMat} />
          <mesh geometry={ringGeo} material={ringMat} rotation={[0, Math.PI / 2, 0]} />
        </>
      )}

      {/* State arrow */}
      <group ref={arrowGroupRef}>
        <mesh ref={shaftRef} geometry={shaftGeo} material={arrowMat} />
        <mesh ref={coneRef} geometry={coneGeo} material={arrowMat} />
      </group>

      {/* Ghost trails */}
      {Array.from({ length: TRAIL_COUNT }, (_, i) => (
        <group
          key={i}
          ref={(el) => { if (el) trailRefs.current[i] = el; }}
          visible={false}
        >
          <mesh geometry={shaftGeo} material={trailMats[i]} />
        </group>
      ))}

      {/* Pole labels */}
      {showLabels && (
        <>
          <Text position={[0, radius + 0.15, 0]} fontSize={0.12} color="#9b9db0" anchorX="center" anchorY="bottom">
            |0⟩
          </Text>
          <Text position={[0, -(radius + 0.15), 0]} fontSize={0.12} color="#9b9db0" anchorX="center" anchorY="top">
            |1⟩
          </Text>
        </>
      )}

      {/* Interactive info tooltip */}
      {isSelected && simulation !== 'idle' && (
        <Html
          position={[radius + 0.3, 0, 0]}
          center
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div
            style={{
              background: theme.bg.surface + 'f5',
              border: `1px solid ${theme.border.medium}`,
              borderRadius: 10,
              padding: '10px 12px',
              width: 200,
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <div style={{
                width: 8, height: 8, borderRadius: 4,
                background: theme.accent.primary,
              }} />
              <span style={{ color: theme.accent.hover, fontWeight: 700, fontSize: 13 }}>
                q[{qubitIndex}]
              </span>
              <span style={{ color: theme.text.tertiary, fontSize: 10, marginLeft: 'auto' }}>
                Bloch Sphere
              </span>
            </div>

            {/* State label */}
            <div style={{ color: theme.text.primary, fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
              {stateDesc.label}
            </div>

            {/* Probabilities */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
              <div style={{ fontSize: 10 }}>
                <span style={{ color: theme.text.tertiary }}>|0⟩: </span>
                <span style={{ color: theme.text.primary, fontFamily: 'monospace' }}>
                  {((1 - amplitude) * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{ fontSize: 10 }}>
                <span style={{ color: theme.text.tertiary }}>|1⟩: </span>
                <span style={{ color: theme.text.primary, fontFamily: 'monospace' }}>
                  {(amplitude * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Phase */}
            <div style={{ fontSize: 10, marginBottom: 6 }}>
              <span style={{ color: theme.text.tertiary }}>Phase: </span>
              <span style={{ color: theme.accent.hover, fontFamily: 'monospace' }}>
                {formatPhase(phase)}
              </span>
            </div>

            {/* Explanation */}
            <div style={{
              fontSize: 10, lineHeight: 1.4,
              color: theme.text.secondary,
              borderTop: `1px solid ${theme.border.subtle}`,
              paddingTop: 6,
            }}>
              {stateDesc.detail}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
