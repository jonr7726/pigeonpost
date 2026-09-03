import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { navTabs, type TabId } from './NavBar';
import { useTheme } from '../theme/useTheme';

// Desktop navigation (PM header-band port): walnut band + brass hairline,
// wordmark, the same four content tabs as the mobile bar, then bell + the
// user image (profile lives behind it). Global chrome only.
export function TopNav({
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
  return (
    <View style={[styles.band, { borderBottomColor: palette.panelEdge }]}>
      <Pressable onPress={() => onSelect('feed')} accessibilityRole="button" style={styles.word}>
        <AppText tone="display" size="md">
          🕊️ pigeonpost
        </AppText>
      </Pressable>
      <View style={styles.nav}>
        {navTabs.map(({ id, label }) => (
          <Pressable
            key={id}
            onPress={() => onSelect(id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active === id }}
            style={[styles.link, active === id && { borderBottomColor: palette.accent, borderBottomWidth: 2 }]}
          >
            <AppText size="sm" tone={active === id ? 'accent' : 'dim'} style={styles.linkText}>
              {label}
            </AppText>
          </Pressable>
        ))}
      </View>
      <View style={styles.side}>
        <Pressable onPress={() => onSelect('feed')} accessibilityRole="button" accessibilityLabel="notifications">
          <AppText style={styles.bell}>🔔{bellActive ? '·' : ''}</AppText>
        </Pressable>
        <Pressable
          onPress={() => onSelect('profile')}
          accessibilityRole="button"
          accessibilityLabel={`your profile, ${username}`}
          accessibilityState={{ selected: active === 'profile' }}
          style={styles.me}
        >
          <Avatar name={username} size={26} accessibilityLabel={`profile of ${username}`} />
          <AppText tone="dim" size="sm">@{username}</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    paddingHorizontal: 20, borderBottomWidth: 1, backgroundColor: 'transparent',
  },
  nav: { flexDirection: 'row', gap: 18 },
  link: { paddingVertical: 14, borderBottomWidth: 0 },
  linkText: { fontFamily: 'Menlo, Consolas, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' },
  word: { paddingVertical: 10 },
  side: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingRight: 14 },
  bell: { fontSize: 17 },
  me: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
