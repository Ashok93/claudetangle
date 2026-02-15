import { useLearnStore } from '../../store/learnStore';
import { useCircuitStore } from '../../store/circuitStore';
import { CHAPTERS } from './chapters/chapterData';
import { LearnCanvas } from './LearnCanvas';
import { LearnOverlay } from './LearnOverlay';
import { theme, semantic } from '../../lib/theme';

function ChapterSelect() {
  const startChapter = useLearnStore((s) => s.startChapter);
  const completedChapters = useLearnStore((s) => s.completedChapters);
  const setUIMode = useCircuitStore((s) => s.setUIMode);

  return (
    <div
      className="h-full w-full flex items-center justify-center"
      style={{ background: theme.bg.base }}
    >
      <div className="flex flex-col items-center gap-6 max-w-[600px] w-full px-6">
        {/* Header */}
        <div className="text-center mb-2">
          <h2 className="text-xl font-bold mb-1" style={{ color: theme.text.primary }}>
            Learn Quantum Computing
          </h2>
          <p className="text-sm" style={{ color: theme.text.tertiary }}>
            Interactive 3D lessons — no prior knowledge needed
          </p>
        </div>

        {/* Chapter cards */}
        <div className="w-full flex flex-col gap-3">
          {CHAPTERS.map((chapter) => {
            const isCompleted = completedChapters.includes(chapter.id);
            return (
              <button
                key={chapter.id}
                onClick={() => startChapter(chapter.id)}
                className="text-left p-5 rounded-xl border transition-all duration-200"
                style={{
                  background: theme.bg.raised,
                  borderColor: isCompleted ? semantic.success + '40' : theme.border.subtle,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.accent.primary + '60';
                  e.currentTarget.style.background = theme.bg.surface;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isCompleted ? semantic.success + '40' : theme.border.subtle;
                  e.currentTarget.style.background = theme.bg.raised;
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: isCompleted ? semantic.success + '20' : theme.accent.primary + '20',
                        color: isCompleted ? semantic.success : theme.accent.hover,
                      }}
                    >
                      {isCompleted ? '\u2713' : chapter.id}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: theme.text.primary }}>
                      {chapter.title}
                    </span>
                  </div>
                  <span className="text-[11px]" style={{ color: theme.text.tertiary }}>
                    {chapter.steps.length} steps
                  </span>
                </div>
                <p className="text-[13px] ml-9" style={{ color: theme.text.tertiary }}>
                  {chapter.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Back to programs */}
        <button
          onClick={() => setUIMode('explore')}
          className="px-6 py-2 rounded-lg text-sm transition-colors border"
          style={{
            background: 'transparent',
            color: theme.text.secondary,
            borderColor: theme.border.medium,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.accent.primary;
            e.currentTarget.style.color = theme.accent.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.border.medium;
            e.currentTarget.style.color = theme.text.secondary;
          }}
        >
          &larr; Back to Programs
        </button>
      </div>
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
