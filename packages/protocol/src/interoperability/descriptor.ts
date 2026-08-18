import type { StandingStatus } from '../claims/claim-enums';
import type { SovereignSubjectRef } from '../identity';
import type { CanonicalClaim } from '../claims/claim';
import {
  isValidSovereigntyPortabilityBundleV1,
  portableClaimOf,
  portableManifestOf,
  validateSovereigntyPortabilityBundleV1,
  type PortableSovereignClaimArtifactKind,
  type PortableSovereignManifestArtifactKind,
  type SovereigntyPortabilityBundleV1,
} from '../portability';
import {
  collectInteroperabilitySemanticRequirements,
  compareInteroperabilitySemanticRequirements,
  isInteroperableClaimType,
  isInteroperableStandingStatus,
  isSovereigntyInteroperabilityArtifactKind,
  isValidInteroperabilitySemanticRequirement,
  type InteroperabilitySemanticRequirement,
  type InteroperableClaimType,
  type SovereigntyInteroperabilityArtifactKind,
} from './features';
import {
  AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_REF,
  AOC_SOVEREIGNTY_PORTABILITY_MEDIA_TYPE,
  isValidSovereigntyInteroperabilityProfileRef,
  type AocSovereigntyPortabilityMediaType,
  type SovereigntyInteroperabilityProfileRef,
  type SovereigntyInteroperabilityRepresentationProfile,
} from './profile';
import {
  SOVEREIGNTY_INTEROPERABILITY_REASON_CODES,
  type SovereigntyInteroperabilityReasonCode,
} from './reason-codes';

export const SOVEREIGNTY_INTEROPERABILITY_DESCRIPTOR_SCHEMA_VERSION =
  'aoc-sovereignty-interoperability-descriptor/1' as const;

export type SovereigntyInteroperabilityDescriptorSchemaVersion =
  typeof SOVEREIGNTY_INTEROPERABILITY_DESCRIPTOR_SCHEMA_VERSION;

/**
 * What semantic features are actually present in one concrete representation.
 *
 * Every array reports *presence*, never possibility: an empty array means the
 * bundle genuinely contains none of that feature, and is never a placeholder
 * for "unknown" or an invitation to assume the profile's full range.
 */
export interface SovereigntyInteroperabilityPresentFeatures {
  readonly manifestArtifactKinds: readonly PortableSovereignManifestArtifactKind[];
  /**
   * The `manifestVersion` values actually carried, ascending.
   *
   * This is *historical manifest version* information about the subject — the
   * versions of the subject's record that travelled — and is not the manifest
   * schema version, the bundle schema version or the profile version. Those
   * three are single values elsewhere in this document; this is a list.
   */
  readonly manifestVersions: readonly number[];
  readonly claimArtifactKinds: readonly PortableSovereignClaimArtifactKind[];
  /**
   * The underlying claim semantics present, independent of wrapper kind. A
   * signed `Derivation` contributes `Derivation` here and `signed-claim` above;
   * conflating the two would make "I understand Derivation" and "I understand
   * signed wrappers" the same statement, which they are not.
   */
  readonly claimTypes: readonly InteroperableClaimType[];
  readonly standingStatuses: readonly StandingStatus[];
  readonly semanticRequirements: readonly InteroperabilitySemanticRequirement[];
}

/**
 * SovereigntyInteroperabilityDescriptorV1 — the machine-readable description of
 * one specific `SovereigntyPortabilityBundleV1`.
 *
 * ## What it is
 *
 * The answer to "what did I just receive?", produced from the bundle itself and
 * nothing else. It names the profile the representation speaks, the wire
 * schemas it uses, the subject it is about, and the exact set of semantic
 * features present in it.
 *
 * ## What it is not
 *
 * Not a copy of the bundle. Manifests, claims, standings, proofs, digests,
 * statements, evidence references and metadata are **not** duplicated here: the
 * descriptor reports which semantic shapes are present, and the bundle carries
 * the data. A descriptor that inlined the payload would be a second
 * representation of the same sovereign facts, free to drift from the first, and
 * would leak the payload into every place a description was safe to send.
 *
 * ## Fields deliberately absent, and why
 *
 * - **`descriptorId`** — a descriptor is a deterministic *description* of an
 *   existing representation, not a new sovereign object. It has no owner and no
 *   lifecycle, so an identity for it would be an id nobody can be responsible
 *   for. Describing the same bundle twice must produce the same value, and an
 *   id would make that impossible.
 * - **`describedAt`** — the same determinism requirement. *When* a description
 *   was produced is recorded truthfully in the SM-03 invocation evidence;
 *   *what* was described is this document, and it does not move.
 * - **`digest` / `signature`** — Integrity and Verifiability concerns, reached
 *   by explicit composition over this document's canonical serialization.
 * - **`trustScore` / `verifiedIssuer` / `signatureValid`** — a descriptor may
 *   report that a `signed-claim` is present; it never reports whether its proof
 *   holds. Understanding what an artifact claims to be and checking whether its
 *   proof is authentic are different minerals.
 * - **`owner` / `provider` / `sourceApplication` / `region`** — describing a
 *   representation says nothing about who holds it or where it has been.
 */
