import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { Divider } from './Divider';
import { useSession } from '../session';
import { useTheme } from '../theme/useTheme';

// The user dropdown (Instagram-style): your account header, then switch
// account (mock account list) and log out. Used by the desktop TopNav and the
// mobile NavBar — the same menu everywhere.
export function UserMenu({
  username,
  onGoProfile,
  trigger,
  direction = 'down',
}: {
  username: string;
  onGoProfile?: () => void;
  trigger: (open: () => void, openNow: boolean) => ReactNode;
  direction?: 'down' | 'up';
}) {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const { palette } = useTheme();
  const { onLogout, onSwitchAccount } = useSession();

  const accounts = ['marta', 'lesley', 'bill'];

  return (
    <View style={styles.wrap}>
      {trigger(() => setOpen((v) => !v), open)}
      {open && (
        <View style={[direction === 'up' ? styles.menuUp : styles.menu, { backgroundColor: palette.panel, borderColor: palette.panelEdge }]} testID="user-menu">
          <Pressable
            onPress={() => {
              setOpen(false);
              onGoProfile?.();
            }}
            accessibilityRole="button"
            style={styles.row}
          >
            <Avatar name={username} size={40} />
            <View style={styles.col}>
              <AppText size="md">@{username}</AppText>
              <AppText size="sm" tone="dim">see your profile</AppText>
            </View>
          </Pressable>
          <Divider />
          <MenuItem
            icon="⇆"
            label="Switch account"
            onPress={() => setSwitching((v) => !v)}
          />
          {switching &&
            accounts
              .filter((a) => a !== username)
              .map((a) => (
                <MenuItem
                  key={a}
                  icon="☉"
                  label={`@${a}`}
                  onPress={() => {
                    setOpen(false);
                    onSwitchAccount?.(a);
                  }}
                />
              ))}
          <MenuItem
            icon="⇥"
            label="Log out"
            onPress={() => {
              setOpen(false);
              onLogout?.();
            }}
          />
        </View>
      )}
          </View>
  );
}

function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  const { palette } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.row, styles.item]}
    >
      <View style={styles.glyphBox}><AppText style={{ fontSize: 14, color: palette.text }}>{icon}</AppText></View>
      <AppText size="md">{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' as const },
  menu: { position: 'absolute' as const, top: 44, right: 0, width: 260, borderWidth: 1, borderRadius: 10, paddingVertical: 6, zIndex: 60 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 8 },
  col: { gap: 0 },
  item: { borderRadius: 6 },
  glyphBox: { width: 28, alignItems: 'center' },
  menuUp: { position: 'absolute' as const, bottom: 56, right: 0, width: 260, borderWidth: 1, borderRadius: 10, paddingVertical: 6, zIndex: 70 },
});
