import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon } from './Icon';
import { useTheme } from '../theme/useTheme';

// Title + optional back + optional right slot (bell, actions). Shared by every
// screen so global chrome stays consistent; themed by the viewer, per Design.
export function TopBar({
  title,
  onBack,
  right,
  showBell,
  onPressBell,
  bellActive,
}: {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  showBell?: boolean;
  onPressBell?: () => void;
  bellActive?: boolean;
}) {
  const { palette } = useTheme();
  return (
    <View style={[styles.bar, { borderBottomColor: palette.panelEdge }]}>
      {onBack ? (
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="back">
          <Icon name="back" size={24} />
        </Pressable>
      ) : (
        <View style={styles.edgeSpace} />
      )}
      <AppText tone="display" size="lg" align="left" style={styles.title}>
        {title ?? ''}
      </AppText>
      <View style={styles.rightRow}>
        {right}
        {showBell && (
          <Pressable onPress={onPressBell} accessibilityRole="button" accessibilityLabel="notifications">
            <AppText style={bellActive ? styles.bellActive : styles.bellIdle}>🔔</AppText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, gap: 8, borderBottomWidth: 1 },
  edgeSpace: { width: 24 },
  title: { flex: 1 },
  rightRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  bellIdle: { fontSize: 20, opacity: 0.85 },
  bellActive: { fontSize: 20 },
});
