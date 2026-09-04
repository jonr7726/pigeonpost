import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppButton, AppText, Modal } from './components';
import { useTheme } from '../theme/useTheme';
import type { EventScope, UserRef } from '../../data/sample/types-shared';
import { useSampleData } from '../../data/sample/useSampleData';
export type Draft = { title: string; text: string; when: string; where: string };

export function CreateEventModal({
  visible,
  onClose,
  onCreate,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate?: (draft: Draft, scope: EventScope, invited: UserRef[]) => void;
}) {
  const { friends } = useSampleData();
  const { palette } = useTheme();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [when, setWhen] = useState('');
  const [where, setWhere] = useState('');
  const [scope, setScope] = useState<EventScope>('friends');
  const [invited, setInvited] = useState<string[]>([]);

  function submit() {
    if (!title.trim()) return;
    onCreate?.(
      { title: title.trim(), text: text.trim(), when: when.trim() || 'date to be pinned', where: (where.trim() || undefined) as string },
      scope,
      friends.filter((f) => invited.includes(f.id)),
    );
    setTitle(''); setText(''); setWhen(''); setWhere(''); setInvited([]); setScope('friends');
  }

  return (
    <Modal visible={visible} onClose={onClose} title="Create event">
      <LabeledInput value={title} onChange={setTitle} placeholder="title" testID="event-title" />
      <LabeledInput value={text} onChange={setText} placeholder="what happens, and why come" multiline />
      <LabeledInput value={when} onChange={setWhen} placeholder="when (e.g. Sat 14th, 2pm)" />
      <LabeledInput value={where ?? ""} onChange={setWhere} placeholder="where (optional)" />
      <View style={styles.scopeRow}>
        <Pressable onPress={() => setScope('friends')} accessibilityRole="radio" accessibilityState={{ selected: scope === 'friends' }} style={[styles.scopeBtn, scope === 'friends' && { backgroundColor: palette.panelEdge }]}>
          <AppText size="sm">open to all friends</AppText>
        </Pressable>
        <Pressable onPress={() => setScope('invited')} accessibilityRole="radio" accessibilityState={{ selected: scope === 'invited' }} style={[styles.scopeBtn, scope === 'invited' && { backgroundColor: palette.panelEdge }]}>
          <AppText size="sm">invite specific friends</AppText>
        </Pressable>
      </View>
      {scope === 'invited' && (
        <View style={styles.inviteList}>
          {friends.map((f) => (
            <Pressable key={f.id} onPress={() => setInvited((i) => (i.includes(f.id) ? i.filter((x) => x !== f.id) : [...i, f.id]))} accessibilityRole="checkbox" accessibilityState={{ checked: invited.includes(f.id) }} style={[styles.tagRow, invited.includes(f.id) && { backgroundColor: palette.panelEdge }]}>
              <AppText size="sm">{f.name}{invited.includes(f.id) ? ' ✓' : ''}</AppText>
            </Pressable>
          ))}
        </View>
      )}
      <AppButton label="Create event" onPress={submit} full testID="event-create-submit" />
    </Modal>
  );
}


function LabeledInput({
  value, onChange, placeholder, multiline, testID,
}: { value: string; onChange: (v: string) => void; placeholder: string; multiline?: boolean; testID?: string }) {
  const { palette } = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={palette.textDim}
      multiline={multiline}
      testID={testID}
      style={[styles.memo, { color: palette.text, borderColor: palette.panelEdge }]}
    />
  );
}


const styles = StyleSheet.create({
  memo: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, minHeight: 40, textAlignVertical: 'top' as never },
  scopeRow: { flexDirection: 'row', gap: 8 },
  scopeBtn: { padding: 8, borderRadius: 8 },
  inviteList: { flexDirection: 'row', flexWrap: 'wrap' as never, gap: 8 },
  tagRow: { padding: 6, borderRadius: 6 },
});
