import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Panel } from './Panel';
import { Avatar } from './Avatar';
import type { Story } from '../../data/sample/types-shared';

// The horizontal 24h story ring row — top of Feed (S5) and a profile widget.
export function StoryRow({ stories, onSelect }: { stories: Story[]; onSelect?: (story: Story) => void }) {
  return (
    <Panel style={styles.card}>
      <View style={styles.row}>
        {stories.map((story) => (
          <Pressable
            key={story.id}
            onPress={() => onSelect?.(story)}
            accessibilityRole="button"
            accessibilityLabel={`story by ${story.author.name}`}
            style={styles.item}
          >
            <Avatar name={story.author.name} size={56} ring />
            <AppText size="sm" tone="dim" align="center">
              {story.author.name.split(' ')[0]}
            </AppText>
          </Pressable>
        ))}
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14, paddingVertical: 8 },
  card: { padding: 8 },
  item: { alignItems: 'center', gap: 4 },
});
