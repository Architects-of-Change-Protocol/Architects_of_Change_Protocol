import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type RouterValue = {
  pathname: string;
  navigate: (to: string, replace?: boolean) => void;
};

const RouterContext = createContext<RouterValue | undefined>(undefined);

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const value = useMemo<RouterValue>(
    () => ({
      pathname,
      navigate: (to: string, replace = false) => {
        if (replace) {
          window.history.replaceState({}, '', to);
        } else {
          window.history.pushState({}, '', to);
        }
        setPathname(to);
      },
    }),
    [pathname]
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (context === undefined) {
    throw new Error('useRouter must be used inside RouterProvider.');
  }
  return context;
}
