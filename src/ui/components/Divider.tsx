import { StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '../theme/useTheme';

// PM's brass hairline. `rule` variant: heavier page-rule for document surfaces.
export function Divider({ rule, style, ...rest }: ViewProps & { rule?: boolean }) {
  const { palette } = useTheme();
  return (
    <View
      style={[
        styles.divider,
        rule
          ? { borderTopWidth: 2, borderTopColor: palette.accentAlt }
          : { borderTopWidth: 1, borderTopColor: palette.panelEdge },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({ divider: { flexBasis: 0, alignSelf: 'stretch' } });
