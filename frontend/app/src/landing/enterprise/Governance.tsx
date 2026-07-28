import { GOVERNANCE_CONCEPTS } from './content';
import { SectionHeader } from './primitives';

export function Governance() {
  return (
    <section id="governance" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
      <SectionHeader
        eyebrow="Stage 4 · Governance"
        title="Capabilities define powers. Governance defines how they're exercised."
        description="Governance is a distinct layer from capability enablement. It expresses the rules, constraints, and decision paths that determine when a capability may actually be exercised."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {GOVERNANCE_CONCEPTS.map((concept) => (
          <article key={concept.name} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="font-semibold text-white">{concept.name}</h3>
            <p className="mt-2 text-sm text-white/55 leading-relaxed">{concept.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
