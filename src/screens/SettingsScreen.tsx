import { StyleSheet, View } from 'react-native';

import { AppText, Divider, Panel, Screen, ScreenScroll, ThemeToggle, TopBar } from '../ui/components';
import { useTheme } from '../ui/theme/ThemeProvider';
import { useSession } from '../ui/session';
import { useSampleData } from '../data/sample/useSampleData';

// Settings: the theme toggle lives here (app-level chrome theme), plus about.
// Profile-page themes are their owner's business and are unaffected by this.
export function SettingsScreen() {
  const { mode, toggle } = useTheme();
  const { username } = useSession();
  return (
    <Screen width="narrow">
      <TopBar title="Settings" showBell />
      <ScreenScroll>
      <Panel style={styles.gap}>
        <AppText tone="display" size="lg">
          Appearance
        </AppText>
        <AppText tone="dim">
          themes the chrome (bars, banners). Profile pages follow their owner's own theme.
        </AppText>
        <ThemeToggle mode={mode} onSelect={(next) => { if (next !== mode) toggle(); }} />
      </Panel>
      <Panel style={styles.gap}>
        <AppText tone="display" size="lg">
          About pigeonpost
        </AppText>
        <AppText tone="dim">
          your circle sees only what you seal to it; the server stores ciphertext and public keys, never keys or plaintext
        </AppText>
        <Divider />
        <AppText tone="dim" size="sm">
          signed in as @{username ?? 'wren'} · dev-rig account (real accounts arrive with R-001)
        </AppText>
      </Panel>
      </ScreenScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 8, width: '100%' },
});
