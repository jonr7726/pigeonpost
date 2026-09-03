import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';

import { dark, light } from './palette';
import type { Palette } from './theme';

export type ThemeMode = 'dark' | 'light';

const THEME_STORAGE_KEY = 'pigeonpost.theme.mode';

// Persistence on web only (no async-storage dependency); native keeps the
// session default until R-010 wires storage. Reads are best-effort and silent.
function readStoredMode(): ThemeMode | null {
  if (Platform.OS !== 'web') return null;
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
  } catch {
    return null;
  }
}

function writeStoredMode(mode: ThemeMode): void {
  if (Platform.OS !== 'web') return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // private mode / storage disabled — session-only theme is fine
  }
}

// First run follows the OS; once the user touches the toggle we persist theirs.
function initialMode(): ThemeMode {
  const stored = readStoredMode();
  if (stored === 'dark' || stored === 'light') return stored;
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

export type ThemeContextValue = {
  palette: Palette;
  mode: ThemeMode;
  toggle: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const palette = mode === 'dark' ? dark : light;
  const toggle = useCallback(() => {
    setMode((current) => {
      const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
      writeStoredMode(next);
      return next;
    });
  }, []);
  const value = useMemo(() => ({ palette, mode, toggle }), [palette, mode, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme used outside ThemeProvider');
  return value;
}
