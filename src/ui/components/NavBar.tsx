import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { Composer } from './Composer';
import { GroupSection } from './SideRail';
import { ShortcutsSection } from './ShortcutsSection';
import { Modal } from './Modal';
import { UserMenu } from './UserMenu';
import { useRouter } from '../nav';
import { useTheme } from '../theme/useTheme';

export type TabId = 'letters' | 'feed' | 'discover' | 'profile' | 'settings' | 'events';

// Mobile bottom bar (features all reachable): feed (📣), letters (✉), more
// (≡ — friends, groups, shortcuts), notifications, and the avatar opening the
// account menu upward (switch account + log out). Creation lives where the
// thing gets created: the feed composer and the events page.
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
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <Modal visible={moreOpen} onClose={() => setMoreOpen(false)} title="more">
        <Pressable
          onPress={() => {
            setMoreOpen(false);
            router.goTab('discover');
          }}
          accessibilityRole="button"
          accessibilityLabel="friends"
          style={styles.moreRow}
          testID="more-friends"
        >
          <AppText size="md">👥 friends</AppText>
        </Pressable>
        <Pressable
          onPress={() => {
            setMoreOpen(false);
            router.goTab('events');
          }}
          accessibilityRole="button"
          accessibilityLabel="events"
          style={styles.moreRow}
        >
          <AppText size="md">📅 events</AppText>
        </Pressable>
        <GroupSection onOpen={(id: string) => { setMoreOpen(false); router.push({ screen: 'group', groupId: id }); }} />
        <ShortcutsSection />
      </Modal>
      <View testID="navbar" style={styles.barWrap}>
        <View style={[styles.bar, { borderTopColor: palette.panelEdge, backgroundColor: palette.band }]}>
          <Pressable
            onPress={() => onSelect('feed')}
            accessibilityRole="tab"
            accessibilityState={{ selected: active === 'feed' }}
            accessibilityLabel="feed"
            style={styles.tab}
          >
            <AppText style={{ fontSize: 20, color: active === 'feed' ? palette.accent : palette.textDim }}>📣</AppText>
          </Pressable>
          <Pressable
            onPress={() => onSelect('letters')}
            accessibilityRole="tab"
            accessibilityState={{ selected: active === 'letters' }}
            accessibilityLabel="letters"
            style={styles.tab}
          >
            <AppText style={{ fontSize: 20, color: active === 'letters' ? palette.accent : palette.textDim }}>✉</AppText>
          </Pressable>
          <Pressable
            onPress={() => setMoreOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="more — friends, groups, shortcuts"
            style={styles.tab}
            testID="more-open"
          >
            <AppText style={{ fontSize: 20, color: palette.textDim }}>≡</AppText>
          </Pressable>
          <Pressable
            onPress={() => onSelect('feed')}
            accessibilityRole="button"
            accessibilityLabel="notifications"
            style={[styles.tab, styles.smallTab]}
          >
            <AppText style={{ fontSize: 20 }}>🔔</AppText>
            {bellActive && <View style={[styles.bellDot, { backgroundColor: palette.error }]} />}
          </Pressable>
          <UserMenu
            username={username}
            direction="up"
            onGoProfile={() => onSelect('profile')}
            trigger={(openMenu, openNow) => (
              <Pressable
                onPress={openMenu}
                accessibilityRole="button"
                accessibilityLabel={`account menu for ${username}`}
                accessibilityState={{ expanded: openNow }}
                style={styles.me}
              >
                <Avatar name={username} size={30} accessibilityLabel={`account menu of ${username}`} ring={active === 'profile'} />
              </Pressable>
            )}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  barWrap: { position: 'relative' as never, zIndex: 100 as never },
  bar: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingBottom: 10 },
  tab: { flex: 1, alignItems: 'center', paddingTop: 10 },
  smallTab: { flex: 'auto' as never, paddingHorizontal: 14 },
  bellDot: { position: 'absolute' as never, top: 10, right: 2 },
  me: { paddingRight: 14, paddingLeft: 4 },
  moreRow: { paddingVertical: 10, paddingHorizontal: 14 },
});
