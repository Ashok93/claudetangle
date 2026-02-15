// Design system tokens — single source of truth for all colors
export const theme = {
  bg: {
    base: '#ffffff',       // pure white page background
    surface: '#ffffff',    // white cards/panels
    raised: '#f5f6fa',    // very light gray for inputs/elevated elements
  },
  border: {
    subtle: '#e8eaef',    // fine dividers
    medium: '#d4d7e0',    // card borders
  },
  text: {
    primary: '#111827',   // near-black headings (gray-900)
    secondary: '#374151',  // body text (gray-700, WCAG AA)
    tertiary: '#6b7280',   // labels, hints (gray-500)
  },
  accent: {
    primary: '#4f46e5',   // indigo-600
    hover: '#6366f1',     // indigo-500
  },
} as const;

// Dark theme for HTML overlays rendered inside R3F canvases
export const theme3d = {
  bg: { surface: '#161820', raised: '#1c1e28' },
  border: { subtle: '#232530', medium: '#2e3040' },
  text: { primary: '#e8e9ed', secondary: '#9b9db0', tertiary: '#5f6177' },
  accent: { primary: '#6366f1', hover: '#818cf8' },
} as const;

// Semantic status colors
export const semantic = {
  success: '#16a34a',   // green-600
  error: '#dc2626',     // red-600
  warning: '#d97706',   // amber-600
} as const;

// Gate colors — Tailwind -600 variants for light background contrast
export const THEME_GATE_COLORS: Record<string, string> = {
  h: '#0891b2',      // cyan-600
  x: '#dc2626',      // red-600
  y: '#16a34a',      // green-600
  z: '#2563eb',      // blue-600
  s: '#7c3aed',      // violet-600
  sdg: '#7c3aed',    // violet-600
  t: '#9333ea',      // purple-600
  tdg: '#9333ea',    // purple-600
  cx: '#ea580c',     // orange-600
  ccx: '#c026d3',    // fuchsia-600
  swap: '#0d9488',   // teal-600
  cz: '#e11d48',     // rose-600
  cs: '#e11d48',     // rose-600
  csdg: '#e11d48',   // rose-600
  ct: '#db2777',     // pink-600
  ctdg: '#db2777',   // pink-600
  cr4: '#db2777',    // pink-600
  cr4dg: '#db2777',  // pink-600
  measure: '#d97706', // amber-600
} as const;
