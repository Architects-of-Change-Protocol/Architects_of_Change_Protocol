import { PipelineRail, SectionHeader, Card } from '../primitives';
import { METHODOLOGY_STAGES } from './content';

const RAIL_STEPS = METHODOLOGY_STAGES.map((stage) => ({ label: stage.label }));

// Section 4 — the eight-stage assessment methodology. Reuses PipelineRail
// (the same numbered-stepper primitive as governed-access/Assessment.tsx
// and ../enterprise/AssuranceSection.tsx) for the rail, then a static grid
// of stage detail cards below — no hover-reveal state, per the brief's "no
// decorative motion" instruction.
export function Methodology() {
  return (
    <section id="methodology" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Assessment Methodology"
        title="Eight stages, from inventory to continuous monitoring"
        description="Each stage produces a specific output and defines what we need from you to produce it."
      />

      <PipelineRail steps={RAIL_STEPS} activeIndex={0} mineral="emerald" />

      <div className="mt-14 grid sm:grid-cols-2 gap-5">
        {METHODOLOGY_STAGES.map((stage, i) => (
          <Card key={stage.label} className="p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600">
              {i + 1}. {stage.label}
            </p>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Purpose</dt>
                <dd className="mt-1 text-[13.5px] leading-relaxed text-slate-700">{stage.purpose}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Customer Input</dt>
                <dd className="mt-1 text-[13.5px] leading-relaxed text-slate-700">{stage.customerInput}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Soberanía Activity</dt>
                <dd className="mt-1 text-[13.5px] leading-relaxed text-slate-700">{stage.aocActivity}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Output</dt>
                <dd className="mt-1 text-[13.5px] leading-relaxed text-slate-900 font-medium">{stage.output}</dd>
              </div>
            </dl>
          </Card>
        ))}
      </div>
    </section>
  );
}
