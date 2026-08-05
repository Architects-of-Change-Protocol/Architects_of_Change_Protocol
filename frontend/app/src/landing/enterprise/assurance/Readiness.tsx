import { Card, SectionHeader } from '../primitives';
import { NOT_THIS } from './content';

// Answers exactly one question — "how do I know if my architecture is
// actually Enterprise-ready?" — and draws the boundary the brief requires:
// distinct from compliance certification, security auditing, and legal
// opinion. See docs/audits/w007a-assurance-commercial-audit.md, "Technical
// Accuracy" section.
export function Readiness() {
  return (
    <section id="readiness" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Technical Assessment"
        title="Enterprise-ready is a claim. Assurance is the evidence."
        description="Assurance is AOC's own technical assessment against the control catalog Enterprise operationalizes — not a third-party certification, and not a substitute for one."
      />

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
