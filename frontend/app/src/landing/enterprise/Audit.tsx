import { AUDIT_RECORD_TYPES } from './content';
import { SectionHeader } from './primitives';

export function Audit() {
  return (
    <section id="audit" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
      <SectionHeader
        eyebrow="Stage 4 · Evidence"
        title="Operational history, kept separate from evaluation."
        description="Audit is the raw, immutable record of what happened. Assurance interprets that record to evaluate governance maturity — the two are deliberately distinct layers."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {AUDIT_RECORD_TYPES.map((record) => (
          <article key={record.name} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="font-semibold text-white">{record.name}</h3>
            <p className="mt-2 text-sm text-white/55 leading-relaxed">{record.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
