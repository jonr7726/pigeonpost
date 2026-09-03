import { StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '../theme/useTheme';

export type ScreenWidth = 'narrow' | 'reading' | 'wide';

// Safe-area + padding wrapper every screen is wrapped in. `width` centres a
// content column: narrow (forms, letters ~560), reading (feed/posts ~640),
// wide (profile pages, two-pane letters ~900). Desktop gives the same
// components wider columns — nothing screen-specific from this file.
export function Screen({
  children,
  width = 'reading',
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

const columns = { narrow: 560, reading: 640, wide: 960 };

const styles = StyleSheet.create({
  fill: { flex: 1 },
  column: { flex: 1, width: '100%', paddingHorizontal: 16, alignSelf: 'center' },
});
