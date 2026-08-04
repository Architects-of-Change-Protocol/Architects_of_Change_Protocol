import { useState } from 'react';
import { Card, SectionHeader } from './primitives';

const STAGES = [
  { label: 'Request', detail: 'A principal asks for access to a specific resource, for a specific purpose.' },
  { label: 'Decision', detail: 'The request is checked against policy in real time — approve, deny, or escalate.' },
  { label: 'Obligations', detail: 'Conditions attach to the grant: watermarking, expiry, read-only, no export.' },
  { label: 'Grant', detail: 'A time-bound, scoped capability is issued — never a standing credential.' },
  { label: 'Translation', detail: 'The grant is translated into the exact call the provider adapter understands.' },
  { label: 'Execution', detail: 'The provider adapter enforces the grant at the point of access.' },
  { label: 'Usage', detail: 'Every read, view, or action is recorded as it happens — not reconstructed later.' },
  { label: 'Evidence', detail: 'The full record becomes a provable, replayable audit trail.' },
];

// Deck slide 4. Hover a stage to see what it means — node highlighting over
// a static diagram, per the "teach, don't decorate" animation rule. This is
// the deck's literal 8-stage pipeline; it also fulfills the same role the
// old GovernanceEmerges "Decisions, obligations, grants & evidence" summary
// used to play, now with the deck's full, exact stage list.
export function Pipeline() {
  const [active, setActive] = useState(-1);

  return (
    <section id="pipeline" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="How It Works"
        title="One request, one provable record"
        description="Every stage produces one immutable record — nothing is overwritten, only added to. Hover a stage to see what it does."
      />

      <div
        role="list"
        aria-label="Governed access pipeline stages"
        className="flex flex-wrap gap-y-8"
        onMouseLeave={() => setActive(-1)}
      >
        {STAGES.map((stage, i) => (
          <button
            key={stage.label}
            type="button"
            role="listitem"
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            aria-current={active === i ? 'step' : undefined}
            className="relative flex flex-1 min-w-[25%] md:min-w-0 flex-col items-center bg-transparent px-1 text-center"
          >
            {i < STAGES.length - 1 ? (
              <div className="absolute left-1/2 top-[26px] hidden h-px w-full bg-slate-200 md:block" aria-hidden />
            ) : null}
            <div
              className={`relative z-10 flex h-[52px] w-[52px] items-center justify-center rounded-full text-[17px] font-extrabold transition-colors ${
                active === i ? 'bg-indigo-600 text-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]' : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              {i + 1}
            </div>
            <div className={`mt-4 text-[13.5px] font-bold ${active === i ? 'text-indigo-800' : 'text-slate-900'}`}>{stage.label}</div>
          </button>
        ))}
      </div>

      <Card className="mt-12 max-w-3xl mx-auto px-8 py-7 min-h-[100px] flex flex-col justify-center">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
          {active >= 0 ? STAGES[active].label : 'Every stage'}
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-900">
          {active >= 0 ? STAGES[active].detail : 'Hover a stage above to see what it does.'}
        </p>
      </Card>

      <Card className="mt-5 max-w-3xl mx-auto px-8 py-7">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">Reference scenario</p>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-900">
          M&amp;A data-room access — outside counsel is granted a 24-hour, read-only, watermark-flagged view
          of a confidential target report. Every view is logged; nothing is ever downloaded.
        </p>
      </Card>
    </section>
  );
}
