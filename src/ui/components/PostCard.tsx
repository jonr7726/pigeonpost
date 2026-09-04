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
export function PostCard({ post, onPress, onLike }: { post: Post; onPress?: () => void; onLike?: () => void }) {
  // The card opens the post, but the HTML surface is per-region (header/body
  // clickable) rather than one big <button>: nested pressables (like, comment)
  // inside a role="button" ancestor are invalid DOM and break hydration on web.
return (
    <Panel>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ disabled: !onPress }} style={styles.open}>
        <View style={styles.header}>
          <Avatar name={post.author.name} size={36} />
          <View style={styles.meta}>
            <AppText>{post.author.name}</AppText>
            <AppText tone="dim" size="sm">{`@${post.author.username} · ${timeAgo(post.createdAt)}`}</AppText>
          </View>
        </View>
        {post.kind === 'photo' && <PhotoPlate seed={post.id} />}
        <AppText style={styles.body} tone={post.kind === 'text' ? 'body' : 'dim'}>
          {post.kind === 'blog' ? post.excerpt : post.text}
        </AppText>
      </Pressable>
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
  open: { flex: 1 },
  header: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 10 },
  meta: { flex: 1 },
  actions: { flexDirection: 'row', gap: 18, alignItems: 'center', marginTop: 12 },
  row: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  body: { marginTop: 2 },
  plate: { height: 190, borderRadius: 8, overflow: 'hidden', marginTop: 4, justifyContent: 'center' },
  blob: { width: 130, height: 130, borderRadius: 999, position: 'absolute', left: 30 },
});
