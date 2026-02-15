import { useEffect, useState, useCallback } from 'react';
import { Layout } from './components/ui/Layout';
import { Onboarding } from './components/ui/Onboarding';
import { theme } from './lib/theme';

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [opacity, setOpacity] = useState(1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setOpacity(0);
            setTimeout(onComplete, 500);
          }, 300);
          return 100;
        }
        return p + Math.random() * 15 + 5;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-500"
      style={{ opacity, background: theme.bg.base }}
    >
      <div className="relative mb-8">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white"
          style={{ background: theme.accent.primary }}
        >
          Q
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-1 tracking-wider" style={{ color: theme.text.primary }}>Q-Flux</h1>
      <p className="text-sm mb-8" style={{ color: theme.text.tertiary }}>3D Quantum Circuit Visualizer</p>
      <div className="w-48 h-1 rounded-full overflow-hidden" style={{ background: theme.bg.raised }}>
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{ width: `${Math.min(progress, 100)}%`, background: theme.accent.primary }}
        />
      </div>
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('qflux-onboarded');
  });

  const handleOnboardingComplete = useCallback(() => {
    localStorage.setItem('qflux-onboarded', 'true');
    setShowOnboarding(false);
  }, []);

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      {!loading && showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      <Layout />
    </>
  );
}

export default App;
