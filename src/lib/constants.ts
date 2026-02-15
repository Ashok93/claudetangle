import * as THREE from 'three';
import { THEME_GATE_COLORS } from './theme';
// Layout
export const QUBIT_SPACING = 2;
export const STEP_SPACING = 2.5;
export const RAIL_RADIUS = 0.04;
export const RAIL_LENGTH = 30; // static fallback — prefer useRailLength() for dynamic sizing
export const RAIL_MIN_LENGTH = 8; // minimum rail for empty circuits
export const RAIL_PADDING_STEPS = 2; // extra steps past last gate

// Gate colors — from theme
export const GATE_COLORS = THEME_GATE_COLORS;

// Three.js color objects — dynamically generated from theme
export const GATE_THREE_COLORS: Record<string, THREE.Color> = Object.fromEntries(
  Object.entries(THEME_GATE_COLORS).map(([key, val]) => [key, new THREE.Color(val)])
);

// Rail colors — visible on dark background
export const RAIL_COLOR = '#3a4560';
export const RAIL_EMISSIVE = '#4a5a80';

// Scene — dark navy 3D canvas for vivid visualization
export const BACKGROUND_COLOR = '#0e1525';
export const GRID_COLOR = '#1c2640';

// Bloom — punchy for dark background
export const BLOOM_INTENSITY = 0.5;
export const BLOOM_LUMINANCE_THRESHOLD = 0.6;
export const BLOOM_LUMINANCE_SMOOTHING = 0.9;

// Animation
export const GATE_FLOAT_SPEED = 1;
export const GATE_FLOAT_INTENSITY = 0.1;
export const GATE_ROTATION_SPEED = 0.5;
