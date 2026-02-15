import { useState, useCallback } from 'react';
import { Layout } from './components/ui/Layout';
import { Onboarding } from './components/ui/Onboarding';
import { LandingPage } from './components/landing/LandingPage';
import { useCircuitStore } from './store/circuitStore';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('claudetangle-onboarded') && !localStorage.getItem('qflux-onboarded');
  });

  const handleLandingEnter = useCallback((mode?: string) => {
    if (mode === 'learn') {
      useCircuitStore.getState().setUIMode('learn');
    }
    setShowLanding(false);
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    localStorage.setItem('claudetangle-onboarded', 'true');
    setShowOnboarding(false);
  }, []);

  if (showLanding) {
    return <LandingPage onEnter={handleLandingEnter} />;
  }

  return (
    <>
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      <Layout />
    </>
  );
}

export default App;
