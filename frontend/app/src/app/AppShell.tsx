import type { ReactNode } from 'react';
import { useSession } from '../auth/session';
import { useRouter } from './router';

export function AppShell({ children }: { children: ReactNode }) {
  const { session, signOut } = useSession();
  const { navigate } = useRouter();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-white/50">AOC Control Plane</div>
            <div className="text-lg font-semibold">Protected App Shell</div>
          </div>

          <nav className="flex items-center gap-4 text-sm">
            <button type="button" className="hover:text-cyan-300" onClick={() => navigate('/app')}>
              Entry
            </button>
            <button type="button" className="hover:text-cyan-300" onClick={() => navigate('/app/user')}>
              User
            </button>
            <button type="button" className="hover:text-cyan-300" onClick={() => navigate('/app/enterprise')}>
              Enterprise
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1 rounded-full border border-white/20">{session.role ?? 'anonymous'}</span>
            <button
              type="button"
              onClick={() => {
                signOut();
                navigate('/login', true);
              }}
              className="text-xs px-3 py-2 rounded-md border border-white/20 hover:border-white/40"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-8">{children}</section>
    </main>
  );
}
