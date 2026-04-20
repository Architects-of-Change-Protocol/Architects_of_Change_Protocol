import { useEffect } from 'react';
import { useSession } from '../auth/session';
import { useRouter } from '../app/router';

export function LoginPage() {
  const { session, signInAs } = useSession();
  const { navigate } = useRouter();

  useEffect(() => {
    if (session.authenticated) {
      navigate('/app', true);
    }
  }, [navigate, session.authenticated]);

  if (session.authenticated) return null;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-white/10 rounded-2xl p-8 bg-white/[0.02]">
        <h1 className="text-2xl font-semibold mb-2">Mock Sign In</h1>
        <p className="text-white/60 text-sm mb-6">P0 role/session foundation for dashboard routing.</p>

        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => {
              signInAs('user');
              navigate('/app/user');
            }}
            className="px-4 py-3 rounded-lg bg-cyan-400 text-black font-semibold"
          >
            Continue as User
          </button>

          <button
            type="button"
            onClick={() => {
              signInAs('market_maker');
              navigate('/app/enterprise');
            }}
            className="px-4 py-3 rounded-lg border border-white/20 hover:border-white/40"
          >
            Continue as Market Maker
          </button>
        </div>
      </div>
    </main>
  );
}
