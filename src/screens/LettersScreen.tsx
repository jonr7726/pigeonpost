import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppText, Banner, Icon, List, Panel, Screen, TopBar, daysUntil, timeAgo } from '../ui/components';
import { WorldMap } from '../ui/components/WorldMap';
import { useRouter } from '../ui/nav';
import { useLetters, useSampleData } from '../data/sample/useSampleData';
import type { Letter } from '../data/sample/types-shared';

// Inbox (Letters tab): one threaded list in every state — in transit (with the
// travelling pigeon marker), sealed + arrived, opened (read), overdue, draft.
// Mobile stack; desktop two-pane (list left, read pane right) reads the same
// rows via the same components.
export function LettersScreen() {
  const { letters, open } = useLetters();
  const { me, friends } = useSampleData();
  const router = useRouter();
  return (
    <Screen width="wide">
      <TopBar
        title="Letters"
        showBell
        right={<AppButton label="Compose" variant="secondary" onPress={() => router.push({ screen: 'letterCompose' })} />}
      />
      <Banner>
        letters are one-offs — no threads, no unsend; keep the obvious chart small
      </Banner>
      <WorldMap
        height={180}
        pins={[
          { x: 0.5, y: 0.62, label: me.username, tone: 'you' },
          ...friends.map((f) => ({ x: f.pin.x, y: f.pin.y, label: f.mapLabel })),
        ]}
        flights={letters
          .filter((letter) => letter.state === 'inTransit')
          .map((letter) => {
            const home = { x: 0.5, y: 0.62 };
            const peer = friends.find((f) => f.username === (letter.from.username === me.username ? letter.to.username : letter.from.username));
            const target = peer ? { x: peer.pin.x, y: peer.pin.y } : home;
            return letter.from.username === me.username ? { from: home, to: target, label: letter.subject } : { from: target, to: home, label: letter.subject };
          })}
      />
      <List<Letter>
        items={letters}
        keyOf={(letter) => letter.id}
        divided
        renderItem={(letter) => (
          <LetterRow
            letter={letter}
            onPress={() => {
              if (letter.state === 'sealed' || letter.state === 'overdue' || letter.state === 'opened') {
                open(letter.id);
                router.push({ screen: 'letterRead', letterId: letter.id });
              }
            }}
          />
        )}
        empty={{ what: 'No pigeons in sight', why: 'write the first letter to a friend' }}
      />
    </Screen>
  );
}

export function LetterRow({ letter, onPress }: { letter: Letter; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`letter ${letter.subject}`}>
      <Panel style={styles.row}>
        <View style={styles.left}>
          <AppText tone={unread(letter) ? 'body' : 'dim'}>
            {unread(letter) ? '✉ ' : ''}
            {letter.subject}
          </AppText>
          <AppText tone="dim" size="sm">{`${letter.from.name} → ${letter.to.name} · ${timeAgo(letter.createdAt)}`}</AppText>
        </View>
        <StateChip letter={letter} />
        <Icon name={letter.state === 'inTransit' ? 'pigeon' : 'letters'} size={18} />
      </Panel>
    </Pressable>
  );
}

export function StateChip({ letter }: { letter: Letter }) {
  const copy: Record<Letter['state'], string> = {
    inTransit: `~${letter.arrivesAt ? daysUntil(letter.arrivesAt) : '?'} days — in flight`,
    sealed: 'sealed · arrived',
    opened: 'read',
    overdue: 'overdue',
    draft: 'draft',
  };
  return <AppText tone="accent" size="sm">{copy[letter.state]}</AppText>;
}

function unread(letter: Letter): boolean {
  return letter.state === 'sealed' || letter.state === 'overdue';
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 12 },
  left: { flex: 1, gap: 2 },
  brief: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
