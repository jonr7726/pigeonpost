import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Modal } from './Modal';
import { useTheme } from '../theme/useTheme';

// The one confirmation sheet: message centre, Cancel bottom-left, the primary
// action bottom-right (red when danger/warning, brass otherwise). Reused for
// shortcut removal, leaving groups, invitations, discard guards — everywhere a
// confirm replaces a naive window.confirm.
export function ConfirmModal({
  open,
  title,
  message,
  danger = false,
  confirmLabel = 'confirm',
  cancelLabel = 'cancel',
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  danger?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { palette } = useTheme();
  return (
    <Modal visible={open} onClose={onCancel} title={title}>
      <AppText>{message}</AppText>
      <View style={styles.row}>
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
          style={[styles.btn, styles.bordered, { borderColor: palette.panelEdge }]}
          testID="confirm-cancel"
        >
          <AppText size="sm" tone="dim">{cancelLabel}</AppText>
        </Pressable>
        <Pressable
          onPress={onConfirm}
          accessibilityRole="button"
          accessibilityLabel={confirmLabel}
          style={[styles.btn, styles.primary, { backgroundColor: danger ? palette.error : palette.accent }]}
          testID="confirm-go"
        >
          <AppText size="sm" style={{ color: palette.bg }}>{confirmLabel}</AppText>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  bordered: { borderWidth: 1 },
  primary: { minWidth: 88, alignItems: 'center' },
});
