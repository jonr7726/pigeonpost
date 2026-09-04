import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppInput, AppText, ConfirmModal, InviteFriendsPicker } from '../ui/components';
import { useRouter } from '../ui/nav';
import { useTheme } from '../ui/theme/useTheme';
import { markDraft } from '../ui/components/draftGuard';
import { useEvents } from '../data/sample/useSampleData';
import type { EventScope } from '../data/sample/types-shared';

// Whole-page create-event screen: photo plate (upload UI — storyboard), a big
// description (2–3 paragraphs assumed), when/where, all-friends vs invited,
// and a staged invite picker (search; sends upon the confirmed create). Back
// and Cancel raise the discard confirmation once the form has anything in it.
export function CreateEventScreen() {
  const { palette } = useTheme();
  const router = useRouter();
  const { add } = useEvents();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [when, setWhen] = useState('');
  const [where, setWhere] = useState('');
  const [scope, setScope] = useState<EventScope>('friends');
  const [invited, setInvited] = useState<string[]>([]);
  const [createConfirm, setCreateConfirm] = useState(false);
  const [discard, setDiscard] = useState(false);

  const dirty = title.length + text.length + when.length + where.length + invited.length > 0;
  useEffect(() => {
    markDraft(dirty);
  }, [dirty]);

  function leave() {
    markDraft(false);
    router.pop();
  }

  function submit() {
    const id = add({
      title: title.trim() || 'an event yet to be named',
      text: text.trim() || 'details on the wing',
      when: when.trim() || 'date to be pinned',
      where: where.trim() || undefined,
      scope,
      invited: [],
      plate: undefined,
    });
    markDraft(false);
    setCreateConfirm(false);
    router.pop();
    router.push({ screen: 'event', eventId: id });
  }

  return (
    <>
      <View style={styles.page}>
        <Pressable
          onPress={() => (dirty ? setDiscard(true) : leave())}
          accessibilityRole="button"
          accessibilityLabel="back"
          testID="event-back"
        >
          <AppText size="sm" tone="dim">‹ back</AppText>
        </Pressable>
        <AppText tone="display" size="lg">create event</AppText>

        <View style={[styles.plate, { backgroundColor: palette.panel }]} testID="event-photo-plate" />

        <AppInput placeholder="event title" value={title} onChangeText={setTitle} testID="event-title" />
        <View style={styles.row}>
          <AppInput placeholder="when (e.g. Sat 14th, 2pm)" value={when} onChangeText={setWhen} style={styles.half} />
          <AppInput placeholder="where (optional)" value={where} onChangeText={setWhere} style={styles.half} />
        </View>
        <AppText size="sm" tone="dim">description</AppText>
        <AppInput
          multiline
          placeholder="what happens, and why come… two or three paragraphs is welcome"
          value={text}
          onChangeText={setText}
          style={styles.desc}
          testID="event-desc"
        />

        <View style={styles.scopeRow}>
          <Pressable onPress={() => setScope('friends')} accessibilityRole="radio" accessibilityState={{ selected: scope === 'friends' }} style={[styles.scopeBtn, scope === 'friends' && { backgroundColor: palette.panelEdge }]}>
            <AppText size="sm">open to all friends</AppText>
          </Pressable>
          <Pressable onPress={() => setScope('invited')} accessibilityRole="radio" accessibilityState={{ selected: scope === 'invited' }} style={[styles.scopeBtn, scope === 'invited' && { backgroundColor: palette.panelEdge }]}>
            <AppText size="sm">invite specific friends</AppText>
          </Pressable>
        </View>

        {scope === 'invited' && (
          <InviteFriendsPicker
            title="invite friends"
            staging
            picked={invited}
            onPickedChange={setInvited}
          />
        )}

        <View style={styles.footRow}>
          <Pressable
            onPress={() => (dirty ? setDiscard(true) : leave())}
            accessibilityRole="button"
            accessibilityLabel="cancel creating event"
            testID="event-cancel"
          >
            <AppText size="sm" tone="dim">cancel</AppText>
          </Pressable>
          <Pressable
            onPress={() => setCreateConfirm(true)}
            accessibilityRole="button"
            accessibilityLabel="create event"
            style={[styles.postBtn, { backgroundColor: palette.accent }]}
            testID="event-create-submit"
          >
            <AppText size="sm" style={{ color: palette.bg }}>create event</AppText>
          </Pressable>
        </View>
      </View>

      <ConfirmModal
        open={createConfirm}
        title="Create this event?"
        message={invited.length > 0 ? `Invitations go to ${invited.map((n) => `@${n}`).join(', ')} with the event.` : 'The event opens to all your friends.'}
        confirmLabel="create"
        onCancel={() => setCreateConfirm(false)}
        onConfirm={submit}
      />
      <ConfirmModal
        open={discard}
        title="Discard this event?"
        message="Leaving now discards the half-created event."
        danger
        confirmLabel="discard"
        onCancel={() => setDiscard(false)}
        onConfirm={() => {
          setDiscard(false);
          leave();
        }}
      />
    </>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, gap: 10 },
  plate: { height: 120, borderRadius: 10 },
  row: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
  desc: { minHeight: 140 },
  scopeRow: { flexDirection: 'row', gap: 8 },
  scopeBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  footRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  postBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
});
