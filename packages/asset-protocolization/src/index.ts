/**
 * `@aoc/asset-protocolization` — the Asset Protocolization Vertical.
 *
 * A vertical built **on** AOC Protocol. It is not AOC Protocol, it is not AOC
 * Enterprise, and it does not tokenize
 * (`docs/architecture/adr-asset-protocolization-vertical-boundary.md` §1).
 *
 * APV-03 delivers the first slice: the **asset profile framework** — how the
 * vertical states what a category of asset requires. Everything it describes is
 * a requirement *over* Protocol primitives; it defines no evidence, claim,
 * attestation, verification or identity type of its own, and nothing here
 * governs an action or executes one.
 *
 * See `docs/asset-protocolization/APV_03_ASSET_PROFILE_FRAMEWORK.md`.
 */

export {
  ASSET_IDENTIFIER_MAX_LENGTH,
  assetProfileVersionKey,
  compareAssetProfileVersions,
  isValidAssetCategoryId,
  isValidAssetProfileId,
  isValidAssetProfileVersion,
  isValidAssetRequirementConditionId,
  isValidAssetRequirementId,
  isValidAssetVerificationCheckId,
} from './identifiers';
export type {
  AssetCategoryId,
  AssetProfileId,
  AssetProfileVersion,
  AssetRequirementConditionId,
  AssetRequirementId,
  AssetVerificationCheckId,
} from './identifiers';

export { GLOBAL_JURISDICTION_CODE, isValidJurisdictionCode, isValidJurisdictionRef, jurisdictionRefsEqual } from './jurisdiction';
export type { JurisdictionRef } from './jurisdiction';

export { isValidAssetProfileMetadata } from './metadata';
export type { AssetProfileMetadata } from './metadata';

export { isValidAssetFreshnessConstraint, isValidUtcDateTime } from './freshness';
export type { AssetFreshnessConstraint } from './freshness';

export {
  isValidAssetAttesterConstraint,
  isValidAssetCredentialConstraint,
  isValidAssetRegistryConstraint,
} from './constraints';
export type {
  AssetAttesterConstraint,
  AssetCredentialConstraint,
  AssetRegistryConstraint,
} from './constraints';

export {
  AssetIdentityStrategy,
  AssetRequirementKind,
  AssetRequirementObligation,
  AssetRequirementSatisfaction,
} from './requirements';
export type {
  AssetAttestationRequirement,
  AssetDeclarationRequirement,
  AssetEvidenceRequirement,
  AssetIdentityRequirement,
  AssetRequirement,
  AssetRequirementCondition,
  AssetVerificationRequirement,
} from './requirements';

export { ASSET_PROFILE_SCHEMA_VERSION, AssetProfileScope } from './profile';
export type { AssetProfile } from './profile';

export {
  ASSET_PROFILE_VALIDATION_CODES,
  isAssetRequirementOfKind,
  isValidAssetProfile,
  validateAssetProfile,
} from './profile-validation';
export type {
  AssetProfileValidationCode,
  AssetProfileValidationIssue,
  AssetProfileValidationResult,
} from './profile-validation';

export {
  getAssetProfileRequirement,
  hasAssetProfileRequirement,
  listAssetProfileReadinessRequirements,
  listAssetProfileRequirements,
} from './profile-selectors';
export type { AssetRequirementFilter } from './profile-selectors';

export { createAssetProfileCatalog } from './profile-catalog';
export type { AssetProfileCatalog, AssetProfileCatalogFilter } from './profile-catalog';

export { ASSET_PROFILE_ERROR_CODES, AssetProfileError } from './errors';
export type { AssetProfileErrorCode, AssetProfileErrorDetails } from './errors';
