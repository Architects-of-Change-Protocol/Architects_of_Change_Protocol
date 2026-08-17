import type { SovereigntyCapabilityId, SovereigntyCapabilityKey, SovereigntyCapabilityNamespace } from './ids';
import type { SovereigntyCapabilityVersion } from './version';
/**
 * The canonical Protocol definition of one Sovereignty Capability.
 *
 * Deliberately small and truthful. SM-01 establishes identity, version and
 * discovery only, so there are no input/output/evidence contract references
 * here: those contracts do not exist yet, and a placeholder would assert an
 * implementation that has not been built. Presentation concerns (colour, icon,
 * crystal geometry, marketing copy, tier, pricing, provider configuration)
 * are not Protocol metadata and never belong in this structure.
 */
export interface SovereigntyCapabilityDefinition {
    /** Canonical, stable, serializable Protocol identity. */
    readonly id: SovereigntyCapabilityId;
    /** Stable programmatic key — the machine name used in code and lookups. */
    readonly key: SovereigntyCapabilityKey;
    /** Namespace segment shared by every canonical Sovereignty Capability. */
    readonly namespace: SovereigntyCapabilityNamespace;
    /** Version of this capability's semantic contract. */
    readonly version: SovereigntyCapabilityVersion;
    /** Canonical human-readable name. Not display copy — the Protocol's own name. */
    readonly name: string;
    /** Canonical statement of the capability's sovereignty responsibility. */
    readonly description: string;
}
//# sourceMappingURL=types.d.ts.map