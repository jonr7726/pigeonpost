import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { Divider } from './Divider';
import { useTheme } from '../theme/useTheme';
import { timeAgo } from './timeAgo';
import type { Comment } from '../../data/sample/types-shared';

// One comment line under a post (or a wall post row in the Wall widget).
export function CommentRow({ comment }: { comment: Comment }) {
  return (
    <View style={styles.row}>
      <Avatar name={comment.author.name} size={28} />
      <View style={styles.body}>
        <AppText size="sm">
          {comment.author.name}{' '}
          <AppText tone="dim" size="sm"> · {timeAgo(comment.createdAt)}</AppText>
        </AppText>
        <AppText tone="body">{comment.text}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, paddingVertical: 6, alignItems: 'flex-start' },
  body: { flex: 1, gap: 2 },
});
