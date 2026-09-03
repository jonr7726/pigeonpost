import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { navTabs, type TabId } from './NavBar';
import { useTheme } from '../theme/useTheme';

// Desktop global chrome: vertical rail with the same navTabs list. The rail
// always follows the viewer's own app theme (never a page's theme).
export function SideRail({
  active,
  onSelect,
  username,
}: {
  active: TabId;
  onSelect: (tab: TabId) => void;
  username?: string;
}) {
  const { palette } = useTheme();
  return (
    <View style={[styles.rail, { borderRightColor: palette.panelEdge, backgroundColor: palette.panel }]}>
      <AppText tone="display" size="lg" align="center">
        🕊️
      </AppText>
      <View style={styles.items}>
        {navTabs.map((tab) => (
          <Pressable
            key={tab.label.toLowerCase()}
            onPress={() => onSelect(tab.label.toLowerCase() as TabId)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active === tab.label.toLowerCase() }}
            style={[styles.item, active === tab.label.toLowerCase() && { backgroundColor: palette.accent }]}
          >
            <Icon name={tab.icon} size={18} />
            <AppText size="md" tone={active === tab.label.toLowerCase() ? 'invert' : 'dim'}>
              {tab.label}
            </AppText>
          </Pressable>
        ))}
      </View>
      {username != null && (
        <View style={styles.foot}>
          <Avatar name={username} size={32} />
          <AppText size="sm" tone="dim">
            @{username}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { width: 190, borderRightWidth: 1, paddingVertical: 24, paddingHorizontal: 12, justifyContent: 'space-between' },
  items: { gap: 6, marginTop: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  foot: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 8 },
});
