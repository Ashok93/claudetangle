import { useEffect, useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import { useLearnStore } from '../../../store/learnStore';
import { LearnBlochSphere } from '../LearnBlochSphere';
import { GateButton3D } from '../GateButton3D';
import { QuantumWaveLearn } from '../QuantumWaveLearn';
import { theme } from '../../../lib/theme';

export function Chapter3Scene() {
  const currentStep = useLearnStore((s) => s.currentStep);
  const applyGate = useLearnStore((s) => s.applyGate);
  const measureQubit = useLearnStore((s) => s.measureQubit);
  const addSingleMeasurement = useLearnStore((s) => s.addSingleMeasurement);
  const completeInteraction = useLearnStore((s) => s.completeInteraction);
  const setQubitState = useLearnStore((s) => s.setQubitState);
  const measurementResult = useLearnStore((s) => s.measurementResult);
  const measurementHistory = useLearnStore((s) => s.measurementHistory);
  const resetQubits = useLearnStore((s) => s.resetQubits);
  const qubits = useLearnStore((s) => s.qubits);

  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const measureProbRef = useRef(0.5); // Store prob before animation starts
  const prevStepRef = useRef(currentStep);

  // Auto-setup on step transitions
  useEffect(() => {
    if (currentStep === prevStepRef.current) return;
    prevStepRef.current = currentStep;

    if (currentStep === 0) {
      resetQubits();
      setTimeout(() => applyGate('h'), 300);
    } else if (currentStep === 4) {
      // Nudge step: reset to superposition first, user clicks Nudge to tilt
      resetQubits();
      setTimeout(() => applyGate('h'), 50);
    } else if (currentStep === 6) {
      // Free play: start fresh
      resetQubits();
    }
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup animation interval
  useEffect(() => {
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, []);

  const handleRun100 = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    // Capture current qubit probability before measurements
    const q = useLearnStore.getState().qubits[0];
    measureProbRef.current = q.amplitude;

    let count = 0;
    const batchSize = 3;
    animationRef.current = setInterval(() => {
      for (let i = 0; i < batchSize && count < 100; i++) {
        addSingleMeasurement(measureProbRef.current);
        count++;
      }
      if (count >= 100) {
        if (animationRef.current) clearInterval(animationRef.current);
        animationRef.current = null;
        setIsAnimating(false);
        completeInteraction();
      }
    }, 30);
  };

  const handleNudge = () => {
    // Set qubit to ~75% |1⟩ (tilted toward south pole)
    const q = useLearnStore.getState().qubits[0];
    setQubitState(0, 0.75, q.phase);
    completeInteraction();
  };

  const handleFreePlayMeasure = () => {
    // Reset to current state (re-prepare), then measure
    const q = useLearnStore.getState().qubits[0];
    resetQubits();
    setTimeout(() => {
      setQubitState(0, q.amplitude, q.phase);
      setTimeout(() => measureQubit(0), 50);
    }, 50);
  };

  const showMeasureButton = currentStep === 1;
  const showRun100Step2 = currentStep === 2;
  const showNudge = currentStep === 4;
  const showRun100Step5 = currentStep === 5;
  const showFreePlay = currentStep === 6;
  const showHistogram = measurementHistory.length > 0 && (currentStep <= 3 || currentStep >= 5);

  const zeros = measurementHistory.filter((r) => r === 0).length;
  const ones = measurementHistory.filter((r) => r === 1).length;
  const total = measurementHistory.length;

  const q = qubits[0];
  const prob0 = ((1 - q.amplitude) * 100).toFixed(0);
  const prob1 = (q.amplitude * 100).toFixed(0);

  const speechBubble = currentStep === 0 ? "I'm in superposition!" :
    currentStep === 1 ? "Measure me!" :
    currentStep === 4 ? `Now I'm ${prob1}% likely to be |1⟩!` :
    currentStep === 6 ? "Set my state and measure!" :
    undefined;

  return (
    <>
      <LearnBlochSphere
        index={0}
        position={[showHistogram ? -0.6 : 0, 0.3, 0]}
        speechBubble={speechBubble}
      />

      {/* Wave visualization */}
      <QuantumWaveLearn index={0} position={[showHistogram ? -0.6 : 0, -1.1, 0]} />

      {/* Measure button (step 1) */}
      {showMeasureButton && (
        <Html position={[1.4, 0.9, 0]} center distanceFactor={5}>
          <button
            onClick={() => {
              resetQubits();
              setTimeout(() => {
                applyGate('h');
                setTimeout(() => measureQubit(0), 100);
              }, 50);
            }}
            style={{
              background: '#fbbf24',
              color: '#1c1e28',
              border: 'none',
              borderRadius: 10,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)',
            }}
          >
            Measure
          </button>
        </Html>
      )}

      {/* Measurement result display (step 1) */}
      {currentStep === 1 && measurementResult !== null && (
        <Html position={[1.4, 0.4, 0]} center distanceFactor={5}>
          <div style={{
            background: theme.bg.surface + 'f0',
            border: `1px solid ${theme.border.medium}`,
            borderRadius: 10,
            padding: '8px 14px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: theme.text.tertiary }}>Result</div>
            <div style={{
              fontSize: 24,
              fontWeight: 700,
              color: measurementResult === 0 ? theme.accent.hover : '#f87171',
              fontFamily: 'monospace',
            }}>
              |{measurementResult}⟩
            </div>
          </div>
        </Html>
      )}

      {/* Run 100x button (step 2) */}
      {showRun100Step2 && (
        <Html position={[1.4, 0.8, 0]} center distanceFactor={5}>
          <button
            onClick={handleRun100}
            disabled={isAnimating}
            style={{
              background: isAnimating ? '#92710c' : '#fbbf24',
              color: '#1c1e28',
              border: 'none',
              borderRadius: 10,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 700,
              cursor: isAnimating ? 'wait' : 'pointer',
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)',
            }}
          >
            {isAnimating ? `Running... ${total}` : 'Run 100\u00D7'}
          </button>
        </Html>
      )}

      {/* Nudge button (step 4) */}
      {showNudge && (
        <Html position={[1.4, 0.5, 0]} center distanceFactor={5}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            <button
              onClick={handleNudge}
              style={{
                background: '#a855f7',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)',
              }}
            >
              Nudge toward |1⟩
            </button>
            <div style={{ fontSize: 10, color: theme.text.tertiary }}>
              Tilts from 50/50 to ~75/25
            </div>
          </div>
        </Html>
      )}

      {/* Run 100x button (step 5 — skewed) */}
      {showRun100Step5 && (
        <Html position={[1.4, 0.8, 0]} center distanceFactor={5}>
          <button
            onClick={handleRun100}
            disabled={isAnimating}
            style={{
              background: isAnimating ? '#92710c' : '#fbbf24',
              color: '#1c1e28',
              border: 'none',
              borderRadius: 10,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 700,
              cursor: isAnimating ? 'wait' : 'pointer',
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)',
            }}
          >
            {isAnimating ? `Running... ${total}` : 'Run 100\u00D7'}
          </button>
        </Html>
      )}

      {/* Free play controls (step 6) */}
      {showFreePlay && (
        <>
          <GateButton3D gate="h" label="H" position={[-1.4, 0.9, 0]} onClick={() => applyGate('h')} />
          <GateButton3D gate="x" label="X" position={[-1.0, -0.3, 0]} onClick={() => applyGate('x')} />
          <GateButton3D gate="measure" label="Reset" position={[0, -1.8, 0]} onClick={() => {
            resetQubits();
            setTimeout(() => applyGate('h'), 50);
          }} />

          <Html position={[1.4, 0.8, 0]} center distanceFactor={5}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
              <button
                onClick={handleFreePlayMeasure}
                style={{
                  background: '#fbbf24',
                  color: '#1c1e28',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Measure
              </button>
              <button
                onClick={handleRun100}
                disabled={isAnimating}
                style={{
                  background: isAnimating ? '#92710c' : '#fbbf24',
                  color: '#1c1e28',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: isAnimating ? 'wait' : 'pointer',
                }}
              >
                {isAnimating ? `${total}...` : 'Run 100\u00D7'}
              </button>
            </div>
          </Html>
        </>
      )}

      {/* Histogram */}
      {showHistogram && (
        <Html position={[1.2, -0.4, 0]} center distanceFactor={5}>
          <div style={{
            background: theme.bg.surface + 'f0',
            border: `1px solid ${theme.border.medium}`,
            borderRadius: 10,
            padding: '10px 14px',
            backdropFilter: 'blur(8px)',
            minWidth: 130,
          }}>
            <div style={{ fontSize: 10, color: theme.text.tertiary, marginBottom: 6 }}>
              {total} measurement{total !== 1 ? 's' : ''}
            </div>
            <div style={{ display: 'flex', alignItems: 'end', gap: 14, height: 60 }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  width: 36,
                  height: Math.max(3, (zeros / Math.max(total, 1)) * 50),
                  background: theme.accent.primary,
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 0.15s ease-out',
                  margin: '0 auto',
                }} />
                <div style={{ fontSize: 9, color: theme.text.secondary, marginTop: 3 }}>|0⟩</div>
                <div style={{ fontSize: 11, color: theme.text.primary, fontFamily: 'monospace', fontWeight: 600 }}>
                  {total > 0 ? ((zeros / total) * 100).toFixed(0) : 0}%
                </div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  width: 36,
                  height: Math.max(3, (ones / Math.max(total, 1)) * 50),
                  background: '#f87171',
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 0.15s ease-out',
                  margin: '0 auto',
                }} />
                <div style={{ fontSize: 9, color: theme.text.secondary, marginTop: 3 }}>|1⟩</div>
                <div style={{ fontSize: 11, color: theme.text.primary, fontFamily: 'monospace', fontWeight: 600 }}>
                  {total > 0 ? ((ones / total) * 100).toFixed(0) : 0}%
                </div>
              </div>
            </div>
          </div>
        </Html>
      )}
    </>
  );
}
