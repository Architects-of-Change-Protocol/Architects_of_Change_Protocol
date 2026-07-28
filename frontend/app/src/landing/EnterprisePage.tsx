import { ProtocolFooter } from './components/ProtocolFooter';
import { EnterpriseNav } from './enterprise/Nav';
import { Hero } from './enterprise/Hero';
import { BusinessNeeds } from './enterprise/BusinessNeeds';
import { ArchitectureExperience } from './enterprise/ArchitectureExperience';
import { GovernanceEmerges } from './enterprise/GovernanceEmerges';
import { ExploreCapabilities } from './enterprise/ExploreCapabilities';

export const renderEnterprisePage = () => {
  return (
    <main className="min-h-screen bg-[#090b11] text-white font-sans">
      <EnterpriseNav />
      <Hero />
      <BusinessNeeds />
      <ArchitectureExperience />
      <GovernanceEmerges />
      <ExploreCapabilities />
      <ProtocolFooter />
    </main>
  );
};
