import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppInput, AppText, Avatar, Composer, ConfirmModal, InviteFriendsPicker, Panel, PeopleList, PostCard } from '../ui/components';
import { useLayoutMode } from '../ui/theme/breakpoints';
import { useTheme } from '../ui/theme/useTheme';
import { useRouter } from '../ui/nav';
import { useGroups } from '../data/sample/useSampleData';
import type { Group, UserRef } from '../data/sample/types-shared';

// A group is an invite-only mini-feed rendered with the SAME composer and
// post cards as the main feed: identical width and grammar — the only
// differences are the right-hand settings column, the cover photo, and no
// stories. Desktop: the two columns share the Screen measure. Mobile stacks,
// with settings behind a feed/settings toggle on top.
export function GroupScreen({ groupId }: { groupId: string }) {
  const { palette } = useTheme();
  const router = useRouter();
  const desktop = useLayoutMode() === 'desktop';
  const { groups, rename, leave, invite, decide, post, like } = useGroups();
  const group = groups.find((g) => g.id === groupId);
  const [pane, setPane] = useState<'feed' | 'settings'>('feed');

  if (group == null) {
    return (
      <View style={{ gap: 10 }}>
        <AppText tone="dim">this group is gone (or you left it)</AppText>
        <Pressable onPress={() => router.goTab('feed')} accessibilityRole="button">
          <AppText>‹ back to feed</AppText>
        </Pressable>
      </View>
    );
  }

  const feed = (
    <View style={{ gap: 12 }}>
      <Composer onPost={(text) => post(group.id, text)} />
      {group.posts.map((p) => (
        <PostCard key={p.id} post={p} onLike={() => like(group.id, p.id)} />
      ))}
    </View>
  );
  const settings = (
    <GroupSettings
      group={group}
      onRename={(name) => rename(group.id, name)}
      onLeave={() => {
        leave(group.id);
        router.goTab('feed');
      }}
      onInvite={(users) => invite(group.id, users)}
      onDecide={(username, accept) => decide(group.id, username, accept)}
    />
  );

  if (!desktop) {
    return (
      <View style={{ gap: 10, paddingBottom: 12 }}>
        <AppText tone="display" size="lg">{group.name}</AppText>
        <View style={styles.seg}>
          {(['feed', 'settings'] as const).map((pi) => (
            <Pressable
              key={pi}
              onPress={() => setPane(pi)}
              accessibilityRole="radio"
              accessibilityState={{ selected: pane === pi }}
              style={[styles.segBtn, pane === pi && { backgroundColor: palette.panelEdge }]}
            >
              <AppText size="sm">{pi}</AppText>
            </Pressable>
          ))}
        </View>
        {pane === 'feed' ? feed : settings}
      </View>
    );
  }

  return (
    <View style={styles.columns}>
      <View style={styles.main}>{feed}</View>
      <View style={styles.side}>{settings}</View>
    </View>
  );
}

