import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppInput, AppText, Avatar, Panel, PostCard } from '../ui/components';
import { useLayoutMode } from '../ui/theme/breakpoints';
import { useTheme } from '../ui/theme/useTheme';
import { useGroups, useSampleData } from '../data/sample/useSampleData';
import type { Group, UserRef } from '../data/sample/types-shared';

// A group is an invite-only mini-feed. Desktop: two columns — the feed column
// is the same width as the main feed, settings rides to its right (the pair
// shares the 2/3 content rule). Mobile stacks, with the settings pane behind a
// segmented feed/settings toggle on top.
export function GroupScreen({ groupId }: { groupId: string }) {
  const { palette } = useTheme();
  const desktop = useLayoutMode() === 'desktop';
  const { groups, rename, leave, invite, decide, post, like } = useGroups();
  const { friends } = useSampleData();
  const group = groups.find((g) => g.id === groupId);
  const [pane, setPane] = useState<'feed' | 'settings'>('feed');

  if (group == null) {
    return (
      <View style={styles.mobile}>
        <AppText tone="dim">this group is gone (or you left it).</AppText>
        <AppText tone="dim" style={{ marginTop: 8 }}>groups you were in:</AppText>
        <GroupList />
      </View>
    );
  }

  const settings = (
    <GroupSettings
      group={group}
      friends={friends.filter((f) => !group.members.some((m) => m.username === f.username))}
      onRename={(name) => rename(group.id, name)}
      onLeave={() => leave(group.id)}
      onInvite={(us) => invite(group.id, us)}
      onDecide={(username, accept) => decide(group.id, username, accept)}
    />
  );
  const feed = (
    <View style={styles.feedCol}>
      <ComposerInline onPost={(text) => post(group.id, text)} />
      {group.posts.map((p) => (
        <PostCard key={p.id} post={p} onLike={() => like(group.id, p.id)} />
      ))}
    </View>
  );

  if (!desktop) {
    return (
      <View style={styles.mobile}>
        <AppText tone="display" size="lg">{group.name}</AppText>
        <View style={styles.seg}>
          {(['feed', 'settings'] as const).map((p) => (
            <Pressable key={p} onPress={() => setPane(p)} accessibilityRole="radio" accessibilityState={{ selected: pane === p }} style={[styles.segBtn, pane === p && { backgroundColor: palette.panelEdge }]}>
              <AppText size="sm">{p}</AppText>
            </Pressable>
          ))}
        </View>
        {pane === 'feed' ? feed : settings}
      </View>
    );
  }

  return (
    <View style={[styles.columns, { backgroundColor: palette.bg }]}>
      <View style={styles.main}>{feed}</View>
      <View style={styles.side}>{settings}</View>
    </View>
  );
}

function GroupList() {
  const { groups } = useGroups();
  return (
    <View style={styles.feedCol}>
      {groups.map((g) => (
        <Panel key={g.id} style={styles.card}>
          <AppText size="md">{g.name}</AppText>
          <AppText size="sm" tone="dim">{g.description}</AppText>
        </Panel>
      ))}
    </View>
  );
}

function ComposerInline({ onPost }: { onPost: (text: string) => void }) {
  const [draft, setDraft] = useState('');
  const { palette } = useTheme();
  return (
    <Panel style={styles.composer}>
      <AppInput
        value={draft}
        onChangeText={setDraft}
        placeholder="share with the members…"
        multiline
        style={styles.input}
      />
      <Pressable
        onPress={() => {
          if (!draft.trim()) return;
          onPost(draft.trim());
          setDraft('');
        }}
        accessibilityRole="button"
        style={[styles.postBtn, { backgroundColor: palette.accent }]}
      >
        <AppText size="sm" style={{ color: palette.bg }}>post</AppText>
      </Pressable>
    </Panel>
  );
}

