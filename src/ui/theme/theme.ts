// The semantic token contract. Components read tokens through useTheme();
// palettes (in palette.ts) are swappable implementations of this type.
export type Palette = {
  bg: string; // page background
  panel: string; // cards / panels
  panelEdge: string; // hairline borders
  text: string; // primary text
  textDim: string; // secondary text
  accent: string; // primary accent (links, active)
  accentAlt: string; // secondary accent
  success: string;
  error: string;
  warning: string;
  overlay: string; // scrims / press states
  // Props — physical objects, not theme. Same names in both palettes; values
  // differ only where the medium demands it (paper is light in dark mode and a
  // natural lighter parchment in light mode — a letter is paper in both).
  paper: string; // a letter page
  ink: string; // writing on a letter page
  wax: string; // sealing wax
};

export const paletteTokens = [
  'bg',
  'panel',
  'panelEdge',
  'text',
  'textDim',
  'accent',
  'accentAlt',
  'success',
  'error',
  'warning',
  'overlay',
  'paper',
  'ink',
  'wax',
] as const satisfies readonly (keyof Palette)[];
