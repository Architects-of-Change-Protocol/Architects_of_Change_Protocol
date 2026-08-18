import type { StandingStatus } from '../claims/claim-enums';
import { type InteroperabilitySemanticRequirement, type InteroperableClaimType, type SovereigntyInteroperabilityArtifactKind } from './features';
import { type SovereigntyInteroperabilityReasonCode } from './reason-codes';
export declare const SOVEREIGNTY_INTEROPERABILITY_SUPPORT_SCHEMA_VERSION: "aoc-sovereignty-interoperability-support/1";
export type SovereigntyInteroperabilitySupportSchemaVersion = typeof SOVEREIGNTY_INTEROPERABILITY_SUPPORT_SCHEMA_VERSION;
/**
 * Which interoperability profile the consumer speaks, and at which versions.
 *
 * `acceptedVersions` is an explicit list, matched exactly. A consumer that
 * accepts `1.0.0` is not assumed to accept `2.0.0`, and one that accepts
 * `2.0.0` is not assumed to accept `1.0.0`: guessing in either direction would
 * be Protocol deciding on a consumer's behalf that two sets of meanings are
 * interchangeable, which is precisely the judgement the consumer is here to
 * make. Exact matching is sufficient for v1 and adds no dependency; when the
 * profile grows a second same-major version, this list is where that widening
 * is declared, additively.
 */
export interface SovereigntyInteroperabilityProfileSupport {
    readonly id: string;
    readonly acceptedVersions: readonly string[];
}
/**
 * SovereigntyInteroperabilityConsumerSupportV1 — what a receiving system
 * declares it understands.
 *
 * ## Explicit declaration, never inference
 *
 * This document is supplied by the consumer. AOC never infers it from a
 * user-agent string, a package name, an installed dependency, a runtime
 * version, a browser, a request header or a provider, because every one of
 * those would be Protocol guessing at semantic understanding from an
 * operational signal. "This system has `@aoc/protocol` installed" is not the
 * same fact as "this system understands Derivation assertions".
 *
 * Nor is it fetched. There is no well-known URL, no DID document lookup, no
 * service discovery, no registry and no DNS in SM-07: support is caller input.
 * A convenience layer that retrieves a declaration over the network can be
 * built later, on top, without changing what the declaration means.
 *
 * ## No consumer identity
 *
 * There is deliberately no `consumerId`, `application`, `tenant`, `company` or
 * `user`. Compatibility is a relation between what a representation requires
 * and what a consumer declares — *who* is asking changes nothing about the
 * answer, and a field for it would invite exactly the identity-conditional
 * behaviour Protocol must not have.
 */
export interface SovereigntyInteroperabilityConsumerSupportV1 {
    readonly schemaVersion: SovereigntyInteroperabilitySupportSchemaVersion;
    readonly profile: SovereigntyInteroperabilityProfileSupport;
    readonly mediaTypes: readonly string[];
    readonly representationSchemaVersions: readonly string[];
    readonly canonicalizationProfiles: readonly string[];
    readonly artifactKinds: readonly SovereigntyInteroperabilityArtifactKind[];
    readonly claimTypes: readonly InteroperableClaimType[];
    readonly standingStatuses: readonly StandingStatus[];
    /**
     * Semantic concepts the consumer declares it understands, as
     * `namespace` + `termRef`. A consumer may list concepts from the canonical
     * AOC vocabulary, from its own namespace, or from anywhere else; declaring an
     * external concept here does not modify the canonical AOC profile, which is
     * immutable.
     */
    readonly semanticTerms: readonly InteroperabilitySemanticRequirement[];
}
export interface SovereigntyInteroperabilityConsumerSupportValidationResult {
    readonly valid: boolean;
    readonly reasons: readonly SovereigntyInteroperabilityReasonCode[];
}
export interface BuildSovereigntyInteroperabilityConsumerSupportV1Input {
    readonly profile: SovereigntyInteroperabilityProfileSupport;
    readonly mediaTypes: readonly string[];
    readonly representationSchemaVersions: readonly string[];
    readonly canonicalizationProfiles: readonly string[];
    readonly artifactKinds: readonly SovereigntyInteroperabilityArtifactKind[];
    readonly claimTypes: readonly InteroperableClaimType[];
    readonly standingStatuses: readonly StandingStatus[];
    readonly semanticTerms?: readonly InteroperabilitySemanticRequirement[];
}
/**
 * Validates a consumer support declaration.
 *
 * ## Fails closed, and never cleans
 *
 * A support declaration is a machine-readable contract about understanding, and
 * a malformed one is not quietly repaired. Nothing here trims a blank entry,
 * drops an unrecognised artifact kind, coerces a value or deduplicates a
 * repeated one. Silently cleaning a dirty declaration would mean assessing
 * compatibility against a document the consumer never actually wrote, and
 * reporting the result as if it had.
 *
 * ## Duplicates are rejected, deliberately
 *
 * A list that says `['claim', 'claim']` is ambiguous input, not emphasis: it
 * usually means two sources of truth were concatenated, and the reader has no
 * way to know whether the duplication is harmless or evidence that one of the
 * two lists was the wrong one. Rejecting it is the fail-closed reading and
 * matches the SM-06 bundle's treatment of duplicate manifest versions, claim
 * ids and standing ids. Callers wanting normalization can build the declaration
 * with `buildSovereigntyInteroperabilityConsumerSupportV1`, which sorts and
 * deduplicates *their own* input before it becomes a contract.
 *
 * Sparse arrays fall out of the same rules rather than needing a special case:
 * a hole reads as `undefined`, which is not a valid entry of any of these
 * lists, and `aoc-canonical-json/1` would refuse it in any case.
 */
export declare function validateSovereigntyInteroperabilityConsumerSupportV1(value: unknown): SovereigntyInteroperabilityConsumerSupportValidationResult;
export declare function isValidSovereigntyInteroperabilityConsumerSupportV1(value: unknown): value is SovereigntyInteroperabilityConsumerSupportV1;
/**
 * Assembles a consumer support declaration from a caller's own lists.
 *
 * Copies, sorts and deduplicates the caller's arrays before freezing them, so
 * a declaration assembled from several sources becomes a single canonical
 * document instead of failing validation for duplication. This is normalization
 * of a caller's *input*, at the moment the caller chooses to normalize it —
 * quite different from a validator silently cleaning a finished contract that
 * arrived from somewhere else. The caller's arrays are never mutated.
 */
export declare function buildSovereigntyInteroperabilityConsumerSupportV1(input: BuildSovereigntyInteroperabilityConsumerSupportV1Input): SovereigntyInteroperabilityConsumerSupportV1;
//# sourceMappingURL=support.d.ts.map