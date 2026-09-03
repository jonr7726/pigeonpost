import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider } from './src/ui/theme/ThemeProvider';
import { RouterProvider } from './src/ui/nav';
import { AccountScreen } from './src/screens/AccountScreen';
import { AppShell } from './src/ui/AppShell';
import { SessionProvider } from './src/ui/session';

// ThemeProvider wraps everything (mode switch is instant + global); the
// dev-rig account card gates the shell. No navigation library yet — the
// storyboard router covers tabs + detail pushes until the roadmap says more.
export default function App() {
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);
  return (
    <ThemeProvider>
      <StatusBar />
      <RouterProvider>
        {user == null ? (
          <AccountScreen onSignedIn={setUser} />
        ) : (
          <SessionProvider username={user == null ? null : user.username}>
            <AppShell />
          </SessionProvider>
        )}
      </RouterProvider>
    </ThemeProvider>
  );
}
