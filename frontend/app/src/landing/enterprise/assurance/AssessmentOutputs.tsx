import { SectionHeader, IconCircle } from '../primitives';
import { ASSESSMENT_OUTPUTS } from './content';

const CHECK_ICON =
  '<path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';

// Section 6 — what a customer receives from an assessment. The SAF
// reference below repeats the exact, already-approved claim from
// ../AssuranceSection.tsx ("Soberanía SAF v1.0.0 — implemented, API-backed,
// evidence-driven. Not a certification authority.") rather than inventing
// new domain/control counts — see docs/audits/SAF-002-Assessment-
// Methodology-v1.0.md for the underlying methodology.
export function AssessmentOutputs() {
  return (
    <section id="assessment-outputs" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="Assessment Outputs"
        title="What you receive"
        description="A Technical Assessment produces the following — not a certificate, a structured account of where your architecture stands."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ASSESSMENT_OUTPUTS.map((output) => (
          <div key={output} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <IconCircle size="sm" mineral="emerald">
              <svg viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: CHECK_ICON }} />
            </IconCircle>
            <p className="mt-2.5 text-[13.5px] font-semibold text-slate-900">{output}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-[13px] italic text-slate-500">
        Informed by the Soberanía Sovereignty Assurance Framework — Soberanía SAF v1.0.0 — implemented, API-backed,
        evidence-driven. Not a certification authority.
      </p>
    </section>
  );
}
