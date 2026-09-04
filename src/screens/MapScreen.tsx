import { Screen, ScreenScroll, TopBar } from '../ui/components';
import { WorldMap } from '../ui/components/WorldMap';
import { useRouter } from '../ui/nav';
import { useMyPin, useSampleData } from '../data/sample/useSampleData';

// The chart at full page: same WorldMap object as the letters pane (one
// component, two surfaces), with the back chevron and the same settings cog
// ("change your location" → tap the chart).
export function MapScreen() {
  const router = useRouter();
  const { me, friends } = useSampleData();
  const myPin = useMyPin();

  return (
    <Screen width="standard">
      <TopBar title="The chart" onBack={router.pop} />
      <ScreenScroll contentStyle={styles.gap}>
        <WorldMap
          height={480}
          cog
          onPinPlace={myPin.setPin}
          pins={[
            { x: myPin.pin.x, y: myPin.pin.y, label: me.username, tone: 'you' },
            ...friends.map((f) => ({ x: f.pin.x, y: f.pin.y, label: f.mapLabel })),
          ]}
        />
      </ScreenScroll>
    </Screen>
  );
}

const styles = {
  gap: { padding: 16, paddingBottom: 32 },
} as const;
