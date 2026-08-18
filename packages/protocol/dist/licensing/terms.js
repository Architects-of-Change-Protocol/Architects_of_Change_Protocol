"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOVEREIGN_LICENSE_TERMS_RULE_EFFECTS = exports.SovereignLicenseTermsRuleEffect = exports.SOVEREIGN_LICENSE_TERMS_AUDIENCE_KINDS = exports.SovereignLicenseTermsAudienceKind = exports.SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION = void 0;
/**
 * `SovereignLicenseTermsV1` — the structured, portable terms document a
 * licensing declaration carries.
 *
 * ## What a terms document is
 *
 * A machine-readable record of what an issuer *declares* over a sovereign
 * subject: whom the declaration addresses, and a list of permission,
 * restriction and obligation clauses over semantic action concepts. That is
 * the whole model.
 *
 * ## What it is not
 *
 *     declared permission   != runtime authorization
 *     declared restriction  != enforced denial
 *     declared obligation   != proof of compliance
 *     signed terms          != legal validity
 *     issuer                != proven rights holder
 *     terms                 != ownership transfer
 *     terms                 != policy decision
 *     terms                 != access grant
 *     terms                 != DRM
 *
 * Nothing in this module evaluates, decides, resolves, enforces, meters,
 * prices or settles anything. There is no condition language, no operator, no
 * expression tree, no precedence rule and no "current terms" resolver: a
 * consuming governance system reads these declarations and reaches its own
 * conclusions, which is precisely the boundary AOC Protocol keeps.
 *
 * ## Why the version is its own field
 *
 * `schemaVersion` versions the *terms document* and nothing else. It is
 * independent of the `@aoc/protocol` package version, the AOC.LICENSING_TERMS
 * capability version, the claim id, the manifest version and the portability
 * bundle schema — those five change for five different reasons, and a
 * consumer reading terms off the wire needs to know which of them it is
 * looking at.
 */
exports.SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION = 'aoc-sovereign-license-terms/1';
/**
 * Whom a terms document addresses.
 *
 * A closed union for v1. Terms nobody is addressed to are not terms, so the
 * audience is required rather than defaulted — an implicit "everyone" would be
 * Protocol inventing the most consequential clause in the document.
 */
exports.SovereignLicenseTermsAudienceKind = {
    /**
     * A general/public audience.
     *
     * This says who the declaration is *addressed to* and nothing more. It does
     * **not** mean public domain, CC0, free, out of copyright, attribution-free
     * or commercially unrestricted. A `Public` audience with a
     * `Restriction`/`CommercialUse` rule is an ordinary, coherent document, and
     * no reader may infer permissions from the audience alone.
     */
    Public: 'Public',
    /** A specific principal, named through the existing canonical issuer/principal conventions. */
    Principal: 'Principal',
    /** An issuer-defined audience, carried opaquely and never resolved. */
    Custom: 'Custom',
};
/** Every canonical audience kind, in a stable order, for validation and discovery. */
exports.SOVEREIGN_LICENSE_TERMS_AUDIENCE_KINDS = Object.freeze(Object.values(exports.SovereignLicenseTermsAudienceKind));
/**
 * What a clause declares.
 *
 * Closed for v1, and deliberately *not* `Allow`/`Deny`. Those words name the
 * output of a runtime decision, and a vocabulary that used them would invite
 * every reader to treat a stored declaration as an evaluated verdict. A
 * `Permission` rule issues no grant, a `Restriction` rule blocks nothing, and
 * an `Obligation` rule proves no compliance.
 */
exports.SovereignLicenseTermsRuleEffect = {
    /** The issuer declares the action permitted under these terms. Not a grant. */
    Permission: 'Permission',
    /** The issuer declares the action restricted under these terms. Not an enforced denial. */
    Restriction: 'Restriction',
    /** The issuer declares the action required under these terms. Not evidence it happened. */
    Obligation: 'Obligation',
};
/** Every canonical effect, in a stable order, for validation and discovery. */
exports.SOVEREIGN_LICENSE_TERMS_RULE_EFFECTS = Object.freeze(Object.values(exports.SovereignLicenseTermsRuleEffect));
