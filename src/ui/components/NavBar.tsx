import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { Icon, type IconName } from './Icon';
import { useTheme } from '../theme/useTheme';

export type TabId = 'letters' | 'feed' | 'discover' | 'profile' | 'settings';

// Four content tabs; profile is reached from the user image (your rule) and
// the bell rides in the bar with its badge. Desktop swaps this for TopNav —
// same TabId list in both renderers.
export const navTabs: { id: TabId; icon: IconName; label: string }[] = [
  { id: 'letters', icon: 'letters', label: 'Letters' },
  { id: 'feed', icon: 'home', label: 'Feed' },
  { id: 'discover', icon: 'compass', label: 'Friends' },
  { id: 'settings', icon: 'settings', label: 'Settings' },
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
  return (
    <View style={[styles.bar, { borderTopColor: palette.panelEdge, backgroundColor: palette.band }]}>
      {navTabs.map(({ id, icon, label }) => {
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
            <Icon name={icon} size={20} />
            <AppText size="sm" tone={isActive ? 'accent' : 'dim'} style={styles.label}>
              {label}
            </AppText>
            {isActive && <View style={[styles.dot, { backgroundColor: palette.accent }]} />}
          </Pressable>
        );
      })}
      <Pressable onPress={() => onSelect('feed')} accessibilityRole="button" accessibilityLabel="notifications" style={[styles.tab, styles.bell]}>
        <Icon name="bell" size={20} />
        {bellActive && <View style={[styles.dot, styles.bellDot, { backgroundColor: palette.error }]} />}
      </Pressable>
      <Pressable
        onPress={() => onSelect('profile')}
        accessibilityRole="button"
        accessibilityLabel={`your profile, ${username}`}
        accessibilityState={{ selected: active === 'profile' }}
        style={styles.me}
      >
        <Avatar name={username} size={30} ring={active === 'profile'} accessibilityLabel={`profile of ${username}`} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: 1, paddingBottom: 12, alignItems: 'center' },
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingTop: 10 },
  label: { fontSize: 11 },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },
  bell: { flex: 'auto' as never, gap: 0 },
  bellDot: { position: 'absolute', top: 12, right: 2 },
  me: { paddingRight: 14, paddingLeft: 4 },
});