function GroupSettings({
  group,
  friends,
  onRename,
  onLeave,
  onInvite,
  onDecide,
}: {
  group: Group;
  friends: UserRef[];
  onRename: (name: string) => void;
  onLeave: () => void;
  onInvite: (users: UserRef[]) => void;
  onDecide: (username: string, accept: boolean) => void;
}) {
  const { palette } = useTheme();
  const [name, setName] = useState(group.name);
  const [picked, setPicked] = useState<string[]>([]);

  return (
    <Panel style={styles.settings}>
      <AppText tone="display" size="md">group settings</AppText>
      <View style={styles.field}>
        <AppText size="sm" tone="dim">name</AppText>
        <View style={styles.renameRow}>
          <AppInput value={name} onChangeText={setName} style={styles.input} placeholder="group name" />
          <Pressable onPress={() => onRename(name.trim() || group.name)} accessibilityRole="button" style={styles.smallBtn}>
            <AppText size="sm" style={{ color: palette.accent }}>rename</AppText>
          </Pressable>
        </View>
      </View>

      <AppText size="sm" tone="dim">members ({group.members.length})</AppText>
      <View style={styles.chips}>
        {group.members.map((m) => (
          <View key={m.username} style={styles.chip}>
            <Avatar name={m.name} size={20} />
            <AppText size="sm">{m.name}</AppText>
          </View>
        ))}
      </View>

      <AppText size="sm" tone="dim">invite friends</AppText>
      <View style={styles.chips}>
        {friends.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => setPicked((p) => (p.includes(f.id) ? p.filter((x) => x !== f.id) : [...p, f.id]))}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: picked.includes(f.id) }}
            style={[styles.chip, picked.includes(f.id) && { backgroundColor: palette.panelEdge }]}
          >
            <Avatar name={f.name} size={20} />
            <AppText size="sm">{f.name}{picked.includes(f.id) ? ' ✓' : ''}</AppText>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={() => onInvite(friends.filter((f) => picked.includes(f.id)))} accessibilityRole="button" style={styles.smallBtn}>
        <AppText size="sm" style={{ color: palette.accent }}>send invites ({picked.length})</AppText>
      </Pressable>

      <AppText size="sm" tone="dim">requests to join</AppText>
      {group.requests.length === 0 && <AppText size="sm" tone="dim">none waiting</AppText>}
      {group.requests.map((r) => (
        <View key={r.id} style={styles.reqRow}>
          <Avatar name={r.name} size={20} />
          <AppText size="sm">{r.name}</AppText>
          <Pressable onPress={() => onDecide(r.username, true)} accessibilityRole="button" style={styles.smallBtn}>
            <AppText size="sm" style={{ color: palette.accent }}>accept</AppText>
          </Pressable>
          <Pressable onPress={() => onDecide(r.username, false)} accessibilityRole="button" style={styles.smallBtn}>
            <AppText size="sm" style={{ color: palette.error }}>decline</AppText>
          </Pressable>
        </View>
      ))}

      <Pressable onPress={onLeave} accessibilityRole="button" style={styles.smallBtn}>
        <AppText size="sm" style={{ color: palette.error }}>leave this group</AppText>
      </Pressable>
    </Panel>
  );
}

const styles = StyleSheet.create({
  columns: { flex: 1, flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  main: { flex: 2, gap: 12 },
  side: { flex: 1, gap: 12 },
  feedCol: { gap: 12 },
  mobile: { gap: 10, paddingBottom: 12 },
  seg: { flexDirection: 'row', gap: 6 },
  segBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  composer: { gap: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 8, fontSize: 14, minHeight: 40, textAlignVertical: 'top' as never },
  postBtn: { marginTop: 8, alignSelf: 'flex-end' as never, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  settings: { gap: 10, alignSelf: 'stretch' as never },
  field: { gap: 6 },
  renameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' as never, gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 6, borderRadius: 8 },
  reqRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  smallBtn: { alignSelf: 'flex-start' as never, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  card: { gap: 8 },
});
