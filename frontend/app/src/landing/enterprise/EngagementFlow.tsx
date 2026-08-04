import { PipelineRail, SectionHeader } from './primitives';

const STEPS = [
  { label: 'Technical Assessment', sub: 'Gap analysis' },
  { label: 'Design Partner', sub: 'Working integration' },
  { label: 'Implementation', sub: 'Validated end-to-end' },
  { label: 'Enterprise Platform', sub: 'Production deployment' },
  { label: 'Continuous Assurance', sub: 'Ongoing evidence' },
];

// Deck slide 10.
export function EngagementFlow() {
  return (
    <section id="engagement" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader eyebrow="How We Work Together" title="Start small and specific. Scale only if it fits." />

      <PipelineRail steps={STEPS} activeIndex={0} />

      <p className="mt-10 text-center text-[13px] italic text-slate-500">
        Most engagements start with a single Technical Assessment call.
      </p>
    </section>
  );
}
