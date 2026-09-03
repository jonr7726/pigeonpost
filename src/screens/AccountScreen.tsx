import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { UsernameField } from '../ui/components/UsernameField';
import { ApiError, login, signup } from '../data/api';

type Mode = 'signup' | 'login';

export default function AccountScreen() {
  const [mode, setMode] = useState<Mode>('signup');
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);

  if (user) {
    return (
      <Screen>
        <Text style={styles.mark}>🕊️</Text>
        <Text style={styles.title} testID="signed-in-message">
          Signed in as {user.username}
        </Text>
        <Text style={styles.tag}>
          (nothing else here yet — accounts get real in R-001)
        </Text>
      </Screen>
    );
  }

  async function submit() {
    if (!username.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const u = mode === 'signup' ? await signup(username.trim()) : await login(username.trim());
      setUser(u);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.mark}>🕊️</Text>
      <Text style={styles.title}>pigeonpost</Text>
      <Text style={styles.tag}>
        {mode === 'signup' ? 'pick a username to join' : 'log in with your username'}
      </Text>
      <UsernameField
        value={username}
        onChange={setUsername}
        onSubmit={submit}
        placeholder="username"
      />
      {error != null && (
        <Text style={styles.error} testID="account-error">
          {error}
        </Text>
      )}
      <Button label={mode === 'signup' ? 'Create account' : 'Log in'} onPress={submit} busy={busy} />
      <Pressable
        onPress={() => {
          setMode(mode === 'signup' ? 'login' : 'signup');
          setError(null);
        }}
        role="button"
      >
        <Text style={styles.switch}>
          {mode === 'signup' ? 'Already have a username? Log in' : 'New here? Sign up'}
        </Text>
      </Pressable>
    </Screen>
  );
}

function Screen({ children }: { children: React.ReactNode }) {  return <View style={styles.container}>{children}</View>;
}

function Button({
  label,
  onPress,
  busy,
}: {
  label: string;
  onPress: () => void;
  busy: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      role="button"
      style={[styles.button, busy && styles.buttonBusy]}
      aria-label={label}
    >
      {busy ? (
        <ActivityIndicator color="#11181a" />
      ) : (
        <Text style={styles.buttonLabel}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#11181a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 24,
  },
  mark: { fontSize: 56 },
  title: { color: '#e6eae7', fontSize: 32, fontWeight: '600', letterSpacing: 0.5 },
  tag: { color: '#3dc9ba', fontSize: 15, marginBottom: 12 },
  error: { color: '#f0a4a4', fontSize: 14 },
  switch: { color: '#8a9a9f', fontSize: 14, marginTop: 6 },
  button: {
    backgroundColor: '#3dc9ba',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  buttonBusy: { opacity: 0.6 },
  buttonLabel: { color: '#11181a', fontSize: 16, fontWeight: '600' },
});
