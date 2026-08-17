"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSovereignExternalReference = validateSovereignExternalReference;
exports.isValidSovereignExternalReference = isValidSovereignExternalReference;
exports.buildSovereignExternalReference = buildSovereignExternalReference;
exports.isValidSovereignSubjectRef = isValidSovereignSubjectRef;
exports.sovereignExternalReferencesEqual = sovereignExternalReferencesEqual;
exports.toSovereignSubjectRef = toSovereignSubjectRef;
const sovereign_asset_id_1 = require("./sovereign-asset-id");
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
/**
 * Non-empty after trimming, but never trimmed in place: an externally
 * meaningful identifier must survive Protocol untouched (leading/trailing
 * characters can be significant in a namespace we do not understand), so
 * this rejects blank values instead of silently rewriting them. The
 * `trim()`-based emptiness rule matches the existing repository precedent
 * in `capability/capabilityToken.ts` and `consent/consentObject.ts`.
 */
function isNonBlankString(value) {
    return typeof value === 'string' && value.trim() !== '';
}
/**
 * Deliberately minimal structural validation. Protocol validates *shape*,
 * never external semantics: no URL/URI syntax, no DID, no UUID, no
 * SHA-256, no CID, no blockchain-address form, no HTTP(S) scheme, no
 * known-provider list, and no known-namespace list is required or
 * checked. Unknown and future namespaces are valid by construction.
 *
 * An optional field that is present-but-`undefined` is reported as
 * invalid rather than accepted: `aoc-canonical-json/1`
 * (`@aoc/protocol/canonical`) refuses to serialize `undefined`, so an
 * absent optional field must be structurally omitted for the reference to
 * be signable at all.
 */
function validateSovereignExternalReference(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return { valid: false, reasons: ['INVALID_EXTERNAL_REFERENCE_STRUCTURE'] };
    }
    const reasons = [];
    const candidate = value;
    if (!isNonBlankString(candidate.namespace)) {
        reasons.push('INVALID_EXTERNAL_REFERENCE_NAMESPACE');
    }
    if (!isNonBlankString(candidate.id)) {
        reasons.push('INVALID_EXTERNAL_REFERENCE_ID');
    }
    if (hasOwn(candidate, 'locator') && !isNonBlankString(candidate.locator)) {
        reasons.push('INVALID_EXTERNAL_REFERENCE_LOCATOR');
    }
    return { valid: reasons.length === 0, reasons };
}
function isValidSovereignExternalReference(value) {
    return validateSovereignExternalReference(value).valid;
}
/**
 * Builds a validated external reference, omitting `locator` structurally
 * when it was not supplied (never emitting `locator: undefined`). Throws
 * rather than repairing malformed input — this is a construction helper,
 * not a lenient parser, and it never rewrites the values it accepts.
 */
function buildSovereignExternalReference(input) {
    const reference = {
        namespace: input.namespace,
        id: input.id,
        ...(input.locator === undefined ? {} : { locator: input.locator }),
    };
    const validation = validateSovereignExternalReference(reference);
    if (!validation.valid) {
        throw new Error(`Invalid SovereignExternalReference: ${validation.reasons.join(', ')}`);
    }
    return reference;
}
/**
 * Structural check for a subject reference. A `SovereignAssetId` alone is
 * a complete, valid subject reference — `externalReference` is optional
 * and `ContentIdentity` is not part of this contract at all.
 */
function isValidSovereignSubjectRef(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }
    const candidate = value;
    if (!(0, sovereign_asset_id_1.isValidSovereignAssetId)(candidate.sovereignAssetId)) {
        return false;
    }
    if (hasOwn(candidate, 'externalReference') && !isValidSovereignExternalReference(candidate.externalReference)) {
        return false;
    }
    return true;
}
/**
 * Exact structural equality of two external references. Two references
 * that share a namespace and id but differ in `locator` are NOT equal —
 * they are the same external thing at a different address, which is
 * precisely the distinction the sovereign model has to keep visible.
 * This compares references; it never decides that two references denote
 * the same real-world object.
 */
function sovereignExternalReferencesEqual(a, b) {
    return a.namespace === b.namespace && a.id === b.id && a.locator === b.locator;
}
/**
 * Narrows anything that already carries the canonical subject fields
 * (notably a `SovereignManifestV1`) to a bare `SovereignSubjectRef`, so a
 * consumer can pass "which sovereign subject this is" around without
 * carrying integrity material, claims, or manifest metadata with it.
 * `externalReference` is omitted structurally when absent, keeping the
 * result canonicalizable.
 */
function toSovereignSubjectRef(subject) {
    return {
        sovereignAssetId: subject.sovereignAssetId,
        ...(subject.externalReference === undefined ? {} : { externalReference: subject.externalReference }),
    };
}
