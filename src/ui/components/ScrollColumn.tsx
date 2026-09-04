import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/useTheme';

// One independently-scrolling column. Fills its container height and scrolls
// only its own content (the feed/posts column and the right settings/people
// column scroll separately — the page never scrolls). Native scrollbars are
// left ON so each column shows a visible rail, in contrast to the decorative
// BrassRail which reports the whole page.
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

// The two-column pane shared by the feed and group screens: the main (feed /
// posts) column is flexible, the right (settings / people) column is a fixed
// width behind a hairline separator. Both columns scroll independently, with
// the top margin clearing the nav band so the first cards aren't flush.
export function TwoColumns({
  main,
  side,
  sideWidth = 340,
}: {
  main: React.ReactNode;
  side: React.ReactNode;
  sideWidth?: number;
}) {
  const { palette } = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.mainBox}>
        <ScrollColumn>{main}</ScrollColumn>
      </View>
      <View style={[styles.sideBox, { width: sideWidth, borderLeftColor: palette.panelEdge }]}>
        <ScrollColumn>{side}</ScrollColumn>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  grow: { flex: 1, flexGrow: 1, flexBasis: 0 },
  content: { paddingTop: 20, paddingBottom: 40 },
  row: { flex: 1, flexDirection: 'row', gap: 20 },
  mainBox: { flex: 1 },
  sideBox: { borderLeftWidth: 1, paddingLeft: 16 },
});
