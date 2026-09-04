import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { Divider } from './Divider';
import { ShortcutsSection } from './ShortcutsSection';
import { useTheme } from '../theme/useTheme';
import { useRouter } from '../nav';
import { useGroups } from '../../data/sample/useSampleData';

// The desktop left rail, old-Facebook-shaped: your identity card, then the
// scrollable divided sections — Groups above Shortcuts (shortcuts open on
// click; hover raises an ✕ that removes with a confirmation).
// Desktop-only: AppShell never mounts it on mobile.
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
            <AppText size="sm" tone="dim">{g.members.length} members</AppText>
          </View>
        </Pressable>
      ))}
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
});
