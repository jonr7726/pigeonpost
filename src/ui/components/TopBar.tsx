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
}: {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const { palette } = useTheme();
  return (
    <View style={[styles.bar, { borderBottomColor: palette.panelEdge }]}>
      {onBack ? (
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="back">
          <Icon name="back" size={24} />
        </Pressable>
      ) : null}
      <AppText tone="display" size="lg" align="left" style={styles.title}>
        {title ?? ''}
      </AppText>
      <View style={styles.rightRow}>
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // the hairline breathes: a margin under the bar so the next component never
  // sits hard against it, and the title shares the same edge padding as the
  // vertical rhythm (no phantom second indent from an always-empty back slot).
  bar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, gap: 10, borderBottomWidth: 1, marginBottom: 14 },
  title: { flex: 1 },
  rightRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
});
