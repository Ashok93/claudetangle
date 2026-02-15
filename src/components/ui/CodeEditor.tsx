import { useEffect, useRef, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { useCircuitStore } from '../../store/circuitStore';
import { parseQASM } from '../../parser/qasmParser';
import { generateQASM } from '../../parser/qasmGenerator';
import { theme } from '../../lib/theme';

// Track whether the code change came from the user or from sync
let isSyncing = false;

// Custom light theme for CodeMirror
const lightTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '14px',
    backgroundColor: '#ffffff',
  },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
  '.cm-content': {
    padding: '12px 0',
    caretColor: '#4f46e5',
  },
  '.cm-gutters': {
    backgroundColor: '#f8f9fc',
    borderRight: '1px solid #e2e4ea',
    color: '#8b90a5',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#f0f1f5',
  },
  '.cm-activeLine': {
    backgroundColor: '#f0f1f520',
  },
  '.cm-cursor': {
    borderLeftColor: '#4f46e5',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: '#4f46e520',
  },
  '.cm-line': {
    color: '#1a1d2d',
  },
});

export function CodeEditor() {
  const viewRef = useRef<EditorView | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const qubits = useCircuitStore((s) => s.qubits);
  const gates = useCircuitStore((s) => s.gates);
  const loadGates = useCircuitStore((s) => s.loadGates);

  const handleCodeChange = useCallback(
    (code: string) => {
      if (isSyncing) return;
      const result = parseQASM(code);
      if (result.gates.length > 0 || code.includes('qreg')) {
        isSyncing = true;
        loadGates(result.qubits, result.gates);
        isSyncing = false;
      }
    },
    [loadGates]
  );

  // Initialize editor
  useEffect(() => {
    if (!containerRef.current) return;

    const initialCode = generateQASM(qubits, gates);

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        handleCodeChange(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: initialCode,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        history(),
        bracketMatching(),
        syntaxHighlighting(defaultHighlightStyle),
        javascript(),
        lightTheme,
        keymap.of([...defaultKeymap, ...historyKeymap]),
        updateListener,
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync store → editor (when gates change from outside the editor, e.g., drag-and-drop or blueprint)
  useEffect(() => {
    if (!viewRef.current || isSyncing) return;

    const newCode = generateQASM(qubits, gates);
    const currentCode = viewRef.current.state.doc.toString();

    if (newCode !== currentCode) {
      isSyncing = true;
      viewRef.current.dispatch({
        changes: { from: 0, to: currentCode.length, insert: newCode },
      });
      isSyncing = false;
    }
  }, [qubits, gates]);

  return (
    <div className="h-full flex flex-col">
      <div
        className="flex items-center px-4 py-3 border-b"
        style={{ background: theme.bg.raised, borderColor: theme.border.subtle }}
      >
        <span className="text-xs font-mono" style={{ color: theme.text.tertiary }}>OpenQASM 2.0</span>
      </div>
      <div ref={containerRef} className="flex-1 overflow-hidden" />
    </div>
  );
}
