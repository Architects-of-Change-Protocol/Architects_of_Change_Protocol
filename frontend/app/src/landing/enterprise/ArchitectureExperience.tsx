import { useState } from 'react';
import { ARCHITECTURE_PATTERNS } from './content';
import { ArchitectureBuilder } from './ArchitectureBuilder';
import { CapabilityComposer } from './CapabilityComposer';
import { FlowRail, SectionHeader } from './primitives';

/**
 * The homepage's interactive centerpiece: one shared selection drives both the
 * architecture picker (choose the center of gravity) and the capability
 * composer (see what powers that choice implies). This is also the reserved
 * future home of Architecture Compass — the layout and #composition anchor
 * are structured so that component can later replace or extend this panel
 * without reshaping the surrounding narrative.
 */
export function ArchitectureExperience() {
  const [selectedId, setSelectedId] = useState(ARCHITECTURE_PATTERNS[0].id);
  const selected = ARCHITECTURE_PATTERNS.find((pattern) => pattern.id === selectedId) ?? ARCHITECTURE_PATTERNS[0];

  return (
    <section id="composition" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-slate-200">
      <FlowRail current="Protocol Capabilities" />

      <SectionHeader
        eyebrow="Capability Composition"
        title="Soberanía Enterprise composes protocol capabilities into your architecture."
        description="Soberanía Protocol defines the capabilities — identity, authority, delegation, evidence, and more. Soberanía Enterprise is where an organization chooses what its architecture is sovereign around, and composes the capabilities that architecture actually needs."
      />

      <ArchitectureBuilder selected={selected} onSelect={setSelectedId} />
      <CapabilityComposer pattern={selected} />
    </section>
  );
}
