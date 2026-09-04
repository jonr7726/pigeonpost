import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { LikeButton } from './LikeButton';
import { Panel } from './Panel';
import { useTheme } from '../theme/useTheme';
import type { PigeonEvent } from '../../data/sample/types-shared';

// Events read like posts (same card grammar) with the event specifics: when,
// where, who's invited. `invited` shows short names; scope 'friends' = open to
// all your friends.
export function EventCard({
  event,
  onLike,
  onPress,
}: {
  event: PigeonEvent;
  onLike: () => void;
  onPress?: () => void;
}) {
  const { palette } = useTheme();
  const names = event.author.name;
  return (
    <Panel style={styles.card}>
      <Pressable onPress={onPress} accessibilityRole="button" style={styles.head}>
        <Avatar name={names} size={36} />
        <View>
          <AppText size="md" tone="display">{event.title}</AppText>
          <AppText size="sm" tone="dim">hosted by {names}</AppText>
        </View>
      </Pressable>
      <AppText size="md">{event.text}</AppText>
      <View style={[styles.meta, { borderColor: palette.panelEdge }]}>
        <AppMeta label="📅" value={event.when} />
        {event.where != null && <AppMeta label="📍" value={event.where} />}
        <AppMeta
          label="👥"
          value={event.scope === 'friends' ? 'open to all friends' : `invited: ${event.invited.map((u) => u.name).join(', ') || '—'}`}
        />
        <AppMeta label="🕊" value={`${event.going} going`} />
      </View>
      <View style={styles.foot}>
        <LikeButton liked={event.liked} count={event.going} onPress={onLike} />
      </View>
    </Panel>
  );
}

function AppMeta({ label, value }: { label: string; value: string }) {
  const { palette } = useTheme();
  return (
    <View style={styles.metaRow}>
      <AppText style={{ fontSize: 12 }}>{label}</AppText>
      <AppText size="sm" style={{ color: palette.text }}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  meta: { gap: 4, borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 8 },
  metaRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  foot: { flexDirection: 'row' },
});
