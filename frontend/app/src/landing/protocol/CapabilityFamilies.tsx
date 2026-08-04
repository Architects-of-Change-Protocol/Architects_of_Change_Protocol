import { CAPABILITY_FAMILIES } from './content';
import { SectionHeader, StatusPill } from './primitives';

export function CapabilityFamilies() {
  return (
    <section id="capabilities" className="scroll-mt-24 max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
      <SectionHeader
        eyebrow="What Can a Digital Asset Express?"
        title="Capabilities are what a digital asset can declare about itself."
        description="Each family below is a property an asset's manifest or canonical record can carry. Status labels show what's already defined as a canonical contract in @aoc/protocol versus what's still a protocol direction — not a claim that a full creation or runtime SDK ships today."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {CAPABILITY_FAMILIES.map((family) => (
          <article key={family.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-white">{family.name}</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/55">{family.summary}</p>
            <div className="mt-4">
              <StatusPill status={family.status} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
