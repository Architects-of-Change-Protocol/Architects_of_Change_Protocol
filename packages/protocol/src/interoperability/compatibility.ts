import type { StandingStatus } from '../claims/claim-enums';
import {
  compareInteroperabilitySemanticRequirements,
  interoperabilitySemanticRequirementKey,
  type InteroperabilitySemanticRequirement,
  type InteroperableClaimType,
  type SovereigntyInteroperabilityArtifactKind,
} from './features';
import {
  presentInteroperabilityArtifactKinds,
  type SovereigntyInteroperabilityDescriptorV1,
} from './descriptor';
import {
  SOVEREIGNTY_INTEROPERABILITY_REASON_CODES,
  type SovereigntyInteroperabilityReasonCode,
} from './reason-codes';
import type { SovereigntyInteroperabilityConsumerSupportV1 } from './support';

export const SOVEREIGNTY_INTEROPERABILITY_REPORT_SCHEMA_VERSION =
  'aoc-sovereignty-interoperability-report/1' as const;

export type SovereigntyInteroperabilityReportSchemaVersion =
  typeof SOVEREIGNTY_INTEROPERABILITY_REPORT_SCHEMA_VERSION;

/**
 * The three possible outcomes of a compatibility assessment.
 *
 * Enumerated and explainable, never scored. There is no "80% compatible", no
 * `0.74` match and no confidence value, because a consuming system cannot act
 * responsibly on a number: it needs to know *which* semantics it does not
 * understand, so that it can decide what to do about those specific ones.
 *
 * These are semantic-consumption results, not authorization outcomes. None of
 * them says allow, deny, approve, reject, grant or enforce. What an application
 * does with a `partially-compatible` representation is the application's
 * decision, made at the application or Enterprise layer.
 */
export const SOVEREIGNTY_INTEROPERABILITY_COMPATIBILITY_STATUSES = Object.freeze([
  'compatible',
  'partially-compatible',
  'incompatible',
] as const);

export type SovereigntyInteroperabilityCompatibilityStatus =
  (typeof SOVEREIGNTY_INTEROPERABILITY_COMPATIBILITY_STATUSES)[number];

/**
 * Whether each of the four *core* representation requirements is supported.
 *
 * Core means: without this, the consumer cannot read the representation as the
 * representation it is. The profile fixes which meanings apply, the media type
 * names the wire form, the bundle schema fixes the envelope, and the
 * canonicalization profile fixes how that envelope's bytes are produced. Miss
 * any of the four and the result is `incompatible` regardless of how many
 * individual features happened to line up — a consumer that can parse JSON but
 * does not declare `aoc-canonical-json/1` does not understand the canonical
 * wire semantics, and generic JSON support is never read as semantic support.
 */
export interface SovereigntyInteroperabilityCoreCompatibility {
  readonly profile: boolean;
  readonly mediaType: boolean;
  readonly representationSchema: boolean;
  readonly canonicalizationProfile: boolean;
}

/**
 * SovereigntyInteroperabilityCompatibilityReportV1 — what a receiving system
 * can and cannot understand about one described representation.
 *
 * ## What a partial result does *not* authorize
 *
 * `partially-compatible` means "the consumer reports incomplete semantic
 * understanding". It does **not** mean "drop the unsupported artifacts and
 * carry on". Protocol produces no reduced bundle, strips nothing, downgrades
 * nothing and projects nothing: the described bundle and the descriptor are
 * exactly as they were before the assessment. Whether to reject the
 * representation, keep the unsupported parts as opaque data, ask for a
 * translation, or proceed knowingly is the caller's decision, and silently
 * making it for them is how sovereign data gets lost in transit.
 *
 * ## Fields deliberately absent, and why
 *
 * - **`reportId` / `assessedAt`** — the same descriptor and the same support
 *   declaration must always produce the same report. Operational timing lives
 *   in the SM-03 invocation evidence.
 * - **`score` / `confidence` / `matchPercentage`** — see the status note above.
 * - **`trustScore` / `reputation` / `authorityLevel`** — a system can perfectly
 *   understand a claim it has every reason to distrust. Understandable is not
 *   trusted, and compatible is not true.
 * - **`decision` / `allowed` / `enforcement`** — a compatibility result is not
 *   a policy outcome.
 * - **`projectedBundle` / `supportedSubset`** — see the partial-result note.
 */
export interface SovereigntyInteroperabilityCompatibilityReportV1 {
  readonly schemaVersion: SovereigntyInteroperabilityReportSchemaVersion;
  readonly status: SovereigntyInteroperabilityCompatibilityStatus;
  readonly core: SovereigntyInteroperabilityCoreCompatibility;
  readonly unsupportedArtifactKinds: readonly SovereigntyInteroperabilityArtifactKind[];
  readonly unsupportedClaimTypes: readonly InteroperableClaimType[];
  readonly unsupportedStandingStatuses: readonly StandingStatus[];
  readonly unsupportedSemanticTerms: readonly InteroperabilitySemanticRequirement[];
  /**
   * Stable codes naming exactly which requirements were not met, sorted
   * lexicographically so `Set` iteration order can never define public output.
   * Empty for a fully compatible result.
   */
  readonly reasonCodes: readonly SovereigntyInteroperabilityReasonCode[];
}

