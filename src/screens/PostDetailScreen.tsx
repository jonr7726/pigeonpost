import { StyleSheet, View } from 'react-native';

import { AppInput, AppText, CommentRow, List, PostCard, Screen, ScreenScroll, TopBar } from '../ui/components';
import { useRouter } from '../ui/nav';
import { comments as seedComments, posts as seedPosts } from '../data/sample/sample';
import { useFeed } from '../data/sample/useSampleData';
import type { Comment } from '../data/sample/types-shared';

// Post detail: full card + comments + like. The composer box is sample-scaffold
// (no API); edits/deletes (§7: forever-editable) land with the real surfaces.
export function PostDetailScreen({ postId }: { postId: string }) {
  const router = useRouter();
  const post = seedPosts.find((entry) => entry.id === postId);
  const { like } = useFeed();
  const comments = seedComments[postId] ?? [];
  if (post == null) return null;
  return (
    <Screen>
      <TopBar title="Post" onBack={router.pop} showBell />
      <ScreenScroll>
      <PostCard post={post} onLike={() => like(post.id)} />
      <List<Comment>
        items={comments}
        keyOf={(comment) => comment.id}
        renderItem={(comment) => <CommentRow comment={comment} />}
        empty={{ what: 'no comments yet', why: 'friends comment from your feed or profile' }}
        header={<TopBannerCount count={comments.length} />}
      />
      </ScreenScroll>
    </Screen>
  );
}

function TopBannerCount({ count }: { count: number }) {
  return (
    <View style={styles.gap}>
      <AppInput placeholder="write a comment…" accessibilityLabel="write a comment" />
      <AppText tone="dim" size="sm">
        {count === 1 ? '1 comment' : `${count} comments`} — comments are circle blobs like posts
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 10, paddingVertical: 8 },
});
