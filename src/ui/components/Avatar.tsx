import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { useTheme } from '../theme/useTheme';

// Initials avatar with optional story ring. Images slot into the same API.
export function Avatar({
  name,
  size = 44,
  ring,
  onPress,
  accessibilityLabel,
}: {
  name: string;
  size?: number;
  ring?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const { palette } = useTheme();
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
  const content = (
    <View
      style={[
        styles.disc,
        ring && styles.ringPadding,
        { width: size + (ring ? 8 : 0), height: size + (ring ? 8 : 0) },
        (ring || false) && { borderRadius: (size + 8) / 2, borderWidth: 2, borderColor: palette.accent },
        { backgroundColor: palette.accentAlt },
        !ring && { borderRadius: size / 2 },
      ]}
    >
      <AppText tone="invert" style={{ fontSize: size * 0.36, fontWeight: '600' }}>
        {initials}
      </AppText>
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? name}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  disc: { borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  ringPadding: { padding: 2 },
});
