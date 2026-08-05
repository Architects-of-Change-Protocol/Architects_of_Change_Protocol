import { ProtocolFooter } from './components/ProtocolFooter';
import { ProtocolNav } from './protocol/Nav';
import { Hero } from './protocol/Hero';
import { FileToAsset } from './protocol/FileToAsset';
import { CapabilityFamilies } from './protocol/CapabilityFamilies';
import { Sovereignty } from './protocol/Sovereignty';
import { AssetCreationFlow } from './protocol/AssetCreationFlow';
import { PhotographExample } from './protocol/PhotographExample';
import { ProviderNeutral } from './protocol/ProviderNeutral';
import { ProtocolToEnterprise } from './protocol/ProtocolToEnterprise';
import { Developers } from './protocol/Developers';
import { CtaSection } from './protocol/CtaSection';
import { usePageMeta } from './protocol/usePageMeta';

// AOC Protocol, rebuilt onto the unified AOC Design Language: the same
// light-primary layout, typography, spacing, nav/footer shell and component
// library (Card, SectionHeader, IconCircle, Chip, StatusPill, StepFlow,
// PipelineRail — all from ../enterprise/primitives) that AOC Enterprise,
// Governed Access and Assurance already share, with two dark #0B1220
// bookends (Hero, closing CTA) — the same rhythm every other AOC surface
// follows. The one thing that's still Protocol's own is its Capability
// Mineral: Amethyst, applied only to accents (badges, icons, chips,
// highlights, section identifiers), never to the layout itself. See
// docs/w008-unified-aoc-design-language-capability-minerals.md.
export const AocLandingPage = () => {
  usePageMeta();

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans">
      <ProtocolNav />

      <Hero />
      <FileToAsset />
      <CapabilityFamilies />
      <Sovereignty />
      <AssetCreationFlow />
      <PhotographExample />
      <ProviderNeutral />
      <ProtocolToEnterprise />
      <Developers />
      <CtaSection />

      <ProtocolFooter accent="amethyst" />
    </main>
  );
};
