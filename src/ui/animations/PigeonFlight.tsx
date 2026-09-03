import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

import { AppText } from '../components/AppText';
import { useReducedMotion } from '../theme/useReducedMotion';

// A pigeon sliding from its sender's pin to the receiver's (map + letters
// read): "in transit, ~3 days". Verbs not nouns: reduced motion shows it
// already mid-flight, as a still.
export function PigeonFlight({
  from,
  to,
  seconds = 6,
  loop = true,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  seconds?: number;
  loop?: boolean;
}) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) return undefined;
    const timing = loop
      ? Animated.loop(Animated.sequence([
          Animated.timing(progress, { toValue: 1, duration: seconds * 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
          Animated.timing(progress, { toValue: 0, duration: seconds * 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        ]))
      : Animated.timing(progress, { toValue: 1, duration: seconds * 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: false });
    timing.start();
    return () => timing.stop();
  }, [reduced, loop, seconds, progress]);

  const top = `${((from.y + to.y) / 2) * 100}%`;
  const moving = progress.interpolate({ inputRange: [0, 1], outputRange: [`${from.x * 100}%`, `${to.x * 100}%`] });
  return (
    <Animated.View
      style={[
        styles.flight,
        reduced
          ? { top: `${((from.y + to.y) / 2) * 100}%`, left: `${((from.x + to.x) / 2) * 100}%` }
          : { left: moving },
      ]}
    >
      <AppText>🕊️</AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flight: { position: 'absolute' },
});
