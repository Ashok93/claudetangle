import * as THREE from 'three';
import { THEME_GATE_COLORS, theme } from './theme';
import type { GateType } from '../types/circuit';

// Layout
export const QUBIT_SPACING = 2;
export const STEP_SPACING = 2.5;
export const RAIL_RADIUS = 0.04;
export const RAIL_LENGTH = 30;

// Gate colors — from theme
export const GATE_COLORS = THEME_GATE_COLORS;

// Three.js color objects — dynamically generated from theme
export const GATE_THREE_COLORS: Record<string, THREE.Color> = Object.fromEntries(
  Object.entries(THEME_GATE_COLORS).map(([key, val]) => [key, new THREE.Color(val)])
);

// Rail colors — muted
export const RAIL_COLOR = '#64748b';
export const RAIL_EMISSIVE = '#475569';

// Scene
export const BACKGROUND_COLOR = theme.bg.base;
export const GRID_COLOR = theme.border.subtle;

// Bloom — reduced
export const BLOOM_INTENSITY = 0.6;
export const BLOOM_LUMINANCE_THRESHOLD = 0.6;
export const BLOOM_LUMINANCE_SMOOTHING = 0.9;

// Animation
export const GATE_FLOAT_SPEED = 1;
export const GATE_FLOAT_INTENSITY = 0.1;
export const GATE_ROTATION_SPEED = 0.5;
