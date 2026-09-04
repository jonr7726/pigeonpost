import { StyleSheet, View, type ViewStyle } from 'react-native';

import { AppText, Panel, Screen, ScreenScroll, TopBar } from '../ui/components';
import { SealBreak, SealBrokenStill } from '../ui/animations';
import { PARCHMENT } from '../ui/theme/palette';
import { useTheme } from '../ui/theme/ThemeProvider';
import { useRouter } from '../ui/nav';
import { useLetters } from '../data/sample/useSampleData';
import type { Letter } from '../data/sample/types-shared';

// RN-web honours background-image/box-shadow on views, but RN core types don't
// describe them for web: one lift, one place, next to the palette it comes from.
const PARCHMENT_LAYER = { backgroundImage: PARCHMENT.backgroundImage, boxShadow: PARCHMENT.boxShadow } as unknown as ViewStyle;
// Reading a letter: paper prop drops in (ink on paper), the wax seal breaks
// once on first open, then it's plain paper. Reduced motion: still seal.
export function LetterReadScreen({ letterId }: { letterId: string }) {
  const { letters } = useLetters();
  const router = useRouter();
  const letter = letters.find((entry) => entry.id === letterId);
  if (letter == null) return null;
  return (
    <Screen width="standard">
      <TopBar
        title={letter.subject}
        onBack={router.pop}
      />
      <ScreenScroll>
      <LetterPaper letter={letter} firstOpen={letter.state === 'opened' && letter.text == null} />
      </ScreenScroll>
    </Screen>
  );
}

export function LetterPaper({ letter, firstOpen }: { letter: Letter; firstOpen: boolean }) {
  const { palette } = useTheme();
  return (
    // A physical sheet of paper, not a panel: layered grain + stains from the
    // palette's PARCHMENT spec, soft shadow beneath, ink on top. Reads as
    // "the same object" in both themes — a letter is paper either way.
    <Panel style={[styles.paper, PARCHMENT_LAYER]}>
      <AppText style={{ color: palette.ink }} size="sm">{`${letter.from.name} → ${letter.to.name}`}</AppText>
      <AppText tone="display" size="lg" style={{ color: palette.ink }}>{letter.subject}</AppText>
      {letter.state === 'sealed' && <SealBreak />}
      {letter.state === 'overdue' && <SealBrokenStill label="— the seal is still intact; the pigeon is late —" />}
      {letter.text != null && <AppText style={[styles.hand, { color: palette.ink }]}>{letter.text}</AppText>}
      {firstOpen && <SealBrokenStill label="— broken once —" />}
    </Panel>
  );
}

const styles = StyleSheet.create({
  paper: { padding: 28, gap: 12, minHeight: 320 },
  hand: { fontFamily: 'Georgia, serif', fontSize: 17, lineHeight: 28 },
});
