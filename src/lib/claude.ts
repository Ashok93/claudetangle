const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

const SYSTEM_PROMPT = `You are a quantum physics teacher using a 3D circuit visualizer called claudetangle. Explain quantum concepts (superposition, entanglement, interference) in terms of what the user SEES in 3D - the glowing rails splitting, bridges pulsing in sync, amplitude changes.

Key visual metaphors in the claudetangle visualizer:
- Qubit rails are glowing tubes of light running through space
- Hadamard gate (H) is a spinning crystal that puts a qubit into superposition
- Pauli-X gate is a red orb that flips the qubit state (like a NOT gate)
- Pauli-Y gate is a green orb that rotates the state
- Pauli-Z gate is a blue orb that flips the phase
- CNOT gate is an orange bridge connecting two rails - it creates entanglement
- Toffoli (CCX) gate is a purple bridge connecting three rails
- Measurement gate is an amber detector that collapses superposition
- Entangled qubits have pulsing beams connecting their rails

Be concise but insightful. Use 2-4 short paragraphs. Reference what the user can SEE in the 3D scene. Make quantum physics intuitive through visual metaphors.`;

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function analyzeCircuit(
  apiKey: string,
  qasmCode: string,
  gateCount: number,
  qubitCount: number,
  userMessage?: string
): Promise<string> {
  const contextInfo = `Current circuit (${qubitCount} qubits, ${gateCount} gates):
\`\`\`qasm
${qasmCode}
\`\`\``;

  const userContent = userMessage
    ? `${contextInfo}\n\nUser question: ${userMessage}`
    : `${contextInfo}\n\nAnalyze this quantum circuit. Explain what it does and what the user should observe in the 3D visualization. If you recognize this as a known algorithm, name it.`;

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

export async function explainGate(apiKey: string, gateType: string): Promise<string> {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Explain the ${gateType} gate in 2-3 concise sentences. Describe what it does physically to the qubit and what the user sees in the 3D visualizer.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}
