"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LICENSING_TERMS_REASON_CODES = exports.validateLicenseTermsClaim = exports.licenseTermsSemanticConcepts = exports.isValidLicenseTermsClaim = exports.buildLicenseTermsSemanticRefs = exports.buildLicenseTermsClaim = exports.validateSovereignLicenseTermsV1 = exports.validateSovereignLicenseTermsRuleV1 = exports.validateSovereignLicenseTermsAudience = exports.validateSovereignLicenseActionRef = exports.isValidSovereignLicenseTermsV1 = exports.isValidSovereignLicenseTermsRuleV1 = exports.isValidSovereignLicenseTermsRuleEffect = exports.isValidSovereignLicenseTermsAudience = exports.isValidSovereignLicenseActionRef = exports.isAocLicensingActionTermId = exports.getAocLicensingSemanticTerm = exports.AOC_LICENSING_SEMANTIC_TERMS = exports.AOC_LICENSING_SEMANTIC_TERM_IDS = exports.AOC_LICENSING_SEMANTIC_NAMESPACE = exports.AOC_LICENSING_SEMANTIC_CATEGORY_IDS = exports.AOC_LICENSING_SEMANTIC_CATEGORIES = exports.AOC_LICENSING_DECLARATION_TERM_IDS = exports.AOC_LICENSING_ACTION_TERM_IDS = exports.AOC_LICENSE_TERMS_SEMANTIC_VOCABULARY_ID = exports.AOC_LICENSE_TERMS_SEMANTIC_VOCABULARY = exports.SovereignLicenseTermsRuleEffect = exports.SovereignLicenseTermsAudienceKind = exports.SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION = exports.SOVEREIGN_LICENSE_TERMS_RULE_EFFECTS = exports.SOVEREIGN_LICENSE_TERMS_AUDIENCE_KINDS = void 0;
/**
 * `@aoc/protocol/licensing` — the structured, portable sovereign license terms
 * model: what an issuer declares over a sovereign subject, expressed so a
 * machine can read it, carry it and describe it.
 *
 * SM-08 answered "can an independent party check the proof?". This subpath
 * answers a different question: what does the issuer actually *say* about this
 * subject, in a form that survives transport and advertises the semantics a
 * receiving system needs in order to understand it?
 *
 * The licensing *data contracts* live here; the production AOC.LICENSING_TERMS
 * capsule that runs `declare-license-terms`, `validate-license-terms` and
 * `contest-license-terms-claim` through the common SM-03 invocation and
 * evidence spine lives in `@aoc/protocol/sovereignty-capabilities`. This mirrors
 * the existing split between `@aoc/protocol/portability`,
 * `@aoc/protocol/interoperability` and their capsules, so the terms model,
 * builder and validators stay usable on their own and no contract is defined
 * twice across two surfaces.
 *
 * ## The boundary this module exists to hold
 *
 *     declared permission   != runtime authorization
 *     declared restriction  != enforced denial
 *     declared obligation   != proof of compliance
 *     signed license claim  != legal validity
 *     issuer declares rights!= issuer proven to hold rights
 *     license terms         != ownership transfer
 *     license terms         != policy decision
 *     license terms         != access grant
 *     license terms         != DRM
 *
 * AOC Protocol records what someone declares. It does not decide whether an
 * action is allowed, grant access, enforce a restriction, determine legal
 * ownership, calculate royalties or resolve conflicting declarations. AOC
 * Enterprise or another external governance system may later *consume* these
 * terms and reach its own decisions; that consumption is outside Protocol.
 *
 * Importing this module has no side effects: nothing is minted, no clock is
 * read, no file is opened, no connection is made, nothing is registered and
 * nothing is written. The canonical vocabulary is a frozen constant evaluated
 * once, from other constants.
 */
