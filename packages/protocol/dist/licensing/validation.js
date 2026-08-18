"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSovereignLicenseTermsAudience = validateSovereignLicenseTermsAudience;
exports.isValidSovereignLicenseTermsAudience = isValidSovereignLicenseTermsAudience;
exports.isValidSovereignLicenseTermsRuleEffect = isValidSovereignLicenseTermsRuleEffect;
exports.validateSovereignLicenseActionRef = validateSovereignLicenseActionRef;
exports.isValidSovereignLicenseActionRef = isValidSovereignLicenseActionRef;
exports.validateSovereignLicenseTermsRuleV1 = validateSovereignLicenseTermsRuleV1;
exports.isValidSovereignLicenseTermsRuleV1 = isValidSovereignLicenseTermsRuleV1;
exports.validateSovereignLicenseTermsV1 = validateSovereignLicenseTermsV1;
exports.isValidSovereignLicenseTermsV1 = isValidSovereignLicenseTermsV1;
const timestamps_1 = require("../claims/timestamps");
const reason_codes_1 = require("./reason-codes");
const terms_1 = require("./terms");
const vocabulary_1 = require("./vocabulary");
/**
 * Structural validation for the SM-09-owned terms structures.
 *
 * ## Closed, exact-key structures
 *
 * `SovereignLicenseTermsV1`, every audience variant, every rule and every
 * action ref are validated with **exact key** checks, so an unknown field
 * fails closed rather than being accepted and ignored. A document carrying
 * `automaticRoyaltyRate` must not travel, be signed and be read by three
 * systems as though Protocol had agreed to it; silently dropping it would be
 * worse still, because the issuer would believe it was declared.
 *
 * This closure is scoped to the structures SM-09 owns. `AuthorityClaim.metadata`
 * as a whole stays open — that extensibility predates SM-09 and belongs to the
 * claims layer — and the licensing validator only insists on `kind`,
 * `statement` and `terms` being what a licensing declaration needs them to be.
 *
 * ## What is never checked here
 *
 * No rule is evaluated. No action is resolved, dereferenced or looked up. No
 * audience membership is expanded. No precedence is applied between
 * contradictory clauses. No wall clock is consulted, so a document that takes
 * effect next year and one that expired last year are both perfectly valid
 * documents — Protocol stores declarations and does not turn dates into policy
 * state.
 *
 * Ordering rules between `issuedAt`, `effectiveAt` and `expiresAt` are
 * deliberately *not* enforced. No canonical repository rule owns such an
 * ordering, and inventing one would make a backdated correction or a
 * retroactive licence structurally malformed — a legal timing judgement
 * Protocol has no business making.
 */
const codes = reason_codes_1.LICENSING_TERMS_REASON_CODES;
function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isNonBlankString(value) {
    return typeof value === 'string' && value.trim() !== '';
}
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
function hasExactKeys(value, keys) {
    const actual = Object.keys(value);
    return actual.length === keys.length && keys.every((key) => hasOwn(value, key));
}
/**
 * Distinct reasons, in first-seen order.
 *
 * A document with four malformed clauses has one *kind* of defect, and
 * repeating `LICENSING_TERMS_INVALID_RULE` four times would tell a reader how
 * many clauses were bad without telling them which — information the reason
 * list cannot carry anyway. Order is preserved so the output stays
 * deterministic for a given document.
 */
function distinct(reasons) {
    return [...new Set(reasons)];
}
/**
 * Same structural floor the claims layer applies to `CanonicalIssuer`: a
 * non-blank string, or an object carrying a non-blank `id` and `kind`.
 *
 * Protocol still has no fully canonical runtime validator for
 * `CanonicalPrincipalRef` — SM-04 recorded the gap for `SovereignRegistrant`
 * and SM-05 for `CanonicalIssuer`. SM-09 documents rather than closes it:
 * redesigning `PrincipalKind` is not this work package's mission, and a
 * licensing-only principal validator would be a second, competing rule.
 */
function isStructuralPrincipal(value) {
    if (isNonBlankString(value))
        return true;
    if (!isPlainObject(value))
        return false;
    return isNonBlankString(value.id) && isNonBlankString(value.kind);
}
/** Validates one audience variant, closed to exactly its own keys. */
function validateSovereignLicenseTermsAudience(value) {
    if (!isPlainObject(value))
        return false;
    if (!terms_1.SOVEREIGN_LICENSE_TERMS_AUDIENCE_KINDS.includes(value.kind))
        return false;
    if (value.kind === terms_1.SovereignLicenseTermsAudienceKind.Public) {
        return hasExactKeys(value, ['kind']);
    }
    if (value.kind === terms_1.SovereignLicenseTermsAudienceKind.Principal) {
        return hasExactKeys(value, ['kind', 'principal']) && isStructuralPrincipal(value.principal);
    }
    return (hasExactKeys(value, ['kind', 'namespace', 'id'])
        && isNonBlankString(value.namespace)
        && isNonBlankString(value.id));
}
function isValidSovereignLicenseTermsAudience(value) {
    return validateSovereignLicenseTermsAudience(value);
}
function isValidSovereignLicenseTermsRuleEffect(value) {
    return (typeof value === 'string'
        && terms_1.SOVEREIGN_LICENSE_TERMS_RULE_EFFECTS.includes(value));
}
/**
 * Validates an action reference, returning the reasons rather than a boolean so
 * "this is not an action reference at all" stays distinguishable from "this is
 * a well-formed reference to a Protocol concept that does not exist".
 *
 * Outside `aoc.licensing`, any non-blank namespace and term is accepted
 * opaquely and is never dereferenced. Inside it, the term must be one of this
 * version's canonical action concepts.
 */
