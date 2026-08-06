import { MotionConfig } from 'framer-motion';
import { SectionHeader } from '../enterprise/primitives';
import { CapabilityDock } from './capabilityDock/CapabilityDock';
import { CAPABILITY_DOCK_EYEBROW, CAPABILITY_DOCK_HEADLINE, CAPABILITY_DOCK_PARAGRAPH } from './content';

// The single fused "what can a digital asset express" narrative — replaces
// what used to be two separate sections (CapabilityFamilies.tsx's capability
// grid and Sovereignty.tsx's "keeps its meaning wherever it goes" pitch).
// One eyebrow, one headline, one paragraph, one dock: a digital asset
// declares capabilities about itself, and together they're what keeps it
// itself as it moves. See capabilityDock/ for the proximity/motion engine
// and dockTokens.ts for why each capability gets its own faceted mineral
// rather than a generic icon.
export function CapabilityDockSection() {
  return (
    <section id="capabilities" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-slate-200">
      <SectionHeader
        eyebrow={CAPABILITY_DOCK_EYEBROW}
        title={CAPABILITY_DOCK_HEADLINE}
        description={CAPABILITY_DOCK_PARAGRAPH}
        mineral="amethyst"
      />

      <p className="hidden sm:block mb-6 text-sm text-slate-400">
        Move the cursor across the row, or use the arrow keys, to open a capability.
      </p>
      <p className="sm:hidden mb-6 text-sm text-slate-400">Swipe or tap a capability to see what it means.</p>

      <MotionConfig reducedMotion="user">
        <CapabilityDock />
      </MotionConfig>
    </section>
  );
}
