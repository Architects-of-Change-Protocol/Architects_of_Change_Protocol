import { useMemo, useState } from 'react';

type EntryMode = 'user' | 'company';

export function LaunchEntryExperience() {
  const [mode, setMode] = useState<EntryMode>('user');
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const content = useMemo(() => {
    if (mode === 'company') {
      return {
        badge: 'Company entry',
        title: 'Bring compliant access controls to your organization.',
        description:
          'Start a company workspace and configure explicit permissions, audit trails, and integration points for your team.',
        primaryLabel: 'Launch company workspace',
        secondaryLabel: 'Book enterprise onboarding',
        secondaryHref: '/enterprise'
      };
    }

    return {
      badge: 'User entry',
      title: 'Control your data access in real time.',
      description:
        'Enter AOC as a user to review permissions, approve scoped requests, and track every access interaction with full visibility.',
      primaryLabel: 'Enter user control plane',
      secondaryLabel: 'Learn about enterprise setup',
      secondaryHref: '/enterprise'
    };
  }, [mode]);

  return (
    <section className="min-h-screen flex items-center py-24 px-4 sm:px-6">
      <div className="w-full max-w-xl mx-auto rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_28px_100px_rgba(0,0,0,0.45)]">
        <p className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-200">
          Launch App
        </p>

        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/50">{content.badge}</p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
          {content.title}
        </h1>
        <p className="mt-4 text-base text-white/70 leading-relaxed">{content.description}</p>

        <div className="mt-6 grid grid-cols-2 rounded-2xl border border-white/10 p-1 bg-black/35">
          <button
            type="button"
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              mode === 'user'
                ? 'bg-cyan-300 text-black'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setMode('user')}
          >
            User
          </button>
          <button
            type="button"
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              mode === 'company'
                ? 'bg-cyan-300 text-black'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setMode('company')}
          >
            Company
          </button>
        </div>

        <div className="mt-6 grid gap-3">
          <a
            href="/"
            className="w-full rounded-2xl bg-cyan-300 px-5 py-4 text-center text-base font-semibold text-black transition hover:bg-cyan-200 active:scale-[0.99]"
          >
            {content.primaryLabel}
          </a>

          <a
            href={content.secondaryHref}
            className="w-full rounded-2xl border border-white/15 px-5 py-4 text-center text-base font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.03]"
          >
            {content.secondaryLabel}
          </a>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/30">
          <button
            type="button"
            className="w-full px-4 py-3 text-left text-sm font-medium text-white/80 flex items-center justify-between"
            onClick={() => setShowHowItWorks((current) => !current)}
            aria-expanded={showHowItWorks}
          >
            <span>How it works</span>
            <span className="text-cyan-200">{showHowItWorks ? '−' : '+'}</span>
          </button>

          {showHowItWorks && (
            <div className="border-t border-white/10 px-4 py-4 text-sm text-white/70 leading-6 space-y-3">
              <p>
                1. Choose your entry mode (User or Company) based on who is initiating access.
              </p>
              <p>
                2. Continue into the control plane to define permissions, verify requests, and audit outcomes.
              </p>
              <p>
                3. Launch with explicit controls first, then integrate deeper workflows as needed.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
