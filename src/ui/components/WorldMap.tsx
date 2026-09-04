import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { useTheme } from '../theme/useTheme';

// The hand-drawn world (UI-DESIGN §6): a parchment chart, not an Earth. Pin
// positions are normalised 0..1 on the panel; flights are dashed ink routes a
// pigeon travels. Decorative only — the art never enters any encrypted blob.
export type MapPoint = { x: number; y: number };
export type MapPin = MapPoint & { label: string; tone?: 'you' | 'friend' };
export type MapFlight = { from: MapPoint; to: MapPoint; label?: string };

export function WorldMap({
  pins,
  flights = [],
  height = 240,
  style,
  ...rest
}: ViewProps & { pins: MapPin[]; flights?: MapFlight[]; height?: number }) {
  const { palette } = useTheme();
  const paper = palette.paper;
  const ink = palette.ink;
  const wax = palette.wax;
  return (
    <View style={[styles.chart, { backgroundColor: paper, height }, style]} {...rest}>
      <Continent ink={ink} style={continents.one} />
      <Continent ink={ink} style={continents.two} />
      <Continent ink={ink} style={continents.three} />
      {flights.map((flight, index) => (
        <Flight key={index} flight={flight} ink={ink} />
      ))}
      {pins.map((pin) => (
        <View key={`${pin.x}:${pin.y}`} style={[styles.pin, { left: `${pin.x * 100}%`, top: `${pin.y * 100}%` }]}>
          <View style={[styles.dot, { backgroundColor: pin.tone === 'you' ? palette.accent : wax }]} />
          <AppText size="sm" style={[styles.label, { color: ink }]}>{pin.label}</AppText>
        </View>
      ))}
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
  continent: { position: 'absolute', opacity: 0.08 },
  pin: { position: 'absolute', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: 'transparent' },
  flight: { position: 'absolute', height: 0, borderStyle: 'dashed', borderTopWidth: 2, overflow: 'visible' },
  marker: { position: 'absolute', top: -22, alignSelf: 'center' },
  label: { fontSize: 13 },
});