export interface SovereigntyInteroperabilityDescriptorV1 {
  readonly schemaVersion: SovereigntyInteroperabilityDescriptorSchemaVersion;
  /** Versioned reference to the profile whose meanings this description uses. */
  readonly profile: SovereigntyInteroperabilityProfileRef;
  readonly mediaType: AocSovereigntyPortabilityMediaType;
  /**
   * The subject the described representation is about — the canonical SM-02
   * reference carried by the bundle, passed through unchanged. Nothing is
   * minted, and no second subject model is introduced.
   */
  readonly subject: SovereignSubjectRef;
  readonly representation: SovereigntyInteroperabilityRepresentationProfile;
  readonly present: SovereigntyInteroperabilityPresentFeatures;
}

export interface SovereigntyInteroperabilityDescriptorValidationResult {
  readonly valid: boolean;
  readonly reasons: readonly SovereigntyInteroperabilityReasonCode[];
}

export type SovereigntyInteroperabilityDescriptorBuildResult =
  | { readonly valid: true; readonly descriptor: SovereigntyInteroperabilityDescriptorV1 }
  | { readonly valid: false; readonly reasons: readonly SovereigntyInteroperabilityReasonCode[] };

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

const sortedUnique = <T extends string>(values: readonly T[]): readonly T[] =>
  Object.freeze([...new Set(values)].sort(compareStrings));

/**
 * The semantic refs an embedded manifest assertion carries.
 *
 * A `SovereignManifestV1` may embed an `originClaim` and `authorityClaims`, and
 * those are ordinary `CanonicalClaim`s that can carry `semanticRefs`. Their
 * concepts have to be understood for the manifest to be understood, so they are
 * counted here.
 *
 * They are counted as *semantic requirements only*. They are never promoted
 * into `claimTypes` or `claimArtifactKinds`: an embedded assertion is part of
 * the manifest it belongs to, not a separately presented claim artifact, and
 * hoisting it would make the descriptor report claim artifacts the bundle does
 * not actually carry. Nothing is extracted from, moved out of, or written back
 * into the manifest — this is read-only inspection.
 */
const embeddedManifestClaimsOf = (manifest: {
  readonly originClaim?: CanonicalClaim;
  readonly authorityClaims?: readonly CanonicalClaim[];
}): readonly CanonicalClaim[] => {
  const embedded: CanonicalClaim[] = [];
  const { originClaim, authorityClaims } = manifest;
  if (originClaim !== undefined && originClaim !== null) embedded.push(originClaim);
  if (Array.isArray(authorityClaims)) {
    for (const claim of Array.from(authorityClaims)) {
      if (claim !== undefined && claim !== null) embedded.push(claim);
    }
  }
  return embedded;
};

/**
 * Describes one canonical portability bundle.
 *
 * ## What it does
 *
 * Validates the bundle with SM-06's own validator, inspects it without
 * mutation, extracts only semantic *presence* metadata, sorts everything
 * deterministically, and returns the descriptor.
 *
 * ## What it does not do
 *
 * It does not reimplement bundle validation — `@aoc/protocol/portability`'s
 * validator is the single source of what a valid bundle is, and a second copy
 * of those rules inside a describing layer would be a drift source. It does not
 * parse: a serialized bundle is turned into a bundle by the Portability parser,
 * outside this function, so there is no second JSON entry point into the
 * representation.
 *
 * Reusing the Portability *contract* this way is not hidden capability
 * execution: no `invokeSovereigntyCapability` call is made, the AOC.PORTABILITY
 * capsule is not constructed, and no evidence is produced here. Composing
 * minerals stays the caller's decision.
 *
 * The bundle is never mutated. Arrays are copied before sorting, nested
 * artifacts are only read, and the caller's `semanticRefs` are left exactly as
 * they are.
 */
