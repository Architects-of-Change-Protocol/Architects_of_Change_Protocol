import { SectionHeader } from './primitives';

const PROTOCOL_OWNS = ['Identity', 'Integrity', 'Capabilities', 'Sovereignty', 'Interoperability'];
const ENTERPRISE_OWNS = ['Governance', 'Access', 'Decisions', 'Obligations', 'Grants', 'Revocation', 'Evidence', 'Assurance'];

export function ProtocolToEnterprise() {
  return (
    <section id="protocol-to-enterprise" className="scroll-mt-24 max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
      <SectionHeader
        eyebrow="Protocol to Enterprise"
        title="Protocol defines what an asset can be. Enterprise decides how it's used."
        description="Protocol describes. AOC Enterprise decides, executes, observes and audits — operationalizing governance for organizations that need to control how assets built on the protocol are actually used."
      />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-cyan-300/25 bg-cyan-300/[0.04] p-6 md:p-7">
          <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/70 font-mono">AOC Protocol defines</p>
          <ul className="mt-5 space-y-2.5">
            {PROTOCOL_OWNS.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-white/80">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-cyan-300/70" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-7">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-mono">AOC Enterprise operationalizes</p>
          <ul className="mt-5 space-y-2.5">
            {ENTERPRISE_OWNS.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-white/70">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-white/30" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          href="/?view=enterprise"
          className="px-8 py-4 bg-[#00f0ff] hover:bg-[#00d4e0] text-black font-semibold rounded-2xl transition-all active:scale-[0.98] inline-block"
        >
          Explore AOC Enterprise &rarr;
        </a>
        <a
          href="/?view=docs#getting-started"
          className="px-8 py-4 border border-white/15 hover:border-white/30 text-white font-semibold rounded-2xl transition-all active:scale-[0.98] inline-block"
        >
          Review Protocol Documentation
        </a>
      </div>
    </section>
  );
}
