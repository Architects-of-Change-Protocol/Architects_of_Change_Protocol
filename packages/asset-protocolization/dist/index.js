"use strict";
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
 * APV-05 delivers the third: the **evidence intake layer** — how a case is told
 * about evidence. It receives a submission, admits it *structurally*, correlates
 * it to requirements of the pinned profile, records an immutable receipt, and
 * associates it through APV-04's own evidence material pathway. It reuses
 * Protocol's `CanonicalEvidence`/`EvidenceType` and defines no evidence
 * substrate of its own. Evidence received is never evidence verified; evidence
 * associated is never a requirement satisfied; evidence complete is never a case
 * ready.
 *
 * APV-06 delivers the fourth: the **declaration / claim preparation layer** —
 * how a participant asserts something into a case. It records that a named
 * declarant asserted a proposition, carried by a Protocol `CanonicalClaim` the
 * caller names or supplies, correlated to declaration requirements of the
 * pinned profile, optionally pointing at evidence APV-05 already admitted. It
 * constructs no claim substrate of its own and prepares no `CanonicalClaim`.
 * A declaration recorded is never a declaration true; a claim named is never a
 * claim verified; evidence linked is never a claim proven; a declarant is never
 * an authority; and all declarations present is never a case ready.
 *
 * See `docs/asset-protocolization/APV_03_ASSET_PROFILE_FRAMEWORK.md`,
 * `docs/asset-protocolization/APV_04_PROTOCOLIZATION_CASE.md`,
 * `docs/asset-protocolization/APV_05_EVIDENCE_INTAKE.md` and
 * `docs/asset-protocolization/APV_06_DECLARATION_CLAIM_PREPARATION.md`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtocolizationRequirementConditionStatus = exports.ProtocolizationCaseState = exports.INITIAL_PROTOCOLIZATION_CASE_STATE = exports.protocolizationMaterialPayloadKey = exports.isValidProtocolizationCaseMaterial = exports.isProtocolizationMaterialKind = exports.ProtocolizationMaterialKind = exports.isValidProtocolizationCaseSubject = exports.protocolizationProfileRefsEqual = exports.isValidProtocolizationTenantId = exports.isValidProtocolizationProfileRef = exports.isValidProtocolizationMaterialId = exports.isValidProtocolizationCaseId = exports.PROTOCOLIZATION_IDENTIFIER_MAX_LENGTH = exports.AssetProfileError = exports.ASSET_PROFILE_ERROR_CODES = exports.createAssetProfileCatalog = exports.listAssetProfileRequirements = exports.listAssetProfileReadinessRequirements = exports.hasAssetProfileRequirement = exports.getAssetProfileRequirement = exports.validateAssetProfile = exports.isValidAssetProfile = exports.isAssetRequirementOfKind = exports.ASSET_PROFILE_VALIDATION_CODES = exports.AssetProfileScope = exports.ASSET_PROFILE_SCHEMA_VERSION = exports.AssetRequirementSatisfaction = exports.AssetRequirementObligation = exports.AssetRequirementKind = exports.AssetIdentityStrategy = exports.isValidAssetRegistryConstraint = exports.isValidAssetCredentialConstraint = exports.isValidAssetAttesterConstraint = exports.isValidUtcDateTime = exports.isValidAssetFreshnessConstraint = exports.isValidAssetProfileMetadata = exports.jurisdictionRefsEqual = exports.isValidJurisdictionRef = exports.isValidJurisdictionCode = exports.GLOBAL_JURISDICTION_CODE = exports.isValidAssetVerificationCheckId = exports.isValidAssetRequirementId = exports.isValidAssetRequirementConditionId = exports.isValidAssetProfileVersion = exports.isValidAssetProfileId = exports.isValidAssetCategoryId = exports.compareAssetProfileVersions = exports.assetProfileVersionKey = exports.ASSET_IDENTIFIER_MAX_LENGTH = void 0;
