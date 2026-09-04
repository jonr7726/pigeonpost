import { Modal as RNModal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Panel } from './Panel';
import { useTheme } from '../theme/useTheme';

// The one sheet/modal. The scrim closes it; presses inside the panel don't.
export function Modal({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  const { palette } = useTheme();
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[styles.shade, { backgroundColor: palette.overlay }]}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="close"
      >
        <View style={styles.spot}>
          <Pressable onPress={() => undefined} accessibilityLabel="sheet">
            <Panel style={styles.panel}>
              {title != null && <AppText tone="display" size="lg">{title}</AppText>}
              {children}
            </Panel>
          </Pressable>
        </View>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  shade: { flex: 1 },
  spot: { flex: 1, justifyContent: 'center', padding: 24 },
  panel: { gap: 12, marginHorizontal: 'auto', width: '100%', maxWidth: 420 },
});
