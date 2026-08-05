import { ProtocolFooter } from '../components/ProtocolFooter';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EnterpriseNav } from './Nav';
import { Hero } from './assurance/Hero';
import { Readiness } from './assurance/Readiness';
import { EngagementPipeline } from './assurance/EngagementPipeline';
import { Deliverables } from './assurance/Deliverables';
import { EvidenceModel } from './assurance/EvidenceModel';
import { Cta } from './assurance/Cta';

// AOC Enterprise's Services offering — the SAF-based continuous
// governance-posture validation service that ../AssuranceSection.tsx
// (deck slide 7) has always promised on the Enterprise homepage, and that
// ../SolutionsAndServices.tsx already links to. Built on the same W005
// commercial design system as ../GovernedAccessPage.tsx (light-primary,
// dark hero/CTA bookends, indigo accent, shared primitives.tsx) so it reads
// as the same product family.
//
// This used to share the "Assurance" name and URL (/?view=assurance) with
// a different, older commercial offering (Institutional Intelligence Risk /
// Knowledge Loss / the Constitutional Index) that predates the W005
// redesign. That offering is preserved as-is under its own identity — AOC
// Intelligence Risk, landing/IntelligenceRiskPage.tsx, /?view=intelligence-risk
// — see docs/audits/w007a-assurance-commercial-audit.md for why they were
// split rather than merged or rewritten.
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
      <Readiness />
      <EngagementPipeline />
      <Deliverables />
      <EvidenceModel />
      <Cta />

      <ProtocolFooter accent="indigo" />
    </main>
  );
}
