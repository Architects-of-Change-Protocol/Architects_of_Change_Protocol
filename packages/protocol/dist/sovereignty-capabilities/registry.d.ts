import type { SovereigntyCapabilityDefinition } from './types';
/**
 * Every canonical Sovereignty Capability, always in canonical order. The
 * returned array is the frozen canonical list — callers cannot reorder,
 * extend, or truncate the Protocol's inventory through it.
 */
export declare function listSovereigntyCapabilities(): readonly SovereigntyCapabilityDefinition[];
/**
 * Resolves a canonical definition by its canonical id. Unknown ids resolve to
 * `undefined` — they are never coerced onto a neighbouring capability.
 */
export declare function getSovereigntyCapability(id: unknown): SovereigntyCapabilityDefinition | undefined;
/** Resolves a canonical definition by its stable programmatic key. */
export declare function getSovereigntyCapabilityByKey(key: unknown): SovereigntyCapabilityDefinition | undefined;
//# sourceMappingURL=registry.d.ts.map