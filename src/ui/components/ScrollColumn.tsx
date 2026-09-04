import { StyleSheet, ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';

// The one vertical column scroller: fills its container's height and scrolls
// its content. The feed column and the right settings/people column each own
// their scroll, so the feed/group screens never scroll the whole page.
export function ScrollColumn({
  children,
  style,
  contentStyle,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.fill, style]}>
      <ScrollView
        style={styles.grow}
        contentContainerStyle={[styles.content, contentStyle]}
        showsVerticalScrollIndicator
      >
        {children}
      </ScrollView>
    </View>
  );
}

// The two-column pane used by the feed and group screens: main column is
// flexible, the right column is fixed width with the hairline separator bar
// groups and feed share. Both halves scroll independently.
export function TwoColumns({ main, side }: { main: React.ReactNode; side: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <View style={styles.mainBox}>
        <ScrollColumn>{main}</ScrollColumn>
      </View>
      <View style={styles.sideBox}>
        <ScrollColumn>{side}</ScrollColumn>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  grow: { flex: 1, flexGrow: 1, flexBasis: 0 },
  content: { paddingTop: 16, paddingBottom: 32 },
  row: { flex: 1, flexDirection: 'row', gap: 16 },
  sideBox: { width: 320, borderLeftWidth: 1, paddingLeft: 16 },
  mainBox: { flex: 1 },
});
