import { ActivityIndicator, StyleSheet } from 'react-native';

import { useTheme } from '../theme/useTheme';

// The one spinner — screens use this (raw ActivityIndicator is banned there).
export function Loading() {
  const { palette } = useTheme();
  return <ActivityIndicator color={palette.accent} style={styles.spin} />;
}

const styles = StyleSheet.create({ spin: { padding: 16 } });
