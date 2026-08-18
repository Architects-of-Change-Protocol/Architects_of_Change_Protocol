import type { StandingStatus } from '../claims/claim-enums';
import {
  compareInteroperabilitySemanticRequirements,
  interoperabilitySemanticRequirementKey,
  isInteroperableClaimType,
  isInteroperableStandingStatus,
  isSovereigntyInteroperabilityArtifactKind,
  isValidInteroperabilitySemanticRequirement,
  type InteroperabilitySemanticRequirement,
  type InteroperableClaimType,
  type SovereigntyInteroperabilityArtifactKind,
} from './features';
import {
  SOVEREIGNTY_INTEROPERABILITY_REASON_CODES,
  type SovereigntyInteroperabilityReasonCode,
} from './reason-codes';

export const SOVEREIGNTY_INTEROPERABILITY_SUPPORT_SCHEMA_VERSION =
  'aoc-sovereignty-interoperability-support/1' as const;

export type SovereigntyInteroperabilitySupportSchemaVersion =
  typeof SOVEREIGNTY_INTEROPERABILITY_SUPPORT_SCHEMA_VERSION;

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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonBlankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value);
  return actual.length === keys.length && keys.every((key) => Object.prototype.hasOwnProperty.call(value, key));
}

const compareStrings = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

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
export function validateSovereigntyInteroperabilityConsumerSupportV1(
  value: unknown,
): SovereigntyInteroperabilityConsumerSupportValidationResult {
  const codes = SOVEREIGNTY_INTEROPERABILITY_REASON_CODES;
  const invalid = { valid: false, reasons: [codes.invalidConsumerSupport] } as const;

  if (!isPlainObject(value)) return invalid;
  if (
    !hasExactKeys(value, [
      'schemaVersion',
      'profile',
      'mediaTypes',
      'representationSchemaVersions',
      'canonicalizationProfiles',
      'artifactKinds',
      'claimTypes',
      'standingStatuses',
      'semanticTerms',
    ])
  ) {
    return invalid;
  }
  if (value.schemaVersion !== SOVEREIGNTY_INTEROPERABILITY_SUPPORT_SCHEMA_VERSION) return invalid;

  const profile = value.profile;
  if (!isPlainObject(profile) || !hasExactKeys(profile, ['id', 'acceptedVersions'])) return invalid;
  if (!isNonBlankString(profile.id)) return invalid;
  if (!Array.isArray(profile.acceptedVersions)) return invalid;
  const acceptedVersions = Array.from(profile.acceptedVersions);
  if (acceptedVersions.length === 0) return invalid;
  if (acceptedVersions.some((entry) => !isNonBlankString(entry))) return invalid;
  if (new Set(acceptedVersions).size !== acceptedVersions.length) return invalid;

  for (const key of ['mediaTypes', 'representationSchemaVersions', 'canonicalizationProfiles'] as const) {
    const entries = value[key];
    if (!Array.isArray(entries)) return invalid;
    const listed = Array.from(entries);
    if (listed.some((entry) => !isNonBlankString(entry))) return invalid;
    if (new Set(listed).size !== listed.length) return invalid;
  }

  for (const [key, isKnown] of [
    ['artifactKinds', isSovereigntyInteroperabilityArtifactKind],
    ['claimTypes', isInteroperableClaimType],
    ['standingStatuses', isInteroperableStandingStatus],
  ] as const) {
    const entries = value[key];
    if (!Array.isArray(entries)) return invalid;
    const listed = Array.from(entries);
    // An unknown entry is rejected rather than ignored: a declaration naming a
    // feature this profile version has no meaning for is a declaration whose
    // author and reader disagree about the vocabulary, and continuing would
    // mean assessing against a vocabulary neither of them holds.
    if (listed.some((entry) => !isKnown(entry))) return invalid;
    if (new Set(listed).size !== listed.length) return invalid;
  }

  const semanticTerms = value.semanticTerms;
  if (!Array.isArray(semanticTerms)) return invalid;
  const listedTerms = Array.from(semanticTerms);
  if (listedTerms.some((entry) => !isValidInteroperabilitySemanticRequirement(entry))) return invalid;
  const termKeys = listedTerms.map((entry) =>
    interoperabilitySemanticRequirementKey(entry as InteroperabilitySemanticRequirement),
  );
  if (new Set(termKeys).size !== termKeys.length) return invalid;

  return { valid: true, reasons: [] };
}

export function isValidSovereigntyInteroperabilityConsumerSupportV1(
  value: unknown,
): value is SovereigntyInteroperabilityConsumerSupportV1 {
  return validateSovereigntyInteroperabilityConsumerSupportV1(value).valid;
}

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
export function buildSovereigntyInteroperabilityConsumerSupportV1(
  input: BuildSovereigntyInteroperabilityConsumerSupportV1Input,
): SovereigntyInteroperabilityConsumerSupportV1 {
  const uniqueSorted = <T extends string>(values: readonly T[]): readonly T[] =>
    Object.freeze([...new Set(values)].sort(compareStrings));

  const semanticTerms = new Map<string, InteroperabilitySemanticRequirement>();
  for (const requirement of input.semanticTerms ?? []) {
    semanticTerms.set(interoperabilitySemanticRequirementKey(requirement), {
      namespace: requirement.namespace,
      termRef: requirement.termRef,
    });
  }

  const support: SovereigntyInteroperabilityConsumerSupportV1 = Object.freeze({
    schemaVersion: SOVEREIGNTY_INTEROPERABILITY_SUPPORT_SCHEMA_VERSION,
    profile: Object.freeze({
      id: input.profile.id,
      acceptedVersions: uniqueSorted(input.profile.acceptedVersions),
    }),
    mediaTypes: uniqueSorted(input.mediaTypes),
    representationSchemaVersions: uniqueSorted(input.representationSchemaVersions),
    canonicalizationProfiles: uniqueSorted(input.canonicalizationProfiles),
    artifactKinds: uniqueSorted(input.artifactKinds),
    claimTypes: uniqueSorted(input.claimTypes),
    standingStatuses: uniqueSorted(input.standingStatuses),
    semanticTerms: Object.freeze(
      [...semanticTerms.values()].sort(compareInteroperabilitySemanticRequirements),
    ),
  });

  const validation = validateSovereigntyInteroperabilityConsumerSupportV1(support);
  if (!validation.valid) {
    throw new Error(
      `Invalid SovereigntyInteroperabilityConsumerSupportV1: ${validation.reasons.join(', ')}`,
    );
  }
  return support;
}
