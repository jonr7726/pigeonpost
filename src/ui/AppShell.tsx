import { StyleSheet, View } from 'react-native';

import { GlobalStyle } from './chrome/GlobalStyle';
import { BrassRail } from './chrome/BrassRail';
import { NavBar, TopNav } from './components';
import { useLayoutMode } from './theme/breakpoints';
import { useTheme } from './theme/useTheme';
import { useRouter } from './nav';
import { FeedScreen } from '../screens/FeedScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { LettersScreen } from '../screens/LettersScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PostDetailScreen } from '../screens/PostDetailScreen';
import { LetterReadScreen } from '../screens/LetterReadScreen';
import { LetterComposeScreen } from '../screens/LetterComposeScreen';
import { MapScreen } from '../screens/MapScreen';
import { useSampleData } from '../data/sample/useSampleData';
import { useSession } from './session';

// The bottom tab NavBar (mobile/tablet) vs the PM-style TopNav band (desktop):
// same four content tabs; profile lives behind the user image; the bell rides
// in the bar. Global chrome always follows the viewer's own app theme.
export function AppShell() {
  const { palette, mode: themeMode } = useTheme();
  const router = useRouter();
  const session = useSession();
  const railName = session.username ?? 'wren';
  const desktop = useLayoutMode() === 'desktop';
  const top = router.stack[router.stack.length - 1];

  const body =
    top?.screen === 'postDetail' ? <PostDetailScreen postId={top.postId} /> :
    top?.screen === 'letterRead' ? <LetterReadScreen letterId={top.letterId} /> :
    top?.screen === 'letterCompose' ? <LetterComposeScreen /> :
    top?.screen === 'map' ? <MapScreen /> :
    top?.screen === 'username' ? <ProfileScreen username={top.username} /> :
    router.tab === 'feed' ? (
      <FeedScreen />
    ) : router.tab === 'letters' ? (
      <LettersScreen />
    ) : router.tab === 'discover' ? (
      <FriendsScreen />
    ) : router.tab === 'profile' ? (
      <ProfileScreen username={railName} />
    ) : (
      <SettingsScreen />
    );

  return (
    <View style={[styles.fill, { backgroundColor: palette.bg }]}>
      <GlobalStyle mode={themeMode} bg={palette.bg} bgGlow={palette.bgGlow} />
      <BrassRail />
      {desktop ? (
        <View style={styles.desktopCol}>
          <TopNav active={router.tab} onSelect={router.goTab} username={railName} />
          <View style={styles.main}>
            <View style={styles.inner}>{body}</View>
          </View>
        </View>
      ) : (
        <View style={styles.mobile}>
          <View style={styles.mainMobile}>{body}</View>
          <NavBar active={router.tab} onSelect={router.goTab} username={railName} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  desktopCol: { flexDirection: 'column', flex: 1 },
  mobile: { flex: 1 },
  main: { flex: 1, flexDirection: 'column', alignItems: 'center' },
  mainMobile: { flex: 1, width: '100%' },
  inner: { flex: 1, width: '100%', maxWidth: 1240 },
});
