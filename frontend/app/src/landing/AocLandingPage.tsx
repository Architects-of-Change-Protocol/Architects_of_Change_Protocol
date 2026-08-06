import { ProtocolFooter } from './components/ProtocolFooter';
import { ProtocolNav } from './protocol/Nav';
import { Hero } from './protocol/Hero';
import { FileToAsset } from './protocol/FileToAsset';
import { CapabilityDockSection } from './protocol/CapabilityDockSection';
import { AssetComposition } from './protocol/AssetComposition';
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
      {/* id="sovereignty" is a legacy deep-link target: the section used to be
          split into a Capabilities grid and a separate Sovereignty pitch,
          now fused into one Capability Dock (see CapabilityDockSection.tsx). */}
      <span id="sovereignty" aria-hidden="true" className="block h-0" />
      <CapabilityDockSection />
      <AssetComposition />
      <PhotographExample />
      <ProviderNeutral />
      <ProtocolToEnterprise />
      <Developers />
      <CtaSection />

      <ProtocolFooter accent="amethyst" />
    </main>
  );
};
