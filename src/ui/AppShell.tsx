import { StyleSheet, View } from 'react-native';

import { GlobalStyle } from './chrome/GlobalStyle';
import { BrassRail } from './chrome/BrassRail';
import { NavBar, Screen, SideRail, TopNav, type TabId } from './components';
import { useLayoutMode } from './theme/breakpoints';
import { useTheme } from './theme/useTheme';
import { useRouter } from './nav';
import { FeedScreen } from '../screens/FeedScreen';
import { EventsScreen } from '../screens/EventsScreen';
import { GroupScreen } from '../screens/GroupScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { LettersScreen } from '../screens/LettersScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PostDetailScreen } from '../screens/PostDetailScreen';
import { LetterReadScreen } from '../screens/LetterReadScreen';
import { LetterComposeScreen } from '../screens/LetterComposeScreen';
import { useSession } from './session';

// The bottom tab NavBar (mobile/tablet) vs the old-Facebook desktop chrome:
// word TopNav + a left SideRail (groups, shortcuts) that only exists on
// desktop. Detail pushes still swap `body`.
export function AppShell() {
  const { palette, mode: themeMode } = useTheme();
  const router = useRouter();
  const session = useSession();
  const railName = session.username ?? 'wren';
  const desktop = useLayoutMode() === 'desktop';
  const top = router.stack[router.stack.length - 1];

  const tabBody =
    router.tab === 'letters' ? <LettersScreen /> :
    router.tab === 'events' ? <EventsScreen /> :
    router.tab === 'discover' ? <FriendsScreen /> :
    router.tab === 'profile' ? <ProfileScreen username={railName} /> :
    <SettingsScreen />;
  const body =
    top?.screen === 'group' ? <GroupScreen groupId={top.groupId} /> :
    top?.screen === 'postDetail' ? <PostDetailScreen postId={top.postId} /> :
    top?.screen === 'letterRead' ? <LetterReadScreen letterId={top.letterId} /> :
    top?.screen === 'letterCompose' ? <LetterComposeScreen /> :
    top?.screen === 'username' ? <ProfileScreen username={top.username} /> :
    router.tab === 'feed' ? <FeedScreen /> : tabBody;

  const topnavActive =
    top?.screen === 'group' ? 'feed' :
    router.tab === 'profile' ? 'home' :
    router.tab === 'discover' ? 'friends' : String(router.tab);

  if (desktop) {
    return (
      <View style={[styles.fill, { backgroundColor: palette.bg }]}>
        <GlobalStyle mode={themeMode} bg={palette.bg} bgGlow={palette.bgGlow} />
        <BrassRail />
        <TopNav
          active={topnavActive}
          onSelect={(id) => {
            router.goTab((id === 'home' ? 'profile' : id === 'friends' ? 'discover' : id) as TabId);
          }}
          username={railName}
        />
        <View style={styles.desktopCols}>
          <SideRail
            onGoProfile={() => router.goTab('profile')}
            username={railName}
          />
          <View style={styles.railContent}>
            <Screen><View style={styles.innerBody}>{body}</View></Screen>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.fill, { backgroundColor: palette.bg }]}>
      <GlobalStyle mode={themeMode} bg={palette.bg} bgGlow={palette.bgGlow} />
      <BrassRail />
      <View style={[styles.mainMobile, { backgroundColor: palette.bg }]}>
        <View style={styles.mobileScrollArea}>{body}</View>
        <NavBar
          active={top?.screen === 'group' ? 'feed' : router.tab}
          onSelect={router.goTab}
          username={railName}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  mainMobile: { flex: 1, width: '100%' },
  inner: { flex: 1, width: '100%' },
  innerBody: { flex: 1, width: '100%' },
  mobileScrollArea: { width: '100%', maxWidth: 1240, flex: 1 },
  desktopCols: { flex: 1, flexDirection: 'row' },
  railContent: { flex: 1, flexDirection: 'column' },
});
