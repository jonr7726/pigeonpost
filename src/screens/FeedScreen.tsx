import { StyleSheet, View } from 'react-native';

import { AppText, Composer, PeopleList, Screen, StoryRow, usePeoplePool } from '../ui/components';
import { useLayoutMode } from '../ui/theme/breakpoints';
import { PostCard } from '../ui/components';
import { useRouter } from '../ui/nav';
import { useFeed } from '../data/sample/useSampleData';

// The main feed now matches the group layout: posts column + a right bar.
// The right bar is your friends (the one people list) and stories; groups get
// the same two columns minus stories. Mobile: single column with stories on
// top. The 2/3 measure stays via Screen's desktop column.
export function FeedScreen() {
  const router = useRouter();
  const desktop = useLayoutMode() === 'desktop';
  const { posts, like, add } = useFeed();
  const friends = usePeoplePool();
  const { stories } = useFeed();
  return (
    <Screen>
      <View style={styles.columns}>
        <View style={styles.main}>
          <Composer onPost={(text) => add(text)} />
          {desktop ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => like(post.id)}
                onPress={() => router.push({ screen: 'postDetail', postId: post.id })}
              />
            ))
          ) : (
            <>
              <StoryRow stories={stories} />
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={() => like(post.id)}
                  onPress={() => router.push({ screen: 'postDetail', postId: post.id })}
                />
              ))}
            </>
          )}
        </View>
        {desktop && (
          <View style={styles.side}>
            <StoryRow stories={stories} />
            <AppText size="sm" tone="dim">your friends</AppText>
            <PeopleList people={friends} />
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  columns: { flex: 1, flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  main: { flex: 2, gap: 12 },
  side: { flex: 1, gap: 12 },
});
