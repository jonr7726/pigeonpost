import { StyleSheet, Text, type TextProps } from 'react-native';

import { useTheme } from '../theme/useTheme';

export type AppTextTone = 'body' | 'dim' | 'display' | 'invert' | 'accent' | 'mono';
export type AppTextSize = 'sm' | 'md' | 'lg' | 'xl' | 'display';

const sizes: Record<AppTextSize, { fontSize: number; lineHeight: number }> = {
  sm: { fontSize: 13, lineHeight: 18 },
  md: { fontSize: 16, lineHeight: 22 },
  lg: { fontSize: 20, lineHeight: 27 },
  xl: { fontSize: 26, lineHeight: 33 },
  display: { fontSize: 36, lineHeight: 44 },
};

// The one text component — screens never render raw <Text> (reuse gate).
// Tone: body (primary), dim (secondary), display (headings, serif), invert
// (text on an accent surface), mono (numbers/ids), display.
export function AppText({
  tone = 'body',
  size = 'md',
  align,
  style,
  children,
  ...rest
}: {
  tone?: AppTextTone;
  size?: AppTextSize;
  align?: 'left' | 'center' | 'right';
  children?: React.ReactNode;
} & TextProps) {
  const { palette } = useTheme();
  const colours: Record<AppTextTone, string> = {
    body: palette.text,
    dim: palette.textDim,
    display: palette.text,
    invert: palette.bg,
    accent: palette.accent,
    mono: palette.text,
  };
  const serif = tone === 'display';
  return (
    <Text
      style={[
        sizes[size],
        serif && styles.serif,
        tone === 'mono' && styles.mono,
        align && { textAlign: align },
        { color: colours[tone] },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  serif: { fontFamily: 'Georgia, "Times New Roman", serif' },
  mono: { fontFamily: 'Menlo, Consolas, monospace', fontVariant: ['tabular-nums'] },
});
