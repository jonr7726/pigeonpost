import { createContext, useContext, type ReactNode } from 'react';

// The signed-in account identity for UI chrome. Fuel for screens that show
// "who is looking" (SideRail badge, Settings line, profile header) without
// reaching back into the login screen's state; sample data stays the seed.
// `onLogout` / `onSwitchAccount` drive the Instagram-style user menu (logout +
// switch account) — storyboard-grade for now.
type SessionValue = {
  username: string | null;
  onLogout?: () => void;
  onSwitchAccount?: (username: string) => void;
};

const SessionContext = createContext<SessionValue>({ username: null });

export function SessionProvider({
  username,
  onLogout,
  onSwitchAccount,
  children,
}: SessionValue & { children: ReactNode }) {
  return <SessionContext.Provider value={{ username, onLogout, onSwitchAccount }}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  return useContext(SessionContext);
}
