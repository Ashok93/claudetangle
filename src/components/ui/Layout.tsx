import { useState, useCallback } from 'react';
import { QuantumScene } from '../three/QuantumScene';
import { CodeEditor } from './CodeEditor';
import { Toolbar } from './Toolbar';
import { GateInfo } from './GateInfo';
import { OutputPanel } from './OutputPanel';
import { SimulationBar } from './SimulationBar';
import { ProgramSelector } from './ProgramSelector';
import { LearnMode } from '../learn/LearnMode';
import { useCircuitStore } from '../../store/circuitStore';
import { theme } from '../../lib/theme';

export function Layout() {
  const uiMode = useCircuitStore((s) => s.uiMode);
  const simulation = useCircuitStore((s) => s.simulation);
  const gates = useCircuitStore((s) => s.gates);
  const [editorWidth, setEditorWidth] = useState(320);
  const [showEditor, setShowEditor] = useState(true);
  const isHomeScreen = uiMode === 'explore' && simulation === 'idle' && gates.length === 0;
  const [isDraggingEditor, setIsDraggingEditor] = useState(false);

  const handleEditorDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingEditor(true);

    const startX = e.clientX;
    const startWidth = editorWidth;

    const onMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      setEditorWidth(Math.max(200, Math.min(600, startWidth + delta)));
    };

    const onMouseUp = () => {
      setIsDraggingEditor(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [editorWidth]);

  if (uiMode === 'learn') {
    return (
      <div className="h-dvh w-screen flex flex-col overflow-hidden" style={{ background: theme.bg.base }}>
        <div className="flex-1 overflow-hidden">
          <LearnMode />
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh w-screen flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]" style={{ background: theme.bg.base }}>
      {/* Top bar: Toolbar */}
      <Toolbar />

      {/* Simulation transport bar — below toolbar, above content */}
      <SimulationBar />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor Panel — hidden on home screen and on mobile */}
        {!isHomeScreen && showEditor && (
          <>
            <div style={{ width: editorWidth, minWidth: 200 }} className="hidden md:block flex-shrink-0 h-full">
              <CodeEditor />
            </div>
            <div
              onMouseDown={handleEditorDrag}
              className="hidden md:block w-1 flex-shrink-0 cursor-col-resize transition-colors"
              style={{
                background: isDraggingEditor ? theme.accent.primary : theme.border.subtle,
              }}
            />
          </>
        )}

        {/* 3D Scene — fills remaining space */}
        <div className="flex-1 relative min-w-0">
          <QuantumScene />
          <GateInfo />
          <OutputPanel />
          <ProgramSelector />

          {/* Code toggle — hidden on home screen and on mobile */}
          {!isHomeScreen && (
            <div className="absolute top-2 left-2 hidden md:flex gap-1 z-20">
              <button
                onClick={() => setShowEditor(!showEditor)}
                className="px-3 py-1.5 text-[11px] rounded transition-colors border"
                style={{
                  background: showEditor ? theme.accent.primary + '20' : theme.bg.raised,
                  color: showEditor ? theme.accent.hover : theme.text.tertiary,
                  borderColor: showEditor ? theme.accent.primary + '30' : theme.border.subtle,
                }}
              >
                {showEditor ? '\u2190 Hide Code' : 'Code'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
