import { PipelineRail, SectionHeader } from '../primitives';
import { METHODOLOGY_DETAIL, METHODOLOGY_STEPS } from './content';

// Section 4 — Assessment Methodology. The full 8-stage process; the
// Enterprise homepage's AssuranceSection.tsx summarizes the customer-facing
// half of it (Assessment/Recommendations/Implementation/Validation/
// Continuous Assurance) as its own 5-step engagement model.
export function Methodology() {
  return (
    <section id="methodology" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Assessment Methodology"
        title="An evidence-driven process, not a self-attestation"
        description="Eight stages, from inventory to continuous monitoring."
      />

      <PipelineRail steps={METHODOLOGY_STEPS} activeIndex={0} />

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
        {METHODOLOGY_DETAIL.map((step) => (
          <div key={step.title}>
            <p className="text-sm font-bold text-slate-900">{step.title}</p>
            <p className="mt-2 text-[13px] text-slate-500 leading-relaxed">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
