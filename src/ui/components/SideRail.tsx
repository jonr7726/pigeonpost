import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { Divider } from './Divider';
import { Icon } from './Icon';
import { useTheme } from '../theme/useTheme';

// The desktop left rail, old-Facebook-shaped: your identity card, a
// feed/events toggle, then scrollable divided sections — Shortcuts first
// (configurable; the user pins their own links) with more sections to come.
// Desktop-only: AppShell never mounts it below the desktop breakpoint.
export type SideView = 'feed' | 'events';

export function SideRail({
  view,
  onView,
  onGoProfile,
  username,
}: {
  view: SideView;
  onView: (v: SideView) => void;
  onGoProfile: () => void;
  username: string;
}) {
  const { palette } = useTheme();
  const [shortcuts, setShortcuts] = useState<string[]>(['Pigeon Fanciers Weekly', 'loft-supplies.corvid.ly', 'martaletterweaving.blog']);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  function add() {
    const label = draft.trim();
    if (!label) { setAdding(false); return; }
    setShortcuts((s) => [...s, label]);
    setDraft('');
    setAdding(false);
  }

  return (
    <View style={[styles.rail, { borderRightColor: palette.panelEdge, backgroundColor: palette.bg }]}>
      <Pressable onPress={onGoProfile} accessibilityRole="button" style={styles.meRow} accessibilityLabel={`your profile, ${username}`}>
        <Avatar name={username} size={28} />
        <AppText size="md">@{username}</AppText>
      </Pressable>

      <View style={styles.toggle}>
        <Pressable
          onPress={() => onView('feed')}
          accessibilityRole="tab"
          accessibilityState={{ selected: view === 'feed' }}
          style={[styles.toggleBtn, view === 'feed' && { backgroundColor: palette.panelEdge }]}
        >
          <AppText size="sm" style={{ color: palette.text }}>🕊 Feed</AppText>
        </Pressable>
        <Pressable
          onPress={() => onView('events')}
          accessibilityRole="tab"
          accessibilityState={{ selected: view === 'events' }}
          style={[styles.toggleBtn, view === 'events' && { backgroundColor: palette.panelEdge }]}
        >
          <AppText size="sm" style={{ color: palette.text }}>📅 Events</AppText>
        </Pressable>
      </View>

      <Divider />

      <View style={styles.sectionHead}>
        <AppText size="sm" tone="dim" style={styles.sectionLabel}>your shortcuts</AppText>
        <Pressable onPress={() => { setAdding((v) => !v); }} accessibilityRole="button" accessibilityLabel="add shortcut">
          <AppText size="sm" style={{ color: palette.accent }}>＋</AppText>
        </Pressable>
      </View>
      {adding && (
        <Pressable onPress={add} accessibilityLabel="add shortcut input">
          <View style={[styles.shortcutInput, { borderColor: palette.panelEdge }]}>
            <AppText size="sm" tone="dim">type on web ⏎</AppText>
          </View>
        </Pressable>
      )}
      {shortcuts.map((label, i) => (
        <Pressable
          key={label}
          onPress={() => setShortcuts((s) => [...s.slice(0, i), ...s.slice(i + 1)])}
          accessibilityRole="button"
          accessibilityLabel={`remove shortcut ${label}`}
          style={() => [styles.row, ]}
        >
          <Avatar name={label} size={20} />
          <AppText size="md" numberOfLines={1} style={styles.linkLabel}>{label}</AppText>
        </Pressable>
      ))}
      <AppText size="sm" tone="dim">click a shortcut to remove it</AppText>

      <Divider />
      <AppText size="sm" tone="dim" style={styles.sectionLabel}>explore</AppText>
      {['Friends', 'Letters', 'Settings'].map((label) => (
        <View key={label} style={styles.row}>
          <Icon name={label === 'Letters' ? 'letters' : label === 'Friends' ? 'compass' : 'settings'} size={14} />
          <AppText size="md" tone="dim">{label}</AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { width: 220, borderRightWidth: 1, paddingVertical: 10, paddingHorizontal: 8 },
  meRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: 8 },
  toggle: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  toggleBtn: { flex: 1, paddingVertical: 6, borderRadius: 8, alignItems: 'center', overflow: 'hidden' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8 },
  sectionLabel: { textTransform: 'uppercase', letterSpacing: 2, fontSize: 10, marginVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 6, borderRadius: 6 },
  linkLabel: { flex: 1 },
  shortcutInput: { borderWidth: 1, borderRadius: 6, padding: 6, margin: 4 },
});
