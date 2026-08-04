import { ProtocolFooter } from './components/ProtocolFooter';
import { Breadcrumbs } from './components/Breadcrumbs';
import { EnterpriseNav } from './enterprise/Nav';
import { Hero } from './enterprise/Hero';
import { Problem } from './enterprise/Problem';
import { MissingLayer } from './enterprise/MissingLayer';
import { SolutionsAndServices } from './enterprise/SolutionsAndServices';
import { Pipeline } from './enterprise/Pipeline';
import { ArchitectureStack } from './enterprise/ArchitectureStack';
import { Outcomes } from './enterprise/Outcomes';
import { AssuranceSection } from './enterprise/AssuranceSection';
import { Benefits } from './enterprise/Benefits';
import { CustomerSegments } from './enterprise/CustomerSegments';
import { EngagementFlow } from './enterprise/EngagementFlow';
import { PlatformStatus } from './enterprise/PlatformStatus';
import { BusinessNeeds } from './enterprise/BusinessNeeds';
import { ArchitectureExperience } from './enterprise/ArchitectureExperience';
import { CtaSection } from './enterprise/CtaSection';

// AOC Enterprise is the interactive extension of the canonical SK005 pitch
// deck (maintained outside this repo as commercial collateral — see
// docs/w005-enterprise-pitch-deck-design-system.md for the full mapping).
// Section order below follows the deck's own 12-slide sequence exactly:
// Hero(1) -> Problem(2) -> MissingLayer(3) -> Pipeline(4) ->
// ArchitectureStack(5) -> Outcomes(6) -> Assurance(7) -> Benefits(8) ->
// CustomerSegments(9) -> EngagementFlow(10) -> PlatformStatus(11) -> Cta(12).
// SolutionsAndServices (One Pager pill content) and the BusinessNeeds /
// ArchitectureExperience composer are website-only depth beyond the deck's
// 12 slides — see the doc above for why each is placed where it is.
export const renderEnterprisePage = () => {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans">
      <EnterpriseNav />
      {/* Breadcrumbs uses light-on-dark text (shared across other still-dark
          Enterprise sub-pages) — wrapped here so it stays legible against
          the light body background introduced by the pitch-deck redesign. */}
      <div className="bg-[#0B1220]">
        <Breadcrumbs items={[{ label: 'Protocol', href: '/' }, { label: 'Enterprise' }]} />
      </div>
      <Hero />
      <Problem />
      <MissingLayer />
      <SolutionsAndServices />
      <Pipeline />
      <ArchitectureStack />
      <Outcomes />
      <AssuranceSection />
      <Benefits />
      <CustomerSegments />
      <EngagementFlow />
      <PlatformStatus />
      <BusinessNeeds />
      <ArchitectureExperience />
      <CtaSection />
      <ProtocolFooter accent="indigo" />
    </main>
  );
};
