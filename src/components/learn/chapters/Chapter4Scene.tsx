import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useLearnStore } from '../../../store/learnStore';
import { LearnBlochSphere } from '../LearnBlochSphere';
import { GateButton3D } from '../GateButton3D';
import { theme } from '../../../lib/theme';

function EntanglementBeamLearn() {
  const dashRef = useRef(0);
  const isEntangled = useLearnStore((s) => s.isEntangled);

  useFrame((_, delta) => {
    dashRef.current -= delta * 2;
  });

  if (!isEntangled) return null;

  const points1: [number, number, number][] = [];
  const points2: [number, number, number][] = [];
  const numPoints = 30;
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const x = -1.3 + t * 2.6;
    const wave = Math.sin(t * Math.PI * 4) * 0.15;
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

export function Chapter4Scene() {
  const currentStep = useLearnStore((s) => s.currentStep);
  const applyGate = useLearnStore((s) => s.applyGate);
  const measureQubit = useLearnStore((s) => s.measureQubit);
  const twoQubitResults = useLearnStore((s) => s.twoQubitResults);
  const twoQubitHistory = useLearnStore((s) => s.twoQubitHistory);
  const isEntangled = useLearnStore((s) => s.isEntangled);
  const subStep = useLearnStore((s) => s.subStep);
  const resetQubits = useLearnStore((s) => s.resetQubits);

  const showXOnA = currentStep === 1;
  const showEntangleButtons = currentStep === 2;
  const showMeasure = currentStep === 3;
  const showFreePlay = currentStep === 4;

  const handleXOnA = () => {
    applyGate('x', 0);
  };

  const handleHOnA = () => {
    resetQubits();
    setTimeout(() => {
      applyGate('h', 0);
      useLearnStore.setState({ subStep: 1 });
    }, 50);
  };

  const handleCNOT = () => {
    applyGate('cx');
  };

  const handleMeasure = () => {
    measureQubit(0);
  };

  const handleFreePlayEntangle = () => {
    resetQubits();
    setTimeout(() => {
      applyGate('h', 0);
      setTimeout(() => applyGate('cx'), 100);
    }, 50);
  };

  const handleFreePlayMeasure = () => {
    measureQubit(0);
  };

  const correlated = twoQubitHistory.filter((r) => r.a === r.b).length;
  const total = twoQubitHistory.length;

  return (
    <>
      {/* Qubit A */}
      <LearnBlochSphere
        index={0}
        position={[-1.3, 0.2, 0]}
        label="Qubit A"
      />

      {/* Qubit B */}
      <LearnBlochSphere
        index={1}
        position={[1.3, 0.2, 0]}
        label="Qubit B"
      />

      {/* Entanglement beam */}
      <group position={[0, 0.2, 0]}>
        <EntanglementBeamLearn />
      </group>

      {/* X gate on A (step 1) */}
      {showXOnA && (
        <GateButton3D gate="x" label="X on A" position={[-1.3, 1.5, 0]} pulse onClick={handleXOnA} />
      )}

      {/* Entangle buttons (step 2) */}
      {showEntangleButtons && subStep === 0 && (
        <GateButton3D gate="h" label="H on A" position={[-1.3, 1.5, 0]} pulse onClick={handleHOnA} />
      )}
      {showEntangleButtons && subStep === 1 && (
        <GateButton3D gate="cx" label="CNOT" position={[0, 1.5, 0]} pulse onClick={handleCNOT} />
      )}

      {/* Measure button (step 3) */}
      {showMeasure && (
        <Html position={[0, 1.6, 0]} center distanceFactor={5}>
          <button
            onClick={handleMeasure}
            style={{
              background: '#fbbf24',
              color: '#1c1e28',
              border: 'none',
              borderRadius: 10,
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)',
            }}
          >
            Measure Both
          </button>
        </Html>
      )}

      {/* Free play controls (step 4) */}
      {showFreePlay && (
        <>
          <GateButton3D gate="x" label="X on A" position={[-1.3, 1.5, 0]} onClick={() => applyGate('x', 0)} />
          <GateButton3D gate="h" label="H on A" position={[-0.4, 1.5, 0]} onClick={() => {
            resetQubits();
            setTimeout(() => applyGate('h', 0), 50);
          }} />
          <GateButton3D gate="cx" label="CNOT" position={[0.4, 1.5, 0]} onClick={() => applyGate('cx')} />

          <Html position={[1.3, 1.5, 0]} center distanceFactor={5}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button
                onClick={handleFreePlayMeasure}
                style={{
                  background: '#fbbf24',
                  color: '#1c1e28',
                  border: 'none',
                  borderRadius: 8,
                  padding: '5px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Measure
              </button>
              <button
                onClick={handleFreePlayEntangle}
                style={{
                  background: theme.bg.raised,
                  color: theme.accent.hover,
                  border: `1px solid ${theme.accent.primary}40`,
                  borderRadius: 8,
                  padding: '5px 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Entangle
              </button>
              <button
                onClick={resetQubits}
                style={{
                  background: theme.bg.raised,
                  color: theme.text.secondary,
                  border: `1px solid ${theme.border.medium}`,
                  borderRadius: 8,
                  padding: '5px 12px',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            </div>
          </Html>
        </>
      )}

      {/* Measurement results — positioned between spheres */}
      {(currentStep === 3 || showFreePlay) && twoQubitResults && (
        <Html position={[0, -1.0, 0]} center distanceFactor={5}>
          <div style={{
            background: theme.bg.surface + 'f0',
            border: `1px solid ${theme.border.medium}`,
            borderRadius: 10,
            padding: '10px 16px',
            textAlign: 'center',
            backdropFilter: 'blur(8px)',
          }}>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 9, color: theme.text.tertiary }}>A</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: theme.accent.hover, fontFamily: 'monospace' }}>
                  |{twoQubitResults.a}⟩
                </div>
              </div>
              <div style={{ fontSize: 16, color: '#4ade80' }}>=</div>
              <div>
                <div style={{ fontSize: 9, color: theme.text.tertiary }}>B</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: theme.accent.hover, fontFamily: 'monospace' }}>
                  |{twoQubitResults.b}⟩
                </div>
              </div>
            </div>
            {total > 1 && (
              <div style={{ fontSize: 9, color: '#4ade80', marginTop: 4 }}>
                {correlated}/{total} correlated
              </div>
            )}
            {currentStep === 3 && (
              <button
                onClick={() => {
                  resetQubits();
                  setTimeout(() => {
                    applyGate('h', 0);
                    setTimeout(() => {
                      applyGate('cx');
                      setTimeout(() => measureQubit(0), 100);
                    }, 100);
                  }, 50);
                }}
                style={{
                  marginTop: 6,
                  background: theme.bg.raised,
                  color: theme.text.secondary,
                  border: `1px solid ${theme.border.medium}`,
                  borderRadius: 5,
                  padding: '3px 10px',
                  fontSize: 10,
                  cursor: 'pointer',
                }}
              >
                Measure again
              </button>
            )}
          </div>
        </Html>
      )}
    </>
  );
}
