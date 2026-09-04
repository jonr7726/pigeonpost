import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, EmptyState, Icon, List, Panel, QuillButton, Screen, ScreenScroll, TopBar, daysUntil, timeAgo } from '../ui/components';
import { WorldMap } from '../ui/components/WorldMap';
import { useLayoutMode } from '../ui/theme/breakpoints';
import { useTheme } from '../ui/theme/ThemeProvider';
import { useRouter } from '../ui/nav';
import { LetterPaper } from './LetterReadScreen';
import { LetterCompose } from './LetterComposeScreen';
import { useLetters, useMyPin, useSampleData } from '../data/sample/useSampleData';
import type { Letter } from '../data/sample/types-shared';

// Inbox (Letters tab). Mobile stacks everything; desktop is two-pane: chart +
// list on the left, and on the right the SAME pane opens letters *or* composes
// them (the quill opens compose here on desktop; a separate page on mobile).
export function LettersScreen() {
  const { letters, open } = useLetters();
  const { me, friends } = useSampleData();
  const myPin = useMyPin();
  const router = useRouter();
  const desktop = useLayoutMode() === 'desktop';
  const { palette } = useTheme();
  const [mode, setMode] = useState<'pane' | 'compose'>('pane');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = letters.find((entry) => entry.id === selectedId) ?? null;
  void open;

  const home = { x: myPin.pin.x, y: myPin.pin.y };
  const chartPins = useMemo(
    () => [
      { x: home.x, y: home.y, label: me.username, tone: 'you' as const },
      ...friends.map((f) => ({ x: f.pin.x, y: f.pin.y, label: f.mapLabel })),
    ],
    [home.x, home.y, me.username, friends],
  );
  const chartFlights = useMemo(
    () =>
      letters
        .filter((letter) => letter.state === 'inTransit')
        .map((letter) => {
          const peer = friends.find((f) => f.username === (letter.from.username === me.username ? letter.to.username : letter.from.username));
          const target = peer ? { x: peer.pin.x, y: peer.pin.y } : home;
          return letter.from.username === me.username ? { from: home, to: target, label: letter.subject } : { from: target, to: home, label: letter.subject };
        }),
    [letters, friends, me.username, home.x, home.y]
  );

  const openLetter = (letter: Letter) => {
    if (letter.state === 'inTransit' || letter.state === 'draft') return;
    open(letter.id);
    if (desktop) {
      setMode('pane');
      setSelectedId(letter.id);
    } else {
      router.push({ screen: 'letterRead', letterId: letter.id });
    }
  };

  const list = (items: Letter[]) => (
    <List<Letter>
      items={items}
      keyOf={(letter) => letter.id}
      divided
      renderItem={(letter) => <LetterRow letter={letter} selected={desktop && mode === 'pane' && selectedId === letter.id} onPress={() => openLetter(letter)} />}
      empty={{ what: 'No pigeons in sight', why: 'write the first letter to a friend' }}
    />
  );

  const chart = (
    <WorldMap
      height={desktop ? 200 : 180}
      cog
      onPinPlace={myPin.setPin}
      onFullscreen={() => router.push({ screen: 'map' })}
      pins={chartPins}
      flights={chartFlights}
    />
  );

  return (
    <Screen width={desktop ? 'full' : 'standard'}>
      <TopBar
        title="Letters"
        right={<QuillButton onPress={() => (desktop ? setMode('compose') : router.push({ screen: 'letterCompose' }))} />}
      />
      {desktop ? (
        <View style={styles.paneRow}>
          <View style={styles.paneLeft}>
            <ScreenScroll style={styles.grow} contentStyle={styles.paneScroll}>
              {chart}
              {list(letters)}
            </ScreenScroll>
          </View>
          <View style={[styles.paneRight, { backgroundColor: palette.panel, borderColor: palette.panelEdge, borderWidth: 1 }]}>
            <ScreenScroll style={styles.grow} contentStyle={styles.paneScroll}>
              {mode === 'compose' ? (
                <LetterCompose
                  onSent={() => {
                    setMode('pane');
                    setSelectedId(null);
                  }}
                />
              ) : selected != null ? (
                <LetterPaper letter={selected} firstOpen={false} />
              ) : (
                <EmptyState what="Pick a letter" why="the reading pane opens here — seals break once" />
              )}
            </ScreenScroll>
          </View>
        </View>
      ) : (
        <ScreenScroll>
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
          <AppText numberOfLines={1} tone={unread(letter) ? 'body' : 'dim'}>
            {unread(letter) ? '✉ ' : ''}
            {letter.subject}
          </AppText>
          <AppText tone="dim" size="sm">{`${letter.from.name} → ${letter.to.name} · ${timeAgo(letter.createdAt)}`}</AppText>
        </View>
        <View style={styles.chip}><StateChip letter={letter} /></View>
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
  left: { flex: 1, gap: 2, minWidth: 0 },
  chip: { flexShrink: 0 },
  paneRow: { flex: 1, flexDirection: 'row', gap: 12 },
  paneLeft: { flexBasis: '46%', flexGrow: 1 },
  paneRight: { flexBasis: '54%', flexGrow: 1 },
  paneScroll: { padding: 16, gap: 12 },
  grow: { flex: 1, flexGrow: 1, flexBasis: 0 },
});
