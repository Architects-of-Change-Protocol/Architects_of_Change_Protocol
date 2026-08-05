import { CREATION_FLOW } from './content';
import { SectionHeader, StepFlow, Card } from '../enterprise/primitives';

export function AssetCreationFlow() {
  return (
    <section id="creation" className="scroll-mt-16 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow="How an AOC-Compatible Asset Is Created"
        title="A conceptual model, not a claim about a shipped SDK."
        description="This is the shape a compatible creation flow takes. Some steps already have canonical contracts in @aoc/protocol (identity, integrity, capability declaration); a complete, publicly available creation SDK does not exist yet — see the capability families above for what's defined today."
        mineral="amethyst"
      />

      <Card className="p-6 md:p-8">
        <p className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium tracking-wide font-mono text-slate-500">
          Protocol Direction — Conceptual Model
        </p>
        <StepFlow steps={CREATION_FLOW} mineral="amethyst" />
      </Card>
    </section>
  );
}
