export type { SovereignSigningKey, SovereignKeyPair, SovereignProof } from './proof';
export { generateSovereignKeyPair, signSovereignPayload, verifySovereignSignature } from './proof';

export { SovereignAssetState, isValidSovereignAssetState } from './state';

export type { OriginClaim, AuthorityClaim, BuildOriginClaimInput, BuildAuthorityClaimInput } from './claims';
export { AuthorityClaimKind, buildOriginClaim, buildAuthorityClaim } from './claims';
export type { SignedClaim, SignedClaimVerificationResult, ContestClaimInput } from './claims';
export { signClaim, verifySignedClaim, contestClaim } from './claims';

export {
  SOVEREIGN_MANIFEST_SCHEMA_VERSION,
} from './manifest';
export type {
  SovereignManifestSchemaVersion,
  SovereignRegistrant,
  SovereignManifestV1,
  SignedSovereignManifest,
  BuildSovereignManifestV1Input,
  ManifestValidationResult,
} from './manifest';
export { validateSovereignManifestV1, buildSovereignManifestV1, computeManifestDigest, signSovereignManifest } from './manifest';

export type {
  CheckOutcome,
  BindingOutcome,
  SovereignManifestVerificationChecks,
  SovereignManifestVerificationResult,
  VerifySovereignManifestOptions,
} from './verify';
export { verifySovereignManifest } from './verify';

export type { SovereignAssetRegistry } from './registry';
export { resolveSovereignAsset } from './registry';
