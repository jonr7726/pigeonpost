// The semantic token contract. Components read tokens through useTheme();
// palettes (in palette.ts) are swappable implementations of this type.
export type Palette = {
  bg: string; // page background
  bgGlow: string; // fixed brass vignette over the bg (PM port)
  panel: string; // cards / panels
  panelEdge: string; // hairline borders
  panelSheen: string; // top inset highlight inside panels (PM port)
  text: string; // primary text
  textDim: string; // secondary text
  accent: string; // primary accent (links, active)
  accentAlt: string; // secondary accent
  success: string;
  error: string;
  warning: string;
  overlay: string; // scrims / press states
  hairline: string; // the site-standard section rule (PM CogRule colour)
  band: string; // global nav band gradient (PM header port)
  navBand: string; // mobile bottom nav — deliberately a different surface to every panel/page
  // Props — physical objects, not theme. Same names in both palettes; values
  // differ only where the medium demands it (paper is light in dark mode and a
  // natural lighter parchment in light mode — a letter is paper in both).
  paper: string; // a letter page
  ink: string; // writing on a letter page
  wax: string; // sealing wax
};

export const paletteTokens = [
  'bg',
  'bgGlow',
  'panel',
  'panelEdge',
  'panelSheen',
  'text',
  'textDim',
  'accent',
  'accentAlt',
  'success',
  'error',
  'warning',
  'overlay',
  'hairline',
  'band',
  'navBand',
  'paper',
  'ink',
  'wax',
] as const satisfies readonly (keyof Palette)[];
