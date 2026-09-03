import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { Divider } from './Divider';
import { EmptyState } from './EmptyState';
import { Loading } from './Loading';
type ListProps<Item> = {
  items: readonly Item[] | null;
  renderItem: (item: Item) => React.ReactNode;
  keyOf: (item: Item) => string;
  loading?: boolean;
  empty?: { what: string; why?: string };
  error?: string | null;
  divided?: boolean;
  header?: React.ReactNode;
  /** pixel gap between items (cards etc.) — hairline separators use `divided` */
  gap?: number;
};
// The one list: loading / error / empty / divided states in one implementation.
// SCROLL OWNERSHIP: List never owns vertical scroll — the screen decides
// (ScreenScroll/pagepane wrapper), so headers, banners and maps scroll along.
export function List<Item>({ items, renderItem, keyOf, loading, empty, error, divided, header, gap }: ListProps<Item>) {
  if (loading) return <Loading />;
  if (error != null) return <AppText style={styles.error} align="center">{`⚠︎ ${error}`}</AppText>;

  if (items != null && items.length === 0 && empty != null) return <EmptyState what={empty.what} why={empty.why} />;
  return (
    <View>
      {header}
      <View>
        {(items ?? []).map((item, index) => (
          <View key={keyOf(item)} style={{ paddingBottom: 10 }}>
            {renderItem(item)}
            {divided && index < (items?.length ?? 0) - 1 && <Divider />}
          </View>
        ))}
      </View>
    </View>
  );
}
// The one vertical page scroller (screens wrap their content in this).
export function ScreenScroll({ children, contentStyle, style }: { children: React.ReactNode; contentStyle?: object; style?: object }) {
  return (
    <ScrollView
      style={[styles.grow, style]}
      contentContainerStyle={[styles.screen, contentStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  error: { padding: 24 },
  screen: { paddingBottom: 32 },
  grow: { flex: 1, flexGrow: 1, flexBasis: 0 },
});
