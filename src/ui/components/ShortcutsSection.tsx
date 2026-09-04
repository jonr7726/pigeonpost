import { useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppInput } from './AppInput';
import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { ConfirmModal } from './ConfirmModal';
import { Modal } from './Modal';
import { useTheme } from '../theme/useTheme';

// Your shortcuts — configurable external links. Click a shortcut to open it;
// hover shows an ✕ (confirmed removal); ＋ opens the add form: name, hyperlink
// and a pick-an-icon dropdown.
const ICONS = ['🔗', '🐦', '📰', '📸', '★', '✎', '🕊️'] as const;

export function ShortcutsSection() {
  const [shortcuts, setShortcuts] = useState<{ id: string; name: string; href: string; icon: string }[]>([
    { id: 's-1', name: 'Pigeon Fanciers Weekly', href: 'https://pigeon-fanciers.weekly', icon: '📰' },
    { id: 's-2', name: 'loft supplies', href: 'https://loft-supplies.corvid.ly', icon: '🐦' },
    { id: 's-3', name: 'letter weaving blog', href: 'https://martaletterweaving.blog', icon: '🔗' },
  ]);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const { palette } = useTheme();

  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <AppText size="sm" tone="dim" style={styles.label}>your shortcuts</AppText>
        <Pressable onPress={() => setAdding(true)} accessibilityRole="button" accessibilityLabel="add shortcut" testID="add-shortcut">
          <AppText style={{ color: palette.accent }}>＋</AppText>
        </Pressable>
      </View>
      {shortcuts.map((s) => (
        <ShortcutRow
          key={s.id}
          label={s.name}
          icon={s.icon}
          onOpen={() => Linking.openURL(s.href)}
          onRemove={() => setConfirm(s.id)}
        />
      ))}
      <AddModal
        open={adding}
        onClose={() => setAdding(false)}
        onAdd={(name, href, icon) => setShortcuts((list2) => [...list2, { id: `s-${Date.now()}`, name, href, icon }])}
      />
      <ConfirmModal
        open={confirm != null}
        title="Remove shortcut?"
        message="Remove this shortcut from your list?"
        danger
        confirmLabel="remove"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          setShortcuts((list) => list.filter((x) => x.id !== confirm));
          setConfirm(null);
        }}
      />
    </View>
  );
}

function ShortcutRow({ label, icon, onOpen, onRemove }: { label: string; icon: string; onOpen: () => void; onRemove: () => void }) {
  const [hover, setHover] = useState(false);
  const { palette } = useTheme();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function hold() {
    if (timer.current) clearTimeout(timer.current);
    setHover(true);
  }
  function leave() {
    timer.current = setTimeout(() => setHover(false), 240);
  }
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onOpen}
        accessibilityRole="link"
        accessibilityLabel={`open shortcut ${label}`}
        onHoverIn={hold}
        onHoverOut={leave}
        style={styles.link}
      >
        <AppText style={{ width: 20 }}>{icon}</AppText>
        <AppText size="md" numberOfLines={1} style={{ flex: 1, minWidth: 0 }}>{label}</AppText>
      </Pressable>
      {hover && (
        <Pressable
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={`remove shortcut ${label}`}
          onHoverIn={hold}
          onHoverOut={leave}
          style={styles.x}
          testID={`remove-${label}`}
        >
          <AppText size="sm" style={{ color: palette.text }}>✕</AppText>
        </Pressable>
      )}
    </View>
  );
}

function AddModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, href: string, icon: string) => void;
}) {
  const [name, setName] = useState('');
  const [href, setHref] = useState('');
  const [icon, setIcon] = useState<string>(ICONS[0]);
  const { palette } = useTheme();
  return (
    <Modal visible={open} onClose={onClose} title="Add a shortcut">
      <AppInput placeholder="name" value={name} onChangeText={setName} testID="shortcut-name" />
      <AppInput placeholder="https://…" value={href} onChangeText={setHref} testID="shortcut-href" />
      <View style={styles.iconRow}>
        {ICONS.map((ic) => (
          <Pressable
            key={ic}
            onPress={() => setIcon(ic)}
            accessibilityRole="radio"
            accessibilityState={{ selected: icon === ic }}
            style={[styles.iconBtn, icon === ic && { backgroundColor: palette.panelEdge }]}
          >
            <AppText>{ic}</AppText>
          </Pressable>
        ))}
      </View>
      <Pressable
        onPress={() => {
          if (!name.trim() || !href.trim()) return;
          onAdd(name.trim(), href.trim(), icon);
          setName('');
          setHref('');
          onClose();
        }}
        accessibilityRole="button"
        testID="shortcut-add-submit"
        style={[styles.addBtn, { backgroundColor: palette.accent }]}
      >
        <AppText style={{ color: palette.bg }}>add</AppText>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 0 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, marginVertical: 8 },
  label: { textTransform: 'uppercase', letterSpacing: 2, fontSize: 10 },
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 6 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 6, flex: 1, minWidth: 0 },
  x: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6 },
  iconRow: { flexDirection: 'row', gap: 6 },
  iconBtn: { padding: 8, borderRadius: 8 },
  addBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, alignSelf: 'flex-start' as never },
});
