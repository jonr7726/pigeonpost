import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Divider } from './Divider';
import { EmptyState } from './EmptyState';
import { Loading } from './Loading';
import { useTheme } from '../theme/useTheme';

export type ListProps<Item> = {
  items: readonly Item[] | null;
  renderItem: (item: Item) => React.ReactNode;
  keyOf: (item: Item) => string;
  loading?: boolean;
  empty?: { what: string; why?: string };
  error?: string | null;
  divided?: boolean;
  header?: React.ReactNode;
};

// The one list: loading / error / empty / divided states in one implementation,
// vertical scroll included (screens never render a raw vertical ScrollView).
export function List<Item>({ items, renderItem, keyOf, loading, empty, error, divided, header }: ListProps<Item>) {
  const { palette } = useTheme();
  if (loading) return <Loading />;
  if (error != null) return <AppText style={styles.error} align="center">{`⚠︎ ${error}`}</AppText>;
  if (items != null && items.length === 0 && empty != null) return <EmptyState what={empty.what} why={empty.why} />;
  return (
    <ScrollView style={styles.fill}>
      {header}
      <View>
        {(items ?? []).map((item, index) => (
          <View key={keyOf(item)}>
            {renderItem(item)}
            {divided && index < (items?.length ?? 0) - 1 && <Divider style={{ borderTopColor: palette.panelEdge }} />}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// Compact single-screen scroller (detail panes) — same guarantees, no header.
export function ScreenScroll({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      contentContainerStyle={styles.screen}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  spinner: { padding: 24 },
  error: { padding: 24 },
  fill: { flex: 1 },
  screen: { paddingBottom: 32 },
});
