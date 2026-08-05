import { PipelineRail, SectionHeader } from '../primitives';
import { MATURITY_LEVELS } from './content';

const RAIL_STEPS = MATURITY_LEVELS.map((level) => ({ label: level.name }));

// Section 5 — the five-level Capability Maturity Model used to rate every
// capability in the Capability Evaluation methodology stage. This is a
// per-capability maturity model, distinct from the SAF Assessment Maturity
// Model (docs/audits/SAF-002-Assessment-Methodology-v1.0.md §27), which
// describes an organization's overall SAF-engagement readiness rather than
// the state of an individual capability. Not a certification scale.
export function CapabilityMaturity() {
  return (
    <section id="capability-maturity" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Capability Maturity"
        title="How every capability is rated"
        description="Every capability in scope is rated on this five-level scale — not certified, not pass/fail."
      />

      <PipelineRail steps={RAIL_STEPS} activeIndex={-1} />

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {MATURITY_LEVELS.map((level) => (
          <div key={level.level} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">Level {level.level}</p>
            <h4 className="mt-1.5 text-[14.5px] font-extrabold text-slate-900">{level.name}</h4>
            <p className="mt-2.5 text-[12.5px] leading-relaxed text-slate-500">{level.definition}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
