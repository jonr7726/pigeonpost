import { Pressable, StyleSheet } from 'react-native';

import { AppText } from './AppText';
import { useTheme } from '../theme/useTheme';

// The like counter with a press pop. One shape, used by posts and nothing else.
export function LikeButton({ count, liked, onPress }: { count: number; liked: boolean; onPress?: () => void }) {
  const { palette } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: liked }}
      accessibilityLabel={liked ? 'unlike' : 'like'}
      style={styles.row}
    >
      <AppText tone={liked ? 'accent' : 'dim'} style={{ fontSize: 16 }} suppressHighlighting>
        {liked ? '❤' : '♡'}
      </AppText>
      <AppText tone={liked ? 'accent' : 'dim'}>{count}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: 5, alignItems: 'center' } });
