import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet } from 'react-native';

import { AppText } from '../components/AppText';
import { useTheme } from '../theme/useTheme';
import { useReducedMotion } from '../theme/useReducedMotion';

const HOLD_MS = 900;

// The press-and-hold chop (compose): hold long enough and the stamp commits;
// release early and it backs out. Reduced motion: an instant press.
export function StampHold({ label = 'seal & send', onSealed }: { label?: string; onSealed: () => void }) {
  const { palette } = useTheme();
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;
  const [holding, setHolding] = useState(false);
  const stopped = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (reduced || !holding) return undefined;
    const timing = Animated.timing(progress, { toValue: 1, duration: HOLD_MS, easing: Easing.linear, useNativeDriver: false });
    stopped.current = timing;
    timing.start(({ finished }) => {
      stopped.current = null;
      if (finished) {
        setHolding(false);
        onSealed();
      }
    });
    return () => {
      stopped.current?.stop();
      stopped.current = null;
    };
  }, [holding, reduced, progress, onSealed]);

  if (reduced) {
    return (
      <Pressable onPress={onSealed} accessibilityRole="button" accessibilityLabel={label} style={styles.reduced}>
        <AppText tone="invert" align="center">
          {label}
        </AppText>
      </Pressable>
    );
  }
  const fill = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <Pressable
      onPressIn={() => setHolding(true)}
      onPressOut={() => {
        setHolding(false);
        progress.setValue(0);
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.hold, { backgroundColor: palette.accent }]}
    >
      <Animated.View style={[styles.fill, { backgroundColor: palette.accentAlt, width: fill }]} />
      <AppText tone="invert" align="center">
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hold: { overflow: 'hidden', borderRadius: 10, paddingVertical: 12, position: 'relative' },
  fill: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, opacity: 0.45 },
  reduced: { paddingVertical: 12 },
});
