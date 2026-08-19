/* eslint-disable react-refresh/only-export-components */
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
import { EngagementJourney } from './assurance/EngagementJourney';
import { Cta } from './assurance/Cta';
import { useAssurancePageMeta } from './assurance/useAssurancePageMeta';

// Soberanía Assurance is Soberanía Enterprise's first commercial Service (see
// ./SolutionsAndServices.tsx / ../routes.ts). This is its canonical
// landing — W007 — built on the same W005/W006 commercial design system as
// ./EnterprisePage.tsx and ./GovernedAccessPage.tsx (light-primary, dark
// hero/CTA bookends, indigo accent).
//
// Canonical definition: Soberanía Assurance evaluates, validates and
// continuously monitors every Sovereignty Capability defined by AOC
// Protocol and every Governance Capability operated by Soberanía Enterprise. It
// is the assessment and monitoring layer for the complete Soberanía ecosystem —
// not a peer platform, and not merely another Enterprise capability.
// Governed Access is one Enterprise Solution Assurance can evaluate;
// Intelligence Risk (./assurance/IntelligenceRiskModule.tsx) is one
// specialized Assurance module, not a peer of Assurance itself. The full
// Intelligence Risk experience — risk detail, assessment tiers, Stripe
// checkout, the Constitutional Index — lives at its own preserved route,
// /assurance/intelligence-risk (landing/IntelligenceRiskPage.tsx).
//
// See docs/w007-assurance-canonical-assessment-layer.md for the section
// map, capability-source mapping, and design rationale.
function AssurancePageContent() {
  useAssurancePageMeta();

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
      <EngagementJourney />
      <Cta />

      <ProtocolFooter accent="emerald" />
    </main>
  );
}

export const renderAssurancePage = () => <AssurancePageContent />;
