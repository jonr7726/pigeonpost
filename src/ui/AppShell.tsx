import { StyleSheet, View } from 'react-native';

import { NavBar, SideRail } from './components';
import { useLayoutMode } from './theme/breakpoints';
import { useTheme } from './theme/useTheme';
import { useRouter } from './nav';
import { FeedScreen } from '../screens/FeedScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { LettersScreen } from '../screens/LettersScreen';
import { PeopleScreen } from '../screens/PeopleScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PostDetailScreen } from '../screens/PostDetailScreen';
import { LetterReadScreen } from '../screens/LetterReadScreen';
import { LetterComposeScreen } from '../screens/LetterComposeScreen';
import { useSampleData } from '../data/sample/useSampleData';

// The bottom tab NavBar (mobile/tablet) vs the SideRail (desktop): same five
// tabs, same placement rule — every later screen lands inside this shell.
// Global chrome always follows the viewer's own app theme.
export function AppShell() {
  const { palette } = useTheme();
  const router = useRouter();
  const { me } = useSampleData();
  const mode = useLayoutMode();
  const top = router.stack[router.stack.length - 1];

  const body =
    top?.screen === 'postDetail' ? <PostDetailScreen postId={top.postId} /> :
    top?.screen === 'letterRead' ? <LetterReadScreen letterId={top.letterId} /> :
    top?.screen === 'letterCompose' ? <LetterComposeScreen /> :
    top?.screen === 'username' ? <ProfileScreen username={top.username} /> :
    router.tab === 'feed' ? (
      <FeedScreen />
    ) : router.tab === 'letters' ? (
      <LettersScreen />
    ) : router.tab === 'discover' ? (
      <PeopleScreen />
    ) : router.tab === 'profile' ? (
      <ProfileScreen username={me.username} />
    ) : (
      <SettingsScreen />
    );

  return (
    <View style={[styles.fill, { backgroundColor: palette.bg }]}>
      {mode === 'desktop' ? (
        <View style={styles.desktop}>
          <SideRail active={router.tab} onSelect={router.goTab} username={me.username} />
          <View style={styles.main}>
            <View style={styles.inner}>{body}</View>
          </View>
        </View>
      ) : (
        <View style={styles.mobile}>
          <View style={styles.mainMobile}>{body}</View>
          <NavBar active={router.tab} onSelect={router.goTab} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  desktop: { flexDirection: 'row', flex: 1 },
  mobile: { flex: 1 },
  main: { flex: 1, width: '100%', maxWidth: 1240, alignSelf: 'center' },
  mainMobile: { flex: 1, width: '100%' },
  inner: { flex: 1 },
});
