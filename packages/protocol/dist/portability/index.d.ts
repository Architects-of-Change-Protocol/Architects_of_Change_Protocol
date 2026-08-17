/**
 * `@aoc/protocol/portability` — the canonical sovereign portability bundle.
 *
 * The portable *data contract* lives here; the production AOC.PORTABILITY
 * capsule that executes export/import through the common SM-03 invocation and
 * evidence spine lives in `@aoc/protocol/sovereignty-capabilities`. This mirrors
 * the existing split between the identity/manifest/claim primitives and the
 * capsules that consume them, so the bundle stays usable on its own and no
 * contract is defined twice across two surfaces.
 *
 * Importing this module has no side effects: nothing is minted, no file is
 * read, no connection is opened, no handler is registered, no clock is read and
 * nothing is written.
 */
export { PORTABLE_SOVEREIGN_CLAIM_ARTIFACT_KINDS, PORTABLE_SOVEREIGN_MANIFEST_ARTIFACT_KINDS, SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION, SOVEREIGNTY_PORTABILITY_REASON_CODES, buildSovereigntyPortabilityBundleV1, isPortableSovereignClaimArtifact, isPortableSovereignManifestArtifact, isValidSovereigntyPortabilityBundleV1, portableClaimOf, portableManifestOf, tryBuildSovereigntyPortabilityBundleV1, validateSovereigntyPortabilityBundleV1, } from './bundle';
export type { BuildSovereigntyPortabilityBundleV1Input, PortableSignedSovereignClaimArtifact, PortableSignedSovereignManifestArtifact, PortableSovereignClaim, PortableSovereignClaimArtifact, PortableSovereignClaimArtifactKind, PortableSovereignManifestArtifact, PortableSovereignManifestArtifactKind, PortableUnsignedSovereignClaimArtifact, PortableUnsignedSovereignManifestArtifact, SovereigntyPortabilityBundleBuildResult, SovereigntyPortabilityBundleSchemaVersion, SovereigntyPortabilityBundleV1, SovereigntyPortabilityBundleValidationResult, SovereigntyPortabilityReasonCode, } from './bundle';
export { parseSovereigntyPortabilityBundle, serializeSovereigntyPortabilityBundle, } from './serialization';
export type { SovereigntyPortabilityBundleParseResult } from './serialization';
//# sourceMappingURL=index.d.ts.map