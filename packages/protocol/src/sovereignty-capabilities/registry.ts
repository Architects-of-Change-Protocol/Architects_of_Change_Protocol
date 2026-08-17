import { SOVEREIGNTY_CAPABILITIES } from './definitions';
import {
  isSovereigntyCapabilityId,
  isSovereigntyCapabilityKey,
  type SovereigntyCapabilityId,
  type SovereigntyCapabilityKey,
} from './ids';
import type { SovereigntyCapabilityDefinition } from './types';

/**
 * Canonical, read-only discovery surface for the Sovereignty Capabilities.
 *
 * This is a Protocol registry, not a plugin marketplace and not the runtime
 * `AdapterRegistry`: it borrows that registry's lessons (stable identity, an
 * explicit contract version, frozen registration records, deterministic
 * ordering of `list()`) but deliberately drops registration and removal. The
 * canonical inventory is fixed at Protocol authoring time, so a caller cannot
 * make `my-company.special-capability` a canonical AOC sovereignty mineral.
 *
 * SM-01 answers only "what capabilities exist, what are their identities and
 * versions, and how are they discovered" — never "how are they executed".
 * There is no invocation API here.
 */

const BY_ID: ReadonlyMap<SovereigntyCapabilityId, SovereigntyCapabilityDefinition> = new Map(
  SOVEREIGNTY_CAPABILITIES.map((capability) => [capability.id, capability] as const),
);

const BY_KEY: ReadonlyMap<SovereigntyCapabilityKey, SovereigntyCapabilityDefinition> = new Map(
  SOVEREIGNTY_CAPABILITIES.map((capability) => [capability.key, capability] as const),
);

/**
 * Every canonical Sovereignty Capability, always in canonical order. The
 * returned array is the frozen canonical list — callers cannot reorder,
 * extend, or truncate the Protocol's inventory through it.
 */
export function listSovereigntyCapabilities(): readonly SovereigntyCapabilityDefinition[] {
  return SOVEREIGNTY_CAPABILITIES;
}

/**
 * Resolves a canonical definition by its canonical id. Unknown ids resolve to
 * `undefined` — they are never coerced onto a neighbouring capability.
 */
export function getSovereigntyCapability(id: unknown): SovereigntyCapabilityDefinition | undefined {
  return isSovereigntyCapabilityId(id) ? BY_ID.get(id) : undefined;
}

/** Resolves a canonical definition by its stable programmatic key. */
export function getSovereigntyCapabilityByKey(key: unknown): SovereigntyCapabilityDefinition | undefined {
  return isSovereigntyCapabilityKey(key) ? BY_KEY.get(key) : undefined;
}
