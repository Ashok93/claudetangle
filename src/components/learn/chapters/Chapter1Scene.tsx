import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useLearnStore } from '../../../store/learnStore';
import { LearnBlochSphere } from '../LearnBlochSphere';
import { GateButton3D } from '../GateButton3D';
import { QuantumWaveLearn } from '../QuantumWaveLearn';
import { theme } from '../../../lib/theme';
import { phaseToHue } from '../../../lib/quantumSim';

function ClassicalBit() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [on, setOn] = useState(false);
  const completeInteraction = useLearnStore((s) => s.completeInteraction);

  useFrame(() => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = on ? 0.8 : 0.1;
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          setOn(!on);
          completeInteraction();
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial
          color={on ? '#4ade80' : '#f87171'}
          emissive={on ? '#4ade80' : '#f87171'}
          emissiveIntensity={0.1}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
      <Text position={[0, 0, 0.32]} fontSize={0.35} color="#fff" anchorX="center" anchorY="middle" font={undefined}>
        {on ? '1' : '0'}
      </Text>
      <Text position={[0, -0.55, 0]} fontSize={0.14} color="#94a3b8" anchorX="center" anchorY="top" font={undefined}>
        Classical Bit
      </Text>
    </group>
  );
}

export function Chapter1Scene() {
  const currentStep = useLearnStore((s) => s.currentStep);
  const applyGate = useLearnStore((s) => s.applyGate);
  const setQubitState = useLearnStore((s) => s.setQubitState);
  const qubits = useLearnStore((s) => s.qubits);
  const completeInteraction = useLearnStore((s) => s.completeInteraction);
  const resetQubits = useLearnStore((s) => s.resetQubits);

  const showBit = currentStep <= 1;
  const showSphere = currentStep >= 1;
  const showStateButtons = currentStep === 2;
  const showHGate = currentStep === 3;
  const showProbDisplay = currentStep >= 4;
  const showPhaseControls = currentStep === 4;
  const showWave = currentStep >= 3;
  const showFreePlay = currentStep === 6;

  const speechBubble = currentStep === 1 ? "Hi! I'm a qubit!" : currentStep === 2 ? "Set my state!" : currentStep === 6 ? "Play with me!" : undefined;

  const q = qubits[0];
  const prob0 = ((1 - q.amplitude) * 100).toFixed(0);
  const prob1 = (q.amplitude * 100).toFixed(0);
  const hue = phaseToHue(q.phase);

  const handlePhaseRotate = (delta: number) => {
    const newPhase = ((q.phase + delta) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    setQubitState(0, q.amplitude, newPhase);
    completeInteraction();
  };

  return (
    <>
      {/* Classical bit */}
      {showBit && (
        <group position={[currentStep >= 1 ? -2 : 0, 0, 0]}>
          <group scale={currentStep >= 2 ? 0.001 : 1}>
            <ClassicalBit />
          </group>
        </group>
      )}

      {/* Bloch sphere */}
      {showSphere && (
        <LearnBlochSphere
          index={0}
          position={[0, 0.3, 0]}
          speechBubble={speechBubble}
        />
      )}

      {/* Wave visualization */}
      {showWave && (
        <QuantumWaveLearn index={0} position={[0, -1.1, 0]} />
      )}

      {/* State buttons (step 2) */}
      {showStateButtons && (
        <Html position={[1.3, 0.5, 0]} center distanceFactor={5}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => setQubitState(0, 0, 0)}
              style={{
                background: theme.accent.primary,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              |0⟩
            </button>
            <button
              onClick={() => setQubitState(0, 1, 0)}
              style={{
                background: '#f87171',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              |1⟩
            </button>
          </div>
        </Html>
      )}

      {/* H gate button (step 3) */}
      {showHGate && (
        <GateButton3D
          gate="h"
          label="H"
          position={[1.3, 0.3, 0]}
          pulse
          onClick={() => applyGate('h')}
        />
      )}

      {/* Probability + Phase panel (steps 4-5) */}
      {showProbDisplay && !showFreePlay && (
        <Html position={[1.6, 0.3, 0]} center distanceFactor={5}>
          <div style={{
            background: theme.bg.surface + 'f0',
            border: `1px solid ${theme.border.medium}`,
            borderRadius: 10,
            padding: '10px 14px',
            backdropFilter: 'blur(8px)',
            minWidth: 130,
          }}>
            <div style={{ fontSize: 11, color: theme.text.tertiary, marginBottom: 4 }}>Probability</div>
            <div style={{ display: 'flex', alignItems: 'end', gap: 12, height: 44 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 26,
                  height: Math.max(3, Number(prob0) * 0.42),
                  background: theme.accent.primary,
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 0.5s',
                }} />
                <div style={{ fontSize: 10, color: theme.text.secondary, marginTop: 2 }}>|0⟩ {prob0}%</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 26,
                  height: Math.max(3, Number(prob1) * 0.42),
                  background: '#f87171',
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 0.5s',
                }} />
                <div style={{ fontSize: 10, color: theme.text.secondary, marginTop: 2 }}>|1⟩ {prob1}%</div>
              </div>
            </div>

            {/* Phase display + slider + controls */}
            <div style={{ borderTop: `1px solid ${theme.border.subtle}`, marginTop: 8, paddingTop: 6 }}>
              <div style={{ fontSize: 11, color: theme.text.tertiary, marginBottom: 4 }}>Phase</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 14, height: 14, borderRadius: 7,
                  background: `hsl(${hue}, 70%, 55%)`,
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 12, color: theme.text.primary, fontFamily: 'monospace', fontWeight: 600 }}>
                  {(q.phase * 180 / Math.PI).toFixed(0)}&deg;
                </span>
              </div>
              {/* Phase slider */}
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={Math.round(((q.phase * 180 / Math.PI) % 360 + 360) % 360)}
                onChange={(e) => {
                  const deg = Number(e.target.value);
                  setQubitState(0, q.amplitude, deg * Math.PI / 180);
                  completeInteraction();
                }}
                style={{
                  width: '100%',
                  marginTop: 6,
                  accentColor: `hsl(${hue}, 70%, 55%)`,
                  cursor: 'pointer',
                }}
              />
              {showPhaseControls && (
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {[
                    { label: '+45\u00B0', delta: Math.PI / 4 },
                    { label: '+90\u00B0', delta: Math.PI / 2 },
                    { label: '+180\u00B0', delta: Math.PI },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      onClick={() => handlePhaseRotate(btn.delta)}
                      style={{
                        background: theme.bg.raised,
                        color: theme.accent.hover,
                        border: `1px solid ${theme.accent.primary}30`,
                        borderRadius: 5,
                        padding: '3px 7px',
                        fontSize: 10,
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Html>
      )}

      {/* Free play (step 6) — all controls */}
      {showFreePlay && (
        <>
          <GateButton3D gate="h" label="H" position={[-1.3, 0.8, 0]} onClick={() => applyGate('h')} />

          <Html position={[1.3, 0.5, 0]} center distanceFactor={5}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                onClick={() => setQubitState(0, 0, 0)}
                style={{
                  background: theme.accent.primary,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                |0⟩
              </button>
              <button
                onClick={() => setQubitState(0, 1, 0)}
                style={{
                  background: '#f87171',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                |1⟩
              </button>
              <div style={{ display: 'flex', gap: 3, marginTop: 2 }}>
                {[
                  { label: '+45\u00B0', delta: Math.PI / 4 },
                  { label: '+90\u00B0', delta: Math.PI / 2 },
                  { label: '+180\u00B0', delta: Math.PI },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={() => handlePhaseRotate(btn.delta)}
                    style={{
                      background: theme.bg.raised,
                      color: theme.accent.hover,
                      border: `1px solid ${theme.accent.primary}30`,
                      borderRadius: 4,
                      padding: '2px 5px',
                      fontSize: 9,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </Html>

          <GateButton3D gate="measure" label="Reset" position={[0, -1.8, 0]} onClick={resetQubits} />
        </>
      )}
    </>
  );
}