export function tryBuildSovereigntyInteroperabilityDescriptorV1(
  bundle: SovereigntyPortabilityBundleV1,
): SovereigntyInteroperabilityDescriptorBuildResult {
  const codes = SOVEREIGNTY_INTEROPERABILITY_REASON_CODES;

  const validation = validateSovereigntyPortabilityBundleV1(bundle);
  if (!validation.valid) {
    return { valid: false, reasons: [codes.invalidBundle] };
  }

  const manifestArtifactKinds: PortableSovereignManifestArtifactKind[] = [];
  const manifestVersions: number[] = [];
  const claimArtifactKinds: PortableSovereignClaimArtifactKind[] = [];
  const claimTypes: InteroperableClaimType[] = [];
  const standingStatuses: StandingStatus[] = [];
  const requirements = new Map<string, InteroperabilitySemanticRequirement>();

  for (const artifact of bundle.manifests) {
    manifestArtifactKinds.push(artifact.kind);
    const manifest = portableManifestOf(artifact);
    manifestVersions.push(manifest.manifestVersion);
    for (const embedded of embeddedManifestClaimsOf(manifest)) {
      collectInteroperabilitySemanticRequirements(embedded.semanticRefs, requirements);
    }
  }

  for (const artifact of bundle.claims) {
    claimArtifactKinds.push(artifact.kind);
    // The *underlying* claim, whether or not it arrived inside a signed
    // wrapper. Reading the claim's declared semantic type is not inspecting,
    // trusting or checking the proof that may sit beside it.
    const claim = portableClaimOf(artifact);
    if (isInteroperableClaimType(claim.type)) claimTypes.push(claim.type);
    collectInteroperabilitySemanticRequirements(claim.semanticRefs, requirements);
  }

  for (const standing of bundle.standings) {
    // Reported verbatim. A `Contested` standing is reported as contested; it is
    // not reinterpreted, weighted, or resolved in favour of anybody.
    if (isInteroperableStandingStatus(standing.status)) standingStatuses.push(standing.status);
  }

  const descriptor: SovereigntyInteroperabilityDescriptorV1 = Object.freeze({
    schemaVersion: SOVEREIGNTY_INTEROPERABILITY_DESCRIPTOR_SCHEMA_VERSION,
    profile: AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_REF,
    mediaType: AOC_SOVEREIGNTY_PORTABILITY_MEDIA_TYPE,
    subject: bundle.subject,
    representation: Object.freeze({
      schemaVersion: bundle.schemaVersion,
      canonicalizationProfile: bundle.canonicalizationProfile,
    }),
    present: Object.freeze({
      manifestArtifactKinds: sortedUnique(manifestArtifactKinds),
      manifestVersions: Object.freeze([...new Set(manifestVersions)].sort((a, b) => a - b)),
      claimArtifactKinds: sortedUnique(claimArtifactKinds),
      claimTypes: sortedUnique(claimTypes),
      standingStatuses: sortedUnique(standingStatuses),
      semanticRequirements: Object.freeze(
        [...requirements.values()].sort(compareInteroperabilitySemanticRequirements),
      ),
    }),
  });

  return { valid: true, descriptor };
}

/**
 * Describes a bundle, throwing on an invalid one rather than describing it
 * partially — a construction helper, not a lenient parser, matching
 * `buildSovereigntyPortabilityBundleV1`.
 */
export function buildSovereigntyInteroperabilityDescriptorV1(
  bundle: SovereigntyPortabilityBundleV1,
): SovereigntyInteroperabilityDescriptorV1 {
  const result = tryBuildSovereigntyInteroperabilityDescriptorV1(bundle);
  if (!result.valid) {
    throw new Error(`Invalid SovereigntyPortabilityBundleV1: ${result.reasons.join(', ')}`);
  }
  return result.descriptor;
}

/**
 * Structural validation for a descriptor.
 *
 * A descriptor is produced deterministically here, but it is also exactly the
 * kind of document that crosses an external trust boundary: it is the thing a
 * receiving system is handed, may store, and may later feed back in to ask for
 * a compatibility assessment. Accepting `value as Descriptor` at that boundary
 * would let a malformed document become authoritative by assertion, which is
 * the same failure the SM-06 parser exists to prevent.
 */
