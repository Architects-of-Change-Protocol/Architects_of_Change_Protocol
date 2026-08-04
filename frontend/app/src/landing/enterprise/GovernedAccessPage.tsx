import { ProtocolFooter } from '../components/ProtocolFooter';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EnterpriseNav } from './Nav';
import { Hero } from './governed-access/Hero';
import { Problem } from './governed-access/Problem';
import { Lifecycle } from './governed-access/Lifecycle';
import { ProviderNeutral } from './governed-access/ProviderNeutral';
import { Architecture } from './governed-access/Architecture';
import { OperationalLifecycle } from './governed-access/OperationalLifecycle';
import { Capabilities } from './governed-access/Capabilities';
import { WhoBenefits } from './governed-access/WhoBenefits';
import { Examples } from './governed-access/Examples';
import { Assessment } from './governed-access/Assessment';

// Governed Access is AOC Enterprise's first commercial Solution (see
// ./SolutionsAndServices.tsx / ../routes.ts). This is its dedicated product
// landing — W006 — built on the same W005 commercial design system as
// ../EnterprisePage.tsx (light-primary, dark hero/CTA bookends, indigo
// accent) so it reads as the same product family, but tells the narrower,
// sharper story of this one capability rather than AOC Enterprise as a
// whole. See docs/w006-governed-access-product-landing.md for the section
// map and design rationale.
export function GovernedAccessPage() {
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
            { label: 'Solutions' },
            { label: 'Governed Access' },
          ]}
        />
      </div>

      <Hero />
      <Problem />
      <Lifecycle />
      <ProviderNeutral />
      <Architecture />
      <OperationalLifecycle />
      <Capabilities />
      <WhoBenefits />
      <Examples />
      <Assessment />

      <ProtocolFooter accent="indigo" />
    </main>
  );
}
