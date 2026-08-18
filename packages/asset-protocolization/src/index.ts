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
 * APV-04 delivers the second: the **`ProtocolizationCase`** aggregate — one
 * tenant's attempt to satisfy one profile version for one subject. It records
 * what a case was given and where it is in its lifecycle; it verifies nothing,
 * decides no readiness, resolves no authority and states no legal conclusion.
 *
 * See `docs/asset-protocolization/APV_03_ASSET_PROFILE_FRAMEWORK.md` and
 * `docs/asset-protocolization/APV_04_PROTOCOLIZATION_CASE.md`.
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

// ---------------------------------------------------------------------------
// APV-04 — ProtocolizationCase
// ---------------------------------------------------------------------------

export {
  PROTOCOLIZATION_IDENTIFIER_MAX_LENGTH,
  isValidProtocolizationCaseId,
  isValidProtocolizationMaterialId,
  isValidProtocolizationProfileRef,
  isValidProtocolizationTenantId,
  protocolizationProfileRefsEqual,
} from './case/case-identifiers';
export type {
  ProtocolizationCaseId,
  ProtocolizationMaterialId,
  ProtocolizationProfileRef,
  ProtocolizationTenantId,
} from './case/case-identifiers';

export type { ProtocolizationClock } from './case/case-clock';

export { isValidProtocolizationCaseSubject } from './case/case-subject';
export type { ProtocolizationCaseSubject } from './case/case-subject';

export {
  ProtocolizationMaterialKind,
  isProtocolizationMaterialKind,
  isValidProtocolizationCaseMaterial,
  protocolizationMaterialPayloadKey,
} from './case/case-material';
export type {
  ProtocolizationAttestationMaterial,
  ProtocolizationCaseMaterial,
  ProtocolizationContentIdentityMaterial,
  ProtocolizationCredentialMaterial,
  ProtocolizationDeclarationMaterial,
  ProtocolizationEvidenceMaterial,
  ProtocolizationExternalReferenceMaterial,
  ProtocolizationRegistryEntryMaterial,
  ProtocolizationVerificationMaterial,
} from './case/case-material';

export {
  INITIAL_PROTOCOLIZATION_CASE_STATE,
  ProtocolizationCaseState,
  ProtocolizationRequirementConditionStatus,
  ProtocolizationRequirementMaterialStatus,
  acceptsProtocolizationMaterial,
  isAllowedProtocolizationCaseTransition,
  isProtocolizationCaseState,
} from './case/case-state';

export { PROTOCOLIZATION_CASE_SCHEMA_VERSION } from './case/protocolization-case';
export type { ProtocolizationCase, ProtocolizationCaseRequirementState } from './case/protocolization-case';

export {
  PROTOCOLIZATION_CASE_VALIDATION_CODES,
  isValidProtocolizationCase,
  validateProtocolizationCase,
} from './case/case-validation';
export type {
  ProtocolizationCaseValidationCode,
  ProtocolizationCaseValidationIssue,
  ProtocolizationCaseValidationOptions,
  ProtocolizationCaseValidationResult,
} from './case/case-validation';

export { PROTOCOLIZATION_CASE_EVENT_TYPES } from './case/case-events';
export type {
  ProtocolizationCaseActivatedEvent,
  ProtocolizationCaseCancelledEvent,
  ProtocolizationCaseCreatedEvent,
  ProtocolizationCaseEvent,
  ProtocolizationCaseEventType,
  ProtocolizationMaterialAddedEvent,
  ProtocolizationMaterialAssociatedEvent,
} from './case/case-events';

export {
  activateProtocolizationCase,
  addProtocolizationCaseMaterial,
  associateProtocolizationCaseMaterial,
  cancelProtocolizationCase,
  createProtocolizationCase,
  reconstituteProtocolizationCase,
} from './case/case-operations';
export type {
  AssociateProtocolizationMaterialInput,
  CancelProtocolizationCaseInput,
  CreateProtocolizationCaseInput,
  ProtocolizationCaseContext,
  ProtocolizationCaseMaterialInput,
  ProtocolizationCaseTransition,
} from './case/case-operations';

export {
  getProtocolizationCaseRequirementProgress,
  listProtocolizationCasePendingMaterialRequirements,
  listProtocolizationCaseRequirementProgress,
} from './case/case-progress';
export type {
  ProtocolizationCaseProgressFilter,
  ProtocolizationCaseRequirementProgress,
} from './case/case-progress';

export { createInMemoryProtocolizationCaseRepository } from './case/case-repository';
export type { ProtocolizationCaseRepository } from './case/case-repository';

export { PROTOCOLIZATION_CASE_ERROR_CODES, ProtocolizationCaseError } from './case/case-errors';
export type { ProtocolizationCaseErrorCode, ProtocolizationCaseErrorDetails } from './case/case-errors';
