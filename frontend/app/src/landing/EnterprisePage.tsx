import { ProtocolFooter } from './components/ProtocolFooter';
import { EnterpriseNav } from './enterprise/Nav';
import { Hero } from './enterprise/Hero';
import { ArchitectureExperience } from './enterprise/ArchitectureExperience';
import { ProtocolVsEnterprise } from './enterprise/ProtocolVsEnterprise';
import { HierarchyStrip } from './enterprise/HierarchyStrip';
import { Governance } from './enterprise/Governance';
import { Assurance } from './enterprise/Assurance';
import { Audit } from './enterprise/Audit';
import { Economy } from './enterprise/Economy';
import { Ecosystem } from './enterprise/Ecosystem';

export const renderEnterprisePage = () => {
  return (
    <main className="min-h-screen bg-[#090b11] text-white font-sans">
      <EnterpriseNav />
      <Hero />
      <ArchitectureExperience />
      <ProtocolVsEnterprise />
      <HierarchyStrip />
      <Governance />
      <Assurance />
      <Audit />
      <Economy />
      <Ecosystem />

      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/10 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white max-w-2xl mx-auto">
          Design the architecture. Then govern it.
        </h2>
        <a
          href="mailto:hello@aocprotocol.xyz?subject=AOC%20Enterprise%20Governance%20Walkthrough"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-cyan-300 px-6 py-3 text-sm font-semibold text-black hover:bg-cyan-200 transition-colors"
        >
          Book a governance walkthrough
        </a>
      </section>

      <ProtocolFooter />
    </main>
  );
};
