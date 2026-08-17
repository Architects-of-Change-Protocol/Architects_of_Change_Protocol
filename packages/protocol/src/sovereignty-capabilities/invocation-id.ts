import { randomUUID } from 'node:crypto';

/**
 * SovereigntyCapabilityInvocationId — the identity of one attempt to consume
 * one Sovereignty Capability.
 *
 * Format: `aoc:sovereignty-capability-invocation:<uuid>`, following the AOC
 * identifier grammar already established by `SovereignAssetId`
 * (`aoc:sovereign-asset:<uuid>`) and the canonical capability ids
 * (`aoc:sovereignty-capability:<slug>`). Like a `SovereignAssetId` and
 * unlike a capability id, it is minted rather than constant.
 *
 * Deliberately NOT derived from anything:
 *
 *   invocationId != capability id       (many invocations per capability)
 *   invocationId != subject id          (an invocation may have no subject)
 *   invocationId != correlationId       (one correlation spans many)
 *   invocationId != hash(input)         (identical input, distinct attempts)
 *   invocationId != timestamp           (two invocations can share a clock tick)
 *
 * Deriving it from any of those would silently collapse two genuinely
 * separate consumption events into one evidence record. The value is opaque
 * apart from its namespace prefix: nothing in Protocol parses the uuid.
 */
export type SovereigntyCapabilityInvocationId = string;

const INVOCATION_ID_PREFIX = 'aoc:sovereignty-capability-invocation:';

const UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/;

const INVOCATION_ID_PATTERN = new RegExp(
  `^${INVOCATION_ID_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${UUID_PATTERN.source}$`,
);

/**
 * Mints a fresh invocation identity. Uses the same `node:crypto`
 * `randomUUID()` source as `mintSovereignAssetId`, so the two AOC minted
 * identifier schemes share one entropy source and one uuid shape rather than
 * introducing a second (or an external dependency).
 *
 * Call once per invocation. Reusing an id across two invocations makes their
 * evidence records indistinguishable, which the evidence spine has no way to
 * detect or repair.
 */
export function mintSovereigntyCapabilityInvocationId(): SovereigntyCapabilityInvocationId {
  return `${INVOCATION_ID_PREFIX}${randomUUID()}`;
}

/**
 * Structural validation only. It does not confirm that the invocation
 * happened, was accepted, or was minted by this runtime.
 */
export function isValidSovereigntyCapabilityInvocationId(
  value: unknown,
): value is SovereigntyCapabilityInvocationId {
  return typeof value === 'string' && INVOCATION_ID_PATTERN.test(value);
}
