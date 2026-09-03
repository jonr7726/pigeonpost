import { Pressable, StyleSheet } from 'react-native';

import { AppText, type AppTextSize } from './AppText';
import { Loading } from './Loading';
import { useTheme } from '../theme/useTheme';

export type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

// The one button. variant: primary (brass), secondary (panel + brass edge),
// ghost (bare, accent text), danger. Loading state shares the Loading component.
export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  size = 'md',
  full,
}: {
  label: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  size?: AppTextSize;
  full?: boolean;
}) {
  const { palette } = useTheme();
  const bg: Record<AppButtonVariant, string> = {
    primary: palette.accent,
    secondary: palette.panel,
    ghost: 'transparent',
    danger: palette.error,
  };
  const textTone: 'invert' | 'accent' =
    variant === 'primary' || variant === 'danger' ? 'invert' : 'accent';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg[variant] },
        variant === 'secondary' && { borderWidth: 1, borderColor: palette.panelEdge },
        (pressed || disabled) && { opacity: 0.7 },
        full && styles.full,
      ]}
    >
      {loading ? (
        <Loading />
      ) : (
        <AppText tone={textTone} size={size} style={styles.label}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  full: { width: '100%' },
  label: { fontWeight: '600' },
});
