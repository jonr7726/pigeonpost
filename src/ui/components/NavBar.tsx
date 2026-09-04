import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { Composer } from './Composer';
import { CreateEventModal } from './CreateEventModal';
import { Modal } from './Modal';
import { UserMenu } from './UserMenu';
import { GroupSection, ShortcutsSection } from './SideRail';
import { useRouter } from '../nav';
import { useTheme } from '../theme/useTheme';

export type TabId = 'letters' | 'feed' | 'discover' | 'profile' | 'settings' | 'events';

// Mobile bottom bar: home (→ your profile), feed, letters, friends — then a
// create dropdown (new post / new event), notifications, and the avatar
// opening the same user menu as desktop (switch account + log out).
export const navTabs: { id: TabId; icon: string; label: string }[] = [
  { id: 'letters', icon: '✉', label: 'Letters' },
  { id: 'feed', icon: '⌂', label: 'Home' },
  { id: 'discover', icon: '✧', label: 'Friends' },
];

export function NavBar({
  active,
  onSelect,
  username,
  bellActive,
}: {
  active: TabId;
  onSelect: (tab: TabId) => void;
  username: string;
  bellActive?: boolean;
}) {
  const { palette } = useTheme();
  const [createOpen, setCreateOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const router = useRouter();
  const [postOpen, setPostOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);

  return (
    <>
      <Modal visible={postOpen} onClose={() => setPostOpen(false)} title="Create post">
        <Composer onPost={() => setPostOpen(false)} />
      </Modal>
      <CreateEventModal visible={eventOpen} onClose={() => setEventOpen(false)} />
      <View testID="navbar">
        <View style={styles.barWrap}><View style={[styles.bar, { borderTopColor: palette.panelEdge, backgroundColor: palette.band }]}>
          {navTabs.map(({ id, label }) => {
            const isActive = active === id;
            return (
              <Pressable
                key={id}
                onPress={() => onSelect(id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={label}
                style={styles.tab}
              >
                <Glyph glyph={navGlyph(id)} />
                {isActive && <View style={[styles.dot, { backgroundColor: palette.accent }]} />}
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => setMoreOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="more — events, groups, shortcuts"
            testID="more-open"
            style={styles.tab}
          >
            <AppText size="lg" style={{ color: palette.text }}>≡</AppText>
          </Pressable>
          <Pressable
            onPress={() => setCreateOpen((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel="create"
            accessibilityState={{ expanded: createOpen }}
            style={[styles.tab, styles.create]}
          >
            <AppText size="lg" style={{ color: palette.text }}>＋</AppText>
          </Pressable>
          <Pressable
            onPress={() => onSelect('feed')}
            accessibilityRole="button"
            accessibilityLabel="notifications"
            style={[styles.tab, styles.smallTab]}
          >
            <Glyph glyph="🔔" />
            {bellActive && <View style={[styles.dot, styles.bellDot, { backgroundColor: palette.error }]} />}
          </Pressable>
          <View style={styles.me}>
            <UserMenu
              username={username}
              onGoProfile={() => onSelect('profile')}
              trigger={(openMenu, openNow) => (
                <Pressable
                  onPress={openMenu}
                  accessibilityRole="button"
                  accessibilityLabel={`account menu for ${username}`}
                  accessibilityState={{ expanded: openNow }}
                >
                  <Avatar name={username} size={30} ring={active === 'profile'} accessibilityLabel={`profile of ${username}`} />
                </Pressable>
              )}
            />
          </View>
        </View>
        <Modal visible={moreOpen} onClose={() => setMoreOpen(false)} title="more">
          <Pressable onPress={() => { setMoreOpen(false); router.goTab('events'); }} accessibilityRole="button" accessibilityLabel="events" style={styles.moreRow}>
            <AppText size="md">📅 events</AppText>
          </Pressable>
          <GroupSection onOpen={(id) => { setMoreOpen(false); router.push({ screen: 'group', groupId: id }); }} />
          <ShortcutsSection />
        </Modal>
        {createOpen && (
          <View style={[styles.createMenu, { backgroundColor: palette.panel, borderColor: palette.panelEdge }]} testID="create-menu">
            <Pressable
              onPress={() => { setCreateOpen(false); setPostOpen(true); }}
              accessibilityRole="button"
              style={styles.createRow}
              testID="create-post-open"
            >
              <AppText size="md">create post</AppText>
            </Pressable>
            <Pressable
              onPress={() => { setCreateOpen(false); setEventOpen(true); }}
              accessibilityRole="button"
              style={styles.createRow}
              testID="create-event-open"
            >
              <AppText size="md">create event</AppText>
            </Pressable>
          </View>
        )}
      </View></View>
    </>
  );
}

function navGlyph(id: string): string {
  const map: Record<string, string> = { letters: '✉', feed: '⌂', discover: '✧' };
  return map[id] ?? '?';
}

function Glyph({ glyph, size = 20, tone }: { glyph: string; size?: number; tone?: string }) {
  const { palette } = useTheme();
  return <AppText style={{ fontSize: size, color: tone ?? palette.text }}>{glyph}</AppText>;
}

const styles = StyleSheet.create({
  barWrap: { position: 'relative' as never, zIndex: 100 as never, backgroundColor: 'transparent' },
  bar: { flexDirection: 'row', borderTopWidth: 1, paddingBottom: 10, alignItems: 'center' },
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingTop: 10 },
  smallTab: { flex: 'auto' as never, gap: 0 },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },
  bellDot: { position: 'absolute' as never, top: 12, right: 2 },
  create: { flex: 'auto' as never, paddingTop: 4 },
  createMenu: { position: 'absolute' as never, bottom: 56, left: '50%' as never, width: 200, marginLeft: -100 as never, borderWidth: 1, borderRadius: 10, paddingVertical: 6, zIndex: 60 },
  createRow: { paddingVertical: 10, paddingHorizontal: 14 },
  moreRow: { paddingVertical: 10, paddingHorizontal: 14 },
  me: { paddingRight: 14, paddingLeft: 4 },
});
