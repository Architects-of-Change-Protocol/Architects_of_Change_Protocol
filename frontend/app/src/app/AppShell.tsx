import type { ReactNode } from 'react';
import { useSession } from '../auth/session';
import { useRouter } from './router';

export function AppShell({ children }: { children: ReactNode }) {
  const { session, signOut } = useSession();
  const { navigate } = useRouter();

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 font-sans dark:bg-[#09090b] dark:text-white">
      <header className="border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">AOC Control Plane</div>
            <div className="text-lg font-semibold">Consent Infrastructure</div>
          </div>

          <nav className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-300">
            <button type="button" className="hover:text-zinc-900 dark:hover:text-white" onClick={() => navigate('/app')}>Entry</button>
            <button type="button" className="hover:text-zinc-900 dark:hover:text-white" onClick={() => navigate('/app/user')}>User</button>
            <button type="button" className="hover:text-zinc-900 dark:hover:text-white" onClick={() => navigate('/app/enterprise')}>Enterprise</button>
          </nav>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-zinc-300 px-3 py-1 text-xs dark:border-white/20">{session.role ?? 'anonymous'}</span>
            <button
              type="button"
              onClick={() => {
                signOut();
                navigate('/login', true);
              }}
              className="rounded-md border border-zinc-300 px-3 py-2 text-xs hover:bg-zinc-100 dark:border-white/20 dark:hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">{children}</section>
    </main>
  );
}
