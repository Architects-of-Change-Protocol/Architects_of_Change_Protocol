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

    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // ignore external, mailto, tel, hash-only, target=_blank
      if (
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        anchor.target === '_blank' ||
        anchor.hasAttribute('download')
      ) {
        return;
      }

      event.preventDefault();
      window.history.pushState({}, '', href);
      setPathname(window.location.pathname);
    };

    window.addEventListener('popstate', onPopState);
    document.addEventListener('click', onDocumentClick);

    return () => {
      window.removeEventListener('popstate', onPopState);
      document.removeEventListener('click', onDocumentClick);
    };
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
        setPathname(window.location.pathname);
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
