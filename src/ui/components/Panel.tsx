import { StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '../theme/useTheme';

// The one card/panel surface — everything sits on one.
export function Panel({ children, style, ...rest }: ViewProps) {
  const { palette } = useTheme();
  return (
    <View style={[styles.panel, { backgroundColor: palette.panel, borderColor: palette.panelEdge, boxShadow: palette.panelSheen }, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
});
