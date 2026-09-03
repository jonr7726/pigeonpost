// The ONLY file in the repo where a colour literal may appear
// (checked by scripts/check_palette.sh — swap a palette, swap this file).
// Two palettes implement the same token set; components consume tokens, never
// these values, via ThemeProvider/useTheme.
import type { Palette } from './theme';

// Dark — the product identity, ported from privacymogul globals.css.
export const dark: Palette = {
  bg: '#14100b',
  bgGlow: 'radial-gradient(circle at 50% -10%, rgba(201,162,75,0.12), transparent 55%), radial-gradient(circle at 100% 100%, rgba(184,115,51,0.08), transparent 50%)',
  panel: '#1f1812',
  panelEdge: 'rgba(201,162,75,0.28)',
  panelSheen: 'inset 0 1px 0 rgba(201,162,75,0.18)',
  text: '#ece3cf',
  textDim: '#ece3cf9e',
  accent: '#c9a24b',
  accentAlt: '#b87333',
  success: '#4a7c6f',
  error: '#c0453a',
  warning: '#b8860b',
  overlay: 'rgba(20,16,11,0.6)',
  hairline: '#c9a24b26',
  band: 'linear-gradient(180deg, #241c14, #1b140d)',
  paper: '#e3d8c0',
  ink: '#2a2118',
  wax: '#8b2f28',
};

// Light ("parchment") — same tokens, re-derived for contrast on paper.
// Accent is the dark accents re-derived; raw brass fails contrast on cream.
export const light: Palette = {
  bg: '#ece3cf',
  bgGlow: 'radial-gradient(circle at 50% -10%, rgba(255,250,235,0.55), transparent 55%)',
  panel: '#e0d6ba',
  panelEdge: 'rgba(112,84,20,0.35)',
  panelSheen: 'inset 0 1px 0 rgba(255,252,240,0.5)',
  text: '#1f1812',
  textDim: '#2a2118b8',
  accent: '#8a6a1f',
  accentAlt: '#8f4e1e',
  success: '#3c655a',
  error: '#a33830',
  warning: '#8a6508',
  overlay: 'rgba(42,33,24,0.35)',
  hairline: 'rgba(112,84,20,0.15)',
  band: 'linear-gradient(180deg, #e8ddc4, #ded2b2)',
  paper: '#f6efdd',
  ink: '#2a2118',
  wax: '#8b2f28',
};

export const palettes: Record<'dark' | 'light', Palette> = { dark, light };

// Non-token constants used by the chrome overlays (scrollbar etc.) — still
// named, still here so no colour literal escapes the file.
export const BRASS_RAIL = {
  railGradient: 'linear-gradient(180deg, rgba(201,162,75,0.10), rgba(201,162,75,0.42), rgba(201,162,75,0.10))',
  rivet: 'rgba(201,162,75,0.32)',
  glow: 'rgba(201,162,75,0.5)',
} as const;
