import { SectionHeader, Chip } from '../primitives';
import { IMPLEMENTATION_ITEMS, PROOF_GAPS, WHY_QUESTIONS } from './content';

// Section 2 — the gap between implementation and proof. Deliberately
// question-driven rather than fear-based, per the brief: organizations can
// implement the pieces without knowing whether the whole is complete,
// correct, operational, evidenced, provider-neutral, or durable.
export function WhyAssurance() {
  return (
    <section id="why-assurance" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Why Assurance Exists"
        title="Implementation is not proof."
        description="Organizations build identity, policies, grants, revocation, provider integrations, and evidence systems. Building them is not the same as knowing they work."
      />

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 mb-4">What organizations implement</p>
          <div className="flex flex-wrap gap-2">
            {IMPLEMENTATION_ITEMS.map((item) => (
              <Chip key={item}>{item}</Chip>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600 mb-4">What implementation alone does not prove</p>
          <ul className="space-y-2.5">
            {PROOF_GAPS.map((gap) => (
              <li key={gap} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden />
                {gap}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 mb-5">The questions Assurance answers</p>
        <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
          {WHY_QUESTIONS.map((q) => (
            <li key={q} className="text-[15px] leading-relaxed text-slate-900 font-medium">
              {q}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