// The settings bar (second column). Cover photo change, rename, members,
// search-pick invitations (confirm on click), join requests (accept: neutral
// confirm; decline: red warning confirm) and leaving (red confirm). The plain
// neutral confirm over an errorred state? accepts are calm; declines warn.
export function GroupSettings({
  group,
  onRename,
  onLeave,
  onInvite,
  onDecide,
}: {
  group: Group;
  onRename: (name: string) => void;
  onLeave: () => void;
  onInvite: (users: UserRef[]) => void;
  onDecide: (username: string, accept: boolean) => void;
}) {
  const { palette } = useTheme();
  const [name, setName] = useState(group.name);
  const [leaving, setLeaving] = useState(false);
  const [coverPicked, setCoverPicked] = useState(false);
  const [coverApplied, setCoverApplied] = useState(false);

  return (
    <Panel style={{ gap: 10 }} testID="group-settings">
      <View style={styles.cover}>
        <View style={[styles.plate, { backgroundColor: coverApplied ? palette.accent : palette.panel }, coverApplied && { opacity: 0.5 }]} />
        <Pressable
          onPress={() => setCoverPicked(true)}
          accessibilityRole="button"
          style={[styles.pill, { backgroundColor: palette.panel }]}
          testID="cover-change"
        >
          <AppText size="sm" style={{ color: palette.accent }}>{coverApplied ? 'cover applied' : 'change cover photo'}</AppText>
        </Pressable>
      </View>

      <AppText tone="display" size="md">group settings</AppText>

      <AppText size="sm" tone="dim">name</AppText>
      <View style={styles.renameRow}>
        <AppInput value={name} onChangeText={setName} style={{ flex: 1 }} placeholder="group name" />
        <Pressable onPress={() => onRename(name.trim() || group.name)} accessibilityRole="button" style={styles.smallBtn}>
          <AppText size="sm" style={{ color: palette.accent }}>rename</AppText>
        </Pressable>
      </View>

      <AppText size="sm" tone="dim">members ({group.members.length})</AppText>
      <PeopleList people={group.members} searchable={false} />

      <ConfirmModal
        open={coverPicked}
        title="Set cover photo?"
        message="Your new cover applies for all members. Jon: it will pretend to work correctly."
        confirmLabel="apply"
        onCancel={() => setCoverPicked(false)}
        onConfirm={() => {
          setCoverApplied(true);
          setCoverPicked(false);
        }}
      />

      <InviteFriendsPicker
        title="invite friends"
        immediate
        onPick={(person) => onInvite([person])}
      />

      <AppText size="sm" tone="dim">requests to join ({group.requests.length})</AppText>
      {group.requests.length === 0 && <AppText size="sm" tone="dim">none waiting</AppText>}
      {group.requests.map((r) => (
        <RequestRow key={r.id} person={r} onDecide={onDecide} />
      ))}

      <Pressable onPress={() => setLeaving(true)} accessibilityRole="button" style={styles.smallBtn} testID="leave-group">
        <AppText size="sm" style={{ color: palette.error }}>leave this group</AppText>
      </Pressable>

      <ConfirmModal
        open={leaving}
        title="Leave this group?"
        message={`You will stop seeing ${group.name} posts. You may not be able to rejoin without a new invitation.`}
        danger
        confirmLabel="leave"
        onCancel={() => setLeaving(false)}
        onConfirm={onLeave}
      />
    </Panel>
  );
}
function RequestRow({ person, onDecide }: { person: { id: string; username: string; name: string }; onDecide: (username: string, accept: boolean) => void }) {
  const [choice, setChoice] = useState<null | 'accept' | 'decline'>(null);
  const { palette } = useTheme();
  return (
    <View style={styles.reqRow}>
      <Avatar name={person.name} size={20} />
      <AppText size="sm">{person.name}</AppText>
      <Pressable onPress={() => setChoice('accept')} accessibilityRole="button" style={styles.smallBtn} testID={`accept-${person.username}`}>
        <AppText size="sm">accept</AppText>
      </Pressable>
      <Pressable onPress={() => setChoice('decline')} accessibilityRole="button" style={styles.smallBtn} testID={`decline-${person.username}`}>
        <AppText size="sm" style={{ color: palette.error }}>decline</AppText>
      </Pressable>
      <ConfirmModal
        open={choice != null}
        title={choice === 'accept' ? 'Accept this request?' : 'Decline this request?'}
        message={
          choice === 'accept'
            ? `${person.name} will join the group and see its posts.`
            : `Declining is a warning-level action: ${person.name} will need a new invitation to try again.` // red confirm below
        }
        danger={choice === 'decline'}
        confirmLabel={choice === 'decline' ? 'decline' : 'accept'}
        onCancel={() => setChoice(null)}
        onConfirm={() => {
          onDecide(person.username, choice === 'accept');
          setChoice(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  columns: { flex: 1, flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  main: { flex: 2, gap: 12 },
  side: { flex: 1, gap: 12, borderLeftWidth: 1 },
  stackish: { gap: 10 },
  seg: { flexDirection: 'row', gap: 6 },
  segBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  cover: { gap: 8 },
  pill: { alignSelf: 'flex-start' as never, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  smallBtn: { alignSelf: 'flex-start' as never, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  renameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  input: { flex: 1, minHeight: 0 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' as never, gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 6, borderRadius: 8 },
  plate: { height: 68, borderRadius: 10 },
  reqRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
