import { ProtocolFooter } from '../components/ProtocolFooter';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EnterpriseNav } from './Nav';
import { Hero } from './assurance/Hero';
import { WhyAssurance } from './assurance/WhyAssurance';
import { CapabilityDomains } from './assurance/CapabilityDomains';
import { Methodology } from './assurance/Methodology';
import { CapabilityMaturity } from './assurance/CapabilityMaturity';
import { AssessmentOutputs } from './assurance/AssessmentOutputs';
import { IntelligenceRiskModule } from './assurance/IntelligenceRiskModule';
import { ContinuousAssurance } from './assurance/ContinuousAssurance';
import { Cta } from './assurance/Cta';

// AOC Assurance — the canonical assessment layer of the AOC ecosystem
// (W007; see docs/audits/w007-assurance-canonical-refactor.md, which
// supersedes W007A's framing of Intelligence Risk as a co-equal product).
//
// Canonical definition: Assurance is the capability that evaluates and
// continuously monitors every Sovereignty Capability defined by AOC
// Protocol and every Governance Capability operated by AOC Enterprise. It
// is not a compliance audit, a certification, an IAM product, or a
// consulting page, and it is not reducible to Intelligence Risk —
// Intelligence Risk (landing/IntelligenceRiskPage.tsx, preserved unchanged)
// is one specialized assessment module Assurance evaluates, not Assurance
// itself.
//
// Commercial journey: Protocol -> Enterprise -> Governed Access -> Assurance.
// Governed Access demonstrates one Enterprise capability; Assurance
// evaluates and continuously monitors them all — Protocol's sovereignty
// capabilities (Section 3 Domain A) and Enterprise's full governance
// capability catalog (Section 3 Domain B), both generated from the same
// canonical data sources the rest of the site uses
// (protocol/content.ts CAPABILITY_FAMILIES, enterprise/content.ts
// CAPABILITY_CATALOG) rather than a third, hand-maintained list.
//
// Built on the W005 commercial design system — light-primary body, dark
// hero/CTA bookends, indigo accent, shared enterprise/primitives.tsx
// (SectionHeader, Card, Chip, PipelineRail, StatRow, CapabilityCheckItem) —
// so it reads as the same product family as ../GovernedAccessPage.tsx.
export function renderAssurancePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans">
      <EnterpriseNav />
      {/* Breadcrumbs uses light-on-dark text — wrapped here so it stays
          legible against the dark hero directly beneath it. */}
      <div className="bg-[#0B1220]">
        <Breadcrumbs
          items={[
            { label: 'Protocol', href: '/' },
            { label: 'Enterprise', href: '/?view=enterprise' },
            { label: 'Services' },
            { label: 'Assurance' },
          ]}
        />
      </div>

      <Hero />
      <WhyAssurance />
      <CapabilityDomains />
      <Methodology />
      <CapabilityMaturity />
      <AssessmentOutputs />
      <IntelligenceRiskModule />
      <ContinuousAssurance />
      <Cta />

      <ProtocolFooter accent="indigo" />
    </main>
  );
}
