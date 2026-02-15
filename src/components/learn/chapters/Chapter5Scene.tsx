import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useLearnStore } from '../../../store/learnStore';
import { LearnBlochSphere } from '../LearnBlochSphere';
import { GateButton3D } from '../GateButton3D';
import { QuantumWaveLearn } from '../QuantumWaveLearn';
import { theme } from '../../../lib/theme';

// Decorative rotating mini-qubit
function MiniQubit({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.3;
    }
  });
  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[0.12, 1]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.5} wireframe />
    </mesh>
  );
}

// Entanglement beam (reused from Ch4)
function EntanglementBeam() {
  const isEntangled = useLearnStore((s) => s.isEntangled);
  if (!isEntangled) return null;
  const points1: [number, number, number][] = [];
  const points2: [number, number, number][] = [];
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    const x = -1.3 + t * 2.6;
    const wave = Math.sin(t * Math.PI * 4) * 0.12;
    points1.push([x, wave, 0]);
    points2.push([x, -wave, 0]);
  }
  return (
    <>
      <Line points={points1} color="#818cf8" lineWidth={1.5} transparent opacity={0.4} dashed dashSize={0.3} dashScale={1} gapSize={0.2} />
      <Line points={points2} color="#c084fc" lineWidth={1.5} transparent opacity={0.3} dashed dashSize={0.3} dashScale={1} gapSize={0.2} />
    </>
  );
}

