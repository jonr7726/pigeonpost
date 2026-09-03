import { StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '../theme/useTheme';

export type ScreenWidth = 'standard' | 'full';

// Safe-area + padding wrapper every screen is wrapped in. `standard` is THE
// rule on desktop: a 2/3-width centre column (min 560 / max 980) so every tab
// reads at the same measure, and the left/right margins stay free for future
// profile banners. Full-bleed two-pane screens may take `full`. On mobile
// both are simply full width.
export function Screen({
  children,
  width = 'standard',
  bg = 'bg',
  style,
  ...rest
}: ViewProps & { width?: ScreenWidth; bg?: 'bg' | 'paper' }) {
  const { palette } = useTheme();
  return (
    <View
      style={[styles.fill, { backgroundColor: bg === 'paper' ? palette.paper : palette.bg }, style]}
      {...rest}
    >
      <View style={[styles.column, { maxWidth: columns[width] }]}>{children}</View>
    </View>
  );
}

const columns = { standard: '66.6%', full: 1240 } as const;

const styles = StyleSheet.create({
  fill: { flex: 1 },
  column: { flex: 1, width: '100%', paddingHorizontal: 16, alignSelf: 'center' },
});
