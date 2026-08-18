"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROTOCOLIZATION_IDENTIFIER_MAX_LENGTH = void 0;
exports.isProtocolizationInstanceIdentifier = isProtocolizationInstanceIdentifier;
exports.isValidProtocolizationCaseId = isValidProtocolizationCaseId;
exports.isValidProtocolizationMaterialId = isValidProtocolizationMaterialId;
exports.isValidProtocolizationTenantId = isValidProtocolizationTenantId;
exports.isValidProtocolizationProfileRef = isValidProtocolizationProfileRef;
exports.protocolizationProfileRefsEqual = protocolizationProfileRefsEqual;
const identifiers_1 = require("../identifiers");
/** Shared upper bound with APV-03's identifiers — same rationale, same limit. */
exports.PROTOCOLIZATION_IDENTIFIER_MAX_LENGTH = identifiers_1.ASSET_IDENTIFIER_MAX_LENGTH;
/**
 * One or more of `A-Za-z0-9`, `.`, `_`, `:` and `-`, starting with an
 * alphanumeric.
 *
 * Wide enough for a bare UUID, an `aoc:sovereign-asset:<uuid>`-shaped token and
 * a dotted token; narrow enough that an identifier can never carry whitespace,
 * a control character, a path separator or a quote into a log line, a file
 * name or an audit payload. Mixed case is admitted and never normalized —
 * folding an opaque identifier would merge two distinct cases.
 */
const INSTANCE_IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;
/**
 * Whitespace and the C0/C1 control ranges. A tenant id carrying one of these
 * would be unsafe to put in a log line or an audit payload even though the
 * value itself is opaque to this package.
 */
const UNSAFE_IDENTIFIER_CHARACTERS = /[\s\u0000-\u001f\u007f-\u009f]/;
/**
 * Exported for reuse *inside* this package only — it is not part of the package
 * facade. APV-05 mints an evidence-intake id per intake operation, which is the
 * same *instance* identifier kind as a case id or a material id, so it must
 * satisfy this grammar rather than a second one that happens to look like it.
 */
function isProtocolizationInstanceIdentifier(value) {
    return (typeof value === 'string' &&
        value.length <= exports.PROTOCOLIZATION_IDENTIFIER_MAX_LENGTH &&
        INSTANCE_IDENTIFIER_PATTERN.test(value));
}
function isValidProtocolizationCaseId(value) {
    return isProtocolizationInstanceIdentifier(value);
}
function isValidProtocolizationMaterialId(value) {
    return isProtocolizationInstanceIdentifier(value);
}
/**
 * Deliberately more permissive than a case id.
 *
 * A case id and a material id are minted by this vertical, so it may impose a
 * grammar on them. A tenant id is minted somewhere else — an identity provider,
 * a control plane, a customer record — and Protocol places no grammar on
 * `CanonicalId` at all. Inventing one here would reject legitimate tenants for
 * a cosmetic reason, so this checks only what the vertical actually needs:
 * present, non-blank, bounded, and free of the whitespace and control
 * characters that would make it unsafe to carry. The value is never trimmed —
 * the same reason `validateSovereignExternalReference` rejects blanks instead
 * of rewriting them.
 */
function isValidProtocolizationTenantId(value) {
    return (typeof value === 'string' &&
        value !== '' &&
        value.length <= exports.PROTOCOLIZATION_IDENTIFIER_MAX_LENGTH &&
        !UNSAFE_IDENTIFIER_CHARACTERS.test(value));
}
const PROFILE_REF_KEYS = ['profileId', 'profileVersion'];
function isValidProtocolizationProfileRef(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return false;
    const candidate = value;
    for (const key of Object.keys(candidate)) {
        if (!PROFILE_REF_KEYS.includes(key))
            return false;
    }
    return (0, identifiers_1.isValidAssetProfileId)(candidate.profileId) && (0, identifiers_1.isValidAssetProfileVersion)(candidate.profileVersion);
}
/**
 * Exact equality of two pins. There is deliberately no "compatible with" or
 * "supersedes" comparison: a case pinned to `1.0.0` is never satisfied by
 * `1.0.1`, and offering a looser comparison would be exactly the silent
 * semantic migration that pinning exists to prevent.
 */
function protocolizationProfileRefsEqual(left, right) {
    return left.profileId === right.profileId && left.profileVersion === right.profileVersion;
}
