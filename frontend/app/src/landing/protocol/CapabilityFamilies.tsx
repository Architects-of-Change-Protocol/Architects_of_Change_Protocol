import { CAPABILITY_FAMILIES } from './content';
import { SectionHeader, StatusPill, Card } from '../enterprise/primitives';

export function CapabilityFamilies() {
  return (
    <section id="capabilities" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="What Can a Digital Asset Express?"
        title="Capabilities are what a digital asset can declare about itself."
        description="Each family below is a property an asset's manifest or canonical record can carry. Status labels show what's already defined as a canonical contract in @aoc/protocol versus what's still a protocol direction — not a claim that a full creation or runtime SDK ships today."
        mineral="amethyst"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {CAPABILITY_FAMILIES.map((family) => (
          <Card key={family.id} className="p-6">
            <h3 className="text-base font-extrabold text-slate-900">{family.name}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">{family.summary}</p>
            <div className="mt-4">
              <StatusPill label={family.status} />
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
