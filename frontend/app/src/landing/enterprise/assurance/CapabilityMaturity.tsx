import { SectionHeader } from '../primitives';
import { MATURITY_LEVELS } from './content';

// Section 5 — Capability Maturity. Every capability in Section 3 is placed
// on this five-level scale rather than treated as binary present/absent.
// Visualized as a progression (increasing indigo weight, connected by a
// single rail) rather than five unrelated cards, so the ordering reads at a
// glance.
const FILL_CLASSES = [
  'bg-slate-100 text-slate-400 border-slate-200',
  'bg-indigo-50 text-indigo-400 border-indigo-100',
  'bg-indigo-100 text-indigo-600 border-indigo-200',
  'bg-indigo-200 text-indigo-700 border-indigo-300',
  'bg-indigo-600 text-white border-indigo-600',
];

export function CapabilityMaturity() {
  return (
    <section id="capability-maturity" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Capability Maturity"
        title="Every capability is scored, not just checked off"
        description="A capability being 'present' says nothing about whether it's reliable in production."
      />

      <div className="relative flex flex-wrap md:flex-nowrap items-stretch gap-y-6">
        {MATURITY_LEVELS.map((level, i) => (
          <div key={level.label} className="relative flex-1 min-w-[45%] md:min-w-0 px-1.5">
            {i < MATURITY_LEVELS.length - 1 ? (
              <div className="absolute left-1/2 top-6 hidden h-px w-full bg-slate-200 md:block" aria-hidden />
            ) : null}
            <div
              className={`relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full border text-sm font-extrabold ${FILL_CLASSES[i]}`}
            >
              {i + 1}
            </div>
            <p className="mt-3.5 text-center text-[13px] font-bold text-slate-900">{level.label}</p>
            <p className="mt-1.5 text-center text-[12px] text-slate-500 leading-relaxed">{level.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
