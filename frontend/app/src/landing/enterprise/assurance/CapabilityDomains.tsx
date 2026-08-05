import { CAPABILITY_FAMILIES } from '../../protocol/content';
import { CAPABILITY_CATALOG } from '../content';
import { CapabilityCheckItem, SectionHeader } from '../primitives';

// Section 3 — What Assurance Evaluates. Generated from the same canonical
// capability definitions the rest of the site already uses, rather than a
// third, hand-maintained list:
//   Domain A (Protocol Sovereignty) <- protocol/content.ts CAPABILITY_FAMILIES
//   Domain B (Enterprise Governance) <- enterprise/content.ts CAPABILITY_CATALOG
// This is the literal set Assurance evaluates against — every family/entry
// in both catalogs is rendered, not a curated subset.
const ENTERPRISE_CAPABILITIES = Object.values(CAPABILITY_CATALOG);

export function CapabilityDomains() {
  return (
    <section id="what-we-evaluate" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="What Assurance Evaluates"
        title="Every sovereignty capability. Every governance capability."
        description="Two domains, evaluated together — because sovereignty without governance is unaccountable, and governance without sovereignty is dependency."
      />

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600 mb-4">
            Domain A &middot; Protocol Sovereignty
          </p>
          <div className="space-y-2.5">
            {CAPABILITY_FAMILIES.map((family) => (
              <CapabilityCheckItem
                key={family.id}
                name={family.name}
                summary={family.summary}
                checked={family.status === 'Reference Model'}
              />
            ))}
          </div>
          <p className="mt-4 text-[11px] text-slate-400">
            Checked = defined as a canonical contract in @aoc/protocol today. Unchecked = future direction.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600 mb-4">
            Domain B &middot; Enterprise Governance
          </p>
          <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
            {ENTERPRISE_CAPABILITIES.map((capability) => (
              <CapabilityCheckItem
                key={capability.name}
                name={capability.name}
                summary={capability.summary}
                checked
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-7 text-center">
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Governed Access implements a subset of the Enterprise governance capabilities above. Assurance
          evaluates the whole set — not just what one Solution puts in place.
        </p>
        <a
          href="/?view=governed-access"
          className="mt-4 inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Explore Governed Access &rarr;
        </a>
      </div>
    </section>
  );
}
