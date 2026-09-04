import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { Panel } from './Panel';
import { useSession } from '../session';
import { useTheme } from '../theme/useTheme';

// The create-post box at the top of the feed (old-Facebook shape): a prompt
// that opens to a text box with photo/video and tag-friends affordances.
// Storyboard attach: "photo" chips a surface. Tag friends drops a chip list.
export function Composer({ onPost }: { onPost?: (text: string, tagged: number) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [tagged, setTagged] = useState<string[]>([]);
  const [tagPicker, setTagPicker] = useState(false);
  const { palette } = useTheme();
  const { username } = useSession();

  const friends = [
    { id: 'f-1', username: 'marta', name: 'Marta' },
    { id: 'f-2', username: 'hubert', name: 'Hubert' },
    { id: 'f-3', username: 'nia', name: 'Nia' },
    { id: 'f-4', username: 'otto', name: 'Otto' },
  ];
  const toggleTagFriend = (id: string) =>
    setTagged((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  function submit() {
    if (!draft.trim() && !hasPhoto) return;
    onPost?.(draft.trim(), tagged.length);
    setDraft('');
    setHasPhoto(false);
    setTagged([]);
    setOpen(false);
  }

  return (
    <Panel style={styles.card} testID="composer">
      <View style={styles.promptRow}>
        <Avatar name={username ?? 'wren'} size={32} />
        {open ? (
          <View style={styles.openBody}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="what's on your wing, wren?"
              placeholderTextColor={palette.textDim}
              multiline
              style={[styles.postInput, { color: palette.text, borderColor: palette.panelEdge }]}
              accessibilityLabel="write a post"
              autoFocus
            />
            {(hasPhoto || tagged.length > 0) && (
              <AppText size="sm" tone="dim" style={styles.attachLine}>
                {hasPhoto && '📷 1 photo attached  '}{hasVideo && '🎬 video attached  '}
                {tagged.length > 0 && `with ${tagged.length} tagged`}
              </AppText>
            )}
            <View style={styles.actions}>
              <Pressable onPress={() => setHasPhoto((v) => !v)} accessibilityRole="button" accessibilityLabel="attach photo or video" style={styles.action}>
                <AppText size="sm" style={{ color: palette.accent }}>{hasPhoto ? '📷 ✓' : '📷 / 🎬'} photo or video</AppText>
              </Pressable>
              <Pressable onPress={() => setTagPicker((v) => !v)} accessibilityRole="button" accessibilityLabel="tag friends" style={styles.action}>
                <AppText size="sm" style={{ color: palette.accent }}>@tag friends</AppText>
              </Pressable>
              <Pressable onPress={submit} accessibilityRole="button" testID="composer-post" style={[styles.action, styles.post, { backgroundColor: palette.accent }]}>
                <AppText size="sm" style={{ color: palette.bg }}>{open ? '' : ''}post</AppText>
              </Pressable>
            </View>
            {tagPicker && (
              <View style={[styles.tagPicker, { borderColor: palette.panelEdge }]}>
                {friends.map((f) => (
                  <Pressable key={f.id} onPress={() => toggleTagFriend(f.id)} accessibilityRole="button" style={() => [styles.tagRow, ]}>
                    <Avatar name={f.name} size={20} />
                    <AppText size="sm">{f.name}</AppText>
                    <AppText size="sm" tone="dim" style={styles.tagCheck}>{tagged.includes(f.id) ? '✓' : ''}</AppText>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        ) : (
          <Pressable onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel="create post" style={styles.prompt} testID="composer-open">
            <AppText tone="dim">what's on your wing?</AppText>
          </Pressable>
        )}
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  card: { padding: 8 },
  promptRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  prompt: { flex: 1, paddingVertical: 8 },
  openBody: { flex: 1, gap: 8 },
  postInput: { borderWidth: 0, borderBottomWidth: 1, padding: 8, fontSize: 14, minHeight: 44, textAlignVertical: 'top' },
  attachLine: { paddingHorizontal: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  action: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  post: { marginLeft: 'auto' },
  tagPicker: { borderWidth: 1, borderRadius: 8, padding: 4 },
  tagRow: { padding: 4, borderRadius: 6 },
  tagCheck: { marginLeft: 'auto', width: 40, textAlign: 'right' as never },
});
