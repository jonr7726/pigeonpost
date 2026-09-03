import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Panel } from './Panel';
import { Icon } from './Icon';
import type { ThemeMode } from '../theme/ThemeProvider';
import { useTheme } from '../theme/useTheme';

// Sun/moon segmented toggle lives in Settings (and the account header initially).
export function ThemeToggle({ mode, onSelect }: { mode: ThemeMode; onSelect: (mode: ThemeMode) => void }) {
  const { palette } = useTheme();
  return (
    <View style={[styles.segment, { borderColor: palette.panelEdge }]}>
      {(['dark', 'light'] as const).map((option) => {
        const active = mode === option;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[styles.option, active && { backgroundColor: palette.accent }]}
          >
            <Icon name={option === 'dark' ? 'moon' : 'sun'} />
            <AppText tone={active ? 'invert' : 'dim'} size="sm" style={styles.label}>
              {option === 'dark' ? 'Dark' : 'Parchment'}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segment: { borderWidth: 1, borderRadius: 10, flexDirection: 'row', overflow: 'hidden' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 16 },
  label: { fontWeight: '600' },
});
