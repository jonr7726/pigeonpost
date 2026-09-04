import { useState } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { AppInput, AppText, Panel, Screen, ScreenScroll, TopBar } from '../ui/components';
import { StampHold } from '../ui/animations';
import { PARCHMENT } from '../ui/theme/palette';
import { useRouter } from '../ui/nav';
import { useSampleData } from '../data/sample/useSampleData';
import { useTheme } from '../ui/theme/ThemeProvider';

// RN-web honours background-image/box-shadow on views, but RN core types don't
// describe them for web: one lift, one place, next to the palette it comes from.
const PARCHMENT_LAYER = { backgroundImage: PARCHMENT.backgroundImage, boxShadow: PARCHMENT.boxShadow } as unknown as ViewStyle;
const CAP = 10_000; // L1: hard cap, never surfaced until you cross it

// Compose: pick a friend → (map view holds their pin) → write → Stamp (hold)
// → send animation → back to the inbox with the pigeon in flight.
export function LetterComposeScreen() {
  const router = useRouter();
  const { friends } = useSampleData();
  const { palette } = useTheme();
  const [to, setTo] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);
  const friend = friends.find((f) => f.username === to) ?? null;
  const overCap = body.length > CAP;

  return (
    <Screen width="standard">
      <TopBar title="Compose" onBack={router.pop} />
      <ScreenScroll>
        <Panel style={[styles.paper, PARCHMENT_LAYER]}>
          {sent ? (
            <Sentwing />
          ) : (
            <View style={styles.gap}>
              <AppText size="sm" style={{ color: palette.ink, opacity: 0.8 }}>
                one letter, one friend — pick with care 🕊️
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
                    <AppText size="sm" style={{ color: palette.ink, opacity: to === f.username ? 1 : 0.75 }}>
                      {f.name}
                    </AppText>
                  </Pressable>
                ))}
              </View>
              {friend == null && (
                <AppText align="center" style={{ color: palette.ink, opacity: 0.8 }}>
                  a pigeon can only fly between friends — choose one above
                </AppText>
              )}
              {friend != null && (
                <View style={styles.gap}>
                  <AppText size="sm" align="center">
                    {`for ${friend.name} — your pigeon flies from home to their pin (~3 days)`}
                  </AppText>
                  <AppInput
                    serif
                    multiline
                    value={body}
                    onChangeText={setBody}
                    placeholder="dear …"
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
                    }}
                  />
                </View>
              )}
            </View>
          )}
        </Panel>
      </ScreenScroll>
    </Screen>
  );
}

function Sentwing() {
  return (
    <View style={styles.sent}>
      <AppText size="display" align="center">
        🕊️
      </AppText>
      <AppText tone="display" align="center">
        the wing is off — your letter is in flight
      </AppText>
      <AppText tone="dim" align="center" size="sm">
        you'll see it on the chart until it lands; no unsend after this
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  paper: { padding: 24, gap: 16, minHeight: 300 },
  gap: { gap: 12 },
  body: { minHeight: 180 },
  picker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  pick: { borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 }, // chip on parchment: outline only, ink text
  sent: { gap: 8, padding: 24, alignItems: 'center', flex: 1 },
});