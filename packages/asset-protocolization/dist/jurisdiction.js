"use strict";
/**
 * Jurisdiction context for the profile framework.
 *
 * This is deliberately the smallest structure that lets a later profile say
 * "this requirement applies within jurisdiction X". It is **not** a legal-rules
 * engine, not an ontology, and not a claim that anything is lawful anywhere:
 * the code is an opaque token this package validates structurally and never
 * interprets, resolves, or reasons about. Legal requirements are established
 * only in the later, citation-bearing work packages, never here.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GLOBAL_JURISDICTION_CODE = void 0;
exports.isValidJurisdictionCode = isValidJurisdictionCode;
exports.isValidJurisdictionRef = isValidJurisdictionRef;
exports.jurisdictionRefsEqual = jurisdictionRefsEqual;
/**
 * Uppercase, hyphen-separated token — `CR`, `US-CA`, `EU`, `GLOBAL`, `NONE`.
 *
 * The grammar is a superset of ISO-3166 alpha-2 and alpha-2 + subdivision, but
 * conformance to any external standard is *not* checked: an unknown or future
 * jurisdiction token must remain expressible without a code change, exactly as
 * `SovereignExternalReference.namespace` keeps external namespaces open-world.
 */
const JURISDICTION_CODE_PATTERN = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*$/;
const JURISDICTION_CODE_MAX_LENGTH = 32;
/**
 * The conventional wildcard: a profile scoped to `GLOBAL` places no
 * jurisdictional restriction on its requirements.
 *
 * This constant exists so the one place that needs the convention —
 * profile/requirement scope consistency in `profile-validation.ts` — can name
 * it instead of hard-coding a string. Nothing else in the framework branches on
 * a jurisdiction value.
 */
exports.GLOBAL_JURISDICTION_CODE = 'GLOBAL';
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
function isValidJurisdictionCode(value) {
    return (typeof value === 'string' &&
        value.length <= JURISDICTION_CODE_MAX_LENGTH &&
        JURISDICTION_CODE_PATTERN.test(value));
}
/**
 * Structural check only. A present-but-`undefined` `label` is invalid rather
 * than absent, matching the canonical contracts: `aoc-canonical-json/1` refuses
 * `undefined`, so an absent optional must be structurally omitted.
 */
function isValidJurisdictionRef(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return false;
    const candidate = value;
    for (const key of Object.keys(candidate)) {
        if (key !== 'code' && key !== 'label')
            return false;
    }
    if (!isValidJurisdictionCode(candidate.code))
        return false;
    if (hasOwn(candidate, 'label') && (typeof candidate.label !== 'string' || candidate.label.trim() === '')) {
        return false;
    }
    return true;
}
function jurisdictionRefsEqual(left, right) {
    return left.code === right.code;
}
