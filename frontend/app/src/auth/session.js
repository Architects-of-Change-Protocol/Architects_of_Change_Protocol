import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
const STORAGE_KEY = 'aoc_mock_session_role';
const SessionContext = createContext(undefined);
export function SessionProvider({ children }) {
    const [role, setRole] = useState(undefined);
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
    const value = useMemo(() => ({
        session: {
            authenticated: role !== undefined,
            role,
        },
        signInAs: (nextRole) => {
            setRole(nextRole);
            window.localStorage.setItem(STORAGE_KEY, nextRole);
        },
        signOut: () => {
            setRole(undefined);
            window.localStorage.removeItem(STORAGE_KEY);
        },
    }), [role]);
    return _jsx(SessionContext.Provider, { value: value, children: children });
}
export function useSession() {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSession must be used inside SessionProvider.');
    }
    return context;
}