// Circuit diagram with gate highlighting
function CircuitDiagram({ highlightH, highlightCNOT }: { highlightH?: boolean; highlightCNOT?: boolean }) {
  const hGlow = highlightH ? '#fbbf24' : theme.text.tertiary + '60';
  const cnotGlow = highlightCNOT ? theme.accent.primary : theme.text.tertiary + '40';
  const wireColor = theme.accent.primary + '50';

  return (
    <div style={{
      background: theme.bg.surface + 'f5',
      border: `1px solid ${theme.border.medium}`,
      borderRadius: 12,
      padding: '14px 20px',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      minWidth: 220,
    }}>
      <div style={{ fontSize: 9, color: theme.text.tertiary, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 8, textAlign: 'center' }}>
        Bell Circuit
      </div>
      <div style={{ fontFamily: 'monospace', position: 'relative' }}>
        {/* q0 wire */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, position: 'relative' }}>
          <span style={{ fontSize: 10, color: theme.accent.hover, fontWeight: 700, width: 22, flexShrink: 0 }}>q{'\u2080'}</span>
          <div style={{ flex: 1, height: 2, background: wireColor }} />
          <div style={{
            border: `2px solid ${hGlow}`,
            borderRadius: 5,
            padding: '2px 10px',
            fontSize: 12,
            fontWeight: 700,
            color: highlightH ? '#fbbf24' : theme.text.tertiary,
            background: highlightH ? '#fbbf2420' : 'transparent',
            transition: 'all 0.3s',
            boxShadow: highlightH ? '0 0 12px rgba(251, 191, 36, 0.4)' : 'none',
          }}>
            H
          </div>
          <div style={{ flex: 1, height: 2, background: wireColor }} />
          <div style={{
            width: 10, height: 10, borderRadius: 5,
            background: cnotGlow,
            transition: 'all 0.3s',
            boxShadow: highlightCNOT ? '0 0 10px rgba(99, 102, 241, 0.5)' : 'none',
          }} />
          <div style={{ flex: 0.4, height: 2, background: wireColor }} />
        </div>
        {/* Vertical CNOT line */}
        <div style={{
          position: 'absolute', right: 28, top: 12, bottom: 12, width: 2,
          background: cnotGlow, transition: 'all 0.3s',
        }} />
        {/* q1 wire */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: theme.accent.hover, fontWeight: 700, width: 22, flexShrink: 0 }}>q{'\u2081'}</span>
          <div style={{ flex: 1, height: 2, background: wireColor }} />
          <div style={{ flex: 1, height: 2, background: wireColor }} />
          <div style={{ flex: 1, height: 2, background: wireColor }} />
          <div style={{
            width: 16, height: 16, borderRadius: 8,
            border: `2px solid ${cnotGlow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: cnotGlow, fontWeight: 700,
            background: highlightCNOT ? theme.accent.primary + '15' : 'transparent',
            transition: 'all 0.3s',
            boxShadow: highlightCNOT ? '0 0 10px rgba(99, 102, 241, 0.5)' : 'none',
          }}>
            +
          </div>
          <div style={{ flex: 0.4, height: 2, background: wireColor }} />
        </div>
      </div>
    </div>
  );
}

// State evolution display
function StatePanel({ stateText, label }: { stateText: string; label?: string }) {
  return (
    <div style={{
      background: theme.bg.surface + 'e0',
      border: `1px solid ${theme.border.subtle}`,
      borderRadius: 8,
      padding: '6px 12px',
      textAlign: 'center',
    }}>
      {label && <div style={{ fontSize: 8, color: theme.text.tertiary, marginBottom: 2 }}>{label}</div>}
      <div style={{ fontSize: 13, fontFamily: 'monospace', color: theme.accent.hover, fontWeight: 600 }}>
        {stateText}
      </div>
    </div>
  );
}

// Challenge circuit diagram (H → Z → H)
function ChallengeCircuitDiagram({ subStep }: { subStep: number }) {
  const wireColor = theme.accent.primary + '50';
  const gateStyle = (active: boolean, done: boolean) => ({
    border: `2px solid ${active ? '#fbbf24' : done ? '#4ade80' : theme.text.tertiary + '40'}`,
    borderRadius: 5,
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 700 as const,
    color: active ? '#fbbf24' : done ? '#4ade80' : theme.text.tertiary,
    background: active ? '#fbbf2420' : done ? '#4ade8010' : 'transparent',
    transition: 'all 0.3s',
    boxShadow: active ? '0 0 10px rgba(251, 191, 36, 0.4)' : 'none',
  });

  return (
    <div style={{
      background: theme.bg.surface + 'f5',
      border: `1px solid ${theme.border.medium}`,
      borderRadius: 12,
      padding: '14px 20px',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    }}>
      <div style={{ fontSize: 9, color: theme.text.tertiary, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 8, textAlign: 'center' }}>
        {subStep >= 3 ? 'Solved! H\u2192Z\u2192H = X' : 'Challenge: |0\u27E9 \u2192 |1\u27E9'}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, fontFamily: 'monospace' }}>
        <span style={{ fontSize: 10, color: theme.accent.hover, fontWeight: 700, width: 20 }}>q{'\u2080'}</span>
        <div style={{ width: 12, height: 2, background: wireColor }} />
        <div style={gateStyle(subStep === 0, subStep > 0)}>H</div>
        <div style={{ width: 12, height: 2, background: wireColor }} />
        <div style={gateStyle(subStep === 1, subStep > 1)}>Z</div>
        <div style={{ width: 12, height: 2, background: wireColor }} />
        <div style={gateStyle(subStep === 2, subStep > 2)}>H</div>
        <div style={{ width: 12, height: 2, background: wireColor }} />
      </div>
      {subStep >= 3 && (
        <div style={{ fontSize: 9, color: '#4ade80', textAlign: 'center', marginTop: 6, fontWeight: 600 }}>
          {'Interference turned |0\u27E9 into |1\u27E9!'}
        </div>
      )}
    </div>
  );
}

export function Chapter5Scene() {
  const currentStep = useLearnStore((s) => s.currentStep);
  const applyGate = useLearnStore((s) => s.applyGate);
  const resetQubits = useLearnStore((s) => s.resetQubits);
  const subStep = useLearnStore((s) => s.subStep);
  const completeInteraction = useLearnStore((s) => s.completeInteraction);
  const prevStepRef = useRef(currentStep);

  // Setup state for each step
  useEffect(() => {
    if (currentStep === prevStepRef.current) return;
    prevStepRef.current = currentStep;

    if (currentStep === 2) {
      // Tracing start: both at |0⟩
      resetQubits();
    } else if (currentStep === 3) {
      // After H applied (keep state from step 2 click)
    } else if (currentStep === 4) {
      // After CNOT applied (keep state from step 3 click)
    } else if (currentStep === 5) {
      // Challenge: reset to single-qubit |0⟩
      resetQubits();
      useLearnStore.setState({ subStep: 0 });
    }
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bell circuit tracing: user clicks H
  const handleTraceH = () => {
    applyGate('h', 0);
  };

  // Bell circuit tracing: user clicks CNOT
  const handleTraceCNOT = () => {
    applyGate('cx');
  };

  // Challenge: H → Z → H sequence
  const handleChallengeGate = () => {
    const sub = useLearnStore.getState().subStep;
    if (sub === 0) {
      applyGate('h');
      useLearnStore.setState({ subStep: 1, interactionCompleted: false });
    } else if (sub === 1) {
      applyGate('z');
      useLearnStore.setState({ subStep: 2, interactionCompleted: false });
    } else if (sub === 2) {
      applyGate('h');
      useLearnStore.setState({ subStep: 3 });
      completeInteraction();
    }
  };

  const challengeGateLabel = subStep === 0 ? 'H' : subStep === 1 ? 'Z' : subStep === 2 ? 'H' : '\u2713';
  const challengeGateType = subStep === 0 ? 'h' : subStep === 1 ? 'z' : 'h';

  // Determine scene mode
  const showBellTrace = currentStep >= 2 && currentStep <= 4;
  const showChallenge = currentStep === 5 || currentStep === 6;

  // State text for tracing
  const getStateText = () => {
    if (currentStep === 2) return '|\u03C8\u27E9 = |00\u27E9';
    if (currentStep === 3) return '|\u03C8\u27E9 = (|00\u27E9 + |10\u27E9) / \u221A2';
    if (currentStep === 4) return '|\u03C8\u27E9 = (|00\u27E9 + |11\u27E9) / \u221A2';
    return '';
  };

  return (
    <>
      {/* Decorative elements */}
      <MiniQubit position={[-2.5, 1.5, -1]} color="#6366f1" />
      <MiniQubit position={[2.5, 1.2, -1]} color="#a855f7" />
      <MiniQubit position={[-1.8, -1.5, -0.5]} color="#818cf8" />
      <MiniQubit position={[2.0, -1.5, -0.5]} color="#c084fc" />

      {/* ========== INTRO (steps 0-1) ========== */}
      {currentStep === 0 && (
        <>
          <Text position={[0, 0.5, 0]} fontSize={0.22} color="#e2e8f0" anchorX="center" anchorY="middle" font={undefined}>
            Quantum Circuits
          </Text>
          <Text position={[0, 0.1, 0]} fontSize={0.09} color="#94a3b8" anchorX="center" anchorY="middle" font={undefined}>
            Gates + Qubits + Measurement = Algorithms
          </Text>
        </>
      )}

      {currentStep === 1 && (
        <Html position={[0, 0.3, 0]} center distanceFactor={5}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
            <CircuitDiagram />
            <div style={{
              background: theme.bg.surface + 'e0',
              border: `1px solid ${theme.border.subtle}`,
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 10,
              color: theme.text.secondary,
              lineHeight: 1.6,
              textAlign: 'center',
              maxWidth: 260,
            }}>
              <div><span style={{ color: theme.accent.hover, fontWeight: 600 }}>q{'\u2080'}, q{'\u2081'}</span> = qubit wires (read left to right)</div>
              <div><span style={{ color: '#fbbf24', fontWeight: 600 }}>H</span> = Hadamard gate (superposition)</div>
              <div><span style={{ color: theme.accent.primary, fontWeight: 600 }}>{'\u2022'}{'\u2014'}{'\u2295'}</span> = CNOT gate (entanglement)</div>
            </div>
          </div>
        </Html>
      )}

      {/* ========== BELL CIRCUIT TRACING (steps 2-4) ========== */}
      {showBellTrace && (
        <>
          {/* Two Bloch spheres */}
          <LearnBlochSphere
            index={0}
            position={[-1.3, 0.2, 0]}
            label="Qubit 0"
            speechBubble={
              currentStep === 2 ? "I'm |0\u27E9" :
              currentStep === 3 ? "In superposition!" :
              currentStep === 4 ? "Entangled!" :
              undefined
            }
          />
          <LearnBlochSphere
            index={1}
            position={[1.3, 0.2, 0]}
            label="Qubit 1"
            speechBubble={
              currentStep === 2 ? "Me too!" :
              currentStep === 3 ? "Still |0\u27E9" :
              currentStep === 4 ? "We're linked!" :
              undefined
            }
          />

          {/* Entanglement beam */}
          <group position={[0, 0.2, 0]}>
            <EntanglementBeam />
          </group>

          {/* Circuit diagram — positioned above */}
          <Html position={[0, 1.6, 0]} center distanceFactor={5}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
              <CircuitDiagram
                highlightH={currentStep === 2}
                highlightCNOT={currentStep === 3}
              />
              <StatePanel stateText={getStateText()} label="Quantum State" />
            </div>
          </Html>

          {/* H gate button (step 2) */}
          {currentStep === 2 && (
            <GateButton3D gate="h" label="H" position={[-1.3, -0.9, 0]} pulse onClick={handleTraceH} />
          )}

          {/* CNOT button (step 3) */}
          {currentStep === 3 && (
            <GateButton3D gate="cx" label="CNOT" position={[0, -0.9, 0]} pulse onClick={handleTraceCNOT} />
          )}
        </>
      )}

      {/* ========== INTERFERENCE CHALLENGE (steps 5-6) ========== */}
      {showChallenge && (
        <>
          {/* Challenge circuit diagram — top */}
          <Html position={[0, 1.9, 0]} center distanceFactor={5}>
            <ChallengeCircuitDiagram subStep={subStep} />
          </Html>

          {/* Single Bloch sphere — centered lower */}
          <LearnBlochSphere
            index={0}
            position={[0, 0, 0]}
            speechBubble={
              currentStep === 5 && subStep === 0 ? "Turn me into |1\u27E9!" :
              currentStep === 5 && subStep >= 3 ? "I'm |1\u27E9! Interference!" :
              currentStep === 6 ? "H\u2192Z\u2192H = NOT gate!" :
              undefined
            }
          />

          {/* Wave */}
          <QuantumWaveLearn index={0} position={[0, -1.3, 0]} />

          {/* Gate button for challenge (step 5) */}
          {currentStep === 5 && subStep < 3 && (
            <GateButton3D
              gate={challengeGateType}
              label={`${challengeGateLabel} (${subStep + 1}/3)`}
              position={[1.4, 0, 0]}
              pulse
              onClick={handleChallengeGate}
            />
          )}
        </>
      )}

      {/* ========== FINALE (step 7) ========== */}
      {currentStep === 7 && (
        <>
          <Text position={[0, 0.8, 0]} fontSize={0.16} color="#e2e8f0" anchorX="center" anchorY="middle" font={undefined}>
            You're Ready!
          </Text>

          <Html position={[0, 0.2, 0]} center distanceFactor={5}>
            <div style={{
              background: theme.bg.surface + 'f0',
              border: `1px solid ${theme.border.medium}`,
              borderRadius: 12,
              padding: '14px 20px',
              backdropFilter: 'blur(12px)',
              maxWidth: 300,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 11, color: theme.text.secondary, lineHeight: 1.6, marginBottom: 8 }}>
                Try building in the Circuit Explorer:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  { name: 'Bell State', desc: 'H + CNOT (you just did this!)' },
                  { name: 'GHZ State', desc: 'H + CNOT + CNOT (3-qubit entanglement)' },
                  { name: 'Quantum Teleportation', desc: 'Transfer a state using entanglement' },
                ].map((item) => (
                  <div key={item.name} style={{
                    background: theme.bg.raised,
                    border: `1px solid ${theme.border.subtle}`,
                    borderRadius: 6,
                    padding: '5px 10px',
                    textAlign: 'left',
                  }}>
                    <div style={{ fontSize: 11, color: theme.accent.hover, fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 9, color: theme.text.tertiary }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </Html>
        </>
      )}
    </>
  );
}
