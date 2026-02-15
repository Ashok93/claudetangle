import { useState, useCallback } from 'react';
import Markdown from 'react-markdown';
import { useCircuitStore } from '../../store/circuitStore';
import { generateQASM } from '../../parser/qasmGenerator';
import { analyzeCircuit } from '../../lib/claude';
import { theme, semantic } from '../../lib/theme';

export function AIPanel() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('claude-api-key') || '');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [userMessage, setUserMessage] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  const qubits = useCircuitStore((s) => s.qubits);
  const gates = useCircuitStore((s) => s.gates);

  const handleApiKeyChange = useCallback((key: string) => {
    setApiKey(key);
    localStorage.setItem('claude-api-key', key);
  }, []);

  const handleAnalyze = useCallback(async (message?: string) => {
    if (!apiKey) {
      setError('Please enter your Claude API key');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const qasm = generateQASM(qubits, gates);
      const result = await analyzeCircuit(apiKey, qasm, gates.length, qubits, message);
      setResponse(result);
      setUserMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [apiKey, qubits, gates]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 px-3 py-2 text-white rounded-lg shadow-lg text-sm transition-colors"
        style={{ background: theme.accent.primary }}
      >
        AI Sidekick
      </button>
    );
  }

  return (
    <div className="h-full flex flex-col border-l" style={{ background: theme.bg.surface, borderColor: theme.border.subtle }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: theme.border.subtle, background: theme.bg.raised }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: theme.accent.primary }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.accent.primary }}>AI Sidekick</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-sm leading-none" style={{ color: theme.text.tertiary }}>
          ×
        </button>
      </div>

      {/* API Key */}
      <div className="px-4 py-3 border-b" style={{ borderColor: theme.border.subtle }}>
        <input
          type="password"
          placeholder="Claude API Key"
          value={apiKey}
          onChange={(e) => handleApiKeyChange(e.target.value)}
          className="w-full px-2 py-1 text-sm rounded focus:outline-none"
          style={{
            background: theme.bg.raised,
            border: `1px solid ${theme.border.medium}`,
            color: theme.text.secondary,
          }}
        />
      </div>

      {/* Response area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {error && (
          <div className="text-sm px-2 py-1.5 rounded mb-2" style={{ color: semantic.error, background: semantic.error + '15' }}>{error}</div>
        )}
        {loading && (
          <div className="flex items-center gap-2 text-sm" style={{ color: theme.accent.primary }}>
            <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: theme.accent.primary, borderTopColor: 'transparent' }} />
            Analyzing circuit...
          </div>
        )}
        {response && !loading && (
          <div className="prose prose-sm max-w-none text-sm leading-relaxed" style={{ color: theme.text.secondary }}>
            <Markdown>{response}</Markdown>
          </div>
        )}
        {!response && !loading && !error && (
          <div className="text-sm text-center mt-8" style={{ color: theme.text.tertiary }}>
            Click "Analyze" to let Claude explain your quantum circuit
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-t" style={{ borderColor: theme.border.subtle, background: theme.bg.raised }}>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze(userMessage || undefined)}
            placeholder="Ask about the circuit..."
            className="flex-1 px-2 py-1 text-sm rounded focus:outline-none"
            style={{
              background: theme.bg.surface,
              border: `1px solid ${theme.border.medium}`,
              color: theme.text.secondary,
            }}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleAnalyze()}
            disabled={loading}
            className="flex-1 px-2 py-1.5 text-sm text-white rounded transition-colors disabled:opacity-50"
            style={{ background: theme.accent.primary }}
          >
            Analyze
          </button>
          <button
            onClick={() => handleAnalyze("What happens if I measure all qubits? What are the possible outcomes and their probabilities?")}
            disabled={loading}
            className="flex-1 px-2 py-1.5 text-sm rounded transition-colors border"
            style={{
              background: theme.bg.surface,
              color: theme.accent.primary,
              borderColor: theme.border.medium,
            }}
          >
            What if...?
          </button>
        </div>
      </div>
    </div>
  );
}
