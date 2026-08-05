import { PipelineRail, SectionHeader, StatRow } from './primitives';

const STEPS = [
  { label: 'Assessment' },
  { label: 'Recommendations' },
  { label: 'Implementation' },
  { label: 'Validation' },
  { label: 'Continuous Assurance' },
];

const STATS = [
  { num: '4', label: 'control domains' },
  { num: '10', label: 'controls' },
  { num: '3', label: 'eligibility tiers' },
];

// Deck slide 7. This section is the deck's own Assurance slide, summarizing
// the engagement model; the full canonical page — evaluating every Protocol
// sovereignty capability and every Enterprise governance capability, with
// Intelligence Risk folded in as one specialized assessment module — lives
// at enterprise/AssurancePage.tsx. See
// docs/audits/w007-assurance-canonical-refactor.md.
export function AssuranceSection() {
  return (
    <section id="assurance" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Assurance"
        title="Prove your governance posture, continuously"
        description="The engagement model we run with you — and the evidence engine underneath it."
      />

      <PipelineRail steps={STEPS} activeIndex={0} />

      <div className="mt-9 flex items-center gap-4 max-w-lg mx-auto">
        <span className="h-px flex-1 bg-slate-200" />
        <em className="not-italic text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-slate-500 whitespace-nowrap">
          What&apos;s running underneath
        </em>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <StatRow stats={STATS} />

      <p className="mt-7 text-center text-[13px] italic text-slate-500">
        AOC SAF v1.0.0 — implemented, API-backed, evidence-driven. Not a certification authority.
      </p>

      <div className="mt-8 text-center">
        <a href="/?view=assurance" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
          Explore the full Assurance service →
        </a>
      </div>
    </section>
  );
}
