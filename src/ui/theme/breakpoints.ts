import { useWindowDimensions } from 'react-native';

// Responsive contract: one component library, layout adapts by viewport.
// Mobile (<tablet): one column, bottom NavBar. Tablet: bottom NavBar, wider
// columns. Desktop (>=desktop): side rail, centred content columns.
export const breakpoints = { tablet: 768, desktop: 1080 } as const;

export type LayoutMode = 'mobile' | 'tablet' | 'desktop';

export function useLayoutMode(): LayoutMode {
  const { width } = useWindowDimensions();
  if (width >= breakpoints.desktop) return 'desktop';
  if (width >= breakpoints.tablet) return 'tablet';
  return 'mobile';
}
