import { SectionHeader } from '../primitives';
import { CONTINUOUS_ASSURANCE_ITEMS, MATURITY_CLASSIFICATION_LABEL, type MaturityClassification } from './content';

const CLASSIFICATION_TONE: Record<MaturityClassification, string> = {
  available: 'text-emerald-600 border-emerald-400/40 bg-emerald-50',
  'current-service': 'text-indigo-600 border-indigo-400/40 bg-indigo-50',
  'reference-model': 'text-slate-500 border-slate-300 bg-slate-100',
  'in-development': 'text-amber-600 border-amber-400/40 bg-amber-50',
  'future-direction': 'text-slate-400 border-slate-200 bg-white',
};

// Section 8 — the evolution from point-in-time assessment toward continuous
// monitoring. Every item is explicitly classified so the page never implies
// runtime functionality that does not exist yet — see the brief's
// "Technical Accuracy" requirement.
export function ContinuousAssurance() {
  return (
    <section id="continuous-assurance" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Continuous Assurance"
        title="Beyond a point-in-time assessment"
        description="A Technical Assessment is a snapshot. Continuous Assurance is the direction — some of it available today, some of it still ahead. Each item below is labeled honestly."
      />

      <div className="grid sm:grid-cols-2 gap-4">
        {CONTINUOUS_ASSURANCE_ITEMS.map((item) => (
          <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <h4 className="text-[14.5px] font-extrabold text-slate-900">{item.title}</h4>
              <span
                className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide whitespace-nowrap ${CLASSIFICATION_TONE[item.classification]}`}
              >
                {MATURITY_CLASSIFICATION_LABEL[item.classification]}
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-slate-500">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
