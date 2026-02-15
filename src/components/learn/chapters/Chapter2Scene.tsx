import { useEffect, useRef, useState } from 'react';
import { useLearnStore } from '../../../store/learnStore';
import { LearnBlochSphere } from '../LearnBlochSphere';
import { GateButton3D } from '../GateButton3D';
import { QuantumWaveLearn } from '../QuantumWaveLearn';

export function Chapter2Scene() {
  const currentStep = useLearnStore((s) => s.currentStep);
  const applyGate = useLearnStore((s) => s.applyGate);
  const resetQubits = useLearnStore((s) => s.resetQubits);
  const qubits = useLearnStore((s) => s.qubits);
  const subStep = useLearnStore((s) => s.subStep);
  const completeInteraction = useLearnStore((s) => s.completeInteraction);
  const prevStepRef = useRef(currentStep);

  // Feedback bubble for free play (phase on basis detection)
  const [feedbackBubble, setFeedbackBubble] = useState<string | undefined>(undefined);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-reset qubit to a clean state before each gate demo step
  useEffect(() => {
    if (currentStep === prevStepRef.current) return;
    prevStepRef.current = currentStep;
    setFeedbackBubble(undefined);

    if (currentStep === 0) {
      resetQubits();
    } else if (currentStep === 1) {
      // X demo: start from |0⟩
      resetQubits();
    } else if (currentStep === 2) {
      // H demo: start from |0⟩
      resetQubits();
    } else if (currentStep === 3) {
      // Z demo: start from superposition so phase flip is visible
      resetQubits();
      setTimeout(() => applyGate('h'), 50);
    } else if (currentStep === 4) {
      // S demo: start from superposition
      resetQubits();
      setTimeout(() => applyGate('h'), 50);
    } else if (currentStep === 5) {
      // Phase on basis: start from |0⟩ so Z does nothing visible
      resetQubits();
    } else if (currentStep === 6) {
      // Interference: start from |0⟩, user applies H→Z→H
      resetQubits();
      useLearnStore.setState({ subStep: 0 });
    } else if (currentStep === 7) {
      // Free play: start from |0⟩
      resetQubits();
    }
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup feedback timer
  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  const highlightGate = (gate: string) => {
    if (currentStep === 1) return gate === 'x';
    if (currentStep === 2) return gate === 'h';
    if (currentStep === 3) return gate === 'z';
    if (currentStep === 4) return gate === 's';
    if (currentStep === 5) return gate === 'z';
    return false;
  };

  const isDisabled = (gate: string) => {
    if (currentStep === 7) return false; // Free play
    if (currentStep === 5) return gate !== 'z'; // Only Z in phase-on-basis step
    if (currentStep === 6) return true; // Interference uses its own buttons
    return !highlightGate(gate) && currentStep < 7;
  };

  const handleGateClick = (gate: 'h' | 'x' | 'z' | 's' | 't') => {
    if (currentStep === 7) {
      // Free play: detect phase on basis state
      const q = useLearnStore.getState().qubits[0];
      const isAtPole = q.amplitude < 0.01 || q.amplitude > 0.99;
      const isPhaseGate = gate === 'z' || gate === 's' || gate === 't';

      applyGate(gate);

      if (isAtPole && isPhaseGate) {
        if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
        setFeedbackBubble("Phase gates don't work at the poles! Try H first.");
        feedbackTimer.current = setTimeout(() => setFeedbackBubble(undefined), 3500);
      } else {
        setFeedbackBubble(undefined);
      }
    } else {
      applyGate(gate);
    }
  };

  // Interference step (step 6): H → Z → H sequence
  const handleInterferenceGate = () => {
    const sub = useLearnStore.getState().subStep;
    if (sub === 0) {
      applyGate('h');
      useLearnStore.setState({ subStep: 1, interactionCompleted: false });
    } else if (sub === 1) {
      applyGate('z');
      useLearnStore.setState({ subStep: 2, interactionCompleted: false });
    } else if (sub === 2) {
      applyGate('h');
      completeInteraction();
    }
  };

  const interferenceLabel = subStep === 0 ? 'H' : subStep === 1 ? 'Z' : 'H';
  const interferenceGate = subStep === 0 ? 'h' : subStep === 1 ? 'z' : 'h';

  // Speech bubble logic
  const getBubble = () => {
    if (currentStep === 0) return "Let's learn gates!";
    if (currentStep === 5) return "I'm at a pole — phase won't move me!";
    if (currentStep === 6 && subStep >= 2) return "I ended at |1⟩! That's interference!";
    if (currentStep === 7) return feedbackBubble;
    return undefined;
  };

  return (
    <>
      <LearnBlochSphere
        index={0}
        position={[0, 0.3, 0]}
        speechBubble={getBubble()}
      />

      {/* Wave visualization */}
      <QuantumWaveLearn index={0} position={[0, -1.1, 0]} />

      {/* Gate buttons — steps 0-5 and 7 (not 6, which has its own) */}
      {currentStep !== 6 && (
        <>
          <GateButton3D gate="x" label="X" position={[-1.4, 0.9, 0]} pulse={highlightGate('x')} onClick={() => handleGateClick('x')} disabled={isDisabled('x')} />
          <GateButton3D gate="h" label="H" position={[-1.0, -0.3, 0]} pulse={highlightGate('h')} onClick={() => handleGateClick('h')} disabled={isDisabled('h')} />
          <GateButton3D gate="z" label="Z" position={[1.0, 0.9, 0]} pulse={highlightGate('z')} onClick={() => handleGateClick('z')} disabled={isDisabled('z')} />
          <GateButton3D gate="s" label="S" position={[1.4, 0.1, 0]} pulse={highlightGate('s')} onClick={() => handleGateClick('s')} disabled={isDisabled('s')} />
          <GateButton3D gate="t" label="T" position={[1.0, -0.5, 0]} pulse={currentStep === 7} onClick={() => handleGateClick('t')} disabled={isDisabled('t')} />
        </>
      )}

      {/* Interference step (step 6): sequential H → Z → H */}
      {currentStep === 6 && (
        <GateButton3D
          gate={interferenceGate}
          label={`${interferenceLabel} (${subStep + 1}/3)`}
          position={[0, 1.5, 0]}
          pulse
          onClick={handleInterferenceGate}
        />
      )}

      {/* Reset button in free play mode */}
      {currentStep === 7 && (
        <GateButton3D gate="measure" label="Reset" position={[0, -1.8, 0]} onClick={resetQubits} />
      )}
    </>
  );
}
