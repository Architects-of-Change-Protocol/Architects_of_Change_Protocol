"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.licenseTermsSemanticConcepts = licenseTermsSemanticConcepts;
exports.buildLicenseTermsSemanticRefs = buildLicenseTermsSemanticRefs;
exports.buildLicenseTermsClaim = buildLicenseTermsClaim;
exports.validateLicenseTermsClaim = validateLicenseTermsClaim;
exports.isValidLicenseTermsClaim = isValidLicenseTermsClaim;
const timestamps_1 = require("../claims/timestamps");
const claims_1 = require("../manifest/claims");
const reason_codes_1 = require("./reason-codes");
const terms_1 = require("./terms");
const validation_1 = require("./validation");
const vocabulary_1 = require("./vocabulary");
const codes = reason_codes_1.LICENSING_TERMS_REASON_CODES;
const DECLARATION_TERM_IDS = vocabulary_1.AOC_LICENSING_DECLARATION_TERM_IDS;
const EFFECT_TERM_IDS = Object.freeze({
    [terms_1.SovereignLicenseTermsRuleEffect.Permission]: DECLARATION_TERM_IDS.permissionRule,
    [terms_1.SovereignLicenseTermsRuleEffect.Restriction]: DECLARATION_TERM_IDS.restrictionRule,
    [terms_1.SovereignLicenseTermsRuleEffect.Obligation]: DECLARATION_TERM_IDS.obligationRule,
});
/** The effect concepts in canonical order, so a ref list never depends on rule order. */
const EFFECT_ORDER = Object.freeze([
    terms_1.SovereignLicenseTermsRuleEffect.Permission,
    terms_1.SovereignLicenseTermsRuleEffect.Restriction,
    terms_1.SovereignLicenseTermsRuleEffect.Obligation,
]);
function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isNonBlankString(value) {
    return typeof value === 'string' && value.trim() !== '';
}
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
/**
 * The semantic concepts a terms document requires a consumer to understand, as
 * `(namespace, termRef)` concept pairs in canonical order:
 *
 *   1. `aoc.licensing:license-terms-declaration` — always
 *   2. the permission concept, if any clause declares one
 *   3. the restriction concept, if any clause declares one
 *   4. the obligation concept, if any clause declares one
 *   5. every distinct action concept, sorted by namespace then term
 *
 * Deduplicated by concept identity: three `CommercialUse` clauses impose one
 * requirement, not three. Deterministic by construction — the same document
 * always yields the same list, in the same order, with no clock, no counter and
 * no random value anywhere in it.
 *
 * The *rules themselves* are never reordered by any of this. Ordering a derived
 * concept list is canonicalization of a derived artifact; reordering a caller's
 * authored clauses would be rewriting their declaration.
 */
function licenseTermsSemanticConcepts(terms) {
    const concepts = [
        { namespace: vocabulary_1.AOC_LICENSING_SEMANTIC_NAMESPACE, termRef: DECLARATION_TERM_IDS.licenseTermsDeclaration },
    ];
    const rules = Array.isArray(terms?.rules) ? Array.from(terms.rules) : [];
    const presentEffects = new Set(rules.map((rule) => (isPlainObject(rule) ? rule.effect : undefined)));
    for (const effect of EFFECT_ORDER) {
        if (presentEffects.has(effect)) {
            concepts.push({ namespace: vocabulary_1.AOC_LICENSING_SEMANTIC_NAMESPACE, termRef: EFFECT_TERM_IDS[effect] });
        }
    }
    const actions = rules
        .map((rule) => (isPlainObject(rule) ? rule.action : undefined))
        .filter((action) => isPlainObject(action) && isNonBlankString(action.namespace) && isNonBlankString(action.termRef))
        .map((action) => ({ namespace: action.namespace, termRef: action.termRef }))
        .sort((a, b) => {
        if (a.namespace !== b.namespace)
            return a.namespace < b.namespace ? -1 : 1;
        if (a.termRef !== b.termRef)
            return a.termRef < b.termRef ? -1 : 1;
        return 0;
    });
    concepts.push(...actions);
    const seen = new Set();
    const distinct = [];
    for (const concept of concepts) {
        const key = JSON.stringify([concept.namespace, concept.termRef]);
        if (seen.has(key))
            continue;
        seen.add(key);
        distinct.push(Object.freeze({ namespace: concept.namespace, termRef: concept.termRef }));
    }
    return Object.freeze(distinct);
}
/**
 * The claim-level `CanonicalSemanticRef`s a licensing declaration carries.
 *
 * ## Why they matter
 *
 * They are what lets the **unchanged** SM-07 Interoperability machinery
 * discover that an arriving claim carries licensing semantics — including
 * semantics defined by somebody else. A clause over `example.real-estate:lease`
 * surfaces that concept as a requirement, so a receiving system is told "you
 * need to understand this" without Protocol ever defining, resolving or
 * interpreting it. No interoperability descriptor schema change, no profile
 * bump and no mutation of the SM-07 core vocabulary is needed for any of it.
 *
 * ## Why the ids are derived from the claim id
 *
 * A `CanonicalSemanticRef.id` identifies one reference *occurrence*, so it has
 * to exist — but minting `randomUUID()` here would make the same declaration
 * serialize, digest and sign differently on every construction, which is fatal
 * for a claim meant to be signed and compared. `<claimId>:semantic:<n>` is
 * deterministic, collision-free within a claim, and follows the same
 * `<claimId>:assertion` convention the claim builders already use.
 */
