import { SectionHeader, Chip } from '../primitives';
import { INTELLIGENCE_RISK_FOCUS_AREAS } from './content';

// Section 7 — Intelligence Risk positioned as one specialized module inside
// Assurance, not a peer or a top-level Enterprise offering. The full
// Intelligence Risk experience (risk detail, assessment tiers, Stripe
// checkout, the Constitutional Index benchmark explorer) lives at its own
// route and is deliberately NOT reproduced here — no pricing or checkout
// belongs on the canonical Assurance landing. See
// docs/w007-assurance-canonical-assessment-layer.md "Intelligence Risk
// Position".
export function IntelligenceRiskModule() {
  return (
    <section id="intelligence-risk" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Assurance Module &middot; Intelligence Risk"
        title="Sovereignty and governance also depend on institutional knowledge"
        description="An architecture can be technically sound and still be fragile if the knowledge required to operate, evolve, and govern it lives only in a handful of people. Intelligence Risk is the Assurance module that evaluates that dependency."
      />

      <div className="grid md:grid-cols-[1.1fr_1fr] gap-8 items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 mb-4">Module focus</p>
          <div className="flex flex-wrap gap-2">
            {INTELLIGENCE_RISK_FOCUS_AREAS.map((area) => (
              <Chip key={area}>{area}</Chip>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600 mb-2">Where it sits</p>
          <p className="text-[13.5px] leading-relaxed text-slate-600">
            AOC Enterprise
            <br />
            <span className="pl-4">&rarr; Assurance</span>
            <br />
            <span className="pl-8">&rarr; Intelligence Risk</span>
          </p>
          <a
            href="/assurance/intelligence-risk"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Explore the Intelligence Risk module
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </section>
  );
}
