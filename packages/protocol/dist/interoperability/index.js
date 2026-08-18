"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOVEREIGNTY_INTEROPERABILITY_REASON_CODES = exports.assessSovereigntyInteroperabilityCompatibility = exports.SOVEREIGNTY_INTEROPERABILITY_REPORT_SCHEMA_VERSION = exports.SOVEREIGNTY_INTEROPERABILITY_COMPATIBILITY_STATUSES = exports.validateSovereigntyInteroperabilityConsumerSupportV1 = exports.isValidSovereigntyInteroperabilityConsumerSupportV1 = exports.buildSovereigntyInteroperabilityConsumerSupportV1 = exports.SOVEREIGNTY_INTEROPERABILITY_SUPPORT_SCHEMA_VERSION = exports.validateSovereigntyInteroperabilityDescriptorV1 = exports.tryBuildSovereigntyInteroperabilityDescriptorV1 = exports.presentInteroperabilityArtifactKinds = exports.isValidSovereigntyInteroperabilityDescriptorV1 = exports.buildSovereigntyInteroperabilityDescriptorV1 = exports.SOVEREIGNTY_INTEROPERABILITY_DESCRIPTOR_SCHEMA_VERSION = exports.isValidInteroperabilitySemanticRequirement = exports.isSovereigntyInteroperabilityArtifactKind = exports.isInteroperableStandingStatus = exports.isInteroperableClaimType = exports.interoperabilitySemanticRequirementKey = exports.compareInteroperabilitySemanticRequirements = exports.SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS = exports.INTEROPERABLE_STANDING_STATUSES = exports.INTEROPERABLE_CLAIM_TYPES = exports.getAocSovereigntySemanticTerm = exports.AOC_SOVEREIGNTY_SEMANTIC_VOCABULARY_ID = exports.AOC_SOVEREIGNTY_SEMANTIC_TERM_IDS = exports.AOC_SOVEREIGNTY_SEMANTIC_TERMS = exports.AOC_SOVEREIGNTY_SEMANTIC_NAMESPACE = exports.AOC_SOVEREIGNTY_SEMANTIC_CATEGORY_IDS = exports.AOC_SOVEREIGNTY_SEMANTIC_CATEGORIES = exports.AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY = exports.isValidSovereigntyInteroperabilityProfileV1 = exports.isValidSovereigntyInteroperabilityProfileRef = exports.SOVEREIGNTY_INTEROPERABILITY_PROFILE_SCHEMA_VERSION = exports.AOC_SOVEREIGNTY_PORTABILITY_MEDIA_TYPE = exports.AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_VERSION = exports.AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_V1 = exports.AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_REF = exports.AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_ID = void 0;
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
var profile_1 = require("./profile");
Object.defineProperty(exports, "AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_ID", { enumerable: true, get: function () { return profile_1.AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_ID; } });
Object.defineProperty(exports, "AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_REF", { enumerable: true, get: function () { return profile_1.AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_REF; } });
Object.defineProperty(exports, "AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_V1", { enumerable: true, get: function () { return profile_1.AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_V1; } });
Object.defineProperty(exports, "AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_VERSION", { enumerable: true, get: function () { return profile_1.AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_VERSION; } });
Object.defineProperty(exports, "AOC_SOVEREIGNTY_PORTABILITY_MEDIA_TYPE", { enumerable: true, get: function () { return profile_1.AOC_SOVEREIGNTY_PORTABILITY_MEDIA_TYPE; } });
Object.defineProperty(exports, "SOVEREIGNTY_INTEROPERABILITY_PROFILE_SCHEMA_VERSION", { enumerable: true, get: function () { return profile_1.SOVEREIGNTY_INTEROPERABILITY_PROFILE_SCHEMA_VERSION; } });
Object.defineProperty(exports, "isValidSovereigntyInteroperabilityProfileRef", { enumerable: true, get: function () { return profile_1.isValidSovereigntyInteroperabilityProfileRef; } });
Object.defineProperty(exports, "isValidSovereigntyInteroperabilityProfileV1", { enumerable: true, get: function () { return profile_1.isValidSovereigntyInteroperabilityProfileV1; } });
var vocabulary_1 = require("./vocabulary");
Object.defineProperty(exports, "AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY", { enumerable: true, get: function () { return vocabulary_1.AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY; } });
Object.defineProperty(exports, "AOC_SOVEREIGNTY_SEMANTIC_CATEGORIES", { enumerable: true, get: function () { return vocabulary_1.AOC_SOVEREIGNTY_SEMANTIC_CATEGORIES; } });
Object.defineProperty(exports, "AOC_SOVEREIGNTY_SEMANTIC_CATEGORY_IDS", { enumerable: true, get: function () { return vocabulary_1.AOC_SOVEREIGNTY_SEMANTIC_CATEGORY_IDS; } });
Object.defineProperty(exports, "AOC_SOVEREIGNTY_SEMANTIC_NAMESPACE", { enumerable: true, get: function () { return vocabulary_1.AOC_SOVEREIGNTY_SEMANTIC_NAMESPACE; } });
Object.defineProperty(exports, "AOC_SOVEREIGNTY_SEMANTIC_TERMS", { enumerable: true, get: function () { return vocabulary_1.AOC_SOVEREIGNTY_SEMANTIC_TERMS; } });
Object.defineProperty(exports, "AOC_SOVEREIGNTY_SEMANTIC_TERM_IDS", { enumerable: true, get: function () { return vocabulary_1.AOC_SOVEREIGNTY_SEMANTIC_TERM_IDS; } });
Object.defineProperty(exports, "AOC_SOVEREIGNTY_SEMANTIC_VOCABULARY_ID", { enumerable: true, get: function () { return vocabulary_1.AOC_SOVEREIGNTY_SEMANTIC_VOCABULARY_ID; } });
Object.defineProperty(exports, "getAocSovereigntySemanticTerm", { enumerable: true, get: function () { return vocabulary_1.getAocSovereigntySemanticTerm; } });
var features_1 = require("./features");
Object.defineProperty(exports, "INTEROPERABLE_CLAIM_TYPES", { enumerable: true, get: function () { return features_1.INTEROPERABLE_CLAIM_TYPES; } });
Object.defineProperty(exports, "INTEROPERABLE_STANDING_STATUSES", { enumerable: true, get: function () { return features_1.INTEROPERABLE_STANDING_STATUSES; } });
Object.defineProperty(exports, "SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS", { enumerable: true, get: function () { return features_1.SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS; } });
Object.defineProperty(exports, "compareInteroperabilitySemanticRequirements", { enumerable: true, get: function () { return features_1.compareInteroperabilitySemanticRequirements; } });
Object.defineProperty(exports, "interoperabilitySemanticRequirementKey", { enumerable: true, get: function () { return features_1.interoperabilitySemanticRequirementKey; } });
Object.defineProperty(exports, "isInteroperableClaimType", { enumerable: true, get: function () { return features_1.isInteroperableClaimType; } });
Object.defineProperty(exports, "isInteroperableStandingStatus", { enumerable: true, get: function () { return features_1.isInteroperableStandingStatus; } });
Object.defineProperty(exports, "isSovereigntyInteroperabilityArtifactKind", { enumerable: true, get: function () { return features_1.isSovereigntyInteroperabilityArtifactKind; } });
Object.defineProperty(exports, "isValidInteroperabilitySemanticRequirement", { enumerable: true, get: function () { return features_1.isValidInteroperabilitySemanticRequirement; } });
var descriptor_1 = require("./descriptor");
Object.defineProperty(exports, "SOVEREIGNTY_INTEROPERABILITY_DESCRIPTOR_SCHEMA_VERSION", { enumerable: true, get: function () { return descriptor_1.SOVEREIGNTY_INTEROPERABILITY_DESCRIPTOR_SCHEMA_VERSION; } });
Object.defineProperty(exports, "buildSovereigntyInteroperabilityDescriptorV1", { enumerable: true, get: function () { return descriptor_1.buildSovereigntyInteroperabilityDescriptorV1; } });
Object.defineProperty(exports, "isValidSovereigntyInteroperabilityDescriptorV1", { enumerable: true, get: function () { return descriptor_1.isValidSovereigntyInteroperabilityDescriptorV1; } });
Object.defineProperty(exports, "presentInteroperabilityArtifactKinds", { enumerable: true, get: function () { return descriptor_1.presentInteroperabilityArtifactKinds; } });
Object.defineProperty(exports, "tryBuildSovereigntyInteroperabilityDescriptorV1", { enumerable: true, get: function () { return descriptor_1.tryBuildSovereigntyInteroperabilityDescriptorV1; } });
Object.defineProperty(exports, "validateSovereigntyInteroperabilityDescriptorV1", { enumerable: true, get: function () { return descriptor_1.validateSovereigntyInteroperabilityDescriptorV1; } });
var support_1 = require("./support");
Object.defineProperty(exports, "SOVEREIGNTY_INTEROPERABILITY_SUPPORT_SCHEMA_VERSION", { enumerable: true, get: function () { return support_1.SOVEREIGNTY_INTEROPERABILITY_SUPPORT_SCHEMA_VERSION; } });
Object.defineProperty(exports, "buildSovereigntyInteroperabilityConsumerSupportV1", { enumerable: true, get: function () { return support_1.buildSovereigntyInteroperabilityConsumerSupportV1; } });
Object.defineProperty(exports, "isValidSovereigntyInteroperabilityConsumerSupportV1", { enumerable: true, get: function () { return support_1.isValidSovereigntyInteroperabilityConsumerSupportV1; } });
Object.defineProperty(exports, "validateSovereigntyInteroperabilityConsumerSupportV1", { enumerable: true, get: function () { return support_1.validateSovereigntyInteroperabilityConsumerSupportV1; } });
var compatibility_1 = require("./compatibility");
Object.defineProperty(exports, "SOVEREIGNTY_INTEROPERABILITY_COMPATIBILITY_STATUSES", { enumerable: true, get: function () { return compatibility_1.SOVEREIGNTY_INTEROPERABILITY_COMPATIBILITY_STATUSES; } });
Object.defineProperty(exports, "SOVEREIGNTY_INTEROPERABILITY_REPORT_SCHEMA_VERSION", { enumerable: true, get: function () { return compatibility_1.SOVEREIGNTY_INTEROPERABILITY_REPORT_SCHEMA_VERSION; } });
Object.defineProperty(exports, "assessSovereigntyInteroperabilityCompatibility", { enumerable: true, get: function () { return compatibility_1.assessSovereigntyInteroperabilityCompatibility; } });
var reason_codes_1 = require("./reason-codes");
Object.defineProperty(exports, "SOVEREIGNTY_INTEROPERABILITY_REASON_CODES", { enumerable: true, get: function () { return reason_codes_1.SOVEREIGNTY_INTEROPERABILITY_REASON_CODES; } });
