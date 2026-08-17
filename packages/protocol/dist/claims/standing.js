"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCanonicalStanding = validateCanonicalStanding;
exports.isValidCanonicalStanding = isValidCanonicalStanding;
const claim_enums_1 = require("./claim-enums");
const timestamps_1 = require("./timestamps");
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
function isNonBlankString(value) {
    return typeof value === 'string' && value.trim() !== '';
}
/**
 * Smallest structural validation for a `CanonicalStanding`.
 *
 * Introduced by SM-06 because a portability bundle carries standing records
 * across an external trust boundary and had no canonical runtime validator to
 * check them with. It lives here, beside the type it validates, rather than in
 * `@aoc/protocol/portability`: a second copy of the standing rules inside a
 * transport contract is exactly the kind of drift the claims layer owns this
 * type to prevent.
 *
 * It validates *shape*, and deliberately nothing else. It does not decide
 * whether the referenced claim exists, whether the standing is currently in
 * force at some instant, whether `expiresAt` is after `effectiveAt`, whether
 * the issuer of the standing had authority to record it, or who is right in the
 * dispute a `Contested` standing describes. Protocol records standing; it does
 * not adjudicate it, and a validator that started ordering timestamps would be
 * quietly deciding that a backdated correction is malformed.
 *
 * A present-but-`undefined` optional is reported as invalid rather than treated
 * as absent, matching the rest of the canonical contracts: `aoc-canonical-json/1`
 * refuses `undefined`, so such a record could never be canonicalized or signed.
 */
function validateCanonicalStanding(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return { valid: false, reasons: ['INVALID_STANDING_STRUCTURE'] };
    }
    const reasons = [];
    const candidate = value;
    if (!isNonBlankString(candidate.id))
        reasons.push('INVALID_STANDING_ID');
    if (!isNonBlankString(candidate.claimRef))
        reasons.push('INVALID_STANDING_CLAIM_REF');
    if (!Object.values(claim_enums_1.StandingStatus).includes(candidate.status)) {
        reasons.push('INVALID_STANDING_STATUS');
    }
    if (!(0, timestamps_1.isCanonicalTimestamp)(candidate.effectiveAt))
        reasons.push('INVALID_STANDING_EFFECTIVE_AT');
    if (hasOwn(candidate, 'reason') && !isNonBlankString(candidate.reason)) {
        reasons.push('INVALID_STANDING_REASON');
    }
    if (hasOwn(candidate, 'expiresAt') && !(0, timestamps_1.isCanonicalTimestamp)(candidate.expiresAt)) {
        reasons.push('INVALID_STANDING_EXPIRES_AT');
    }
    return { valid: reasons.length === 0, reasons };
}
function isValidCanonicalStanding(value) {
    return validateCanonicalStanding(value).valid;
}