exports.createInMemoryDeclarationRepository = exports.reconstituteProtocolizationDeclarationRecord = exports.recordProtocolizationDeclaration = exports.PROTOCOLIZATION_DECLARATION_EVENT_TYPES = exports.validateProtocolizationDeclarationSubmission = exports.validateProtocolizationDeclarationRecord = exports.isValidProtocolizationDeclarationRecord = exports.isAdmissibleProtocolizationDeclarationSubmission = exports.DECLARATION_VALIDATION_CODES = exports.PROTOCOLIZATION_DECLARATION_RECORD_SCHEMA_VERSION = exports.isDeclarationPathway = exports.DeclarationPathway = exports.isValidDeclarationId = exports.EvidenceIntakeError = exports.EVIDENCE_INTAKE_ERROR_CODES = exports.createInMemoryEvidenceIntakeRepository = exports.reconstituteEvidenceIntakeReceipt = exports.intakeProtocolizationEvidence = exports.PROTOCOLIZATION_EVIDENCE_EVENT_TYPES = exports.validateProtocolizationEvidenceSubmission = exports.validateEvidenceIntakeReceipt = exports.isValidEvidenceIntakeReceipt = exports.isAdmissibleProtocolizationEvidenceSubmission = exports.EVIDENCE_INTAKE_VALIDATION_CODES = exports.EVIDENCE_INTAKE_RECEIPT_SCHEMA_VERSION = exports.isEvidenceIntakePathway = exports.EvidenceIntakePathway = exports.isValidEvidenceIntakeId = exports.isValidEvidenceIntakeCategoryId = exports.ProtocolizationCaseError = exports.PROTOCOLIZATION_CASE_ERROR_CODES = exports.createInMemoryProtocolizationCaseRepository = exports.listProtocolizationCaseRequirementProgress = exports.listProtocolizationCasePendingMaterialRequirements = exports.getProtocolizationCaseRequirementProgress = exports.reconstituteProtocolizationCase = exports.createProtocolizationCase = exports.cancelProtocolizationCase = exports.associateProtocolizationCaseMaterial = exports.addProtocolizationCaseMaterial = exports.activateProtocolizationCase = exports.PROTOCOLIZATION_CASE_EVENT_TYPES = exports.validateProtocolizationCase = exports.isValidProtocolizationCase = exports.PROTOCOLIZATION_CASE_VALIDATION_CODES = exports.PROTOCOLIZATION_CASE_SCHEMA_VERSION = exports.isProtocolizationCaseState = exports.isAllowedProtocolizationCaseTransition = exports.acceptsProtocolizationMaterial = exports.ProtocolizationRequirementMaterialStatus = void 0;
exports.DeclarationError = exports.DECLARATION_ERROR_CODES = void 0;
var identifiers_1 = require("./identifiers");
Object.defineProperty(exports, "ASSET_IDENTIFIER_MAX_LENGTH", { enumerable: true, get: function () { return identifiers_1.ASSET_IDENTIFIER_MAX_LENGTH; } });
Object.defineProperty(exports, "assetProfileVersionKey", { enumerable: true, get: function () { return identifiers_1.assetProfileVersionKey; } });
Object.defineProperty(exports, "compareAssetProfileVersions", { enumerable: true, get: function () { return identifiers_1.compareAssetProfileVersions; } });
Object.defineProperty(exports, "isValidAssetCategoryId", { enumerable: true, get: function () { return identifiers_1.isValidAssetCategoryId; } });
Object.defineProperty(exports, "isValidAssetProfileId", { enumerable: true, get: function () { return identifiers_1.isValidAssetProfileId; } });
Object.defineProperty(exports, "isValidAssetProfileVersion", { enumerable: true, get: function () { return identifiers_1.isValidAssetProfileVersion; } });
Object.defineProperty(exports, "isValidAssetRequirementConditionId", { enumerable: true, get: function () { return identifiers_1.isValidAssetRequirementConditionId; } });
Object.defineProperty(exports, "isValidAssetRequirementId", { enumerable: true, get: function () { return identifiers_1.isValidAssetRequirementId; } });
Object.defineProperty(exports, "isValidAssetVerificationCheckId", { enumerable: true, get: function () { return identifiers_1.isValidAssetVerificationCheckId; } });
var jurisdiction_1 = require("./jurisdiction");
Object.defineProperty(exports, "GLOBAL_JURISDICTION_CODE", { enumerable: true, get: function () { return jurisdiction_1.GLOBAL_JURISDICTION_CODE; } });
Object.defineProperty(exports, "isValidJurisdictionCode", { enumerable: true, get: function () { return jurisdiction_1.isValidJurisdictionCode; } });
Object.defineProperty(exports, "isValidJurisdictionRef", { enumerable: true, get: function () { return jurisdiction_1.isValidJurisdictionRef; } });
Object.defineProperty(exports, "jurisdictionRefsEqual", { enumerable: true, get: function () { return jurisdiction_1.jurisdictionRefsEqual; } });
var metadata_1 = require("./metadata");
Object.defineProperty(exports, "isValidAssetProfileMetadata", { enumerable: true, get: function () { return metadata_1.isValidAssetProfileMetadata; } });
var freshness_1 = require("./freshness");
Object.defineProperty(exports, "isValidAssetFreshnessConstraint", { enumerable: true, get: function () { return freshness_1.isValidAssetFreshnessConstraint; } });
Object.defineProperty(exports, "isValidUtcDateTime", { enumerable: true, get: function () { return freshness_1.isValidUtcDateTime; } });
var constraints_1 = require("./constraints");
Object.defineProperty(exports, "isValidAssetAttesterConstraint", { enumerable: true, get: function () { return constraints_1.isValidAssetAttesterConstraint; } });
Object.defineProperty(exports, "isValidAssetCredentialConstraint", { enumerable: true, get: function () { return constraints_1.isValidAssetCredentialConstraint; } });
Object.defineProperty(exports, "isValidAssetRegistryConstraint", { enumerable: true, get: function () { return constraints_1.isValidAssetRegistryConstraint; } });
var requirements_1 = require("./requirements");
Object.defineProperty(exports, "AssetIdentityStrategy", { enumerable: true, get: function () { return requirements_1.AssetIdentityStrategy; } });
Object.defineProperty(exports, "AssetRequirementKind", { enumerable: true, get: function () { return requirements_1.AssetRequirementKind; } });
Object.defineProperty(exports, "AssetRequirementObligation", { enumerable: true, get: function () { return requirements_1.AssetRequirementObligation; } });
Object.defineProperty(exports, "AssetRequirementSatisfaction", { enumerable: true, get: function () { return requirements_1.AssetRequirementSatisfaction; } });
var profile_1 = require("./profile");
Object.defineProperty(exports, "ASSET_PROFILE_SCHEMA_VERSION", { enumerable: true, get: function () { return profile_1.ASSET_PROFILE_SCHEMA_VERSION; } });
Object.defineProperty(exports, "AssetProfileScope", { enumerable: true, get: function () { return profile_1.AssetProfileScope; } });
var profile_validation_1 = require("./profile-validation");
Object.defineProperty(exports, "ASSET_PROFILE_VALIDATION_CODES", { enumerable: true, get: function () { return profile_validation_1.ASSET_PROFILE_VALIDATION_CODES; } });
Object.defineProperty(exports, "isAssetRequirementOfKind", { enumerable: true, get: function () { return profile_validation_1.isAssetRequirementOfKind; } });
Object.defineProperty(exports, "isValidAssetProfile", { enumerable: true, get: function () { return profile_validation_1.isValidAssetProfile; } });
Object.defineProperty(exports, "validateAssetProfile", { enumerable: true, get: function () { return profile_validation_1.validateAssetProfile; } });
var profile_selectors_1 = require("./profile-selectors");
Object.defineProperty(exports, "getAssetProfileRequirement", { enumerable: true, get: function () { return profile_selectors_1.getAssetProfileRequirement; } });
Object.defineProperty(exports, "hasAssetProfileRequirement", { enumerable: true, get: function () { return profile_selectors_1.hasAssetProfileRequirement; } });
Object.defineProperty(exports, "listAssetProfileReadinessRequirements", { enumerable: true, get: function () { return profile_selectors_1.listAssetProfileReadinessRequirements; } });
Object.defineProperty(exports, "listAssetProfileRequirements", { enumerable: true, get: function () { return profile_selectors_1.listAssetProfileRequirements; } });
var profile_catalog_1 = require("./profile-catalog");
Object.defineProperty(exports, "createAssetProfileCatalog", { enumerable: true, get: function () { return profile_catalog_1.createAssetProfileCatalog; } });
var errors_1 = require("./errors");
Object.defineProperty(exports, "ASSET_PROFILE_ERROR_CODES", { enumerable: true, get: function () { return errors_1.ASSET_PROFILE_ERROR_CODES; } });
Object.defineProperty(exports, "AssetProfileError", { enumerable: true, get: function () { return errors_1.AssetProfileError; } });
// ---------------------------------------------------------------------------
// APV-04 — ProtocolizationCase
// ---------------------------------------------------------------------------
var case_identifiers_1 = require("./case/case-identifiers");
Object.defineProperty(exports, "PROTOCOLIZATION_IDENTIFIER_MAX_LENGTH", { enumerable: true, get: function () { return case_identifiers_1.PROTOCOLIZATION_IDENTIFIER_MAX_LENGTH; } });
Object.defineProperty(exports, "isValidProtocolizationCaseId", { enumerable: true, get: function () { return case_identifiers_1.isValidProtocolizationCaseId; } });
Object.defineProperty(exports, "isValidProtocolizationMaterialId", { enumerable: true, get: function () { return case_identifiers_1.isValidProtocolizationMaterialId; } });
Object.defineProperty(exports, "isValidProtocolizationProfileRef", { enumerable: true, get: function () { return case_identifiers_1.isValidProtocolizationProfileRef; } });
Object.defineProperty(exports, "isValidProtocolizationTenantId", { enumerable: true, get: function () { return case_identifiers_1.isValidProtocolizationTenantId; } });
Object.defineProperty(exports, "protocolizationProfileRefsEqual", { enumerable: true, get: function () { return case_identifiers_1.protocolizationProfileRefsEqual; } });
var case_subject_1 = require("./case/case-subject");
Object.defineProperty(exports, "isValidProtocolizationCaseSubject", { enumerable: true, get: function () { return case_subject_1.isValidProtocolizationCaseSubject; } });
var case_material_1 = require("./case/case-material");
Object.defineProperty(exports, "ProtocolizationMaterialKind", { enumerable: true, get: function () { return case_material_1.ProtocolizationMaterialKind; } });
Object.defineProperty(exports, "isProtocolizationMaterialKind", { enumerable: true, get: function () { return case_material_1.isProtocolizationMaterialKind; } });
Object.defineProperty(exports, "isValidProtocolizationCaseMaterial", { enumerable: true, get: function () { return case_material_1.isValidProtocolizationCaseMaterial; } });
Object.defineProperty(exports, "protocolizationMaterialPayloadKey", { enumerable: true, get: function () { return case_material_1.protocolizationMaterialPayloadKey; } });
var case_state_1 = require("./case/case-state");
Object.defineProperty(exports, "INITIAL_PROTOCOLIZATION_CASE_STATE", { enumerable: true, get: function () { return case_state_1.INITIAL_PROTOCOLIZATION_CASE_STATE; } });
Object.defineProperty(exports, "ProtocolizationCaseState", { enumerable: true, get: function () { return case_state_1.ProtocolizationCaseState; } });
Object.defineProperty(exports, "ProtocolizationRequirementConditionStatus", { enumerable: true, get: function () { return case_state_1.ProtocolizationRequirementConditionStatus; } });
Object.defineProperty(exports, "ProtocolizationRequirementMaterialStatus", { enumerable: true, get: function () { return case_state_1.ProtocolizationRequirementMaterialStatus; } });
Object.defineProperty(exports, "acceptsProtocolizationMaterial", { enumerable: true, get: function () { return case_state_1.acceptsProtocolizationMaterial; } });
Object.defineProperty(exports, "isAllowedProtocolizationCaseTransition", { enumerable: true, get: function () { return case_state_1.isAllowedProtocolizationCaseTransition; } });
Object.defineProperty(exports, "isProtocolizationCaseState", { enumerable: true, get: function () { return case_state_1.isProtocolizationCaseState; } });
var protocolization_case_1 = require("./case/protocolization-case");
Object.defineProperty(exports, "PROTOCOLIZATION_CASE_SCHEMA_VERSION", { enumerable: true, get: function () { return protocolization_case_1.PROTOCOLIZATION_CASE_SCHEMA_VERSION; } });
var case_validation_1 = require("./case/case-validation");
Object.defineProperty(exports, "PROTOCOLIZATION_CASE_VALIDATION_CODES", { enumerable: true, get: function () { return case_validation_1.PROTOCOLIZATION_CASE_VALIDATION_CODES; } });
Object.defineProperty(exports, "isValidProtocolizationCase", { enumerable: true, get: function () { return case_validation_1.isValidProtocolizationCase; } });
Object.defineProperty(exports, "validateProtocolizationCase", { enumerable: true, get: function () { return case_validation_1.validateProtocolizationCase; } });
var case_events_1 = require("./case/case-events");
Object.defineProperty(exports, "PROTOCOLIZATION_CASE_EVENT_TYPES", { enumerable: true, get: function () { return case_events_1.PROTOCOLIZATION_CASE_EVENT_TYPES; } });
var case_operations_1 = require("./case/case-operations");
Object.defineProperty(exports, "activateProtocolizationCase", { enumerable: true, get: function () { return case_operations_1.activateProtocolizationCase; } });
Object.defineProperty(exports, "addProtocolizationCaseMaterial", { enumerable: true, get: function () { return case_operations_1.addProtocolizationCaseMaterial; } });
Object.defineProperty(exports, "associateProtocolizationCaseMaterial", { enumerable: true, get: function () { return case_operations_1.associateProtocolizationCaseMaterial; } });
Object.defineProperty(exports, "cancelProtocolizationCase", { enumerable: true, get: function () { return case_operations_1.cancelProtocolizationCase; } });
Object.defineProperty(exports, "createProtocolizationCase", { enumerable: true, get: function () { return case_operations_1.createProtocolizationCase; } });
Object.defineProperty(exports, "reconstituteProtocolizationCase", { enumerable: true, get: function () { return case_operations_1.reconstituteProtocolizationCase; } });
var case_progress_1 = require("./case/case-progress");
Object.defineProperty(exports, "getProtocolizationCaseRequirementProgress", { enumerable: true, get: function () { return case_progress_1.getProtocolizationCaseRequirementProgress; } });
Object.defineProperty(exports, "listProtocolizationCasePendingMaterialRequirements", { enumerable: true, get: function () { return case_progress_1.listProtocolizationCasePendingMaterialRequirements; } });
Object.defineProperty(exports, "listProtocolizationCaseRequirementProgress", { enumerable: true, get: function () { return case_progress_1.listProtocolizationCaseRequirementProgress; } });
var case_repository_1 = require("./case/case-repository");
Object.defineProperty(exports, "createInMemoryProtocolizationCaseRepository", { enumerable: true, get: function () { return case_repository_1.createInMemoryProtocolizationCaseRepository; } });
var case_errors_1 = require("./case/case-errors");
Object.defineProperty(exports, "PROTOCOLIZATION_CASE_ERROR_CODES", { enumerable: true, get: function () { return case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES; } });
Object.defineProperty(exports, "ProtocolizationCaseError", { enumerable: true, get: function () { return case_errors_1.ProtocolizationCaseError; } });
// ---------------------------------------------------------------------------
// APV-05 — Evidence intake
// ---------------------------------------------------------------------------
var evidence_intake_identifiers_1 = require("./evidence/evidence-intake-identifiers");
Object.defineProperty(exports, "isValidEvidenceIntakeCategoryId", { enumerable: true, get: function () { return evidence_intake_identifiers_1.isValidEvidenceIntakeCategoryId; } });
Object.defineProperty(exports, "isValidEvidenceIntakeId", { enumerable: true, get: function () { return evidence_intake_identifiers_1.isValidEvidenceIntakeId; } });
var evidence_submission_1 = require("./evidence/evidence-submission");
Object.defineProperty(exports, "EvidenceIntakePathway", { enumerable: true, get: function () { return evidence_submission_1.EvidenceIntakePathway; } });
Object.defineProperty(exports, "isEvidenceIntakePathway", { enumerable: true, get: function () { return evidence_submission_1.isEvidenceIntakePathway; } });
var evidence_intake_receipt_1 = require("./evidence/evidence-intake-receipt");
Object.defineProperty(exports, "EVIDENCE_INTAKE_RECEIPT_SCHEMA_VERSION", { enumerable: true, get: function () { return evidence_intake_receipt_1.EVIDENCE_INTAKE_RECEIPT_SCHEMA_VERSION; } });
var evidence_intake_validation_1 = require("./evidence/evidence-intake-validation");
Object.defineProperty(exports, "EVIDENCE_INTAKE_VALIDATION_CODES", { enumerable: true, get: function () { return evidence_intake_validation_1.EVIDENCE_INTAKE_VALIDATION_CODES; } });
Object.defineProperty(exports, "isAdmissibleProtocolizationEvidenceSubmission", { enumerable: true, get: function () { return evidence_intake_validation_1.isAdmissibleProtocolizationEvidenceSubmission; } });
Object.defineProperty(exports, "isValidEvidenceIntakeReceipt", { enumerable: true, get: function () { return evidence_intake_validation_1.isValidEvidenceIntakeReceipt; } });
Object.defineProperty(exports, "validateEvidenceIntakeReceipt", { enumerable: true, get: function () { return evidence_intake_validation_1.validateEvidenceIntakeReceipt; } });
Object.defineProperty(exports, "validateProtocolizationEvidenceSubmission", { enumerable: true, get: function () { return evidence_intake_validation_1.validateProtocolizationEvidenceSubmission; } });
var evidence_intake_events_1 = require("./evidence/evidence-intake-events");
Object.defineProperty(exports, "PROTOCOLIZATION_EVIDENCE_EVENT_TYPES", { enumerable: true, get: function () { return evidence_intake_events_1.PROTOCOLIZATION_EVIDENCE_EVENT_TYPES; } });
var evidence_intake_operations_1 = require("./evidence/evidence-intake-operations");
Object.defineProperty(exports, "intakeProtocolizationEvidence", { enumerable: true, get: function () { return evidence_intake_operations_1.intakeProtocolizationEvidence; } });
Object.defineProperty(exports, "reconstituteEvidenceIntakeReceipt", { enumerable: true, get: function () { return evidence_intake_operations_1.reconstituteEvidenceIntakeReceipt; } });
var evidence_intake_repository_1 = require("./evidence/evidence-intake-repository");
Object.defineProperty(exports, "createInMemoryEvidenceIntakeRepository", { enumerable: true, get: function () { return evidence_intake_repository_1.createInMemoryEvidenceIntakeRepository; } });
var evidence_intake_errors_1 = require("./evidence/evidence-intake-errors");
Object.defineProperty(exports, "EVIDENCE_INTAKE_ERROR_CODES", { enumerable: true, get: function () { return evidence_intake_errors_1.EVIDENCE_INTAKE_ERROR_CODES; } });
Object.defineProperty(exports, "EvidenceIntakeError", { enumerable: true, get: function () { return evidence_intake_errors_1.EvidenceIntakeError; } });
// ---------------------------------------------------------------------------
// APV-06 — Declaration / claim preparation
// ---------------------------------------------------------------------------
var declaration_identifiers_1 = require("./declarations/declaration-identifiers");
Object.defineProperty(exports, "isValidDeclarationId", { enumerable: true, get: function () { return declaration_identifiers_1.isValidDeclarationId; } });
var declaration_submission_1 = require("./declarations/declaration-submission");
Object.defineProperty(exports, "DeclarationPathway", { enumerable: true, get: function () { return declaration_submission_1.DeclarationPathway; } });
Object.defineProperty(exports, "isDeclarationPathway", { enumerable: true, get: function () { return declaration_submission_1.isDeclarationPathway; } });
var declaration_record_1 = require("./declarations/declaration-record");
Object.defineProperty(exports, "PROTOCOLIZATION_DECLARATION_RECORD_SCHEMA_VERSION", { enumerable: true, get: function () { return declaration_record_1.PROTOCOLIZATION_DECLARATION_RECORD_SCHEMA_VERSION; } });
var declaration_validation_1 = require("./declarations/declaration-validation");
Object.defineProperty(exports, "DECLARATION_VALIDATION_CODES", { enumerable: true, get: function () { return declaration_validation_1.DECLARATION_VALIDATION_CODES; } });
Object.defineProperty(exports, "isAdmissibleProtocolizationDeclarationSubmission", { enumerable: true, get: function () { return declaration_validation_1.isAdmissibleProtocolizationDeclarationSubmission; } });
Object.defineProperty(exports, "isValidProtocolizationDeclarationRecord", { enumerable: true, get: function () { return declaration_validation_1.isValidProtocolizationDeclarationRecord; } });
Object.defineProperty(exports, "validateProtocolizationDeclarationRecord", { enumerable: true, get: function () { return declaration_validation_1.validateProtocolizationDeclarationRecord; } });
Object.defineProperty(exports, "validateProtocolizationDeclarationSubmission", { enumerable: true, get: function () { return declaration_validation_1.validateProtocolizationDeclarationSubmission; } });
var declaration_events_1 = require("./declarations/declaration-events");
Object.defineProperty(exports, "PROTOCOLIZATION_DECLARATION_EVENT_TYPES", { enumerable: true, get: function () { return declaration_events_1.PROTOCOLIZATION_DECLARATION_EVENT_TYPES; } });
var declaration_operations_1 = require("./declarations/declaration-operations");
Object.defineProperty(exports, "recordProtocolizationDeclaration", { enumerable: true, get: function () { return declaration_operations_1.recordProtocolizationDeclaration; } });
Object.defineProperty(exports, "reconstituteProtocolizationDeclarationRecord", { enumerable: true, get: function () { return declaration_operations_1.reconstituteProtocolizationDeclarationRecord; } });
var declaration_repository_1 = require("./declarations/declaration-repository");
Object.defineProperty(exports, "createInMemoryDeclarationRepository", { enumerable: true, get: function () { return declaration_repository_1.createInMemoryDeclarationRepository; } });
var declaration_errors_1 = require("./declarations/declaration-errors");
Object.defineProperty(exports, "DECLARATION_ERROR_CODES", { enumerable: true, get: function () { return declaration_errors_1.DECLARATION_ERROR_CODES; } });
Object.defineProperty(exports, "DeclarationError", { enumerable: true, get: function () { return declaration_errors_1.DeclarationError; } });
