import { ECONOMY_ITEMS } from './content';
import { ComingSoonTag, SectionHeader } from './primitives';

export function Economy() {
  return (
    <section id="economy" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
      <SectionHeader
        eyebrow="Stage 6 · Operations"
        title="Economic governance for capability consumption."
        description="As architectures move into production, consumption becomes a governed quantity of its own — metered, billed, and shared across the ecosystem that produced the capability."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ECONOMY_ITEMS.map((item) => (
          <article key={item.name} className="rounded-2xl border border-white/10 bg-white/[0.015] p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-white/80">{item.name}</h3>
              <ComingSoonTag />
            </div>
            <p className="mt-2 text-sm text-white/45 leading-relaxed">{item.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
