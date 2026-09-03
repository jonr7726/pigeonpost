import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Reduced-motion: web reads the media query directly (PM pattern); native falls
// back to false until an AccessibilityInfo wrapper is worth wiring.
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => Platform.OS === 'web' && typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true,
  );
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }, []);
  return reduced;
}
