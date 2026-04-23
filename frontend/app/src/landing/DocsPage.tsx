export const renderDocsPage = () => {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">
            AOC Protocol Documentation
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-6xl">
            Build on a consent-native control plane.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/65">
            AOC gives applications and enterprises a programmable layer for consent,
            policy, capabilities, governed execution, and auditability.
          </p>
        </div>
      </section>

      <section id="getting-started" className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-3xl font-semibold tracking-tight">Getting started</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm font-semibold text-cyan-200">1. Define permissions</p>
              <p className="mt-3 text-sm leading-7 text-white/65">
                Model what can be accessed, by whom, and under which conditions.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm font-semibold text-cyan-200">2. Evaluate requests</p>
              <p className="mt-3 text-sm leading-7 text-white/65">
                Route each request through consent, policy, identity, and capability checks.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm font-semibold text-cyan-200">3. Enforce + audit</p>
              <p className="mt-3 text-sm leading-7 text-white/65">
                Execute only approved actions and record every decision path for traceability.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-3xl font-semibold tracking-tight">Core concepts</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {[
              ['Consent', 'Explicit approval boundaries.'],
              ['Policy', 'Rules that shape permitted behavior.'],
              ['Identity', 'Who or what is requesting access.'],
              ['Capabilities', 'Machine-scoped actions with strict limits.'],
              ['Audit', 'Permanent record of outcomes and reasoning.'],
            ].map(([title, body]) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-base font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/65">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-3xl font-semibold tracking-tight">Enterprise integration</h2>
          <p className="mt-5 max-w-4xl text-base leading-8 text-white/65">
            AOC can sit in front of existing systems as a governed decision layer for requests,
            permissions, machine actions, and auditability across sensitive workflows.
          </p>
          <div className="mt-8">
            <a
              href="/enterprise"
              className="inline-flex items-center justify-center rounded-xl border border-cyan-300/40 px-6 py-3 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300/70 hover:bg-cyan-300/10"
            >
              Go to Enterprise page
            </a>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10">
            <h2 className="text-3xl font-semibold tracking-tight">Documentation v1</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/65">
              This page is the first dedicated internal docs surface for AOC Protocol.
              It can expand into a full docs site with architecture, integration, and developer sections.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white/85 transition hover:border-white/30 hover:text-white"
              >
                Back to landing
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
