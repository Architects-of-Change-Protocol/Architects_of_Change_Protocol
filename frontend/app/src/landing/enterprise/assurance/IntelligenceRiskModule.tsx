import { Chip, SectionHeader } from '../primitives';
import { INTELLIGENCE_RISK_DOMAINS } from './content';

// Section 7 — Intelligence Risk, repositioned per W007 as ONE specialized
// assessment module within Assurance, not a co-equal product (that was
// W007A's incorrect framing — see
// docs/audits/w007-assurance-canonical-refactor.md). The full module — six
// risk cards, the Constitutional Index explorer, org benchmarking — is
// preserved unchanged at landing/IntelligenceRiskPage.tsx
// (?view=intelligence-risk); nothing there was removed or rewritten, only
// this page's relationship to it was corrected.
export function IntelligenceRiskModule() {
  return (
    <section id="intelligence-risk" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Specialized Assessment Module"
        title="Intelligence Risk: one domain Assurance evaluates"
        description="Institutional knowledge is a sovereignty capability too — whether it survives a resignation, a restructuring, or a platform migration. Intelligence Risk is the specialized module that measures it, benchmarked publicly through the Constitutional Index."
      />

      <div className="flex flex-wrap gap-3 mb-10">
        {INTELLIGENCE_RISK_DOMAINS.map((label) => (
          <Chip key={label}>{label}</Chip>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7 md:p-8 text-center">
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          The full Intelligence Risk assessment module — risk detail, the public Constitutional Index, and
          organization benchmarking — is its own dedicated experience.
        </p>
        <a
          href="/?view=intelligence-risk"
          className="mt-5 inline-flex items-center rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-900 transition-colors"
        >
          Explore the Intelligence Risk module &rarr;
        </a>
      </div>
    </section>
  );
}
