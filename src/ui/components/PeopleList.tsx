import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppInput } from './AppInput';
import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { ConfirmModal } from './ConfirmModal';
import { useSampleData } from '../../data/sample/useSampleData';
import { useTheme } from '../theme/useTheme';
import type { UserRef } from '../../data/sample/types-shared';

// A searchable, scrolling people list — one component behind the friends bar
// on the feed, the member list in groups and events, and every invitation
// surface. Hundreds of friends: the sample store pads one mock beyond the
// named ones so searching actually filters.
export type Person = UserRef;

export function usePeoplePool(): Person[] {
  const { friends } = useSampleData();
  return useMemo(
    () =>
      (friends as Person[]).concat(
        Array.from({ length: 12 }, (_, i) => ({ id: `x-${i}`, username: `friend${i + 1}`, name: `Friend ${i + 1}` })),
      ),
    [friends],
  );
}

export function PeopleList({
  people,
  searchable = true,
  heading,
}: {
  people: Person[];
  searchable?: boolean;
  heading?: string;
}) {
  const [q, setQ] = useState('');
  const shown = people.filter(
    (p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.username.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <View style={styles.list}>
      {searchable && (
        <AppInput
          placeholder="search people…"
          value={q}
          onChangeText={setQ}
          testID="people-search"
          accessibilityLabel="search people"
        />
      )}
      <View style={{ gap: 2 }}>
        {shown.map((p) => (
          <PersonRow key={p.id} person={p} />
        ))}
        {shown.length === 0 && <AppText size="sm" tone="dim">nobody matches that</AppText>}
      </View>
    </View>
  );
}

export function PersonRow({ person }: { person: Person }) {
  return (
    <View style={styles.personRow}>
      <Avatar name={person.name} size={28} />
      <View style={styles.personMeta}>
        <AppText size="sm">{person.name}</AppText>
        <AppText size="sm" tone="dim">@{person.username}</AppText>
      </View>
    </View>
  );
}

// Invitation mechanics:
// - immediate (groups): clicking a person raises the confirm; confirming
//   invites straight away.
// - staging (events): clicking toggles the staged list; it sends upon
//   creating the event (whose create button is itself confirmed).
export function InviteFriendsPicker({
  title,
  staging = false,
  picked = [],
  onPickedChange,
  immediate = false,
  onPick,
}: {
  title?: string;
  staging?: boolean;
  picked?: string[];
  onPickedChange?: (picked: string[]) => void;
  immediate?: boolean;
  onPick?: (person: Person) => void;
}) {
  const { palette } = useTheme();
  const pool = usePeoplePool();
  const [q, setQ] = useState('');
  const [confirming, setConfirming] = useState<Person | null>(null);
  const shown = pool.filter(
    (p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.username.toLowerCase().includes(q.toLowerCase()),
  );

  function click(person: Person) {
    if (immediate) {
      setConfirming(person);
      return;
    }
    const next = picked.includes(person.name) ? picked.filter((n) => n !== person.name) : [...picked, person.name];
    onPickedChange?.(next);
  }

  return (
    <View>
      {title && <AppText size="sm" tone="dim">{title}</AppText>}
      <AppInput
        placeholder="search friends…"
        value={q}
        onChangeText={setQ}
        testID="invite-search"
        accessibilityLabel="search friends"
      />
      {staging && picked.length > 0 && (
        <AppText size="sm" tone="dim">staged: {picked.map((n) => `@${n}`).join(', ')}</AppText>
      )}
      <View>
        {shown.slice(0, 10).map((p) => (
          <Pressable
            key={p.id}
            onPress={() => click(p)}
            accessibilityRole="button"
            accessibilityLabel={staging ? `toggle ${p.name}` : `invite ${p.name}`}
            style={({ pressed }) => [styles.resultRow, pressed && { backgroundColor: palette.panelEdge }, picked.includes(p.name) && { backgroundColor: palette.panelEdge }]}
            testID={`invite-${p.username}`}
          >
            <Avatar name={p.name} size={24} />
            <AppText size="sm">{p.name}</AppText>
            <AppText size="sm" tone="dim" style={styles.handle}>@{p.username}</AppText>
            {picked.includes(p.name) && <AppText size="sm" style={{ color: palette.accent }}>✓</AppText>}
          </Pressable>
        ))}
      </View>
      <ConfirmModal
        open={confirming != null}
        title="Send invite?"
        message={`Invite ${confirming?.name} to the group? Keep it honest — posts stay among members.`}
        confirmLabel="send invite"
        onCancel={() => setConfirming(null)}
        onConfirm={() => {
          onPick?.(confirming!);
          setConfirming(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 4, borderRadius: 6 },
  personMeta: { gap: 0 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 6, borderRadius: 8 },
  handle: { marginLeft: 'auto' as never },
});
