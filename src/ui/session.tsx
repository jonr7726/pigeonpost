import { createContext, useContext, type ReactNode } from 'react';

// The signed-in account identity for UI chrome. Fuel for screens that show
// "who is looking" (SideRail badge, Settings line, profile header) without
// reaching back into the login screen's state; sample data stays the seed.
const SessionContext = createContext<{ username: string | null }>({ username: null });

export function SessionProvider({ username, children }: { username: string | null; children: ReactNode }) {
  return <SessionContext.Provider value={{ username }}>{children}</SessionContext.Provider>;
}

export function useSession(): { username: string | null } {
  return useContext(SessionContext);
}
