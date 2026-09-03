import { List, PostCard, Screen, ScreenScroll, StoryRow, TopBar } from '../ui/components';
import { useRouter } from '../ui/nav';
import { useFeed } from '../data/sample/useSampleData';
import type { Post } from '../data/sample/types-shared';

// S5/S7: stories on top, then friends' posts strictly reverse-chron. Mobile
// and desktop share everything — the column just widens (Screen width token).
export function FeedScreen() {
  const router = useRouter();
  const { posts, stories, like } = useFeed();
  return (
    <Screen>
      <TopBar title="Feed" />
      <ScreenScroll>
      <List<Post>
        items={posts}
        keyOf={(post) => post.id}
        renderItem={(post) => (
          <PostCard
            post={post}
            onLike={() => like(post.id)}
            onPress={() => router.push({ screen: 'postDetail', postId: post.id })}
          />
        )}
        empty={{ what: 'The loft is quiet', why: "your circle hasn't posted in a while" }}
        header={<StoryRow stories={stories} />}
      />
      </ScreenScroll>
    </Screen>
  );
}
