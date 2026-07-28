import { ARCHITECTURE_PATTERNS } from './content';
import { FlowRail, SectionHeader } from './primitives';

export function BusinessNeeds() {
  return (
    <section id="business-needs" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
      <FlowRail current="Business Needs" />

      <SectionHeader
        eyebrow="Why AOC Enterprise exists"
        title="No two organizations are sovereign around the same thing."
        description="A hospital, a data platform, and an agent fleet don't share an architecture — they share a protocol. What each one needs from it is different: which capabilities matter, and in what order."
      />

      <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-6">
        {ARCHITECTURE_PATTERNS.map((pattern) => (
          <span key={pattern.id} className="text-sm text-white/50 font-mono">
            {pattern.name}
          </span>
        ))}
      </div>
    </section>
  );
}
