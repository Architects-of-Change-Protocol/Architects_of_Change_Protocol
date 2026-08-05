import { SectionHeader, StatRow } from '../primitives';
import { EVIDENCE_STATS } from './content';

// Reuses the same stat row as ../AssuranceSection.tsx (4 control domains /
// 10 controls / 3 eligibility tiers, SAF v1.0.0) and adds the forward bridge
// into Governed Access that the audit flagged as missing — previously
// Assurance only linked backward into Enterprise, never forward from
// Governed Access into what validates it.
export function EvidenceModel() {
  return (
    <section id="evidence" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="What's Running Underneath"
        title="An evidence engine, not a self-attestation"
        description="Findings map to a defined control catalog — not an informal checklist."
      />

      <StatRow stats={EVIDENCE_STATS} />

      <p className="mt-8 text-center text-[13px] italic text-slate-500">
        AOC SAF v1.0.0 — implemented, API-backed, evidence-driven. Not a certification authority.
      </p>

      <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-7 md:p-8 text-center">
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Governed Access is what you implement. Assurance is how you know it stays correct — validating the
          access model, evidence trail, and revocation paths Governed Access puts in place, on an ongoing basis
          as your architecture evolves.
        </p>
        <a
          href="/?view=governed-access"
          className="mt-5 inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Explore Governed Access &rarr;
        </a>
      </div>
    </section>
  );
}
