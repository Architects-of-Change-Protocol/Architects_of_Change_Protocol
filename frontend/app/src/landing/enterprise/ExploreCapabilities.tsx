import { EXPLORE_CAPABILITIES } from './content';
import { Eyebrow } from './primitives';
import { CapabilityCrystal } from '../../components/capability-crystal/CapabilityCrystal';

/** Pure navigation, deliberately without explanation — each capability owns its
 * own dedicated page for that. This section exists only to point visitors there. */
export function ExploreCapabilities() {
  return (
    <section id="capabilities" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
      <Eyebrow>Explore Capabilities</Eyebrow>
      <h2 className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight text-white">
        Every capability, on its own.
      </h2>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-white/10">
        {EXPLORE_CAPABILITIES.map((capability) => (
          <a
            key={capability.slug}
            href={`/?view=capability&slug=${capability.slug}`}
            className="group flex items-center border-b border-r border-white/10 px-5 py-6 transition-colors hover:bg-white/[0.02]"
          >
            <CapabilityCrystal capability={capability.slug} size={16} className="mr-2.5" />
            <span className="font-mono text-sm text-white/85 group-hover:text-cyan-200">{capability.name}</span>
            <span className="ml-2 text-white/25 group-hover:text-cyan-200/60">&rarr;</span>
          </a>
        ))}
      </div>
    </section>
  );
}
