import { SectionHeader, StatRow } from '../primitives';
import { ASSESSMENT_OUTPUTS, EVIDENCE_STATS } from './content';

// Section 6 — Assessment Outputs. Also carries the control-catalog stat row
// (4 control domains / 10 controls / 3 eligibility tiers, SAF v1.0.0) that
// ../AssuranceSection.tsx shows on the Enterprise homepage — folded in here
// as the evidence engine underneath these ten outputs, rather than as a
// separate section.
export function AssessmentOutputs() {
  return (
    <section id="assessment-outputs" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Assessment Outputs"
        title="What a completed assessment produces"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-7">
        {ASSESSMENT_OUTPUTS.map((item) => (
          <div key={item.title}>
            <p className="text-sm font-bold text-slate-900">{item.title}</p>
            <p className="mt-2 text-[12.5px] text-slate-500 leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4 max-w-lg mx-auto">
        <span className="h-px flex-1 bg-slate-200" />
        <em className="not-italic text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-slate-500 whitespace-nowrap">
          What&apos;s running underneath
        </em>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <StatRow stats={EVIDENCE_STATS} />

      <p className="mt-7 text-center text-[13px] italic text-slate-500">
        AOC SAF v1.0.0 — implemented, API-backed, evidence-driven. Not a certification authority.
      </p>
    </section>
  );
}
