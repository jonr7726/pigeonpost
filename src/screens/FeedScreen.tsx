import { StyleSheet, View } from 'react-native';

import { Card, Composer, PeopleList, PostCard, ScrollColumn, StoryRow, TwoColumns, usePeoplePool } from '../ui/components';
import { useLayoutMode } from '../ui/theme/breakpoints';
import { useRouter } from '../ui/nav';
import { useFeed } from '../data/sample/useSampleData';
import type { Post } from '../data/sample/types-shared';

// The main feed is the same two-column pane as a group page: posts column
// (create-post composer + posts) and a right bar (stories card, friends
// card). Each column owns its scroll — no whole-page scroll. The 2/3 measure
// stays via Screen's desktop column; mobile is one scrolling column with
// stories on top of the posts.
export function FeedScreen() {
  const router = useRouter();
  const desktop = useLayoutMode() === 'desktop';
  const { posts, stories, like, add, edit, remove } = useFeed();
  const friends = usePeoplePool();

  const isMine = (post: Post) => post.author.username === 'wren';

  const main = (
    <View style={{ gap: 12 }}>
      <Card title="create post">
        <Composer onPost={(text) => add(text)} />
      </Card>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={() => like(post.id)}
          onPress={() => router.push({ screen: 'postDetail', postId: post.id })}
          onEdit={isMine(post) ? (next: string) => edit(post.id, next) : undefined}
          onDelete={isMine(post) ? () => remove(post.id) : undefined}
        />
      ))}
    </View>
  );

  const side = (
    <View style={{ gap: 12 }}>
      <Card title="stories">
        <StoryRow stories={stories} />
      </Card>
      <Card title="friends">
        <PeopleList people={friends} />
      </Card>
    </View>
  );

  const mobileMain = (
    <View style={{ gap: 12 }}>
      <Card title="create post">
        <Composer onPost={(text) => add(text)} />
      </Card>
      <StoryRow stories={stories} />
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={() => like(post.id)}
          onPress={() => router.push({ screen: 'postDetail', postId: post.id })}
          onEdit={isMine(post) ? (next: string) => edit(post.id, next) : undefined}
          onDelete={isMine(post) ? () => remove(post.id) : undefined}
        />
      ))}
    </View>
  );

  if (!desktop) {
    return <ScrollColumn>{mobileMain}</ScrollColumn>;
  }
  return <TwoColumns main={main} side={side} />;
}

const styles = StyleSheet.create({
  pane: { flex: 1 },
});
