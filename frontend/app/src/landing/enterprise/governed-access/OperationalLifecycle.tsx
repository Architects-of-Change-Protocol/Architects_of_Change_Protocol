import { useState } from 'react';
import { Card, SectionHeader } from '../primitives';
import { LIFECYCLE_STAGES } from './content';

// Interactive version of ./Lifecycle.tsx's static chain — same
// hover-to-reveal interaction as ../Pipeline.tsx ("teach, don't decorate"),
// extended to all 8 stages including Policy and Revocation named on their
// own rather than folded into a neighboring stage.
export function OperationalLifecycle() {
  const [active, setActive] = useState(-1);

  return (
    <section id="lifecycle" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Operational Lifecycle"
        title="Every stage produces one immutable record"
        description="Nothing is overwritten, only added to. Hover a stage to see what it does."
      />

      <div
        role="list"
        aria-label="Governed access lifecycle stages"
        className="flex flex-wrap gap-y-8"
        onMouseLeave={() => setActive(-1)}
      >
        {LIFECYCLE_STAGES.map((stage, i) => (
          <button
            key={stage.label}
            type="button"
            role="listitem"
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            aria-current={active === i ? 'step' : undefined}
            className="relative flex flex-1 min-w-[25%] md:min-w-0 flex-col items-center bg-transparent px-1 text-center"
          >
            {i < LIFECYCLE_STAGES.length - 1 ? (
              <div className="absolute left-1/2 top-[26px] hidden h-px w-full bg-slate-200 md:block" aria-hidden />
            ) : null}
            <div
              className={`relative z-10 flex h-[52px] w-[52px] items-center justify-center rounded-full text-[17px] font-extrabold transition-colors ${
                active === i ? 'bg-indigo-600 text-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]' : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              {i + 1}
            </div>
            <div className={`mt-4 text-[12.5px] font-bold leading-tight ${active === i ? 'text-indigo-800' : 'text-slate-900'}`}>
              {stage.label}
            </div>
          </button>
        ))}
      </div>

      <Card className="mt-12 max-w-3xl mx-auto px-8 py-7 min-h-[100px] flex flex-col justify-center">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
          {active >= 0 ? LIFECYCLE_STAGES[active].label : 'Every stage'}
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-900">
          {active >= 0 ? LIFECYCLE_STAGES[active].detail : 'Hover a stage above to see what it does.'}
        </p>
      </Card>
    </section>
  );
}