function buildLicenseTermsSemanticRefs(claimId, terms) {
    return Object.freeze(licenseTermsSemanticConcepts(terms).map((concept, index) => Object.freeze({
        id: `${claimId}:semantic:${index}`,
        termRef: concept.termRef,
        namespace: concept.namespace,
    })));
}
/**
 * Copies one clause into the claim, key-exact and order-preserving.
 *
 * Copied rather than referenced so a caller cannot mutate their array after
 * construction and silently change a claim that has already been digested, and
 * so nothing beyond the four canonical keys can ride along into a signed
 * document.
 */
function toCanonicalRule(rule) {
    return Object.freeze({
        id: rule.id,
        effect: rule.effect,
        action: Object.freeze({ namespace: rule.action.namespace, termRef: rule.action.termRef }),
        statement: rule.statement,
    });
}
function toCanonicalAudience(audience) {
    if (audience.kind === terms_1.SovereignLicenseTermsAudienceKind.Principal) {
        return Object.freeze({ kind: audience.kind, principal: audience.principal });
    }
    if (audience.kind === terms_1.SovereignLicenseTermsAudienceKind.Custom) {
        return Object.freeze({ kind: audience.kind, namespace: audience.namespace, id: audience.id });
    }
    return Object.freeze({ kind: audience.kind });
}
/**
 * Builds a canonical `LicenseTermsClaim`.
 *
 * Reuses `buildAuthorityClaim` with `kind: AuthorityClaimKind.License` rather
 * than reconstructing the `CanonicalClaim` base by hand, so the base fields —
 * `type`, `subject`, `assertionRef`, `evidenceRefs`, `attestationRefs` — keep
 * exactly one construction site in the package.
 *
 * Throws on a malformed declaration rather than repairing it: a construction
 * helper, not a lenient parser, matching `buildDerivationClaim`. Absent
 * optionals are omitted structurally, never emitted as `undefined`, so the
 * claim stays canonicalizable under `aoc-canonical-json/1`.
 *
 * It **never** signs, and it mints nothing: no claim id, no rule id, no
 * subject, no standing, no evidence reference. It creates exactly one claim —
 * no `OriginClaim`, no authorship claim and no `DerivationClaim` appears as a
 * side effect — and it copies no terms from anywhere: a subject derived from
 * another subject inherits none of that subject's terms, and a
 * `Permission`/`Derive` clause declares that deriving is permitted while saying
 * nothing at all about what terms the resulting child carries.
 */
function buildLicenseTermsClaim(input) {
    const base = (0, claims_1.buildAuthorityClaim)({
        id: input.id,
        sovereignAssetId: input.sovereignAssetId,
        issuer: input.issuer,
        kind: claims_1.AuthorityClaimKind.License,
        statement: input.statement,
        issuedAt: input.issuedAt,
        ...(input.evidenceRefs === undefined ? {} : { evidenceRefs: [...input.evidenceRefs] }),
    });
    const terms = Object.freeze({
        schemaVersion: terms_1.SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
        audience: toCanonicalAudience(input.audience),
        ...(input.effectiveAt === undefined ? {} : { effectiveAt: input.effectiveAt }),
        rules: Object.freeze(Array.from(input.rules).map(toCanonicalRule)),
    });
    const claim = {
        ...base,
        ...(input.expiresAt === undefined ? {} : { expiresAt: input.expiresAt }),
        semanticRefs: buildLicenseTermsSemanticRefs(input.id, terms),
        metadata: Object.freeze({
            kind: claims_1.AuthorityClaimKind.License,
            statement: input.statement,
            terms,
        }),
    };
    const validation = validateLicenseTermsClaim(claim);
    if (!validation.valid) {
        throw new Error(`Invalid LicenseTermsClaim: ${validation.reasons.join(', ')}`);
    }
    return claim;
}
/**
 * Maps the claims layer's generic structural reasons onto the licensing
 * vocabulary.
 *
 * The base checks are *performed by* `validateAuthorityClaim` — this validator
 * duplicates none of them — but a licensing consumer reads one reason-code set,
 * so the outcomes are translated rather than mixed. Anything without an exact
 * licensing counterpart becomes `LICENSING_TERMS_INVALID_CLAIM`, which is the
 * honest summary: the candidate is not a structurally valid claim.
 */