export function validateSovereigntyInteroperabilityDescriptorV1(
  value: unknown,
): SovereigntyInteroperabilityDescriptorValidationResult {
  const codes = SOVEREIGNTY_INTEROPERABILITY_REASON_CODES;
  const invalid = { valid: false, reasons: [codes.invalidDescriptor] } as const;

  if (!isPlainObject(value)) return invalid;
  if (!hasExactKeys(value, ['schemaVersion', 'profile', 'mediaType', 'subject', 'representation', 'present'])) {
    return invalid;
  }
  // A future descriptor schema fails closed. A v1 reader pretending to
  // understand `.../2` is the silent semantic drift a versioned wire contract
  // exists to prevent.
  if (value.schemaVersion !== SOVEREIGNTY_INTEROPERABILITY_DESCRIPTOR_SCHEMA_VERSION) return invalid;
  if (!isValidSovereigntyInteroperabilityProfileRef(value.profile)) return invalid;
  if (!isNonBlankString(value.mediaType)) return invalid;

  // The subject is validated through SM-06's own bundle-subject rules by way of
  // a minimal, artifact-free bundle, so there is no second definition here of
  // what a canonical bundle subject is.
  if (
    !isValidSovereigntyPortabilityBundleV1({
      schemaVersion: (value.representation as Record<string, unknown> | undefined)?.schemaVersion,
      canonicalizationProfile: (value.representation as Record<string, unknown> | undefined)
        ?.canonicalizationProfile,
      subject: value.subject,
      manifests: [],
      claims: [],
      standings: [],
    })
  ) {
    return invalid;
  }

  const present = value.present;
  if (!isPlainObject(present)) return invalid;
  if (
    !hasExactKeys(present, [
      'manifestArtifactKinds',
      'manifestVersions',
      'claimArtifactKinds',
      'claimTypes',
      'standingStatuses',
      'semanticRequirements',
    ])
  ) {
    return invalid;
  }

  for (const [key, isKnown] of [
    ['manifestArtifactKinds', isSovereigntyInteroperabilityArtifactKind],
    ['claimArtifactKinds', isSovereigntyInteroperabilityArtifactKind],
    ['claimTypes', isInteroperableClaimType],
    ['standingStatuses', isInteroperableStandingStatus],
  ] as const) {
    const entries = present[key];
    if (!Array.isArray(entries)) return invalid;
    const listed = Array.from(entries);
    if (listed.some((entry) => !isKnown(entry))) return invalid;
    if (new Set(listed).size !== listed.length) return invalid;
  }

  const versions = present.manifestVersions;
  if (!Array.isArray(versions)) return invalid;
  const listedVersions = Array.from(versions);
  if (listedVersions.some((entry) => typeof entry !== 'number' || !Number.isInteger(entry))) return invalid;
  if (new Set(listedVersions).size !== listedVersions.length) return invalid;

  const semanticRequirements = present.semanticRequirements;
  if (!Array.isArray(semanticRequirements)) return invalid;
  const listedRequirements = Array.from(semanticRequirements);
  if (listedRequirements.some((entry) => !isValidInteroperabilitySemanticRequirement(entry))) return invalid;
  const requirementKeys = listedRequirements.map((entry) =>
    JSON.stringify([
      (entry as InteroperabilitySemanticRequirement).namespace,
      (entry as InteroperabilitySemanticRequirement).termRef,
    ]),
  );
  if (new Set(requirementKeys).size !== requirementKeys.length) return invalid;

  return { valid: true, reasons: [] };
}

export function isValidSovereigntyInteroperabilityDescriptorV1(
  value: unknown,
): value is SovereigntyInteroperabilityDescriptorV1 {
  return validateSovereigntyInteroperabilityDescriptorV1(value).valid;
}

/**
 * The complete set of artifact kinds a described representation presents.
 *
 * Derived rather than stored, so it cannot disagree with the three per-artifact
 * lists it is derived from. `standing` appears exactly when the representation
 * carries at least one standing record: a consumer that does not understand
 * standing records at all needs to be told that as an artifact-level gap, not
 * only as a list of statuses it did not recognise.
 */
export function presentInteroperabilityArtifactKinds(
  descriptor: SovereigntyInteroperabilityDescriptorV1,
): readonly SovereigntyInteroperabilityArtifactKind[] {
  const kinds: SovereigntyInteroperabilityArtifactKind[] = [
    ...descriptor.present.manifestArtifactKinds,
    ...descriptor.present.claimArtifactKinds,
  ];
  if (descriptor.present.standingStatuses.length > 0) kinds.push('standing');
  return sortedUnique(kinds);
}