var terms_1 = require("./terms");
Object.defineProperty(exports, "SOVEREIGN_LICENSE_TERMS_AUDIENCE_KINDS", { enumerable: true, get: function () { return terms_1.SOVEREIGN_LICENSE_TERMS_AUDIENCE_KINDS; } });
Object.defineProperty(exports, "SOVEREIGN_LICENSE_TERMS_RULE_EFFECTS", { enumerable: true, get: function () { return terms_1.SOVEREIGN_LICENSE_TERMS_RULE_EFFECTS; } });
Object.defineProperty(exports, "SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION", { enumerable: true, get: function () { return terms_1.SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION; } });
Object.defineProperty(exports, "SovereignLicenseTermsAudienceKind", { enumerable: true, get: function () { return terms_1.SovereignLicenseTermsAudienceKind; } });
Object.defineProperty(exports, "SovereignLicenseTermsRuleEffect", { enumerable: true, get: function () { return terms_1.SovereignLicenseTermsRuleEffect; } });
var vocabulary_1 = require("./vocabulary");
Object.defineProperty(exports, "AOC_LICENSE_TERMS_SEMANTIC_VOCABULARY", { enumerable: true, get: function () { return vocabulary_1.AOC_LICENSE_TERMS_SEMANTIC_VOCABULARY; } });
Object.defineProperty(exports, "AOC_LICENSE_TERMS_SEMANTIC_VOCABULARY_ID", { enumerable: true, get: function () { return vocabulary_1.AOC_LICENSE_TERMS_SEMANTIC_VOCABULARY_ID; } });
Object.defineProperty(exports, "AOC_LICENSING_ACTION_TERM_IDS", { enumerable: true, get: function () { return vocabulary_1.AOC_LICENSING_ACTION_TERM_IDS; } });
Object.defineProperty(exports, "AOC_LICENSING_DECLARATION_TERM_IDS", { enumerable: true, get: function () { return vocabulary_1.AOC_LICENSING_DECLARATION_TERM_IDS; } });
Object.defineProperty(exports, "AOC_LICENSING_SEMANTIC_CATEGORIES", { enumerable: true, get: function () { return vocabulary_1.AOC_LICENSING_SEMANTIC_CATEGORIES; } });
Object.defineProperty(exports, "AOC_LICENSING_SEMANTIC_CATEGORY_IDS", { enumerable: true, get: function () { return vocabulary_1.AOC_LICENSING_SEMANTIC_CATEGORY_IDS; } });
Object.defineProperty(exports, "AOC_LICENSING_SEMANTIC_NAMESPACE", { enumerable: true, get: function () { return vocabulary_1.AOC_LICENSING_SEMANTIC_NAMESPACE; } });
Object.defineProperty(exports, "AOC_LICENSING_SEMANTIC_TERM_IDS", { enumerable: true, get: function () { return vocabulary_1.AOC_LICENSING_SEMANTIC_TERM_IDS; } });
Object.defineProperty(exports, "AOC_LICENSING_SEMANTIC_TERMS", { enumerable: true, get: function () { return vocabulary_1.AOC_LICENSING_SEMANTIC_TERMS; } });
Object.defineProperty(exports, "getAocLicensingSemanticTerm", { enumerable: true, get: function () { return vocabulary_1.getAocLicensingSemanticTerm; } });
Object.defineProperty(exports, "isAocLicensingActionTermId", { enumerable: true, get: function () { return vocabulary_1.isAocLicensingActionTermId; } });
var validation_1 = require("./validation");
Object.defineProperty(exports, "isValidSovereignLicenseActionRef", { enumerable: true, get: function () { return validation_1.isValidSovereignLicenseActionRef; } });
Object.defineProperty(exports, "isValidSovereignLicenseTermsAudience", { enumerable: true, get: function () { return validation_1.isValidSovereignLicenseTermsAudience; } });
Object.defineProperty(exports, "isValidSovereignLicenseTermsRuleEffect", { enumerable: true, get: function () { return validation_1.isValidSovereignLicenseTermsRuleEffect; } });
Object.defineProperty(exports, "isValidSovereignLicenseTermsRuleV1", { enumerable: true, get: function () { return validation_1.isValidSovereignLicenseTermsRuleV1; } });
Object.defineProperty(exports, "isValidSovereignLicenseTermsV1", { enumerable: true, get: function () { return validation_1.isValidSovereignLicenseTermsV1; } });
Object.defineProperty(exports, "validateSovereignLicenseActionRef", { enumerable: true, get: function () { return validation_1.validateSovereignLicenseActionRef; } });
Object.defineProperty(exports, "validateSovereignLicenseTermsAudience", { enumerable: true, get: function () { return validation_1.validateSovereignLicenseTermsAudience; } });
Object.defineProperty(exports, "validateSovereignLicenseTermsRuleV1", { enumerable: true, get: function () { return validation_1.validateSovereignLicenseTermsRuleV1; } });
Object.defineProperty(exports, "validateSovereignLicenseTermsV1", { enumerable: true, get: function () { return validation_1.validateSovereignLicenseTermsV1; } });
var claim_1 = require("./claim");
Object.defineProperty(exports, "buildLicenseTermsClaim", { enumerable: true, get: function () { return claim_1.buildLicenseTermsClaim; } });
Object.defineProperty(exports, "buildLicenseTermsSemanticRefs", { enumerable: true, get: function () { return claim_1.buildLicenseTermsSemanticRefs; } });
Object.defineProperty(exports, "isValidLicenseTermsClaim", { enumerable: true, get: function () { return claim_1.isValidLicenseTermsClaim; } });
Object.defineProperty(exports, "licenseTermsSemanticConcepts", { enumerable: true, get: function () { return claim_1.licenseTermsSemanticConcepts; } });
Object.defineProperty(exports, "validateLicenseTermsClaim", { enumerable: true, get: function () { return claim_1.validateLicenseTermsClaim; } });
var reason_codes_1 = require("./reason-codes");
Object.defineProperty(exports, "LICENSING_TERMS_REASON_CODES", { enumerable: true, get: function () { return reason_codes_1.LICENSING_TERMS_REASON_CODES; } });
