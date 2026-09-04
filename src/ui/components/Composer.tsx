import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppInput } from './AppInput';
import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { InviteFriendsPicker } from './PeopleList';
import { Modal } from './Modal';
import { Panel } from './Panel';
import { markDraft } from './draftGuard';
import { useTheme } from '../theme/useTheme';
import { useSession } from '../session';

// The one post box, identical on the main feed and in groups: an always-open
// four-line text input, photo/video + tag-friends affordances, post button.
export function Composer({
  prompt,
  onPost,
}: {
  prompt?: string;
  onPost?: (text: string, tagged: string[], attached: string[]) => void;
}) {
  const { palette } = useTheme();
  const { username } = useSession();
  const [draft, setDraft] = useState('');
  const [attached, setAttached] = useState<string[]>([]);
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  const dirty = draft.length > 0 || attached.length > 0 || picked.length > 0;
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  useEffect(() => {
    markDraft(dirty);
  }, [dirty]);

  function clean() {
    setDraft('');
    setAttached([]);
    setPicked([]);
  }

  return (
    <Panel style={styles.card} testID="composer">
      <View style={styles.row}>
        <Avatar name={username ?? 'wren'} size={36} />
        <AppInput
          value={draft}
          onChangeText={setDraft}
          multiline
          placeholder={prompt ?? "what's on your wing?"}
          style={styles.input}
          testID="composer-input"
        />
      </View>
      {(attached.length > 0 || picked.length > 0) && (
        <AppText size="sm" tone="dim" style={styles.attachLine}>
          {attached.length > 0 && 'photo attached · '}{picked.length > 0 && `with ${picked.map((n) => `@${n}`).join(', ')}`}
        </AppText>
      )}
      <View style={styles.actions}>
        <Pressable
          onPress={() => setAttached((a) => (a.length ? [] : ['photo']))}
          accessibilityRole="button"
          accessibilityLabel="attach photo or video"
          style={styles.action}
          testID="composer-attach"
        >
          <AppText size="sm" style={{ color: palette.accent }}>
            {attached.length ? '📷 attached' : '📷/🎬 photo or video'}
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => setTagPickerOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="tag friends"
          style={styles.action}
        >
          <AppText size="sm" style={{ color: palette.accent }}>@tag friends</AppText>
        </Pressable>
        <Pressable
          onPress={() => {
            if (!draft.trim() && attached.length === 0) return;
            onPost?.(draft.trim(), picked, attached);
            clean();
          }}
          accessibilityRole="button"
          accessibilityLabel="post"
          style={[styles.postBtn, { backgroundColor: palette.accent }]}
          testID="composer-post"
        >
          <AppText size="sm" style={{ color: palette.bg }}>post</AppText>
        </Pressable>
      </View>
      <Modal visible={tagPickerOpen} onClose={() => setTagPickerOpen(false)} title="tag friends">
        <InviteFriendsPicker title="tag friends" staging picked={picked} onPickedChange={setPicked} />
        <Pressable
          onPress={() => setTagPickerOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="done"
          style={[styles.postBtn, { backgroundColor: palette.accent }]}
        >
          <AppText size="sm" style={{ color: palette.bg }}>done</AppText>
        </Pressable>
      </Modal>
    </Panel>
  );
}

const dirtyRef = { current: false };

const styles = StyleSheet.create({
  card: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  input: { flex: 1, minHeight: 96 },
  action: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  postBtn: { alignSelf: 'flex-end' as never, marginLeft: 'auto', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  attachLine: { paddingHorizontal: 4 },
});
