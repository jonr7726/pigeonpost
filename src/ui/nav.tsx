import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { TabId } from './components/NavBar';

// The tiny in-house router (storyboard scale; react-navigation can land in a
// later session without screens noticing — same push/pop shape).
export type ScreenParams =
  | { screen: 'postDetail'; postId: string }
  | { screen: 'letterRead'; letterId: string }
  | { screen: 'letterCompose' }
  | { screen: 'username'; username: string };

type StackEntry = ScreenParams;

type RouterValue = {
  tab: TabId;
  stack: StackEntry[];
  goTab: (tab: TabId) => void;
  push: (entry: StackEntry) => void;
  pop: () => void;
};

export type Router = RouterValue;

const RouterContext = createContext<RouterValue | null>(null);

// eslint-disable-next-line react-hooks/rules-of-hooks -- not a hook file edge case
export function useRouter(): Router {
  const value = useContext(RouterContext);
  if (!value) throw new Error('useRouter outside RouterProvider');
  return value;
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<TabId>('feed');
  const [stack, setStack] = useState<StackEntry[]>([]);
  const value = useMemo<RouterValue>(
    () => ({
      tab,
      stack,
      goTab: (next) => {
        setTab(next);
        setStack([]);
      },
      push: (entry) => setStack((current) => [...current, entry]),
      pop: () => setStack((current) => current.slice(0, -1)),
    }),
    [tab, stack],
  );
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

