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
export declare function mintSovereigntyCapabilityInvocationId(): SovereigntyCapabilityInvocationId;
/**
 * Structural validation only. It does not confirm that the invocation
 * happened, was accepted, or was minted by this runtime.
 */
export declare function isValidSovereigntyCapabilityInvocationId(value: unknown): value is SovereigntyCapabilityInvocationId;
//# sourceMappingURL=invocation-id.d.ts.map