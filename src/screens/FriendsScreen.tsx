import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Avatar, Divider, List, Panel, Rule, Screen, ScreenScroll, TopBar } from '../ui/components';
import { useTheme } from '../ui/theme/ThemeProvider';
import { SearchBar } from '../ui/components/SearchBar';
import { useRouter } from '../ui/nav';
import { useSampleData } from '../data/sample/useSampleData';
import type { FriendRequest, UserRef } from '../data/sample/types-shared';

// Friends (Discover tab): the three things you come here for — your circle
// (tap a friend to open their profile), find a specific friend by exact
// username, and review incoming requests. A request's one-shot message shows
// only to the recipient here; it never opens a chat.
export function FriendsScreen() {
  const { friends, friendRequests } = useSampleData();
  const [query, setQuery] = useState('');
  const router = useRouter();
  const trimmed = query.trim().toLowerCase();
  const found: UserRef | null = trimmed !== '' ? friends.find((f) => f.username === trimmed) ?? stubFriend(trimmed) : null;

  const openProfile = (username: string) => router.push({ screen: 'username', username });

  return (
    <Screen width="standard">
      <TopBar title="Friends" />
      <View style={styles.searchWrap}>
        <SearchBar value={query} onChange={setQuery} placeholder="find a username…" />
      </View>
      <ScreenScroll>
        {found != null && <FoundCard found={found} isFriend={friends.some((f) => f.username === found.username)} onOpen={() => openProfile(found.username)} />}
        {friendRequests.length > 0 && (
          <View style={styles.section}>
            <AppText tone="display" size="md">Requests</AppText>
            <Rule label="❦" />
            {friendRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </View>
        )}
        <View style={styles.section}>
          <AppText tone="display" size="md">Your circle</AppText>
          <Rule label="❦" reverse />
          <List
            items={friends}
            keyOf={(friend) => friend.username}
            divided
            renderItem={(friend) => (
              <Pressable onPress={() => openProfile(friend.username)} accessibilityRole="button" accessibilityLabel={`open ${friend.name}'s profile`}>
                <View style={styles.circleRow}>
                  <Avatar name={friend.name} size={34} accessibilityLabel={`avatar of ${friend.name}`} />
                  <View style={styles.circleMeta}>
                    <AppText>{friend.name}</AppText>
                    <AppText tone="dim" size="sm">@{friend.username}</AppText>
                  </View>
                  <AppText size="sm" tone="dim">{friend.mapLabel}</AppText>
                  <View accessible={false} style={styles.arrow}><AppText tone="dim">›</AppText></View>
                </View>
              </Pressable>
            )}
            empty={{
              what: 'No friends yet',
              why: 'find someone by their exact username above — friendship is mutual',
            }}
          />
        </View>
      </ScreenScroll>
    </Screen>
  );
}

export function FoundCard({ found, isFriend, onOpen }: { found: UserRef; isFriend: boolean; onOpen?: () => void }) {
  return (
    <Panel style={styles.found}>
      <View style={styles.row}>
        <Avatar name={found.name} size={34} />
        <View style={styles.foundMeta}>
          <AppText>{found.name}</AppText>
          <AppText tone="dim" size="sm">@{found.username}</AppText>
        </View>
        <Pressable accessibilityRole="button" onPress={onOpen}>
          <AppText tone="accent" size="sm">{isFriend ? 'open profile →' : 'send request'}</AppText>
        </Pressable>
      </View>
      {!isFriend && (
        <AppText tone="dim" size="sm">
          a request can carry a one-shot message — they see it when they review; you can only reach friends
        </AppText>
      )}
    </Panel>
  );
}

export function RequestCard({ request }: { request: FriendRequest }) {
  const { palette } = useTheme();
  return (
    <Panel style={styles.request}>
      <View style={styles.row}>
        <Avatar name={request.from.name} size={30} />
        <AppText>@{request.from.username}</AppText>
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
        <Pressable accessibilityRole="button" style={[styles.btn, { backgroundColor: palette.accent }]}>
          <AppText size="sm">accept</AppText>
        </Pressable>
        <Pressable accessibilityRole="button" style={[styles.btn, { borderWidth: 1, borderColor: palette.panelEdge }]}>
          <AppText tone="dim" size="sm">decline</AppText>
        </Pressable>
      </View>
    </Panel>
  );
}

function stubFriend(username: string): UserRef {
  return { id: `q-${username}`, username, name: username.slice(0, 8) };
}

const styles = StyleSheet.create({
  searchWrap: { paddingVertical: 10 },
  section: { gap: 10, paddingTop: 14 },
  found: { gap: 8, padding: 14 },
  foundMeta: { flex: 1 },
  request: { gap: 8, padding: 14 },
  message: { fontStyle: 'italic' },
  buttons: { flexDirection: 'row', gap: 10 },
  btn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  circleRow: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 8 },
  circleMeta: { flex: 1 },
  arrow: { alignItems: 'center', width: 20 },
});
