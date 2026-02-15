// Design system tokens — single source of truth for all colors
export const theme = {
  bg: {
    base: '#0f1117',
    surface: '#161820',
    raised: '#1c1e28',
  },
  border: {
    subtle: '#232530',
    medium: '#2e3040',
  },
  text: {
    primary: '#e8e9ed',
    secondary: '#9b9db0',
    tertiary: '#5f6177',
  },
  accent: {
    primary: '#6366f1',
    hover: '#818cf8',
  },
} as const;

// Muted gate colors — Tailwind -400 variants
export const THEME_GATE_COLORS: Record<string, string> = {
  h: '#22d3ee',      // cyan-400
  x: '#f87171',      // red-400
  y: '#4ade80',      // green-400
  z: '#60a5fa',      // blue-400
  s: '#a78bfa',      // violet-400
  sdg: '#a78bfa',    // violet-400
  t: '#c084fc',      // purple-400
  tdg: '#c084fc',    // purple-400
  cx: '#fb923c',     // orange-400
  ccx: '#e879f9',    // fuchsia-400
  swap: '#2dd4bf',   // teal-400
  cz: '#fb7185',     // rose-400
  cs: '#fb7185',     // rose-400
  csdg: '#fb7185',   // rose-400
  ct: '#f472b6',     // pink-400
  ctdg: '#f472b6',   // pink-400
  cr4: '#f472b6',    // pink-400
  cr4dg: '#f472b6',  // pink-400
  measure: '#fbbf24', // amber-400
} as const;
