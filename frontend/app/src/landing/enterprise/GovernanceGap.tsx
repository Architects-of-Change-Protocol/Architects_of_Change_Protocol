import { ProblemCard } from '../components/ProblemCard';
import { DataPipelineAnimation } from '../components/DataPipelineAnimation';
import { ImplicitConsentAnimation } from '../components/ImplicitConsentAnimation';
import { InvisibleAccessAnimation } from '../components/InvisibleAccessAnimation';
import { BlindTrustAnimation } from '../components/BlindTrustAnimation';
import { FlowRail, SectionHeader } from './primitives';

// Migrated from AOC Protocol's former "Problem" section (W003 governance
// migration). The pain described here — digital assets handled without
// explicit, auditable authorization — is the governance gap AOC Enterprise
// exists to close, not a property of the open protocol itself.
export function GovernanceGap() {
  return (
    <section id="governance-gap" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
      <FlowRail current="Business Needs" />

      <SectionHeader
        eyebrow="The Governance Gap"
        title="The current model is broken."
        description="Digital assets move without explicit authorization: copied, stored, and resold. Consent is implied rather than granted. Access happens invisibly, and trust is a blind assumption instead of a verifiable one."
      />

      <div className="grid md:grid-cols-2 gap-6">
        <ProblemCard title={<>Your data is copied. Stored. Resold.</>}>
          <DataPipelineAnimation />
        </ProblemCard>

        <ProblemCard title={<>Consent is implied. Not explicit.</>}>
          <ImplicitConsentAnimation />
        </ProblemCard>

        <ProblemCard title={<>You never see who accessed what.</>}>
          <InvisibleAccessAnimation />
        </ProblemCard>

        <ProblemCard title={<>Trust is a blind assumption.</>}>
          <BlindTrustAnimation />
        </ProblemCard>
      </div>
    </section>
  );
}
