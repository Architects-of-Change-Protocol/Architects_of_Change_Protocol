import { PipelineRail, SectionHeader } from '../primitives';
import { ENGAGEMENT_DETAIL, ENGAGEMENT_STEPS } from './content';

// Same 5 steps as ../AssuranceSection.tsx (the homepage's summary, deck
// slide 7) and the SK005 pitch deck — this page spells each one out instead
// of only naming it.
export function EngagementPipeline() {
  return (
    <section id="engagement" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Engagement Model"
        title="Five steps, from first conversation to continuous validation"
        description="The same model summarized on the Enterprise homepage — here in full."
      />

      <PipelineRail steps={ENGAGEMENT_STEPS} activeIndex={0} />

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {ENGAGEMENT_DETAIL.map((step) => (
          <div key={step.title}>
            <p className="text-sm font-bold text-slate-900">{step.title}</p>
            <p className="mt-2 text-[13px] text-slate-500 leading-relaxed">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