const compareStrings = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

const missingFrom = <T extends string>(
  required: readonly T[],
  supported: readonly string[],
): readonly T[] => {
  const declared = new Set<string>(supported);
  return Object.freeze([...required].filter((entry) => !declared.has(entry)).sort(compareStrings));
};

/**
 * Assesses one described representation against one consumer's declared
 * support.
 *
 * Pure: no clock, no network, no filesystem, no registry, no persistence and no
 * side effect of any kind. Neither argument is mutated — nothing is sorted in
 * place, no field is added to either document, and no derived artifact is
 * emitted alongside the report.
 *
 * Feature gaps are computed whether or not core support holds. An `incompatible`
 * result therefore still tells the consumer which features it would also have
 * been missing, which is strictly more useful than a bare refusal when someone
 * is working out what to implement next.
 */
export function assessSovereigntyInteroperabilityCompatibility(
  descriptor: SovereigntyInteroperabilityDescriptorV1,
  consumerSupport: SovereigntyInteroperabilityConsumerSupportV1,
): SovereigntyInteroperabilityCompatibilityReportV1 {
  const codes = SOVEREIGNTY_INTEROPERABILITY_REASON_CODES;
  const reasonCodes = new Set<SovereigntyInteroperabilityReasonCode>();

  // --- core: can the consumer read this as the representation it is? -------
  const core: SovereigntyInteroperabilityCoreCompatibility = {
    profile:
      consumerSupport.profile.id === descriptor.profile.id
      // Exact version matching. No "closest version" is chosen and no unknown
      // future major is assumed compatible.
      && consumerSupport.profile.acceptedVersions.includes(descriptor.profile.version),
    mediaType: consumerSupport.mediaTypes.includes(descriptor.mediaType),
    representationSchema: consumerSupport.representationSchemaVersions.includes(
      descriptor.representation.schemaVersion,
    ),
    canonicalizationProfile: consumerSupport.canonicalizationProfiles.includes(
      descriptor.representation.canonicalizationProfile,
    ),
  };

  if (!core.profile) reasonCodes.add(codes.unsupportedProfile);
  if (!core.mediaType) reasonCodes.add(codes.unsupportedMediaType);
  if (!core.representationSchema) reasonCodes.add(codes.unsupportedRepresentationSchema);
  if (!core.canonicalizationProfile) reasonCodes.add(codes.unsupportedCanonicalizationProfile);

  // --- features: which present semantics does the consumer not understand? -
  const unsupportedArtifactKinds = missingFrom(
    presentInteroperabilityArtifactKinds(descriptor),
    consumerSupport.artifactKinds,
  );
  const unsupportedClaimTypes = missingFrom(descriptor.present.claimTypes, consumerSupport.claimTypes);
  const unsupportedStandingStatuses = missingFrom(
    descriptor.present.standingStatuses,
    consumerSupport.standingStatuses,
  );

  // Semantic concepts compare on `namespace` + `termRef`, never on the
  // occurrence id of the ref they were extracted from.
  const declaredTerms = new Set(
    consumerSupport.semanticTerms.map((entry) => interoperabilitySemanticRequirementKey(entry)),
  );
  const unsupportedSemanticTerms = Object.freeze(
    descriptor.present.semanticRequirements
      .filter((entry) => !declaredTerms.has(interoperabilitySemanticRequirementKey(entry)))
      .map((entry) => Object.freeze({ namespace: entry.namespace, termRef: entry.termRef }))
      .sort(compareInteroperabilitySemanticRequirements),
  );

  if (unsupportedArtifactKinds.length > 0) reasonCodes.add(codes.unsupportedArtifactKind);
  if (unsupportedClaimTypes.length > 0) reasonCodes.add(codes.unsupportedClaimType);
  if (unsupportedStandingStatuses.length > 0) reasonCodes.add(codes.unsupportedStandingStatus);
  if (unsupportedSemanticTerms.length > 0) reasonCodes.add(codes.unsupportedSemanticTerm);

  // A representation carrying no semantic refs imposes no semantic
  // requirements, and that dimension is satisfied. No requirement is invented
  // to have something to check.
  const coreSupported =
    core.profile && core.mediaType && core.representationSchema && core.canonicalizationProfile;
  const featureGaps =
    unsupportedArtifactKinds.length
    + unsupportedClaimTypes.length
    + unsupportedStandingStatuses.length
    + unsupportedSemanticTerms.length;

  const status: SovereigntyInteroperabilityCompatibilityStatus = !coreSupported
    ? 'incompatible'
    : featureGaps > 0
      ? 'partially-compatible'
      : 'compatible';

  return Object.freeze({
    schemaVersion: SOVEREIGNTY_INTEROPERABILITY_REPORT_SCHEMA_VERSION,
    status,
    core: Object.freeze({ ...core }),
    unsupportedArtifactKinds,
    unsupportedClaimTypes,
    unsupportedStandingStatuses,
    unsupportedSemanticTerms,
    reasonCodes: Object.freeze([...reasonCodes].sort(compareStrings)),
  });
}
