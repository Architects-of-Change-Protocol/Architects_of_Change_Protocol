import { ARCHITECTURE_PATTERNS } from './content';
import { FlowRail, SectionHeader } from './primitives';

// Not part of the SK005 deck's narrative — the deck tells a narrower,
// concrete "governed access to documents" story, while this composer
// answers a broader question (which architecture pattern is your
// organization sovereign around at all). Kept as a deliberately secondary
// "go deeper" section after the deck-driven narrative rather than deleted,
// per the standing "don't throw away current Enterprise work" rule.
export function BusinessNeeds() {
  return (
    <section id="business-needs" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-slate-200">
      <FlowRail current="Business Needs" />

      <SectionHeader
        eyebrow="Go Deeper — Compose Your Own Architecture"
        title="No two organizations are sovereign around the same thing."
        description="A hospital, a data platform, and an agent fleet don't share an architecture — they share a protocol. What each one needs from it is different: which capabilities matter, and in what order."
      />

      <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-slate-200 pt-6">
        {ARCHITECTURE_PATTERNS.map((pattern) => (
          <span key={pattern.id} className="text-sm text-slate-500 font-mono">
            {pattern.name}
          </span>
        ))}
      </div>
    </section>
  );
}
