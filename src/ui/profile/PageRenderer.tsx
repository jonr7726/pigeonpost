import { StyleSheet, View } from 'react-native';

import { useLayoutMode } from '../theme/breakpoints';
import { useTheme, type ThemeContextValue, ThemeContext } from '../theme/ThemeProvider';
import { palettes } from '../theme/palette';
import type { Palette } from '../theme/theme';
import { validateBlob, type ColourPick, type ProfilePageBlob, type WidgetTheme } from './blobs';
import { AboutWidget, PigeonsWidget, RecentPostsWidget, WallWidget } from './widgets';

// Renders a profile page from its layout/theme blob (§8.4): zero user markup
// executes; each widget instance renders a registered widget component. The
// page body is themed by its OWNER (mode + colour picks per widget); the
// viewer's global chrome is untouched. The future editor edits the blob only.
export function PageRenderer({
  blob,
  username,
  data,
}: {
  blob: ProfilePageBlob;
  username: string;
  data: ProfileData;
}) {
  const app = useTheme();
  const mode = useLayoutMode();
  const broken = validateBlob(blob);
  const pagePalette = themePalette(blob.theme, app.palette);
  const pageValue: ThemeContextValue = { palette: pagePalette, mode: blob.theme.mode, toggle: app.toggle };
  if (broken != null) return null;
  return (
    <ThemeContext.Provider value={pageValue}>
      <View style={styles.grid}>
        {blob.layout.map((instance) => {
          const onDesktop = mode === 'desktop';
          const palette = withWidgetTheme(instance.theme ?? {}, pagePalette);
          return (
            <View key={instance.id} style={onDesktop && instance.span !== 2 ? styles.half : styles.full}>
              <ThemeContext.Provider value={{ ...pageValue, palette }}>
                {instance.widget === 'about' && <AboutWidget username={username} data={data.about ?? { heading: '', bio: '' }} />}
                {instance.widget === 'wall' && <WallWidget username={username} data={data.wall ?? []} />}
                {instance.widget === 'recentPosts' && <RecentPostsWidget username={username} data={data.recentPosts ?? []} />}
                {instance.widget === 'pigeons' && <PigeonsWidget username={username} data={data.pigeons ?? undefined} />}
              </ThemeContext.Provider>
            </View>
          );
        })}
      </View>
    </ThemeContext.Provider>
  );
}

// Widget payload shapes, keyed by widget id.
export type ProfileData = {
  about?: { bio: string; heading: string; wantToMeet?: string };
  wall?: import('../../data/sample/types-shared').WallPost[];
  recentPosts?: import('../../data/sample/types-shared').Post[];
  pigeons?: import('../../data/sample/types-shared').PigeonStats;
};

// Page-level: mode palette with the letter props staying physical, plus an
// accent override. Per-widget instances layer their own picks on top.
function themePalette(
  theme: { mode: 'dark' | 'light'; accent?: ColourPick },
  viewer: Palette,
): Palette {
  const base: Palette = { ...palettes[theme.mode], paper: viewer.paper, ink: viewer.ink, wax: viewer.wax };
  if (theme.accent != null) base.accent = pick(theme.accent, base);
  return base;
}

function withWidgetTheme(theme: WidgetTheme, page: Palette): Palette {
  const next: Palette = { ...page };
  if (theme.accent != null) next.accent = pick(theme.accent, page);
  if (theme.panel != null) next.panel = pick(theme.panel, page);
  return next;
}

function pick(choice: ColourPick, from: Palette): string {
  const byName: Record<ColourPick, keyof Palette> = {
    accent: 'accent',
    accentAlt: 'accentAlt',
    success: 'success',
    wax: 'wax',
    paper: 'paper',
    ink: 'ink',
  };
  return from[byName[choice]];
}

// Desktop: 2-col grid; each instance's span bridges one or both columns.
// Mobile/tablet: everything stacks (span collapses away) — same components.

const styles = StyleSheet.create({
  grid: { gap: 12, flexDirection: 'row', flexWrap: 'wrap' },
  half: { flexBasis: '47%', flexGrow: 1 },
  full: { width: '100%' },
});
