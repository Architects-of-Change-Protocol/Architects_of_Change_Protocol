import { ProtocolFooter } from './components/ProtocolFooter';
import { Breadcrumbs } from './components/Breadcrumbs';
import { EnterpriseNav } from './enterprise/Nav';
import { Hero } from './enterprise/Hero';
import { GovernanceGap } from './enterprise/GovernanceGap';
import { BusinessNeeds } from './enterprise/BusinessNeeds';
import { ArchitectureExperience } from './enterprise/ArchitectureExperience';
import { GovernanceEmerges } from './enterprise/GovernanceEmerges';
import { ExploreCapabilities } from './enterprise/ExploreCapabilities';
import { SolutionsAndServices } from './enterprise/SolutionsAndServices';

export const renderEnterprisePage = () => {
  return (
    <main className="min-h-screen bg-[#090b11] text-white font-sans">
      <EnterpriseNav />
      <Breadcrumbs items={[{ label: 'Protocol', href: '/' }, { label: 'Enterprise' }]} />
      <Hero />
      <GovernanceGap />
      <BusinessNeeds />
      <ArchitectureExperience />
      <GovernanceEmerges />
      <ExploreCapabilities />
      <SolutionsAndServices />
      <ProtocolFooter />
    </main>
  );
};
