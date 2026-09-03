import { View } from 'react-native';

import { AppText, Avatar, Divider, Panel, Screen, ScreenScroll, TopBar } from '../ui/components';
import { PageRenderer } from '../ui/profile/PageRenderer';
import { useProfile, useSampleData } from '../data/sample/useSampleData';

// The profile is a widget page rendered from a layout/theme blob (§8.4): the
// page body takes its owner's theme; TopBar chrome stays the viewer's.
export function ProfileScreen({ username }: { username: string }) {
  const { isMe, blob, widgetData } = useProfile(username);
  const { friends } = useSampleData();
  const known = friends.find((f) => f.username === username);
  const friendsCount = known ? friends.length + 1 : friends.length;

  return (
    <Screen width="wide">
      <TopBar title={`@${username}`} showBell />
      <ScreenScroll>
      {isMe && (
        <Panel>
          <AppText tone="dim" size="sm">
            this page is yours — layout and colours are one theme blob; the editor swaps blobs later
          </AppText>
        </Panel>
      )}
      <ProfileStats friendsCount={friendsCount} />
      <PageRenderer blob={blob} username={username} data={widgetData} />
      </ScreenScroll>
    </Screen>
  );
}

// A small identity strip above the widgets (wireframe: @handle · avatar · count).
export function ProfileStats({ friendsCount }: { friendsCount: number }) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <AppText tone="dim">{`${friendsCount} friends`}</AppText>
        <Avatar name="Wren" size={28} />
      </View>
      <Divider />
    </View>
  );
}
