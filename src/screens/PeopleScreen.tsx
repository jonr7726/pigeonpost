import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Avatar, Banner, Divider, List, Panel, Screen, TopBar } from '../ui/components';
import { SearchBar } from '../ui/components/SearchBar';
import { useRouter } from '../ui/nav';
import { useSampleData } from '../data/sample/useSampleData';
import { useTheme } from '../ui/theme/ThemeProvider';
import type { Friend, FriendRequest, UserRef } from '../data/sample/types-shared';

// People (Discover tab): exact-username friend search + the requests review.
// A request's one-shot message shows here to the recipient only — it never
// opens a chat.
export function PeopleScreen() {
  const { friends, friendRequests } = useSampleData();
  const [query, setQuery] = useState('');
  const found: Friend | UserRef | null =
    query.trim() !== '' ? friends.find((f) => f.username === query.trim().toLowerCase()) ?? stubFriend(query.trim()) : null;
  return (
    <Screen width="narrow">
      <TopBar title="People" showBell />
      <SearchBar value={query} onChange={setQuery} placeholder="find a username…" />
      <List<FriendRequest>
        items={friendRequests}
        keyOf={(request) => request.id}
        renderItem={(request) => <RequestCard request={request} />}
        header={
          found != null && (
            <Panel style={styles.row}>
              <Row name={found.name} username={found.username} />
              <AppText tone="dim" size="sm">requesting carries your wrapped circle keys — accepting opens your circle’s history to them</AppText>
            </Panel>
          )
        }
        empty={{
          what: query.trim() ? 'no account under that exact username' : 'friend requests land here',
          why: query.trim() ? 'usernames match exactly' : 'find someone above — you can only reach friends',
        }}
      />
    </Screen>
  );
}

function stubFriend(name: string): UserRef {
  return { id: `q-${name}`, username: name, name: name.slice(0, 8) };
}

export function RequestCard({ request }: { request: FriendRequest }) {
  const { palette } = useTheme();
  return (
    <Panel style={styles.request}>
      <View style={styles.row}>
        <Avatar name={request.from.name} size={30} />
        <AppText>{`@${request.from.username}`}</AppText>
      </View>
      {request.message != null && (
        <>
          <Divider />
          <AppText tone="dim" style={styles.message}>
            {request.message}
          </AppText>
        </>
      )}
      <View style={styles.buttons}>
        <Pressable style={[styles.btn, { backgroundColor: palette.accent }]} accessibilityRole="button">
          <AppText>accept</AppText>
        </Pressable>
        <Pressable style={styles.btn} accessibilityRole="button">
          <AppText tone="dim">decline</AppText>
        </Pressable>
      </View>
    </Panel>
  );
}

export function Row({ name, username }: { name: string; username: string }) {
  return (
    <View style={styles.request}>
      <Avatar name={name} size={30} />
      <AppText>{name}</AppText>
      <AppText tone="dim">@{username}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  request: { gap: 8, padding: 14 },
  message: { fontStyle: 'italic' },
  buttons: { flexDirection: 'row', gap: 10 },
  btn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
});
