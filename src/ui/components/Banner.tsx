import { StyleSheet, View, type ViewProps } from 'react-native';

import { AppText } from './AppText';
import { Panel } from './Panel';
import { useTheme } from '../theme/useTheme';

type BannerKind = 'info' | 'success' | 'error' | 'warning';

// System notices. Honesty rule: never used to soften what the app actually does.
export function Banner({ kind = 'info', children, ...rest }: ViewProps & { kind?: BannerKind }) {
  const { palette } = useTheme();
  const colour =
    kind === 'error' ? palette.error : kind === 'success' ? palette.success : kind === 'warning' ? palette.warning : palette.accent;
  return (
    <Panel style={[styles.banner, { borderLeftColor: colour, borderLeftWidth: 3 }]} {...rest}>
      <AppText tone="dim">{children}</AppText>
    </Panel>
  );
}

const styles = StyleSheet.create({ banner: { padding: 12 } });
