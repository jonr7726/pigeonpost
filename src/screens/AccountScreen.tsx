import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppInput, AppText, Panel, ThemeToggle } from '../ui/components';
import { useTheme } from '../ui/theme/ThemeProvider';
import { ApiError, login, signup } from '../data/api';

type Mode = 'signup' | 'login';

// The dev-rig account flow (kept: it exercises DB read/write pre-R-001) but on
// the new brand: brass on walnut, serif display, ThemeToggle right on the card.
// Real auth (PAKE, key-bundle) is R-001 — nothing here suggests otherwise.
export function AccountScreen({ onSignedIn }: { onSignedIn: (user: { id: number; username: string }) => void }) {
  const [mode, setMode] = useState<Mode>('signup');
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { palette, mode: themeMode, toggle } = useTheme();

  async function submit() {
    if (!username.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const u = mode === 'signup' ? await signup(username.trim()) : await login(username.trim());
      onSignedIn(u);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AccountView>
      <Panel style={styles.card} testID="account-card">
        <AppText align="center" size="display" style={styles.mark}>
          🕊️
        </AppText>
        <AppText tone="display" size="display" align="center">
          pigeonpost
        </AppText>
        <AppText tone="dim" align="center">
          {mode === 'signup' ? 'pick a username to join the circle' : 'log in with your username'}
        </AppText>
        <AppInput
          value={username}
          onChangeText={setUsername}
          placeholder="username"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="username"
          onSubmitEditing={submit}
        />
        {error != null && (
          <AppText tone="dim" size="sm" align="center" testID="account-error" style={{ color: palette.error }}>
            {error}
          </AppText>
        )}
        <AppButton
          full
          label={mode === 'signup' ? 'Create account' : 'Log in'}
          onPress={submit}
          loading={busy}
          disabled={busy}
        />
        <Pressable
          onPress={() => {
            setMode(mode === 'signup' ? 'login' : 'signup');
            setError(null);
          }}
          accessibilityRole="button"
        >
          <AppText tone="dim" size="sm" align="center">
            {mode === 'signup' ? 'Already have a username? Log in' : 'New here? Pick one'}
          </AppText>
        </Pressable>
        <ThemeToggle mode={themeMode} onSelect={() => toggle()} />
      </Panel>
    </AccountView>
  );
}

function AccountView({ children }: { children: React.ReactNode }) {
  const { palette } = useTheme();
  return <View style={[styles.center, { backgroundColor: palette.bg }]}>{children}</View>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { gap: 14, width: '100%', maxWidth: 380, padding: 24 },
  mark: { fontSize: 52 },
});
