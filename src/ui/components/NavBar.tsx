import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { useTheme } from '../theme/useTheme';

export type TabId = 'letters' | 'feed' | 'discover' | 'profile' | 'settings';

const tabs: { id: TabId; icon: IconName; label: string }[] = [
  { id: 'letters', icon: 'letters', label: 'Letters' },
  { id: 'feed', icon: 'home', label: 'Feed' },
  { id: 'discover', icon: 'compass', label: 'Discover' },
  { id: 'profile', icon: 'profile', label: 'Profile' },
  { id: 'settings', icon: 'settings', label: 'Settings' },
];

// Bottom tab bar (mobile + tablet). Desktop swaps this for SideRail — same tab
// list, same items object.
export function NavBar({ active, onSelect }: { active: TabId; onSelect: (tab: TabId) => void }) {
  const { palette } = useTheme();
  return (
    <View style={[styles.bar, { borderTopColor: palette.panelEdge, backgroundColor: palette.panel }]}>
      {tabs.map(({ id, icon, label }) => {
        const isActive = active === id;
        return (
          <Pressable
            key={id}
            onPress={() => onSelect(id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
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
    </View>
  );
}

export { tabs as navTabs };

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: 1, paddingBottom: 12 },
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingTop: 10 },
  label: { fontSize: 11 },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },
});
