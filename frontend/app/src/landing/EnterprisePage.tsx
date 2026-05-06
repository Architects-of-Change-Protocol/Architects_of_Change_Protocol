import { LogoRotating } from '../components/logo/LogoRotating';
import { AocRuntimeOS } from './components/AocRuntimeOS';

export const renderEnterprisePage = () => {
  return (
    <main className="min-h-screen bg-[#090b11] text-white font-sans">
      <nav className="sticky top-0 z-30 backdrop-blur bg-black/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3"><LogoRotating size={28} inverted /><span className="font-semibold tracking-tight">AOC Runtime OS</span></a>
          <a className="px-4 py-2 rounded-xl bg-cyan-300 text-black text-sm font-semibold" href="mailto:hello@aocprotocol.xyz?subject=AOC%20Runtime%20OS">Book runtime walkthrough</a>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <p className="text-cyan-300 text-xs uppercase tracking-[0.23em] mb-5">Phase 2.6 — Guided Runtime Storytelling Layer</p>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight max-w-5xl">Relationship Infrastructure for the AI and Zero-Party Data Era.</h1>
        <p className="mt-6 text-white/70 text-lg max-w-4xl">AOC Scenario Engine translates relationship infrastructure into an enterprise narrative: programmable consent, runtime enforcement, reusable audience continuity, AI governance boundaries, and auditable trust outcomes in under five minutes.</p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-10">
        <AocRuntimeOS />
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-6">
        {[
          ['Business Value Outcomes', 'Each scenario maps enforcement behavior to lower CAC, reusable relationships, risk reduction, and accountable AI operations.'],
          ['Replay Observability', 'Timeline scrubbing, state snapshots, trust evolution, and telemetry replay provide operational evidence for every relationship event.'],
          ['Enterprise Story Layer', 'Guided narration explains what happened, why it matters, and how AOC preserves trust continuity across teams and AI agents.'],
        ].map(([title, body]) => (
          <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-white/65 text-sm leading-relaxed">{body}</p>
          </article>
        ))}
      </section>
    </main>
  );
};
