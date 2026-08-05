import { SectionHeader, StatusPill, MineralBadge } from '../primitives';
import { CAPABILITY_CATALOG, type CapabilityId } from '../content';
import { CAPABILITY_FAMILIES } from '../../protocol/content';

// Section 3 — the two canonical domains Assurance evaluates. Both lists are
// rendered directly from their canonical sources rather than a hand-written
// duplicate: Domain A from landing/protocol/content.ts CAPABILITY_FAMILIES
// (W004), Domain B from ../content.ts CAPABILITY_CATALOG (W005). If either
// canonical source changes, this section changes with it — see
// docs/w007-assurance-canonical-assessment-layer.md "Capability Sources".
const GOVERNANCE_CAPABILITY_IDS = Object.keys(CAPABILITY_CATALOG) as CapabilityId[];

export function CapabilityDomains() {
  return (
    <section id="capability-domains" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="What Assurance Evaluates"
        title="Two canonical domains, not a curated marketing subset."
        description="Assurance evaluates the full capability surface AOC Protocol defines and AOC Enterprise operationalizes — not a hand-picked selection of it."
      />

      <div className="mb-14">
        <div className="flex items-baseline justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Domain A &middot; Protocol Sovereignty</h3>
            <MineralBadge mineral="amethyst" />
          </div>
          <p className="text-xs text-slate-500">{CAPABILITY_FAMILIES.length} capability families</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CAPABILITY_FAMILIES.map((family) => (
            <div key={family.id} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <h4 className="text-[14.5px] font-extrabold text-slate-900">{family.name}</h4>
              </div>
              <StatusPill label={family.status} />
              <p className="mt-3 text-[12.5px] leading-relaxed text-slate-500">{family.summary}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Domain B &middot; Enterprise Governance</h3>
            <MineralBadge mineral="sapphire" />
          </div>
          <p className="text-xs text-slate-500">{GOVERNANCE_CAPABILITY_IDS.length} capabilities</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GOVERNANCE_CAPABILITY_IDS.map((id) => {
            const capability = CAPABILITY_CATALOG[id];
            return (
              <div key={id} className="rounded-xl border border-slate-200 bg-white p-5">
                <h4 className="text-[14.5px] font-extrabold text-slate-900">{capability.name}</h4>
                <p className="mt-2 text-[12.5px] leading-relaxed text-slate-500">{capability.summary}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
