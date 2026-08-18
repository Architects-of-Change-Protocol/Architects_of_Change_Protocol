import { type LicensingTermsReasonCode } from './reason-codes';
import { type SovereignLicenseActionRef, type SovereignLicenseTermsAudience, type SovereignLicenseTermsRuleEffect, type SovereignLicenseTermsRuleV1, type SovereignLicenseTermsV1 } from './terms';
/** Validates one audience variant, closed to exactly its own keys. */
export declare function validateSovereignLicenseTermsAudience(value: unknown): boolean;
export declare function isValidSovereignLicenseTermsAudience(value: unknown): value is SovereignLicenseTermsAudience;
export declare function isValidSovereignLicenseTermsRuleEffect(value: unknown): value is SovereignLicenseTermsRuleEffect;
/**
 * Validates an action reference, returning the reasons rather than a boolean so
 * "this is not an action reference at all" stays distinguishable from "this is
 * a well-formed reference to a Protocol concept that does not exist".
 *
 * Outside `aoc.licensing`, any non-blank namespace and term is accepted
 * opaquely and is never dereferenced. Inside it, the term must be one of this
 * version's canonical action concepts.
 */
export declare function validateSovereignLicenseActionRef(value: unknown): readonly LicensingTermsReasonCode[];
export declare function isValidSovereignLicenseActionRef(value: unknown): value is SovereignLicenseActionRef;
/** Validates one rule clause, closed to exactly its four keys. */
export declare function validateSovereignLicenseTermsRuleV1(value: unknown): readonly LicensingTermsReasonCode[];
export declare function isValidSovereignLicenseTermsRuleV1(value: unknown): value is SovereignLicenseTermsRuleV1;
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
export declare function validateSovereignLicenseTermsV1(value: unknown): readonly LicensingTermsReasonCode[];
export declare function isValidSovereignLicenseTermsV1(value: unknown): value is SovereignLicenseTermsV1;
//# sourceMappingURL=validation.d.ts.map