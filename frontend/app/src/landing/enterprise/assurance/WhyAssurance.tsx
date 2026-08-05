import { Card, SectionHeader } from '../primitives';
import { NOT_THIS, UNANSWERED_QUESTIONS } from './content';

// Section 2. Establishes the problem Assurance exists to solve, then draws
// the boundary the brief requires: distinct from compliance certification,
// security auditing, and legal opinion. See
// docs/audits/w007-assurance-canonical-refactor.md, "Technical Accuracy".
export function WhyAssurance() {
  return (
    <section id="why-assurance" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Why Assurance Exists"
        title="Organizations implement architecture. Few continuously measure its quality."
        description="Most cannot answer basic questions about their own governance and sovereignty posture — until something breaks."
      />

      <div className="grid sm:grid-cols-2 gap-4 mb-14">
        {UNANSWERED_QUESTIONS.map((q) => (
          <div key={q} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-[15px] text-slate-700 leading-relaxed">{q}</p>
          </div>
        ))}
      </div>

      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 mb-5">What Assurance is not</p>
      <div className="grid sm:grid-cols-3 gap-5">
        {NOT_THIS.map((item) => (
          <Card key={item.title} className="p-6">
            <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
            <p className="mt-2.5 text-sm text-slate-500 leading-relaxed">{item.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
