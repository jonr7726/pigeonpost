import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { AppInput, AppText, Panel, Screen, ScreenScroll, TopBar } from '../ui/components';
import { StampHold } from '../ui/animations';
import { PARCHMENT } from '../ui/theme/palette';
import { useRouter } from '../ui/nav';
import { useSampleData } from '../data/sample/useSampleData';
import { useTheme } from '../ui/theme/ThemeProvider';

// RN-web honours background-image/box-shadow on views, but RN core types don't
// describe them for them. One lift, one place, next to the palette it comes from.
const PARCHMENT_LAYER = { backgroundImage: PARCHMENT.backgroundImage, boxShadow: PARCHMENT.boxShadow } as unknown as ViewStyle;
const CAP = 10_000; // L1: hard cap, never surfaced until you cross it

// Compose: "select a friend" on the study surface, then the writing happens ON
// a letter — a parchment sheet (ink in both themes) with the stamp chop on it
// → send animation → back to the inbox with the pigeon in flight.
export function LetterComposeScreen() {
  const router = useRouter();
  const compose = <LetterCompose onSent={router.pop} />;
  return (
    <Screen width="standard">
      <TopBar title="Compose" onBack={router.pop} />
      <ScreenScroll>{compose}</ScreenScroll>
    </Screen>
  );
}

// The compose body without its own page chrome: the LettersScreen's desktop
// reading pane composes here exactly like it reads letters there.
export function LetterCompose({ onSent }: { onSent?: () => void }) {
  const { friends } = useSampleData();
  const { palette } = useTheme();
  const [to, setTo] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);
  const friend = friends.find((f) => f.username === to) ?? null;
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);
  const overCap = body.length > CAP;

  if (sent) {
    return (
      <Panel style={[styles.paper, PARCHMENT_LAYER]}>
        <Sentwing />
      </Panel>
    );
  }

  return (
    <View style={styles.gap}>
      <AppText size="sm" style={[styles.selectLabel, { color: palette.text }]}>
        select a friend
      </AppText>
      <View style={styles.picker}>
        {friends.map((f) => (
          <Pressable
            key={f.username}
            onPress={() => setTo(f.username)}
            accessibilityRole="button"
            accessibilityLabel={`write to ${f.name}`}
            style={[styles.pick, { borderColor: palette.panelEdge, borderWidth: 1 }, to === f.username && { borderColor: palette.accent }]}
          >
            <AppText size="sm" style={{ color: palette.text, opacity: to === f.username ? 1 : 0.75 }}>
              {f.name}
            </AppText>
          </Pressable>
        ))}
      </View>
      {friend == null && (
        <AppText align="center" style={{ color: palette.text, opacity: 0.8 }}>
          a pigeon can only fly between friends — choose one above
        </AppText>
      )}
      {friend != null && (
        <Panel style={[styles.paper, PARCHMENT_LAYER]}>
          <AppText size="sm" style={{ color: palette.ink, opacity: 0.85 }}>
            {`for ${friend.name} — your pigeon flies from home to their pin (~3 days)`}
          </AppText>
          <AppInput
            serif
            multiline
            value={body}
            onChangeText={setBody}
            placeholder="dear …"
            placeholderTextColor={`${palette.ink}77`}
            accessibilityLabel="letter body"
            style={[styles.body, { backgroundColor: 'transparent', borderColor: PARCHMENT.blankLine, color: palette.ink }]}
          />
          {overCap && (
            <AppText size="sm" align="center" style={{ color: palette.error }}>
              {`a pigeon can only carry so much: ${body.length - CAP} characters over`}
            </AppText>
          )}
          <StampHold
            onSealed={() => {
              setSent(true);
              // let the wing-off toast land before the pane (or page) closes:
              // onSent unmounts this compose, so the confirmation gets a beat
              closeTimer.current = setTimeout(() => onSent?.(), 2600);
            }}
          />
        </Panel>
      )}
    </View>
  );
}

function Sentwing() {
  const { palette } = useTheme();
  return (
    <View style={styles.sent}>
      <AppText size="display" align="center" style={{ color: palette.ink }}>
        🕊️
      </AppText>
      <AppText tone="display" align="center" style={{ color: palette.ink }}>
        the wing is off — your letter is in flight
      </AppText>
      <AppText align="center" size="sm" style={{ color: palette.ink, opacity: 0.75 }}>
        you'll see it on the chart until it lands; no unsend after this
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  paper: { padding: 24, gap: 12, minHeight: 260 },
  gap: { gap: 12 },
  selectLabel: { opacity: 0.85 },
  body: { minHeight: 180 },
  picker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  pick: { borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 }, // chip on parchment: outline only, ink text
  sent: { gap: 8, padding: 24, alignItems: 'center', flex: 1 },
});
