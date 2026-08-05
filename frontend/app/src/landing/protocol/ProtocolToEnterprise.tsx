import { SectionHeader } from '../enterprise/primitives';
import { MINERALS } from '../enterprise/minerals';

const PROTOCOL_OWNS = ['Identity', 'Integrity', 'Capabilities', 'Sovereignty', 'Interoperability'];
const ENTERPRISE_OWNS = ['Governance', 'Access', 'Decisions', 'Obligations', 'Grants', 'Revocation', 'Evidence', 'Assurance'];

const amethyst = MINERALS.amethyst;
const sapphire = MINERALS.sapphire;

// The one section on the Protocol page that deliberately shows two
// Capability Minerals side by side — Protocol's own Amethyst column next to
// Enterprise's Sapphire column — because this is the exact seam where the
// two capability families hand off to each other.
export function ProtocolToEnterprise() {
  return (
    <section id="protocol-to-enterprise" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Protocol to Enterprise"
        title="Protocol defines what an asset can be. Enterprise decides how it's used."
        description="Protocol describes. AOC Enterprise decides, executes, observes and audits — operationalizing governance for organizations that need to control how assets built on the protocol are actually used."
        mineral="amethyst"
      />

      <div className="grid md:grid-cols-2 gap-6">
        <div className={`rounded-2xl border ${amethyst.border} ${amethyst.soft} p-6 md:p-7`}>
          <p className={`text-[11px] uppercase tracking-[0.2em] font-mono ${amethyst.text}`}>AOC Protocol defines</p>
          <ul className="mt-5 space-y-2.5">
            {PROTOCOL_OWNS.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-slate-900">
                <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${amethyst.dot}`} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={`rounded-2xl border ${sapphire.border} ${sapphire.soft} p-6 md:p-7`}>
          <p className={`text-[11px] uppercase tracking-[0.2em] font-mono ${sapphire.text}`}>AOC Enterprise operationalizes</p>
          <ul className="mt-5 space-y-2.5">
            {ENTERPRISE_OWNS.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-slate-900">
                <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${sapphire.dot}`} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          href="/?view=enterprise"
          className={`inline-flex items-center justify-center rounded-2xl ${sapphire.solid} px-8 py-4 text-white font-semibold ${sapphire.solidHover} transition-all active:scale-[0.98]`}
        >
          Explore AOC Enterprise &rarr;
        </a>
        <a
          href="/?view=docs#getting-started"
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 hover:border-slate-300 text-slate-900 font-semibold px-8 py-4 transition-all active:scale-[0.98]"
        >
          Review Protocol Documentation
        </a>
      </div>
    </section>
  );
}
