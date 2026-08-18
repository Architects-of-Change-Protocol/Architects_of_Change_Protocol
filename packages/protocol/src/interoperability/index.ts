/**
 * `@aoc/protocol/interoperability` — the canonical AOC representation profile,
 * the descriptor that describes one representation, the consumer support
 * declaration, and the compatibility assessment between them.
 *
 * SM-06 answered "can the sovereign representation move?". This subpath answers
 * the next question: when it arrives somewhere else, can the receiving system
 * work out what it is, which of its semantics that system understands, which it
 * does not, and whether it can safely consume it?
 *
 * The interoperability *data contracts* live here; the production
 * AOC.INTEROPERABILITY capsule that runs `describe-bundle` and
 * `assess-compatibility` through the common SM-03 invocation and evidence spine
 * lives in `@aoc/protocol/sovereignty-capabilities`. This mirrors the existing
 * split between `@aoc/protocol/portability` and its capsule, so the profile,
 * descriptor and evaluator stay usable on their own and no contract is defined
 * twice across two surfaces.
 *
 * Importing this module has no side effects: nothing is minted, no clock is
 * read, no file is opened, no connection is made, no profile is registered and
 * nothing is written. The canonical profile and vocabulary are frozen constants
 * evaluated once, from other constants.
 */
export {
  AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_ID,
  AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_REF,
  AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_V1,
  AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_VERSION,
  AOC_SOVEREIGNTY_PORTABILITY_MEDIA_TYPE,
  SOVEREIGNTY_INTEROPERABILITY_PROFILE_SCHEMA_VERSION,
  isValidSovereigntyInteroperabilityProfileRef,
  isValidSovereigntyInteroperabilityProfileV1,
} from './profile';
export type {
  AocSovereigntyInteroperabilityProfileId,
  AocSovereigntyPortabilityMediaType,
  SovereigntyInteroperabilityProfileRef,
  SovereigntyInteroperabilityProfileSchemaVersion,
  SovereigntyInteroperabilityProfileV1,
  SovereigntyInteroperabilityRepresentationProfile,
} from './profile';

export {
  AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY,
  AOC_SOVEREIGNTY_SEMANTIC_CATEGORIES,
  AOC_SOVEREIGNTY_SEMANTIC_CATEGORY_IDS,
  AOC_SOVEREIGNTY_SEMANTIC_NAMESPACE,
  AOC_SOVEREIGNTY_SEMANTIC_TERMS,
  AOC_SOVEREIGNTY_SEMANTIC_TERM_IDS,
  AOC_SOVEREIGNTY_SEMANTIC_VOCABULARY_ID,
  getAocSovereigntySemanticTerm,
} from './vocabulary';
export type { AocSovereigntySemanticTermId } from './vocabulary';

export {
  INTEROPERABLE_CLAIM_TYPES,
  INTEROPERABLE_STANDING_STATUSES,
  SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS,
  compareInteroperabilitySemanticRequirements,
  interoperabilitySemanticRequirementKey,
  isInteroperableClaimType,
  isInteroperableStandingStatus,
  isSovereigntyInteroperabilityArtifactKind,
  isValidInteroperabilitySemanticRequirement,
} from './features';
export type {
  InteroperabilitySemanticRequirement,
  InteroperableClaimType,
  SovereigntyInteroperabilityArtifactKind,
} from './features';

export {
  SOVEREIGNTY_INTEROPERABILITY_DESCRIPTOR_SCHEMA_VERSION,
  buildSovereigntyInteroperabilityDescriptorV1,
  isValidSovereigntyInteroperabilityDescriptorV1,
  presentInteroperabilityArtifactKinds,
  tryBuildSovereigntyInteroperabilityDescriptorV1,
  validateSovereigntyInteroperabilityDescriptorV1,
} from './descriptor';
export type {
  SovereigntyInteroperabilityDescriptorBuildResult,
  SovereigntyInteroperabilityDescriptorSchemaVersion,
  SovereigntyInteroperabilityDescriptorV1,
  SovereigntyInteroperabilityDescriptorValidationResult,
  SovereigntyInteroperabilityPresentFeatures,
} from './descriptor';

export {
  SOVEREIGNTY_INTEROPERABILITY_SUPPORT_SCHEMA_VERSION,
  buildSovereigntyInteroperabilityConsumerSupportV1,
  isValidSovereigntyInteroperabilityConsumerSupportV1,
  validateSovereigntyInteroperabilityConsumerSupportV1,
} from './support';
export type {
  BuildSovereigntyInteroperabilityConsumerSupportV1Input,
  SovereigntyInteroperabilityConsumerSupportV1,
  SovereigntyInteroperabilityConsumerSupportValidationResult,
  SovereigntyInteroperabilityProfileSupport,
  SovereigntyInteroperabilitySupportSchemaVersion,
} from './support';

export {
  SOVEREIGNTY_INTEROPERABILITY_COMPATIBILITY_STATUSES,
  SOVEREIGNTY_INTEROPERABILITY_REPORT_SCHEMA_VERSION,
  assessSovereigntyInteroperabilityCompatibility,
} from './compatibility';
export type {
  SovereigntyInteroperabilityCompatibilityReportV1,
  SovereigntyInteroperabilityCompatibilityStatus,
  SovereigntyInteroperabilityCoreCompatibility,
  SovereigntyInteroperabilityReportSchemaVersion,
} from './compatibility';

export { SOVEREIGNTY_INTEROPERABILITY_REASON_CODES } from './reason-codes';
export type { SovereigntyInteroperabilityReasonCode } from './reason-codes';