function validateSovereignLicenseActionRef(value) {
    if (!isPlainObject(value) || !hasExactKeys(value, ['namespace', 'termRef'])) {
        return [codes.invalidActionRef];
    }
    if (!isNonBlankString(value.namespace) || !isNonBlankString(value.termRef)) {
        return [codes.invalidActionRef];
    }
    if (value.namespace === vocabulary_1.AOC_LICENSING_SEMANTIC_NAMESPACE && !(0, vocabulary_1.isAocLicensingActionTermId)(value.termRef)) {
        return [codes.unknownAocAction];
    }
    return [];
}
function isValidSovereignLicenseActionRef(value) {
    return validateSovereignLicenseActionRef(value).length === 0;
}
/** Validates one rule clause, closed to exactly its four keys. */
function validateSovereignLicenseTermsRuleV1(value) {
    if (!isPlainObject(value) || !hasExactKeys(value, ['id', 'effect', 'action', 'statement'])) {
        return [codes.invalidRule];
    }
    const reasons = [];
    if (!isNonBlankString(value.id))
        reasons.push(codes.invalidRule);
    if (!isValidSovereignLicenseTermsRuleEffect(value.effect))
        reasons.push(codes.invalidRuleEffect);
    reasons.push(...validateSovereignLicenseActionRef(value.action));
    if (!isNonBlankString(value.statement))
        reasons.push(codes.invalidRule);
    return distinct(reasons);
}
function isValidSovereignLicenseTermsRuleV1(value) {
    return validateSovereignLicenseTermsRuleV1(value).length === 0;
}
/**
 * Validates a complete terms document.
 *
 * Rules must be a **dense**, non-empty array. `Array.prototype.every` skips
 * holes, so a sparse array like `new Array(1)` would otherwise satisfy any
 * `every` check while carrying nothing at index 0 — and that hole would reach a
 * signed claim as a clause nobody wrote. Iterating a densified copy makes holes
 * visible as `undefined` and rejects them.
 *
 * Duplicate rule ids are **reported, never silently deduplicated**: a caller
 * who sent two clauses under one id made a mistake worth surfacing, and quietly
 * rewriting an issuer's declaration is not Protocol's job. The same *action*
 * appearing several times under different rule ids is entirely legal, including
 * a `Permission` and a `Restriction` over the identical action — Protocol
 * records that the issuer declared both and reaches no conclusion about which
 * wins, because there is no precedence rule here to reach one with.
 */
function validateSovereignLicenseTermsV1(value) {
    if (!isPlainObject(value))
        return [codes.invalidInput];
    const expected = hasOwn(value, 'effectiveAt')
        ? ['schemaVersion', 'audience', 'effectiveAt', 'rules']
        : ['schemaVersion', 'audience', 'rules'];
    if (!hasExactKeys(value, expected))
        return [codes.invalidInput];
    const reasons = [];
    // A future or unknown terms schema fails closed. A v1 reader pretending to
    // understand `.../2` is exactly the silent semantic drift a versioned wire
    // contract exists to prevent, and "best effort" over legal declarations is
    // the worst possible place to guess.
    if (value.schemaVersion !== terms_1.SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION) {
        reasons.push(codes.unsupportedSchema);
    }
    if (!validateSovereignLicenseTermsAudience(value.audience))
        reasons.push(codes.invalidAudience);
    // A present-but-blank or present-but-`undefined` optional is a malformed
    // declaration, not an absent one: `aoc-canonical-json/1` refuses `undefined`,
    // so such a document could never be canonicalized or signed.
    if (hasOwn(value, 'effectiveAt') && !(0, timestamps_1.isCanonicalTimestamp)(value.effectiveAt)) {
        reasons.push(codes.invalidTimestamp);
    }
    const rules = value.rules;
    if (!Array.isArray(rules)) {
        reasons.push(codes.rulesRequired);
        return distinct(reasons);
    }
    if (rules.length === 0) {
        reasons.push(codes.rulesRequired);
        return distinct(reasons);
    }
    const dense = Array.from(rules);
    const ids = [];
    for (const rule of dense) {
        const ruleReasons = validateSovereignLicenseTermsRuleV1(rule);
        reasons.push(...ruleReasons);
        if (isPlainObject(rule) && typeof rule.id === 'string')
            ids.push(rule.id);
    }
    if (new Set(ids).size !== ids.length)
        reasons.push(codes.duplicateRuleId);
    return distinct(reasons);
}
function isValidSovereignLicenseTermsV1(value) {
    return validateSovereignLicenseTermsV1(value).length === 0;
}
