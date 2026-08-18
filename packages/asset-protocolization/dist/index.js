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
 * See `docs/asset-protocolization/APV_03_ASSET_PROFILE_FRAMEWORK.md` and
 * `docs/asset-protocolization/APV_04_PROTOCOLIZATION_CASE.md`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtocolizationRequirementConditionStatus = exports.ProtocolizationCaseState = exports.INITIAL_PROTOCOLIZATION_CASE_STATE = exports.protocolizationMaterialPayloadKey = exports.isValidProtocolizationCaseMaterial = exports.isProtocolizationMaterialKind = exports.ProtocolizationMaterialKind = exports.isValidProtocolizationCaseSubject = exports.protocolizationProfileRefsEqual = exports.isValidProtocolizationTenantId = exports.isValidProtocolizationProfileRef = exports.isValidProtocolizationMaterialId = exports.isValidProtocolizationCaseId = exports.PROTOCOLIZATION_IDENTIFIER_MAX_LENGTH = exports.AssetProfileError = exports.ASSET_PROFILE_ERROR_CODES = exports.createAssetProfileCatalog = exports.listAssetProfileRequirements = exports.listAssetProfileReadinessRequirements = exports.hasAssetProfileRequirement = exports.getAssetProfileRequirement = exports.validateAssetProfile = exports.isValidAssetProfile = exports.isAssetRequirementOfKind = exports.ASSET_PROFILE_VALIDATION_CODES = exports.AssetProfileScope = exports.ASSET_PROFILE_SCHEMA_VERSION = exports.AssetRequirementSatisfaction = exports.AssetRequirementObligation = exports.AssetRequirementKind = exports.AssetIdentityStrategy = exports.isValidAssetRegistryConstraint = exports.isValidAssetCredentialConstraint = exports.isValidAssetAttesterConstraint = exports.isValidUtcDateTime = exports.isValidAssetFreshnessConstraint = exports.isValidAssetProfileMetadata = exports.jurisdictionRefsEqual = exports.isValidJurisdictionRef = exports.isValidJurisdictionCode = exports.GLOBAL_JURISDICTION_CODE = exports.isValidAssetVerificationCheckId = exports.isValidAssetRequirementId = exports.isValidAssetRequirementConditionId = exports.isValidAssetProfileVersion = exports.isValidAssetProfileId = exports.isValidAssetCategoryId = exports.compareAssetProfileVersions = exports.assetProfileVersionKey = exports.ASSET_IDENTIFIER_MAX_LENGTH = void 0;
exports.ProtocolizationCaseError = exports.PROTOCOLIZATION_CASE_ERROR_CODES = exports.createInMemoryProtocolizationCaseRepository = exports.listProtocolizationCaseRequirementProgress = exports.listProtocolizationCasePendingMaterialRequirements = exports.getProtocolizationCaseRequirementProgress = exports.reconstituteProtocolizationCase = exports.createProtocolizationCase = exports.cancelProtocolizationCase = exports.associateProtocolizationCaseMaterial = exports.addProtocolizationCaseMaterial = exports.activateProtocolizationCase = exports.PROTOCOLIZATION_CASE_EVENT_TYPES = exports.validateProtocolizationCase = exports.isValidProtocolizationCase = exports.PROTOCOLIZATION_CASE_VALIDATION_CODES = exports.PROTOCOLIZATION_CASE_SCHEMA_VERSION = exports.isProtocolizationCaseState = exports.isAllowedProtocolizationCaseTransition = exports.acceptsProtocolizationMaterial = exports.ProtocolizationRequirementMaterialStatus = void 0;
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
