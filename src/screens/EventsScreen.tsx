import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, EventCard } from '../ui/components';
import { useRouter } from '../ui/nav';
import { useTheme } from '../ui/theme/useTheme';
import { useEvents } from '../data/sample/useSampleData';

// Events storyboard view: a plain + Create event button (no card around it),
// then the list. Clicking an event opens the full-page event screen.
export function EventsScreen() {
  const router = useRouter();
  const { events, like } = useEvents();

  return (
    <View style={styles.stack}>
      <CreateButton />
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onLike={() => like(event.id)}
          onPress={() => router.push({ screen: 'event', eventId: event.id })}
        />
      ))}
      {events.length === 0 && <AppText tone="dim">no events in the circle yet</AppText>}
    </View>
  );
}

function CreateButton() {
  const { palette } = useTheme();
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push({ screen: 'eventCreate' })}
      accessibilityRole="button"
      accessibilityLabel="create event"
      style={[styles.createBtn, { backgroundColor: palette.accent }]}
      testID="create-event-open"
    >
      <AppText style={{ color: palette.bg }}>＋ Create event</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 12 },
  createBtn: { alignSelf: 'flex-start' as never, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
});
