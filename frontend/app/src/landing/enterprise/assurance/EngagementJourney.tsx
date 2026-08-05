import { PipelineRail, SectionHeader } from '../primitives';
import { ENGAGEMENT_JOURNEY } from './content';

const RAIL_STEPS = ENGAGEMENT_JOURNEY.map((stage) => ({ label: stage.label }));

// Section 9 — the commercial journey. The Technical Assessment is the only
// entry point, and it is explicitly framed as valuable on its own — the
// brief is specific that the assessment must not be a forced funnel into
// implementation.
export function EngagementJourney() {
  return (
    <section id="engagement-journey" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Commercial Journey"
        title="Start with a Technical Assessment, not a sales cycle"
        description="The Technical Assessment is the first engagement — and it stands on its own. Findings and a roadmap are useful even if you never move to implementation with us."
      />

      <PipelineRail steps={RAIL_STEPS} activeIndex={0} />

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ENGAGEMENT_JOURNEY.map((stage) => (
          <div key={stage.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[13px] font-bold text-slate-900">{stage.label}</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-500">{stage.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
