import { LogoRotating } from '../components/logo/LogoRotating';
import { AocRuntimeOS } from './components/AocRuntimeOS';

const enterpriseNav = [
  { label: 'Runtime OS', href: '#runtime-os' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'AI Governance', href: '#ai-governance' },
  { label: 'Scenarios', href: '#scenarios' },
  { label: 'Docs', href: '/docs' },
];

export const renderEnterprisePage = () => {
  return (
    <main className="min-h-screen bg-[#090b11] text-white font-sans">
      <nav className="sticky top-0 z-30 backdrop-blur bg-black/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto min-h-16 px-6 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-4">
            <a href="/" className="flex items-center gap-3">
              <LogoRotating size={28} inverted />
              <span className="font-semibold tracking-tight">AOC Enterprise</span>
            </a>
            <a className="md:hidden px-3 py-1.5 rounded-lg bg-cyan-300 text-black text-xs font-semibold" href="mailto:hello@aocprotocol.xyz?subject=AOC%20Runtime%20OS">Talk to architecture</a>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4 md:gap-7 overflow-x-auto whitespace-nowrap text-sm text-white/75">
            {enterpriseNav.map((item) => (
              <a key={item.label} href={item.href} className="hover:text-white transition-colors">
                {item.label}
              </a>
            ))}
          </div>

          <a className="hidden md:inline-flex px-4 py-2 rounded-xl bg-cyan-300 text-black text-sm font-semibold" href="mailto:hello@aocprotocol.xyz?subject=AOC%20Runtime%20OS">Book runtime walkthrough</a>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 pt-16 pb-10" id="architecture">
        <p className="text-cyan-300 text-xs uppercase tracking-[0.23em] mb-5">Enterprise Relationship Infrastructure</p>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight max-w-5xl">Relationship Infrastructure for the AI and Zero-Party Data Era.</h1>
        <p className="mt-6 text-white/70 text-lg max-w-4xl">AOC operationalizes trusted digital relationships with reusable consented state, programmable capabilities, and runtime trust controls that keep enterprise AI operations governable in production.</p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-10" id="runtime-os">
        <AocRuntimeOS />
      </section>

      <section className="max-w-7xl mx-auto px-6 pt-6 pb-20" id="solutions">
        <div className="max-w-3xl mb-8">
          <p className="text-cyan-300 text-xs uppercase tracking-[0.2em] mb-4">Solutions</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Enterprise operational layers built on AOC Runtime OS.</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            ['Reusable Audience Infrastructure', 'Turn temporary users into reusable consented relationships.', 'Lower CAC through relationship continuity, zero-party relationship state, and bounded personalization that can be reused safely across journeys.'],
            ['AI Runtime Governance', 'AI agents operating inside programmable trust boundaries.', 'Apply bounded execution, runtime attestation, policy intervention, and scoped AI permissions so agent actions remain operationally trusted.'],
            ['Relationship Continuity', 'Persistent operational relationships across systems and experiences.', 'Preserve reusable trust and persistent relationship state across channels while maintaining runtime governance and consent continuity.'],
            ['Delegated Enterprise Access', 'Scoped, auditable, revocable runtime capabilities.', 'Issue delegated capabilities with auditable runtime permissions, trust enforcement, and operational governance from one shared control layer.'],
            ['Consent Runtime Enforcement', 'Transform consent into operational infrastructure.', 'Move consent from static agreement to runtime enforcement with trust orchestration, replayability, and policy-driven relationships.'],
          ].map(([title, subtitle, body]) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <h3 className="text-xl font-semibold mb-1">{title}</h3>
              <p className="text-cyan-200 text-sm mb-3">{subtitle}</p>
              <p className="text-white/65 text-sm leading-relaxed">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20" id="ai-governance">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-white/[0.01] p-8 md:p-10">
          <p className="text-cyan-300 text-xs uppercase tracking-[0.2em] mb-3">Built on AOC</p>
          <h2 className="text-3xl font-semibold tracking-tight mb-6">Foundational runtime infrastructure, operationalized for enterprise execution.</h2>
          <div className="space-y-3 text-white/80 text-sm md:text-base">
            {[
              'AOC Core Infrastructure',
              'Runtime OS',
              'Enterprise Solutions',
              'AI Governance / Reusable Relationships / Runtime Trust',
            ].map((item, idx) => (
              <div key={item} className="flex items-center gap-3">
                <span className="text-cyan-300 font-medium min-w-5">{idx + 1}.</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-6" id="scenarios">
        {[
          ['Interactive Runtime Scenarios', 'See programmable digital relationships operating in real time with auditable trust outcomes, policy intervention moments, and reusable relationship continuity.'],
          ['Runtime Observability', 'Use timeline replay, state snapshots, and trust telemetry to inspect every delegated capability and consent enforcement decision.'],
          ['Enterprise Story Layer', 'Scenario-guided narrative connects runtime behavior directly to lower acquisition cost, operational AI governance, and durable relationship infrastructure.'],
        ].map(([title, body]) => (
          <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-white/65 text-sm leading-relaxed">{body}</p>
          </article>
        ))}
        <div className="md:col-span-3 flex justify-start pt-2">
          <a
            href="mailto:hello@aocprotocol.xyz?subject=AOC%20Scenario%20Engine%20Walkthrough"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-cyan-300 text-black text-sm font-semibold"
          >
            Launch Scenario Engine walkthrough
          </a>
        </div>
      </section>
    </main>
  );
};
