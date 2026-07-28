import { FlowRail, SectionHeader } from './primitives';

export function GovernanceEmerges() {
  return (
    <section id="governance" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
      <FlowRail current="Governance" />

      <SectionHeader
        eyebrow="Governance Emerges"
        title="Governance is the result of composition, not the starting point."
        description="Once an architecture is composed of the right capabilities, governance follows: policies, delegations, and approvals attach to the capabilities already in place. AOC Enterprise doesn't ask an organization to define governance before it knows its own architecture."
      />
    </section>
  );
}
