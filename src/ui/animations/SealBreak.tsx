import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

import { AppText } from '../components/AppText';
import { useTheme } from '../theme/useTheme';
import { useReducedMotion } from '../theme/useReducedMotion';

// Wax-seal break on first open (letters read screen). One break, ever — the
// letter carries its own state; this only animates the already-decided fact.
// Reduced motion renders the broken seal as a single still frame (PM pattern).
export function SealBreak({ onDone }: { onDone?: () => void }) {
  const { palette } = useTheme();
  const wax = palette.wax;
  const reduced = useReducedMotion();
  const spin = useRef(new Animated.Value(0)).current;
  const fall = useRef(new Animated.Value(1)).current;
  const [done, setDone] = useState(reduced);

  useEffect(() => {
    if (reduced) {
      setDone(true);
      onDone?.();
      return undefined;
    }
    Animated.sequence([
      Animated.timing(spin, { toValue: 1, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      Animated.timing(fall, { toValue: 0, duration: 360, easing: Easing.in(Easing.quad), useNativeDriver: false }),
    ]).start(({ finished }) => {
      if (!finished) return;
      setDone(true);
      onDone?.();
    });
    return undefined;
  }, [reduced, spin, fall, onDone]);

  if (done) return null;
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-22deg'] });
  return (
    <Animated.View
      style={[styles.seal, { backgroundColor: wax, opacity: fall, transform: [{ rotate }] }]}
      pointerEvents="none"
    >
      <AppText tone="invert" size="lg" align="center">
        🕊️
      </AppText>
      <AppText size="sm" align="center" style={{ color: palette.paper }}>
        seal
      </AppText>
    </Animated.View>
  );
}

// Broken-seal still ( shown where the story merely tells )
export function SealBrokenStill({ label }: { label?: string }) {
  return (
    <AppText tone="dim" align="center" style={styles.still}>
      {label ?? '— the seal broke once, and stays broken —'}
    </AppText>
  );
}

const styles = StyleSheet.create({
  seal: { alignSelf: 'center', borderRadius: 999, padding: 18, gap: 4 },
  
  still: { paddingVertical: 12 },
});
