import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../components/AppText';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { CommentRow } from '../components/CommentRow';
import { Divider } from '../components/Divider';
import { PostCard } from '../components/PostCard';
import { WorldMap } from '../components/WorldMap';
import { useTheme } from '../theme/useTheme';
import type { WidgetId } from './blobs';
import type { ProfileData } from './PageRenderer';

// One component per widget type (§8.4); registered below. Widgets render
// inside the palette their page/instance applies — they read useTheme() like
// every other component, and the PageRenderer's provider supplies the page's.
type WidgetProps<K extends WidgetId> = { username: string; data: ProfileData[K] };

function WidgetFrame({ title, children }: { title: string; children: React.ReactNode }) {
  const { palette } = useTheme();
  return (
    <View style={[styles.frame, { backgroundColor: palette.panel, borderColor: palette.panelEdge },]} testID="widget-frame">
      <AppText tone="display" size="lg">
        {title}
      </AppText>
      {children}
    </View>
  );
}

export function AboutWidget({ data }: WidgetProps<'about'>) {
  const info = data ?? { heading: 'about', bio: '' };
  return (
    <WidgetFrame title={info.heading}>
      <AppText>{info.bio}</AppText>
      {info.wantToMeet != null && (
        <View style={styles.gap}>
          <Divider rule />
          <AppText tone="dim" size="sm">{`would love to meet: ${info.wantToMeet}`}</AppText>
        </View>
      )}
    </WidgetFrame>
  );
}

export function WallWidget({ data }: WidgetProps<'wall'>) {
  const [entry, setEntry] = useState('');
  const wall = data ?? [];
  return (
    <WidgetFrame title="Wall">
      <AppInput
        value={entry}
        onChangeText={setEntry}
        placeholder="write on the wall…"
        accessibilityLabel="write on the wall"
      />
      <AppButton label="Post" variant="secondary" onPress={() => setEntry('')} />
      <View style={styles.gap}>
        {wall.map((post) => (
          <CommentRow
            key={post.id}
            comment={{ ...post, text: `${post.author.name.split(' ')[0]}: ${post.text}` }}
          />
        ))}
      </View>
    </WidgetFrame>
  );
}

export function RecentPostsWidget({ data }: WidgetProps<'recentPosts'>) {
  return (
    <WidgetFrame title="Recent posts">
      <View style={styles.gap}>
        {(data ?? []).map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </View>
    </WidgetFrame>
  );
}

export function PigeonsWidget({ data }: WidgetProps<'pigeons'>) {
  const stats = data ?? { inFlight: 0, delivered: 0, received: 0 };
  return (
    <WidgetFrame title="Pigeons">
      <View style={styles.gauge}>
        <View style={styles.stat}>
          <AppText tone="accent" size="xl">{stats.inFlight}</AppText>
          <AppText tone="dim" size="sm">in flight</AppText>
        </View>
        <View style={styles.stat}>
          <AppText tone="accent" size="xl">{stats.delivered}</AppText>
          <AppText tone="dim" size="sm">delivered</AppText>
        </View>
      </View>
      <WorldMap pins={[{ x: 0.25, y: 0.2, label: '' }, { x: 0.8, y: 0.75, label: '' }]} height={110} />
      <AppText tone="dim" size="sm">{`${stats.received} received`}</AppText>
    </WidgetFrame>
  );
}

// The registry map the renderer, the sample data, and (later) the editor see
// as one catalogue (data-only list is in blobs.ts; components here).
export const widgetComponents = {
  about: AboutWidget,
  wall: WallWidget,
  recentPosts: RecentPostsWidget,
  pigeons: PigeonsWidget,
} as const;

const styles = StyleSheet.create({
  frame: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 10, width: '100%' },
  gap: { gap: 8 },
  gauge: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, alignItems: 'flex-start' },
  stat: { gap: 2, alignItems: 'center', minWidth: 72 },
});
