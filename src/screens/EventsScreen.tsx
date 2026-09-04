import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, CreateEventModal, EventCard, Panel } from '../ui/components';
import { useRouter } from '../ui/nav';
import { useEvents } from '../data/sample/useSampleData';

// The events storyboard view: the feed/events toggle lives in the desktop
// rail; here the list, plus create → the create-event modal (invite specific
// friends or open it to all friends).
export function EventsScreen() {
  const router = useRouter();
  const { events, like, add } = useEvents();
  const [creating, setCreating] = useState(false);

  return (
    <>
      <CreateEventModal
        visible={creating}
        onClose={() => setCreating(false)}
        onCreate={(draft, scope, invited) =>
          add({ title: draft.title, text: draft.text, when: draft.when, where: draft.where, scope, invited })
        }
      />
      <Panel style={styles.createBar}>
        <AppText tone="display" size="md">events</AppText>
        <AppButton label="+ Create event" onPress={() => setCreating(true)} testID="create-event-open" />
      </Panel>
      <View style={styles.stack}>
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onLike={() => like(event.id)}
            onPress={() => router.goTab('feed')}
          />
        ))}
        {events.length === 0 && <AppText tone="dim">no events in the circle yet</AppText>}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  createBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  stack: { gap: 12, marginTop: 2 },
});
