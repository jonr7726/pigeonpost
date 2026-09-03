import { StyleSheet, View } from 'react-native';

import { AppText, Panel, Screen, ScreenScroll, TopBar } from '../ui/components';
import { SealBreak, SealBrokenStill } from '../ui/animations';
import { useRouter } from '../ui/nav';
import { useLetters } from '../data/sample/useSampleData';
import type { Letter } from '../data/sample/types-shared';

// Reading a letter: paper prop drops in (ink on paper), the wax seal breaks
// once on first open, then it's plain paper. Reduced motion: still seal.
export function LetterReadScreen({ letterId }: { letterId: string }) {
  const { letters } = useLetters();
  const router = useRouter();
  const letter = letters.find((entry) => entry.id === letterId);
  if (letter == null) return null;
  return (
    <Screen bg="paper" width="narrow">
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
  return (
    <Panel style={[styles.paper]}>
      <AppText tone="dim" size="sm">{`${letter.from.name} → ${letter.to.name}`}</AppText>
      <AppText tone="display" size="lg">{letter.subject}</AppText>
      {letter.state === 'sealed' && <SealBreak />}
      {letter.state === 'overdue' && <SealBrokenStill label="— the seal is still intact; the pigeon is late —" />}
      {letter.text != null && <AppText style={styles.hand}>{letter.text}</AppText>}
      {firstOpen && <SealBrokenStill label="— broken once —" />}
      <View style={styles.foot}>
        <AppText tone="dim" size="sm">
          letters are immutable — neither side can edit or delete what was said
        </AppText>
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  paper: { backgroundColor: undefined, padding: 28, gap: 12, minHeight: 320 },
  hand: { fontFamily: 'Georgia, serif', fontSize: 17, lineHeight: 28 },
  foot: { paddingTop: 18 },
});
