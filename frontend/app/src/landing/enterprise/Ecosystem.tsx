import { ECOSYSTEM_ITEMS } from './content';
import { ComingSoonTag, SectionHeader } from './primitives';

export function Ecosystem() {
  return (
    <section id="ecosystem" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
      <SectionHeader
        eyebrow="Beyond the platform"
        title="AOC Enterprise belongs to a larger ecosystem."
        description="AOC Enterprise operates architectures — but it does not define the primitives they're built from. That work happens in the open, in AOC Protocol, and connects back here."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ECOSYSTEM_ITEMS.map((item) => (
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
