import { Platform, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

import { useTheme } from '../theme/useTheme';
import { useReducedMotion } from '../theme/useReducedMotion';

// The site-standard section rule (PM CogRule port): a brass hairline with a
// small seal at its centre turning as if the rule were its drive shaft.
// Alternate `reverse` between consecutive rules so they counter-rotate.
export function Rule({ label, reverse, style }: { label?: string; reverse?: boolean; style?: object }) {
  const { palette } = useTheme();
  const reduced = useReducedMotion();
  const spin = Platform.OS === 'web' && !reduced;
  return (
    <View style={[styles.rule, { borderTopColor: palette.hairline, borderTopWidth: 1 }, style]}>
      {label != null && (
        <View style={styles.sealWrap}>
          <AppText
            style={[
              styles.seal,
              ...(spin ? [{ opacity: 0.4 }] : []),
            ]}
          >
            {label}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rule: { flexBasis: 0, alignSelf: 'stretch' },
  sealWrap: {
    position: 'absolute', left: '50%', top: -16, width: 30, height: 30,
    marginLeft: -15, alignItems: 'center', justifyContent: 'center',
  },
  seal: { fontSize: 14, opacity: 0.4 },
});
