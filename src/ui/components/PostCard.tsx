import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { Panel } from './Panel';
import { timeAgo } from './timeAgo';
import { useTheme } from '../theme/useTheme';
import { LikeButton } from './LikeButton';
import type { Post } from '../../data/sample/types-shared';

// One post component, three content shapes (photo / text / blog). A blog post
// shows its body; a photo shows its (storyboard) plate; a text shows its words.
export function PostCard({ post, onPress, onLike, onEdit, onDelete }: { post: Post; onPress?: () => void; onLike?: () => void; onEdit?: (next: string) => void; onDelete?: () => void }) {
  const { palette } = useTheme();
  const [editing, setEditing] = useState(false);
  const [next, setNext] = useState('');
  const mine = onEdit != null || onDelete != null;
  return (
    <Panel>
      <View style={styles.header}>
        <Avatar name={post.author.name} size={36} />
        <View style={styles.meta}>
          <AppText>{post.author.name}</AppText>
          <AppText tone="dim" size="sm">{`@${post.author.username} · ${timeAgo(post.createdAt)}`}</AppText>
        </View>
        {(onEdit != null || onDelete != null) && (
          <View style={styles.owner}>
            {onEdit != null && (
              <Pressable onPress={() => setEditing(!editing)} accessibilityRole="button" style={styles.ownerBtn} testID={`edit-${post.id}`}>
                <AppText size="sm" style={{ color: palette.accent }}>{editing ? 'editing…' : 'edit'}</AppText>
              </Pressable>
            )}
            <DeleteButton post={post} onDelete={onDelete} />
          </View>
        )}
      </View>
      {post.kind === 'photo' && <PhotoPlate seed={post.id} />}
      {editing ? (
        <View style={{ gap: 6 }}>
          <TextInputPlaceholder post={post} onNext={setNext} />
          <View style={styles.row}>
            <Pressable
              onPress={() => {
                onEdit?.(next);
                setEditing(false);
              }}
              accessibilityRole="button"
              style={[styles.ownerBtn, styles.solidBtn, { backgroundColor: palette.accent }]}
              testID={`save-${post.id}`}
            >
              <AppText size="sm" style={{ color: palette.bg }}>save</AppText>
            </Pressable>
            <Pressable
              onPress={() => setEditing(false)}
              accessibilityRole="button"
              style={[styles.ownerBtn, styles.ownerBorder, { borderColor: palette.panelEdge }]}
            >
              <AppText size="sm" tone="dim">cancel</AppText>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ disabled: !onPress }}>
          <AppText style={styles.body} tone={post.kind === 'text' ? 'body' : 'dim'}>
            {post.kind === 'blog' ? post.excerpt : post.text}
          </AppText>
        </Pressable>
      )}
        <View style={styles.actions}>
          <LikeButton count={post.likes} liked={post.liked} onPress={onLike} />
          <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="comments" style={styles.row}>
            <Icon name="comment" size={16} />
            <AppText tone="dim">{post.commentCount}</AppText>
          </Pressable>
          {post.kind === 'blog' && <AppText tone="accent" size="sm">read post →</AppText>}
        </View>
    </Panel>
  );
}

import { AppInput } from './AppInput';
import { ConfirmModal } from './ConfirmModal';

function TextInputPlaceholder({ post, onNext }: { post: Post; onNext: (v: string) => void }) {
  return (
    <AppInput
      multiline
      defaultValue={post.text}
      onChangeText={onNext}
      numberOfLines={4}
      accessibilityLabel="edit your post text"
    />
  );
}

function DeleteButton({ post, onDelete }: { post: Post; onDelete?: () => void }) {
  const { palette } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <>
      {onDelete != null && (
        <Pressable onPress={() => setOpen(true)} accessibilityRole="button" style={styles.ownerBtn} testID={`delete-${post.id}`}>
          <AppText size="sm" style={{ color: palette.error }}>delete</AppText>
        </Pressable>
      )}
      <ConfirmModal
        open={open}
        title="Delete your post?"
        message="This takes the post down for everyone — it is a warning-level removal."
        danger
        confirmLabel="delete"
        // cancel bottom-left, delete bottom-right
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          onDelete?.();
        }}
      />
    </>
  );
}

// Storyboard plate for photos — a deterministic ink/brass wash, no assets.
// When real media lands, PostCard keeps its structure and swaps this prop only.
function PhotoPlate({ seed }: { seed: string }) {
  const { palette } = useTheme();
  void seed;
  return (
    <View style={[styles.plate, { backgroundColor: palette.paper }]}>
      <View style={[styles.blob, { backgroundColor: palette.wax, opacity: 0.18, transform: [{ translateX: 8 }] }]} />
      <View style={[styles.blob, { backgroundColor: palette.accentAlt, opacity: 0.14, transform: [{ translateX: 90 }, { translateY: 10 }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  owner: { marginLeft: 'auto' as never, flexDirection: 'row', gap: 6 },
  ownerBtn: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  ownerBorder: { borderWidth: 1 },
  solidBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  ownerRow: { flexDirection: 'row', gap: 6 },
  header: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 10 },
  meta: { flex: 1 },
  actions: { flexDirection: 'row', gap: 18, alignItems: 'center', marginTop: 12 },
  row: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  body: { marginTop: 2 },
  plate: { height: 190, borderRadius: 8, overflow: 'hidden', marginTop: 4, justifyContent: 'center' },
  blob: { width: 130, height: 130, borderRadius: 999, position: 'absolute', left: 30 },
});
