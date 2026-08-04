import { Card, SectionHeader } from '../primitives';
import { GAPS, MECHANISMS } from './content';

function DotIcon() {
  return (
    <svg viewBox="0 0 256 256" className="h-[22px] w-[22px] shrink-0 text-indigo-600" fill="currentColor" aria-hidden="true">
      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm12-40a12,12,0,1,1-12-12A12,12,0,0,1,140,176ZM128,72a8,8,0,0,0-8,8v64a8,8,0,0,0,16,0V80A8,8,0,0,0,128,72Z" />
    </svg>
  );
}

// Organizations can authenticate users. They can authorize users. They
// rarely govern access — this section makes that gap concrete by naming
// the ad hoc mechanisms teams already reach for and what they can't answer.
// Structurally mirrors ../Problem.tsx (Enterprise's own Problem slide) but
// scoped to the specific mechanisms and consequences this product replaces.
export function Problem() {
  return (
    <section id="problem" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="The Problem"
        title="You can authenticate. You can authorize. You rarely govern."
        description="Every team assembles the same ad hoc mechanisms to grant access. None of them were built to prove that access was correct — only that it happened."
      />

      <div className="grid md:grid-cols-2 gap-12 mt-11">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">What you're reaching for today</p>
          <ul className="mt-5 flex flex-col gap-6">
            {MECHANISMS.map((item) => (
              <li key={item} className="flex items-center gap-3.5 text-base text-slate-900">
                <DotIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">What they leave behind</p>
          <div className="mt-5 flex flex-col gap-4">
            {GAPS.map((gap) => (
              <Card key={gap.title} className="px-6 py-5">
                <p className="text-[15px] font-bold text-slate-900">{gap.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{gap.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
