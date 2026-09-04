import { useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { Divider } from './Divider';
import { Modal } from './Modal';
import { useTheme } from '../theme/useTheme';
import { useRouter } from '../nav';
import { useGroups } from '../../data/sample/useSampleData';

// The desktop left rail, old-Facebook-shaped: your identity card, then the
// scrollable divided sections — Groups above Shortcuts. Groups are invite-only
// feeds; shortcuts open on click, and hover raises an × that removes with a
// confirmation modal. Desktop-only: AppShell never mounts it on mobile.
export function SideRail({
  username,
  onGoProfile,
}: {
  username: string;
  onGoProfile?: () => void;
}) {
  const { palette } = useTheme();
  const router = useRouter();
  return (
    <View style={[styles.rail, { borderRightColor: palette.panelEdge }]}>
      <Pressable onPress={onGoProfile} accessibilityRole="button" style={styles.meRow} accessibilityLabel={`your profile, ${username}`}>
        <Avatar name={username} size={28} />
        <AppText size="md">@{username}</AppText>
      </Pressable>
      <GroupSection onOpen={(id) => router.push({ screen: 'group', groupId: id })} />
      <Divider />
      <ShortcutsSection />
    </View>
  );
}

export function GroupSection({ onOpen }: { onOpen: (id: string) => void }) {
  const { groups } = useGroups();
  return (
    <View style={styles.section}>
      <AppText size="sm" tone="dim" style={styles.sectionLabel}>groups</AppText>
      {groups.map((g) => (
        <Pressable
          key={g.id}
          onPress={() => onOpen(g.id)}
          accessibilityRole="button"
          accessibilityLabel={`open group ${g.name}`}
          style={styles.row}
        >
          <Avatar name={g.name} size={20} />
          <View style={styles.linkCol}>
            <AppText size="md" numberOfLines={1}>{g.name}</AppText>
            <AppText size="sm" tone="dim">{g.members.length} members · invite-only</AppText>
          </View>
        </Pressable>
      ))}
      <AppText size="sm" tone="dim" style={styles.hint}>invite-only feeds — posts stay among members</AppText>
    </View>
  );
}

export function ShortcutsSection() {
  const [shortcuts, setShortcuts] = useState<string[]>([
    'Pigeon Fanciers Weekly',
    'loft-supplies.corvid.ly',
    'martaletterweaving.blog',
  ]);
  const [confirm, setConfirm] = useState<string | null>(null);
  const { palette } = useTheme();

  return (
    <View style={styles.section}>
      <AppText size="sm" tone="dim" style={styles.sectionLabel}>your shortcuts</AppText>
      {shortcuts.map((label) => (
        <ShortcutRow key={label} label={label} onRemove={() => setConfirm(label)} onOpen={() => Linking.openURL(`https://${label}`)} />
      ))}
      <Modal visible={confirm != null} onClose={() => setConfirm(null)} title="Remove shortcut?">
        <AppText>Remove “{confirm}” from your shortcuts?</AppText>
        <Pressable
          onPress={() => {
            setShortcuts((s) => s.filter((x) => x !== confirm));
            setConfirm(null);
          }}
          accessibilityRole="button"
          style={[styles.dangerBtn, { backgroundColor: palette.error }]}
          testID="confirm-remove-shortcut"
        >
          <AppText style={{ color: palette.bg }}>remove it</AppText>
        </Pressable>
      </Modal>
    </View>
  );
}

function ShortcutRow({ label, onRemove, onOpen }: { label: string; onRemove: () => void; onOpen: () => void }) {
  const [hover, setHover] = useState(false);
  const { palette } = useTheme();
  // Hover carries between the label and the ✕ with a grace period so the
  // pointer can travel across the tiny gap without the ✕ vanishing (removing
  // itself on hover-out would eat its own press).
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function hold() {
    if (timer.current) clearTimeout(timer.current);
    setHover(true);
  }
  function leave() {
    timer.current = setTimeout(() => setHover(false), 240);
  }
  return (
    <View style={styles.shortcutRow}>
      <Pressable
        onPress={onOpen}
        accessibilityRole="link"
        accessibilityLabel={`open shortcut ${label}`}
        onHoverIn={hold}
        onHoverOut={leave}
        style={styles.shortcutLink}
      >
        <Avatar name={label} size={20} />
        <AppText size="md" numberOfLines={1} style={styles.linkLabel}>{label}</AppText>
      </Pressable>
      {hover && (
        <Pressable
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={`remove shortcut ${label}`}
          onHoverIn={() => { timer.current = null; setHover(true); }}
          onHoverOut={leave}
          style={styles.x}
        >
          <AppText size="sm" style={{ color: palette.text }}>✕</AppText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { width: 220, borderRightWidth: 1, paddingVertical: 10, paddingHorizontal: 8 },
  meRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: 8 },
  section: { paddingHorizontal: 0 },
  sectionLabel: { textTransform: 'uppercase', letterSpacing: 2, fontSize: 10, marginVertical: 8, paddingHorizontal: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 6, borderRadius: 6, minWidth: 0 },
  linkCol: { flex: 1, minWidth: 0 },
  shortcutRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 6 },
  shortcutLink: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 6, flex: 1, minWidth: 0 },
  linkLabel: { flex: 1, minWidth: 0 },
  x: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6 },
  hint: { paddingHorizontal: 8, marginTop: 4 },
  dangerBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
});
