

import { AppText } from './AppText';
import { useTheme } from '../theme/useTheme';

// One icon component over a curated glyph set (Feather-style, no image deps).
// Storyboard-grade pictorials; real drawn assets slot into the same names.
export type IconName =
  | 'search'
  | 'heart'
  | 'heartFull'
  | 'comment'
  | 'pigeon'
  | 'letters'
  | 'home'
  | 'compass'
  | 'profile'
  | 'settings'
  | 'bell'
  | 'sun'
  | 'moon'
  | 'back'
  | 'close'
  | 'send'
  | 'write'
  | 'trash'
  | 'check'
  | 'pin';

const glyphs: Record<IconName, string> = {
  search: '⌕',
  heart: '♡',
  heartFull: '❤',
  comment: '💬',
  pigeon: '🕊️',
  letters: '✉',
  home: '⌂',
  compass: '✧',
  profile: '☉',
  settings: '❦',
  bell: '🔔',
  sun: '☀',
  moon: '☾',
  back: '‹',
  close: '×',
  send: '➤',
  write: '✎',
  trash: '✕',
  check: '✓',
  pin: '⌖',
};

// `plain` is reserved for forcing text visuals once real assets land.
export function Icon({ name, size = 18 }: { name: IconName; plain?: boolean; size?: number }) {
  const { palette } = useTheme();
  return (
    <AppText
      style={{ fontSize: size, lineHeight: size + 4, color: palette.text }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {glyphs[name]}
    </AppText>
  );
};

