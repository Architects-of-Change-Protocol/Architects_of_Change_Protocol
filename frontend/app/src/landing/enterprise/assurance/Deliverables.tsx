import { Card, SectionHeader } from '../primitives';
import { DELIVERABLES } from './content';

export function Deliverables() {
  return (
    <section id="deliverables" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="What You Receive"
        title="Findings, recommendations, and a roadmap — not a checklist"
        description="Every deliverable is scoped to your architecture, not a generic template."
      />

      <div className="grid md:grid-cols-3 gap-6">
        {DELIVERABLES.map((item) => (
          <Card key={item.title} className="p-7">
            <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">{item.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
