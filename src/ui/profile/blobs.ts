// The layout/theme blob types (C08 shape): the profile page is an ordered list
// of widget instances, themed at page level with per-widget overrides.
// The eventual editor edits exactly these blobs — nothing else (UI-DESIGN §8.4).
export type PageMode = 'dark' | 'light';

// Palette-pick values map onto palette token colours — no raw hex ever (the
// user picks from tokens; PageRenderer resolves them through the palette).
export type ColourPick = 'accent' | 'accentAlt' | 'success' | 'wax' | 'paper' | 'ink';

export type WidgetId = 'about' | 'wall' | 'recentPosts' | 'pigeons';

export type WidgetInstance = {
  id: string;
  widget: WidgetId;
  // desktop columns a widget bridges (1 = half width, 2 = full)
  span?: 1 | 2;
  // per-widget colour overrides (§8.4 level ②)
  theme?: WidgetTheme;
};

export type PageTheme = {
  mode: PageMode;
  accent?: ColourPick;
};

export type WidgetTheme = Partial<Record<'accent' | 'panel', ColourPick>>;

export type ProfilePageBlob = {
  theme: PageTheme;
  layout: WidgetInstance[];
};

// The widget registry (data-only so tests can hold it in node; widgets/ maps
// ids to components in PageRenderer).
export const widgetRegistry: readonly { id: WidgetId; title: string }[] = [
  { id: 'about', title: 'About' },
  { id: 'wall', title: 'Wall' },
  { id: 'recentPosts', title: 'Recent posts' },
  { id: 'pigeons', title: 'Pigeons' },
] as const;

// Validate a blob: every widget known, ids unique. Editor input + sample data
// both pass through here, so a bad blob is rejected at the boundary.
export function validateBlob(blob: ProfilePageBlob): string[] | null {
  const known = new Set(widgetRegistry.map((w) => w.id));
  const ids = new Set<string>();
  for (const entry of blob.layout) {
    if (!known.has(entry.widget)) return [`unknown widget: ${entry.widget}`];
    if (ids.has(entry.id)) return [`duplicate widget instance id: ${entry.id}`];
    ids.add(entry.id);
  }
  return null;
}
