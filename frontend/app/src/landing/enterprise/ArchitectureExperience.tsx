import { useState } from 'react';
import { ARCHITECTURE_PATTERNS } from './content';
import { ArchitectureBuilder } from './ArchitectureBuilder';
import { CapabilityComposer } from './CapabilityComposer';

/**
 * The conceptual heart of the homepage: one shared selection drives both the
 * architecture builder (choose the center of gravity) and the capability
 * composer (see what powers that choice implies) — a single continuous
 * interaction rather than two disconnected sections.
 */
export function ArchitectureExperience() {
  const [selectedId, setSelectedId] = useState(ARCHITECTURE_PATTERNS[0].id);
  const selected = ARCHITECTURE_PATTERNS.find((pattern) => pattern.id === selectedId) ?? ARCHITECTURE_PATTERNS[0];

  return (
    <section id="architecture" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
      <ArchitectureBuilder selected={selected} onSelect={setSelectedId} />
      <CapabilityComposer pattern={selected} />
    </section>
  );
}
