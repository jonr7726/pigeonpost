import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon } from './Icon';

// The one empty state: why it's quiet + what to do about it.
export function EmptyState({ what, why }: { what: string; why?: string }) {
  return (
    <View style={styles.centered} testID="empty-state">
      <Icon name="pigeon" size={36} />
      <AppText tone="display" size="lg" align="center" style={styles.why}>
        {what}
      </AppText>
      {why != null && <AppText tone="dim" align="center">{why}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { alignItems: 'center', gap: 10, padding: 32 },
  why: { fontFamily: 'Georgia, serif' },
});
