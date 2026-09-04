import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, PeopleList, usePeoplePool } from '../ui/components';
import { useTheme } from '../ui/theme/useTheme';
import { useRouter } from '../ui/nav';
import { useEvents } from '../data/sample/useSampleData';
import type { UserRef } from '../data/sample/types-shared';

// Full-page event screen — the create screen's layout, read-only: photo
// plate, title, when/where, the big description, and the member list (the
// one people list, same as the feed's friends list and a group's members).
// You land here after creating your own event; any event card navigates here.
export function EventScreen({ eventId }: { eventId: string }) {
  const { palette } = useTheme();
  const router = useRouter();
  const { events } = useEvents();
  const event = events.find((e) => e.id === eventId);
  if (event == null) {
    return (
      <View style={{ gap: 10 }}>
        <AppText tone="dim">that event is gone</AppText>
        <Pressable onPress={() => router.goTab('events')} accessibilityRole="button">
          <AppText style={{ color: palette.accent }}>‹ back to events</AppText>
        </Pressable>
      </View>
    );
  }
  const hosts =
    event.scope === 'friends'
      ? 'open to all your friends'
      : `invited: ${event.invited.map((u) => u.name).join(', ') || '—'}`;
  return (
    <View style={styles.page}>
      <Pressable onPress={() => router.pop()} accessibilityRole="button" accessibilityLabel="back">
        <AppText size="sm" tone="dim">‹ back</AppText>
      </Pressable>
      <AppText tone="display" size="lg">{event.title}</AppText>
      <View style={[styles.plate, { backgroundColor: palette.panel }]} />
      <View style={styles.metaRow}>
        <AppText size="sm">📅 {event.when}</AppText>
        {event.where != null && <AppText size="sm">📍 {event.where}</AppText>}
      </View>
      <AppText size="sm" tone="dim">{hosts}</AppText>
      <AppText size="sm" tone="dim">description</AppText>
      <AppText size="md">{event.text}</AppText>
      <MembersSection invited={event.invited} allFriends={event.scope === 'friends'} />
    </View>
  );
}

function MembersSection({ invited, allFriends }: { invited: UserRef[]; allFriends: boolean }) {
  const { palette } = useTheme();
  void palette;
  return (
    <View style={{ gap: 8 }}>
      {invited.length > 0 ? (
        <>
          <AppText size="sm" tone="dim">members</AppText>
          <PeopleList people={invited} searchable={false} />
        </>
      ) : allFriends ? (
        <>
          <AppText size="sm" tone="dim">everyone in your circle can see this</AppText>
          <PeopleList people={usePeoplePool()} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, gap: 10, paddingBottom: 12 },
  metaRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  plate: { height: 120, borderRadius: 10 },
  descBox: { borderWidth: 1, borderRadius: 8, padding: 10 },
});
