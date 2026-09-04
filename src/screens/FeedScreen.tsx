import { List, PostCard, Screen, ScreenScroll, StoryRow, Composer } from '../ui/components';
import { useRouter } from '../ui/nav';
import { useFeed } from '../data/sample/useSampleData';

// S5/S7 updated: a create-post box first (photos/videos, tag friends), then
// stories, then friends' posts strictly reverse-chron. Mobile and desktop
// share everything; the desktop rail owns the feed/events toggle.
export function FeedScreen() {
  const router = useRouter();
  const { posts, stories, like, add } = useFeed();
  return (
    <Screen>
      <ScreenScroll>
        <ComposerPost />
        <List
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

function ComposerPost() {
  const { add } = useFeed();
  return <Composer onPost={(text) => add(text)} />;
}
