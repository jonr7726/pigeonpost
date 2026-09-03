import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppText, Banner, EmptyState, Icon, List, Panel, Screen, ScreenScroll, TopBar, daysUntil, timeAgo } from '../ui/components';
import { WorldMap } from '../ui/components/WorldMap';
import { useLayoutMode } from '../ui/theme/breakpoints';
import { useTheme } from '../ui/theme/ThemeProvider';
import { useRouter } from '../ui/nav';
import { LetterPaper } from './LetterReadScreen';
import { useLetters, useSampleData } from '../data/sample/useSampleData';
import type { Letter } from '../data/sample/types-shared';

// Inbox (Letters tab). One threaded list in every state — in transit, sealed,
// opened (read), overdue, draft. Mobile stacks everything; desktop is two-pane:
// chart + list on the left, the reading pane on the right (same components
// both sides — layout branches, components never).
export function LettersScreen() {
  const { letters, open } = useLetters();
  const { me, friends } = useSampleData();
  const router = useRouter();
  const desktop = useLayoutMode() === 'desktop';
  const { palette } = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = letters.find((entry) => entry.id === selectedId) ?? null;
  void open;

  const openLetter = (letter: Letter) => {
    if (letter.state === 'inTransit' || letter.state === 'draft') return;
    open(letter.id);
    if (desktop) setSelectedId(letter.id);
    else router.push({ screen: 'letterRead', letterId: letter.id });
  };

  const list = (items: Letter[]) => (
    <List<Letter>
      items={items}
      keyOf={(letter) => letter.id}
      divided
      renderItem={(letter) => <LetterRow letter={letter} selected={desktop && selectedId === letter.id} onPress={() => openLetter(letter)} />}
      empty={{ what: 'No pigeons in sight', why: 'write the first letter to a friend' }}
    />
  );

  const chart = (
    <WorldMap
      height={desktop ? 200 : 180}
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
  );

  return (
    <Screen width="wide">
      <TopBar
        title="Letters"
        showBell
        right={<AppButton label="Compose" variant="secondary" onPress={() => router.push({ screen: 'letterCompose' })} />}
      />
      {desktop ? (
        <View style={styles.paneRow}>
          <View style={styles.paneLeft}>
            <ScreenScroll style={styles.grow} contentStyle={styles.paneScroll}>
              <Banner>letters are one-offs — no threads, no unsend</Banner>
              {chart}
              {list(letters)}
            </ScreenScroll>
          </View>
          <View style={[styles.paneRight, { backgroundColor: palette.paper }]}>
            <ScreenScroll style={styles.grow}>
              {selected != null ? (
                <LetterPaper letter={selected} firstOpen={false} />
              ) : (
                <EmptyState what="Pick a letter" why="the reading pane opens here — seals break once" />
              )}
            </ScreenScroll>
          </View>
        </View>
      ) : (
        <ScreenScroll>
          <Banner>letters are one-offs — no threads, no unsend</Banner>
          {chart}
          {list(letters)}
        </ScreenScroll>
      )}
    </Screen>
  );
}

export function LetterRow({ letter, onPress, selected }: { letter: Letter; onPress?: () => void; selected?: boolean }) {
  const { palette } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`letter ${letter.subject}`}>
      <Panel style={[styles.row, selected && { borderTopWidth: 2, borderTopColor: palette.accent }]}>
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
  paneRow: { flex: 1, flexDirection: 'row', gap: 12 },
  paneLeft: { flexBasis: '46%', flexGrow: 1 },
  paneRight: { flexBasis: '54%', flexGrow: 1 },
  paneScroll: { gap: 12, paddingBottom: 24 },
  grow: { flex: 1, flexGrow: 1, flexBasis: 0 },
});
