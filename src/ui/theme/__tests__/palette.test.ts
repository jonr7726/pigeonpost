import { describe, expect, it } from 'vitest';

import { dark, light } from '../palette';
import { paletteTokens } from '../theme';

// WCAG relative luminance per spec (sRGB, linearised).
function luminance(hex: string): number {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
  const linear = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(fore: string, back: string): number {
  const l1 = luminance(fore);
  const l2 = luminance(back);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// textDim is an alpha over the surface it sits on; blend it before measuring.
function blendOver(foreRgba: string, back: string, alpha: number): string {
  const channels = [...back.replace('#', '').match(/../g)!.map(hexToInt)];
  const fore = [...foreRgba.replace('#', '').match(/../g)!.map(hexToInt)];
  const mixed = channels.map((c, i) => Math.round(alpha * fore[i] + (1 - alpha) * c));
  const hex = mixed.map((c) => c.toString(16).padStart(2, '0')).join('');
  return `#${hex}`;
}

function hexToInt(hex: string): number {
  return parseInt(hex, 16);
}

describe('palette readability', () => {
  describe.each([
    ['dark', dark, 0.62],
    ['light', light, 0.72],
  ] as const)('%s palette', (_name, palette, dimAlpha) => {
    const dimOnBg = blendOver(palette.textDim, palette.bg, dimAlpha);
    const dimOnPanel = blendOver(palette.textDim, palette.panel, dimAlpha);

    it('primary text reads on bg and panel (WCAG 4.5)', () => {
      expect(contrast(palette.text, palette.bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(palette.text, palette.panel)).toBeGreaterThanOrEqual(4.5);
    });

    it('secondary text reads on bg and panel (WCAG 4.5)', () => {
      expect(contrast(dimOnBg, palette.bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(dimOnPanel, palette.panel)).toBeGreaterThanOrEqual(4.5);
    });

    it('accent reads on bg and panel (WCAG 3 — icons/accents)', () => {
      expect(contrast(palette.accent, palette.bg)).toBeGreaterThanOrEqual(3);
      expect(contrast(palette.accent, palette.panel)).toBeGreaterThanOrEqual(3);
    });
  });

  it('every palette implements the full token set', () => {
    for (const palette of [dark, light]) {
      expect(Object.keys(palette).sort()).toEqual([...paletteTokens].sort());
    }
  });

  it('letters paper/ink stay readable across the toggle', () => {
    for (const palette of [dark, light]) {
      expect(contrast(palette.ink, palette.paper)).toBeGreaterThanOrEqual(7);
    }
  });
});
