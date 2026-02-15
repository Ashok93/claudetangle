import { useLearnStore } from '../../store/learnStore';
import { useCircuitStore } from '../../store/circuitStore';
import { CHAPTERS } from './chapters/chapterData';
import { LearnCanvas } from './LearnCanvas';
import { LearnOverlay } from './LearnOverlay';
import { theme, semantic } from '../../lib/theme';

const CHAPTER_ICONS = [
  '\u{1F30D}', // 1: globe — Meet the Qubit
  '\u{26A1}',  // 2: lightning — Quantum Gates
  '\u{1F3AF}', // 3: target — Measurement
  '\u{1F517}', // 4: chain — Entanglement
  '\u{1F680}', // 5: rocket — Your First Circuit
];

function ChapterSelect() {
  const startChapter = useLearnStore((s) => s.startChapter);
  const completedChapters = useLearnStore((s) => s.completedChapters);
  const setUIMode = useCircuitStore((s) => s.setUIMode);
  const allCompleted = completedChapters.length === CHAPTERS.length;

  return (
    <div
      className="h-full w-full flex items-center justify-center overflow-y-auto"
      style={{ background: `linear-gradient(135deg, ${theme.bg.base} 0%, #f0f1f8 50%, ${theme.bg.base} 100%)` }}
    >
      <div className="flex flex-col items-center gap-5 max-w-[600px] w-full px-6 py-8">
        {/* Header */}
        <div className="text-center mb-1" style={{ animation: 'learnFadeDown 0.5s ease-out' }}>
          <h2
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{
              color: theme.text.primary,
              letterSpacing: '-0.02em',
            }}
          >
            Learn Quantum Computing
          </h2>
          <p className="text-sm" style={{ color: theme.text.tertiary }}>
            Interactive 3D lessons from bits to entanglement
          </p>
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {CHAPTERS.map((ch) => {
              const done = completedChapters.includes(ch.id);
              return (
                <div
                  key={ch.id}
                  className="rounded-full transition-all duration-500"
                  style={{
                    width: done ? 20 : 8,
                    height: 8,
                    background: done ? semantic.success : theme.border.medium,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Chapter cards */}
        <div className="w-full flex flex-col gap-3">
          {CHAPTERS.map((chapter, idx) => {
            const isCompleted = completedChapters.includes(chapter.id);
            const delay = idx * 60;
            return (
              <button
                key={chapter.id}
                onClick={() => startChapter(chapter.id)}
                className="text-left p-5 rounded-xl border transition-all duration-200 group"
                style={{
                  background: theme.bg.surface,
                  borderColor: isCompleted ? semantic.success + '40' : theme.border.subtle,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  animation: `learnFadeUp 0.4s ease-out ${delay}ms both`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = isCompleted ? semantic.success + '80' : theme.accent.primary + '60';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isCompleted ? semantic.success + '40' : theme.border.subtle;
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-sm"
                      style={{
                        background: isCompleted ? semantic.success + '15' : theme.accent.primary + '10',
                      }}
                    >
                      {isCompleted ? (
                        <span style={{ color: semantic.success, fontSize: 14, fontWeight: 700 }}>{'\u2713'}</span>
                      ) : (
                        <span style={{ fontSize: 16 }}>{CHAPTER_ICONS[idx]}</span>
                      )}
                    </span>
                    <span className="text-[15px] font-semibold" style={{ color: theme.text.primary }}>
                      {chapter.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full" style={{
                    background: theme.bg.raised,
                    color: theme.text.tertiary,
                  }}>
                    {chapter.steps.length} steps
                  </span>
                </div>
                <p className="text-[13px] ml-11" style={{ color: theme.text.tertiary }}>
                  {chapter.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Skip and explore */}
        <button
          onClick={() => setUIMode('explore')}
          className="px-6 py-2.5 rounded-lg text-[13px] transition-all border"
          style={{
            background: 'transparent',
            color: theme.text.tertiary,
            borderColor: theme.border.subtle,
            animation: `learnFadeUp 0.4s ease-out ${CHAPTERS.length * 60 + 100}ms both`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.accent.primary + '60';
            e.currentTarget.style.color = theme.accent.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.border.subtle;
            e.currentTarget.style.color = theme.text.tertiary;
          }}
        >
          {allCompleted ? 'Back to explore \u203A' : 'Skip and explore \u203A'}
        </button>
      </div>

      <style>{`
        @keyframes learnFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes learnFadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export function LearnMode() {
  const showChapterSelect = useLearnStore((s) => s.showChapterSelect);
  const currentChapter = useLearnStore((s) => s.currentChapter);

  if (showChapterSelect || currentChapter === 0) {
    return <ChapterSelect />;
  }

  return (
    <div className="h-full w-full relative" style={{ background: theme.bg.base }}>
      <LearnCanvas />
      <LearnOverlay />
    </div>
  );
}
