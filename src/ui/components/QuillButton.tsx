import { Image, Pressable, StyleSheet } from 'react-native';

import { useTheme } from '../theme/useTheme';

// The letters "Compose" action as a physical object: a quill, drawn as an
// inline SVG (data-URI, so no native image dependency) on a small
// leather-button. Presses like a quill: the disc dips (inked toward the paper)
// rather than just fading.
const QUILL_SHAPE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='STROKE' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20.6 3.4c-6.1.5-10.9 3.9-13.9 8.9-1.4 2.4-2.3 5.2-2 8 2.9.3 5.7-.7 8.1-2.1 4.9-3 8.3-9 7.8-14.8z'/%3E%3Cpath d='M4.7 20.6l9.3-9.4'/%3E%3Cpath d='M8 15.4c2.1-1.9 4.5-3.3 6.5-4.2'/%3E%3Cpath d='M10.7 12.1c1.9-1.1 4.3-3 6.2-4.8'/%3E%3Cpath d='M4.7 20.6l-1.6 1.6'/%3E%3C/svg%3E";

export function QuillButton({ onPress }: { onPress: () => void }) {
  const { palette } = useTheme();
  // the pen is literally the accent: the SVG's stroke is the token colour
  const uri = QUILL_SHAPE.replace('STROKE', `%23${palette.accent.slice(1)}`);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="compose a letter"
      hitSlop={8}
      style={({ pressed }) => [
        styles.disc,
        { backgroundColor: palette.panel, borderColor: palette.panelEdge, boxShadow: palette.panelSheen },
        pressed && { backgroundColor: palette.overlay, borderColor: palette.accent },
      ]}
    >
      <Image source={{ uri }} style={styles.quill} fadeDuration={0} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  disc: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  quill: { width: 24, height: 24 },
});
