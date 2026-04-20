import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AppRole = 'user' | 'market_maker';

type SessionState = {
  authenticated: boolean;
  role?: AppRole;
};

type SessionContextValue = {
  session: SessionState;
  signInAs: (role: AppRole) => void;
  signOut: () => void;
};

const STORAGE_KEY = 'aoc_mock_session_role';

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<AppRole | undefined>(undefined);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'user' || stored === 'market_maker') {
      setRole(stored);
      return;
    }

    const fromQuery = new URLSearchParams(window.location.search).get('as');
    if (fromQuery === 'user' || fromQuery === 'market_maker') {
      setRole(fromQuery);
      window.localStorage.setItem(STORAGE_KEY, fromQuery);
    }
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      session: {
        authenticated: role !== undefined,
        role,
      },
      signInAs: (nextRole: AppRole) => {
        setRole(nextRole);
        window.localStorage.setItem(STORAGE_KEY, nextRole);
      },
      signOut: () => {
        setRole(undefined);
        window.localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [role]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used inside SessionProvider.');
  }
  return context;
}