const BASE_REASON_MAP = Object.freeze({
    INVALID_CLAIM_ID: codes.invalidClaimId,
    INVALID_CLAIM_ISSUER: codes.invalidIssuer,
    INVALID_CLAIM_ISSUED_AT: codes.invalidTimestamp,
    INVALID_CLAIM_EVIDENCE_REFS: codes.invalidEvidenceRefs,
    INVALID_AUTHORITY_STATEMENT: codes.invalidStatement,
});
/**
 * Whether the claim's `semanticRefs` are well formed and surface the licensing
 * declaration concept.
 *
 * Extra refs are fine — a claim may legitimately advertise more than SM-09
 * generates — but the declaration concept must be present, because that ref is
 * what makes "this artifact carries licensing semantics" discoverable
 * generically, without SM-07 knowing anything about SM-09.
 */
function hasLicensingSemanticRefs(value) {
    if (!Array.isArray(value))
        return false;
    const refs = Array.from(value);
    if (refs.some((ref) => !isPlainObject(ref)
        || !isNonBlankString(ref.id)
        || !isNonBlankString(ref.namespace)
        || !isNonBlankString(ref.termRef))) {
        return false;
    }
    return refs.some((ref) => isPlainObject(ref)
        && ref.namespace === vocabulary_1.AOC_LICENSING_SEMANTIC_NAMESPACE
        && ref.termRef === DECLARATION_TERM_IDS.licenseTermsDeclaration);
}
/**
 * Structural validation for a `LicenseTermsClaim`.
 *
 * Every rule is local and offline. It confirms that the *declaration* is well
 * formed — never that it is true, that the issuer had authority to make it,
 * that the terms are lawful, or that anything about the world matches them. It
 * consults no clock, so an expired declaration and one that takes effect in
 * 2030 are both structurally valid, and it creates no `StandingStatus`: nothing
 * here turns a date into `Active`, `Expired` or `NotYetActive`.
 *
 * Cryptographic validity and terms validity are independent, in both
 * directions. An issuer can perfectly well sign a malformed terms document —
 * AOC.VERIFIABILITY will report that signature as valid, and this function will
 * still report the terms as invalid. Neither is wrong, and neither repairs the
 * other.
 */
function validateLicenseTermsClaim(value) {
    const reasons = [];
    // The shared base rules, run by their owner rather than restated here.
    const base = (0, claims_1.validateAuthorityClaim)(value);
    if (!base.valid) {
        for (const reason of base.reasons) {
            reasons.push(BASE_REASON_MAP[reason] ?? codes.invalidClaim);
        }
    }
    if (!isPlainObject(value)) {
        return { valid: false, reasons: [...new Set([...reasons, codes.invalidClaim])] };
    }
    // `CanonicalClaim.expiresAt` is the one expiration field, and the claims
    // layer's shared checks do not reach it, so the licensing validator does.
    if (hasOwn(value, 'expiresAt') && !(0, timestamps_1.isCanonicalTimestamp)(value.expiresAt)) {
        reasons.push(codes.invalidTimestamp);
    }
    if (!hasLicensingSemanticRefs(value.semanticRefs))
        reasons.push(codes.invalidSemanticRefs);
    const metadata = value.metadata;
    if (!isPlainObject(metadata)) {
        reasons.push(codes.invalidClaim);
        return { valid: false, reasons: [...new Set(reasons)] };
    }
    // A `Rights`, `Authorship` or `Custom` AuthorityClaim is a perfectly valid
    // claim — it is simply not a licensing declaration, and saying so is the
    // point of this check.
    if (metadata.kind !== claims_1.AuthorityClaimKind.License)
        reasons.push(codes.invalidClaim);
    if (!hasOwn(metadata, 'terms')) {
        // A generic free-text `AuthorityClaimKind.License` claim remains entirely
        // legal at the claims layer; it is simply outside the formal SM-09 contract.
        reasons.push(codes.invalidInput);
        return { valid: false, reasons: [...new Set(reasons)] };
    }
    reasons.push(...(0, validation_1.validateSovereignLicenseTermsV1)(metadata.terms));
    const distinct = [...new Set(reasons)];
    return { valid: distinct.length === 0, reasons: distinct };
}
function isValidLicenseTermsClaim(value) {
    return validateLicenseTermsClaim(value).valid;
}
