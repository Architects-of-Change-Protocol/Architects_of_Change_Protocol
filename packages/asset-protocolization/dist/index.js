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
 * See `docs/asset-protocolization/APV_03_ASSET_PROFILE_FRAMEWORK.md`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetProfileError = exports.ASSET_PROFILE_ERROR_CODES = exports.createAssetProfileCatalog = exports.listAssetProfileRequirements = exports.listAssetProfileReadinessRequirements = exports.hasAssetProfileRequirement = exports.getAssetProfileRequirement = exports.validateAssetProfile = exports.isValidAssetProfile = exports.isAssetRequirementOfKind = exports.ASSET_PROFILE_VALIDATION_CODES = exports.AssetProfileScope = exports.ASSET_PROFILE_SCHEMA_VERSION = exports.AssetRequirementSatisfaction = exports.AssetRequirementObligation = exports.AssetRequirementKind = exports.AssetIdentityStrategy = exports.isValidAssetRegistryConstraint = exports.isValidAssetCredentialConstraint = exports.isValidAssetAttesterConstraint = exports.isValidUtcDateTime = exports.isValidAssetFreshnessConstraint = exports.isValidAssetProfileMetadata = exports.jurisdictionRefsEqual = exports.isValidJurisdictionRef = exports.isValidJurisdictionCode = exports.GLOBAL_JURISDICTION_CODE = exports.isValidAssetVerificationCheckId = exports.isValidAssetRequirementId = exports.isValidAssetRequirementConditionId = exports.isValidAssetProfileVersion = exports.isValidAssetProfileId = exports.isValidAssetCategoryId = exports.compareAssetProfileVersions = exports.assetProfileVersionKey = exports.ASSET_IDENTIFIER_MAX_LENGTH = void 0;
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
