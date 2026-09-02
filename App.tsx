import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.mark}>🕊️</Text>
      <Text style={styles.title}>pigeonpost</Text>
      <Text style={styles.tag}>post to your circle, not to the world</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#11181a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  mark: { fontSize: 56 },
  title: { color: '#e6eae7', fontSize: 32, fontWeight: '600', letterSpacing: 0.5 },
  tag: { color: '#3dc9ba', fontSize: 15 },
});
