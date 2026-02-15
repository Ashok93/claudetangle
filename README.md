# Claudetangle

An interactive 3D quantum computing simulator and learning platform. Explore quantum algorithms through immersive visualizations — watch qubits evolve on Bloch spheres, see entanglement beams form between qubits, and step through circuits gate by gate with guided explanations.

Built with React, Three.js, and Zustand. Fully client-side — no backend required.

## Features

### Explore Mode

Load and run pre-built quantum algorithms with full 3D visualization:

- **Bell State** — Two-qubit entanglement (2 qubits)
- **GHZ State** — Three-qubit entanglement (3 qubits)
- **Quantum Teleportation** — State transfer via entanglement (3 qubits)
- **Grover's Search** — Quantum search with quadratic speedup (3 qubits)
- **Deutsch-Jozsa** — Constant vs balanced function detection (3 qubits)
- **Quantum Fourier Transform** — Core subroutine for period-finding (4 qubits)
- **Shor's Algorithm** — Full factorization of 15 with inverse QFT (8 qubits)

Each algorithm includes narrative explanations, probability output bars, and state vector display.

### Guided Walkthrough

Step-by-step mode that auto-pauses at each gate with rich explanations:

- Camera focuses on the active gate
- Overlay card shows what's happening and why
- State change notation (e.g. `|00⟩ → (|00⟩ + |11⟩)/√2`)
- Visual hints for what to watch in the 3D scene
- Continue with button click or Space key
- Custom content for Bell State, generic fallback for all other algorithms

### Learn Mode

Five interactive chapters that teach quantum computing from scratch:

1. **Meet the Qubit** — Superposition, Bloch sphere, classical vs quantum
2. **Quantum Gates** — X, H, Z, S, T gates and interference
3. **Measurement** — Born rule, probability, wave function collapse
4. **Two Qubits & Entanglement** — CNOT, correlation, no-cloning
5. **Your First Circuit** — Build a Bell state, quantum interference challenge

### Sandbox Mode

Free-form circuit builder with 1-4 qubits. Apply gates, measure, and watch states evolve in real time on Bloch spheres.

### 3D Visualization

- Qubit rails with particle flow
- Gate geometries (Hadamard crystals, CNOT bridges, Toffoli triple-connects)
- Bloch sphere panel showing per-qubit state vectors
- Entanglement beams between correlated qubits
- Interference patterns and probability waves
- Bloom post-processing on dark canvas

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19, TypeScript, Tailwind CSS |
| 3D | Three.js, React Three Fiber, Drei, Postprocessing |
| State | Zustand |
| Code Editor | CodeMirror (OpenQASM syntax) |
| Build | Vite |
| Deploy | Vercel |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npx tsc --noEmit -p tsconfig.app.json

# Production build
npm run build
```

## Project Structure

```
src/
├── algorithms/        # Pre-built quantum circuit definitions (OpenQASM)
├── components/
│   ├── three/         # 3D scene: gates, Bloch spheres, overlays, simulation flow
│   ├── ui/            # Toolbar, panels, simulation bar, code editor
│   ├── learn/         # Interactive chapter scenes and lesson content
│   └── sandbox/       # Free-form circuit builder
├── lib/               # Quantum simulator, gate info, theme, constants
├── parser/            # OpenQASM parser and generator
├── store/             # Zustand stores (circuit, learn, sandbox)
└── types/             # TypeScript type definitions
```

## License

MIT
