import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { Icon } from './Icon';
import { useTheme } from '../theme/useTheme';

// The hand-drawn world (UI-DESIGN §6): a parchment chart, not an Earth. Pin
// positions are normalised 0..1 on the panel; flights are dashed ink routes a
// pigeon travels. Decorative only — the art never enters any encrypted blob.
// Chrome slots: a settings cog (top-right; "change your location" arms a tap
// any to set your loft) and a fullscreen escape (bottom-right), both as small
// parchment chips on the sheet.
export type MapPoint = { x: number; y: number };
export type MapPin = MapPoint & { label: string; tone?: 'you' | 'friend' };
export type MapFlight = { from: MapPoint; to: MapPoint; label?: string };

export function WorldMap({
  pins,
  flights = [],
  height = 240,
  cog,
  onFullscreen,
  onPinPlace,
  style,
  ...rest
}: ViewProps & {
  pins: MapPin[];
  flights?: MapFlight[];
  height?: number;
  cog?: boolean;
  onPinPlace?: (point: MapPoint) => void;
  onFullscreen?: () => void;
}) {
  const { palette } = useTheme();
  const ink = palette.ink;
  const wax = palette.wax;
  const [cogOpen, setCogOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const chartRef = useRef<{ width: number; height: number } | null>(null);

  // Tap-to-place: pick the tap's normalised position on the chart body.
  const place = (event: { nativeEvent: { locationX: number; locationY: number } }) => {
    if (!placing || !onPinPlace) return;
    const chart = chartRef.current;
    if (!chart || chart.width < 1 || chart.height < 1) return;
    onPinPlace({
      x: Math.min(0.95, Math.max(0.05, event.nativeEvent.locationX / chart.width)),
      y: Math.min(0.95, Math.max(0.05, event.nativeEvent.locationY / chart.height)),
    });
    setPlacing(false);
  };

  return (
    <View style={[styles.chart, { backgroundColor: palette.paper, height }, style]} {...rest}>
      <Pressable
        onPress={place}
        accessibilityLabel={placing ? 'tap the chart to place your pin' : 'the chart'}
        onLayout={(e) => {
          const { width } = e.nativeEvent.layout;
          chartRef.current = { width, height };
        }}
        style={styles.pressSurface}
      >
        <Continent ink={ink} style={continents.one} />
        <Continent ink={ink} style={continents.two} />
        <Continent ink={ink} style={continents.three} />
        {pins.map((pin) => (
          <View key={`${pin.x}:${pin.y}`} style={[styles.pin, { left: `${pin.x * 100}%`, top: `${pin.y * 100}%` }]} pointerEvents="none">
            <View style={[styles.dot, { backgroundColor: pin.tone === 'you' ? palette.accent : wax }]} />
            <AppText size="sm" style={[styles.label, { color: ink }]}>{pin.label}</AppText>
          </View>
        ))}
        {flights.map((flight, index) => (
          <Flight key={index} flight={flight} ink={ink} />
        ))}
        {placing && (
          <View style={styles.hint} pointerEvents="none">
            <AppText size="sm" style={{ color: ink }}>
              tap the chart to set your loft
            </AppText>
          </View>
        )}
      </Pressable>
      {cog && (
        <View style={[styles.corner, styles.topRight]} pointerEvents="box-none">
          <Pressable onPress={() => setCogOpen((open) => !open)} accessibilityRole="button" accessibilityLabel="chart options" style={[styles.cornerButton, { backgroundColor: palette.paper }]}>
            <Icon name="settings" size={16} color={palette.ink} />
          </Pressable>
          {cogOpen && (
            <View style={[styles.cogMenu, { backgroundColor: palette.panel, borderColor: palette.panelEdge }]}>
              <Pressable
                onPress={() => {
                  setCogOpen(false);
                  setPlacing(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="change your location"
                style={styles.cogItem}
              >
                <AppText size="sm">change your location</AppText>
              </Pressable>
            </View>
          )}
        </View>
      )}
      {onFullscreen != null && (
        <Pressable
          onPress={onFullscreen}
          accessibilityRole="button"
          accessibilityLabel="open the chart fullscreen"
          style={[styles.cornerButton, styles.bottomRight, { backgroundColor: palette.paper }]}
        >
          <Icon name="expand" size={16} color={palette.ink} />
        </Pressable>
      )}
    </View>
  );
}

const continents: Record<string, ViewStyle> = {
  one: { left: '6%', top: '30%', width: '22%', height: '34%', borderRadius: 46 },
  two: { left: '33%', top: '18%', width: '30%', height: '46%', borderRadius: 60 },
  three: { left: '68%', top: '40%', width: '22%', height: '40%', borderRadius: 40 },
};

function Continent({ ink, style }: { ink: string; style: ViewStyle }) {
  return <View style={[styles.continent, { backgroundColor: ink }, style]} />;
}

function Flight({ flight, ink }: { flight: MapFlight; ink: string }) {
  const left = Math.min(flight.from.x, flight.to.x);
  const width = Math.abs(flight.to.x - flight.from.x) || 0.02;
  return (
    <View
      style={[
        styles.flight,
        { left: `${left * 100}%`, top: `${flight.from.y * 100}%`, width: `${width * 100}%`, borderTopColor: ink },
        { transform: [{ translateY: -8 }] },
      ]}
    >
      <AppText size="sm" style={styles.marker}>
        🕊️
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { borderRadius: 12, overflow: 'hidden' },
  pressSurface: { flex: 1 },
  continent: { position: 'absolute', opacity: 0.08 },
  pin: { position: 'absolute', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: 'transparent' },
  flight: { position: 'absolute', height: 0, borderStyle: 'dashed', borderTopWidth: 2, overflow: 'visible' },
  marker: { position: 'absolute', top: -22, alignSelf: 'center' },
  label: { fontSize: 13 },
  hint: { position: 'absolute', bottom: 12, alignSelf: 'center', paddingHorizontal: 10, paddingVertical: 4 },
  corner: { position: 'absolute' },
  topRight: { top: 8, right: 8, alignItems: 'flex-end' },
  bottomRight: { position: 'absolute', right: 8, bottom: 8 },
  cornerButton: {
    width: 30, height: 30, borderRadius: 15, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: undefined,
  },
  cogMenu: { borderWidth: 1, borderRadius: 8, paddingVertical: 4, minWidth: 150, marginTop: 4 },
  cogItem: { paddingVertical: 8, paddingHorizontal: 12 },
});
