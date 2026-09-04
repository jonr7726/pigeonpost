// The ONLY file in the repo where a colour literal may appear
// (checked by scripts/check_palette.sh — swap a palette, swap this file).
// Two palettes implement the same token set; components consume tokens, never
// these values, via ThemeProvider/useTheme.
import type { Palette } from './theme';

// Dark — "the study at night": mahogany panelling and leather-bound books lit
// by the fire, gold-leaf inlays at the edges. Much lighter than before — the
// room is lit, not a cave: the background is mid-brown, panels are leather.
export const dark: Palette = {
  bg: '#332418',
  // firelight, not steam: a warm hearth-glow low centre, a soft gold from the
  // reading lamp high left.
  bgGlow: 'radial-gradient(circle at 50% 110%, rgba(224,150,60,0.16), transparent 55%), radial-gradient(circle at 12% -12%, rgba(212,175,100,0.12), transparent 50%)',
  panel: '#3f2e1f',
  panelEdge: 'rgba(212,181,120,0.30)',
  panelSheen: 'inset 0 1px 0 rgba(232,206,150,0.14)',
  text: '#eee1c8',
  textDim: '#eee1c8a6',
  accent: '#c8a95f',
  accentAlt: '#8f3b30',
  success: '#5d7c64',
  error: '#a8443a',
  warning: '#a37c23',
  overlay: 'rgba(24,16,9,0.55)',
  hairline: '#c8a95f2b',
  band: 'linear-gradient(180deg, #40301f, #342516)',
  paper: '#ecdcb4',
  ink: '#2b2014',
  wax: '#7d2b23',
};

// Light ("manor daylight") — the study with the curtains open: parchment-toned
// walls, darker leather panels. Accent re-derived for contrast on cream.
export const light: Palette = {
  bg: '#e6d9ba',
  bgGlow: 'radial-gradient(circle at 50% -10%, rgba(255,250,235,0.55), transparent 55%)',
  panel: '#dccfae',
  panelEdge: 'rgba(122,92,40,0.35)',
  panelSheen: 'inset 0 1px 0 rgba(255,252,240,0.5)',
  text: '#2a1e12',
  textDim: '#2a1e12b8',
  accent: '#78591c',
  accentAlt: '#8a4620',
  success: '#3c655a',
  error: '#a33830',
  warning: '#8a6508',
  overlay: 'rgba(42,30,18,0.35)',
  hairline: 'rgba(122,92,40,0.16)',
  band: 'linear-gradient(180deg, #e2d5b4, #d8caa6)',
  paper: '#f4ead2',
  ink: '#2a1e12',
  wax: '#7d2b23',
};

export const palettes: Record<'dark' | 'light', Palette> = { dark, light };

// Non-token constants used by the chrome overlays (scrollbar etc.) — still
// named, still here so no colour literal escapes the file. The rail is aged
// gold now, not polished brass: quieter, Downton not Foundry.
export const BRASS_RAIL = {
  railGradient: 'linear-gradient(180deg, rgba(200,169,95,0.10), rgba(200,169,95,0.40), rgba(200,169,95,0.10))',
  rivet: 'rgba(200,169,95,0.30)',
  glow: 'rgba(200,169,95,0.45)',
} as const;

// The physical page a letter is written on: layered paper grain (two SVG
// turbulence data-URIs — a coarse grain over a fine one), faded edge stains and
// a warm lorentz-cream base, plus a soft shadow beneath. Used by LetterPaper so
// every letter reads as a physical sheet in both themes; ink comes from the
// palette's `ink` token.
export const PARCHMENT = {
  backgroundImage: [
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.23 0 0 0 0 0.18 0 0 0 0 0.11 0 0 0 0.30 0'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)'/%3E%3C/svg%3E\")",
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.08' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.35 0 0 0 0 0.26 0 0 0 0 0.14 0 0 0 0.20 0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23m)'/%3E%3C/svg%3E\")",
    'radial-gradient(ellipse at 18% 12%, rgba(139,109,66,0.26), transparent 45%)',
    'radial-gradient(ellipse at 82% 88%, rgba(139,109,66,0.30), transparent 42%)',
    'radial-gradient(ellipse at 60% 45%, rgba(120,90,50,0.14), transparent 55%)',
    'linear-gradient(160deg, #f1e3bd, #e4d2a6 55%, #d6bd8d)',
  ].join(', '),
  boxShadow: '0 14px 28px rgba(0,0,0,0.45), inset 0 0 40px rgba(120,90,50,0.25)',
  // the fill-in blanks on a deed-style letter (same idea as the deed on the
  // estate site): ruled ink lines over the paper
  blankLine: 'rgba(43,32,20,0.65)',
} as const;
