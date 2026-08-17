"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDENTITY_SOVEREIGNTY_CAPABILITY_REASON_CODES = void 0;
exports.validateIdentitySovereigntyCapabilityInput = validateIdentitySovereigntyCapabilityInput;
exports.isValidIdentitySovereigntyCapabilityInput = isValidIdentitySovereigntyCapabilityInput;
exports.createIdentitySovereigntyCapabilityImplementation = createIdentitySovereigntyCapabilityImplementation;
const identity_1 = require("../../identity");
const manifest_1 = require("../../manifest");
const time_1 = require("../time");
const canonical_ref_1 = require("./canonical-ref");
/**
 * AOC.IDENTITY — the production Sovereignty Capability capsule that answers:
 *
 *   "Create a new canonical AOC sovereign identity for this registration
 *    action and return the canonical subject representation."
 *
 * It is the first of the canonical eight to become a real implementation of
 * the SM-03 `SovereigntyCapabilityImplementation` socket. It creates nothing
 * new underneath: `mintSovereignAssetId`, `buildSovereignManifestV1` and the
 * SM-02 subject/reference primitives already existed and are reused verbatim.
 * What SM-04 adds is that they are now reachable *through* the common
 * invocation contract, so a consumer receives a `SovereignSubjectRef`, a
 * canonical manifest and capability-attributed invocation evidence from one
 * socket rather than by hand-assembling primitives.
 *
 * ## What Identity is responsible for
 *
 * Minting a new `SovereignAssetId`; associating an optional open-world
 * external reference; binding an optional *precomputed* `ContentIdentity`;
 * recording the registrant; building the canonical unsigned manifest; and
 * returning the resulting subject.
 *
 * ## What Identity is emphatically not responsible for
 *
 * - **Ownership.** `registrant` records *who submitted this registration*, and
 *   is deliberately not `owner`/`legalOwner`. Nothing here asserts that the
 *   registrant owns, controls or has any legal right over the referenced
 *   external thing. Declared (and disputable) authority assertions are
 *   `AuthorityClaim`, which belongs to Provenance, not here.
 * - **Integrity.** It never calls `computeContentIdentity`. A `ContentIdentity`
 *   may be supplied, already computed, by AOC.INTEGRITY or by anything else;
 *   Identity binds it and does not recompute or verify it. This is what keeps
 *   Identity independently consumable over subjects that have no bytes at all.
 * - **Signing.** See `IdentitySovereigntyCapabilityOutput.manifest` below.
 * - **The external world.** `externalReference` is passive metadata: no fetch,
 *   no provider lookup, no chain RPC, no registry or storage resolution, and
 *   no interpretation of `namespace`, `id` or `locator`. A namespace nobody has
 *   invented yet is a first-class input.
 * - **Governance.** No policy, approval, grant, access decision, credential,
 *   price, quota or settlement — those are AOC Enterprise concerns and are
 *   absent by construction.
 *
 * ## One operation, deliberately
 *
 * SM-04 defines exactly one Identity operation: *create*. Resolve, rename,
 * rebind, merge, recover, supersede and transfer are real future Identity
 * lifecycle questions, and each needs its own semantics; overloading them into
 * this first production capsule would make an invocation's meaning ambiguous.
 */
/** Stable, machine-readable reason codes this capsule can report. */
exports.IDENTITY_SOVEREIGNTY_CAPABILITY_REASON_CODES = Object.freeze({
    /**
     * The invocation already named a sovereign subject. This operation *creates*
     * identity, so a second `SovereignAssetId` is never minted for a subject that
     * already exists — that would silently fork the subject rather than identify it.
     */
    subjectAlreadyExists: 'IDENTITY_SUBJECT_ALREADY_EXISTS',
    invalidInput: 'IDENTITY_INVALID_INPUT',
    invalidRegistrant: 'IDENTITY_INVALID_REGISTRANT',
    invalidExternalReference: 'IDENTITY_INVALID_EXTERNAL_REFERENCE',
    invalidContentIdentity: 'IDENTITY_INVALID_CONTENT_IDENTITY',
});
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
function isNonBlankString(value) {
    return typeof value === 'string' && value.trim() !== '';
}
/**
 * Smallest validation that keeps `SovereignManifestV1.registrant` truthful and
 * canonicalizable: `SovereignRegistrant` is `string | CanonicalPrincipalRef`,
 * so a non-blank string, or an object carrying a non-blank `id` and `kind`, is
 * accepted.
 *
 * Deliberately NOT checked: that `kind` is a member of `PrincipalKind` (a
 * future principal kind must stay expressible), nor anything about
 * `displayName`, `source` or `metadata`. `validateSovereignManifestV1` does not
 * validate the registrant at all today; SM-04 does not redesign the
 * claims/principal model to close that gap, and the registrant is passed
 * through verbatim rather than rebuilt so a caller's legitimate `source` and
 * `metadata` survive.
 */
function isValidSovereignRegistrant(value) {
    if (isNonBlankString(value))
        return true;
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return false;
    const candidate = value;
    return isNonBlankString(candidate.id) && isNonBlankString(candidate.kind);
}
/**
 * Validates the capability-specific Identity input, accumulating every reason
 * rather than reporting only the first.
 *
 * Nested Protocol values are checked with their existing canonical validators
 * (`isValidSovereignExternalReference`, `isValidContentIdentity`) rather than a
 * second copy of those rules. A present-but-`undefined` optional is rejected
 * rather than treated as absent, matching the rest of the sovereign contracts:
 * canonical JSON refuses `undefined`, so accepting it here would only defer the
 * failure to canonicalization.
 */
function validateIdentitySovereigntyCapabilityInput(value) {
    const codes = exports.IDENTITY_SOVEREIGNTY_CAPABILITY_REASON_CODES;
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return { valid: false, reasons: [codes.invalidInput] };
    }
    const reasons = [];
    const candidate = value;
    if (!isValidSovereignRegistrant(candidate.registrant)) {
        reasons.push(codes.invalidRegistrant);
    }
    if (hasOwn(candidate, 'externalReference') && !(0, identity_1.isValidSovereignExternalReference)(candidate.externalReference)) {
        reasons.push(codes.invalidExternalReference);
    }
    if (hasOwn(candidate, 'contentIdentity') && !(0, identity_1.isValidContentIdentity)(candidate.contentIdentity)) {
        reasons.push(codes.invalidContentIdentity);
    }
    return { valid: reasons.length === 0, reasons };
}
function isValidIdentitySovereigntyCapabilityInput(value) {
    return validateIdentitySovereigntyCapabilityInput(value).valid;
}
/**
 * Builds the production AOC.IDENTITY capsule.
 *
 * A factory rather than a constant because of the injectable clock, and
 * because constructing it performs no work at import time: this module
 * registers nothing, mutates nothing and reaches no global. There is no
 * implementation registry to register into — the capsule is passed explicitly
 * to `invokeSovereigntyCapability`, which is also the only supported way to
 * execute it. It exposes no second `execute()` entry point that would bypass
 * the common result and evidence semantics.
 */
function createIdentitySovereigntyCapabilityImplementation(options = {}) {
    const clock = options.clock ?? time_1.systemSovereigntyCapabilityClock;
    const capability = (0, canonical_ref_1.requireSovereigntyCapabilityRef)('identity');
    return Object.freeze({
        capability,
        async invoke(invocation) {
            // An expected semantic refusal, not an exception: the caller asked a
            // coherent question ("create identity for this subject") whose answer is
            // "that subject already has one".
            if (invocation.subject !== undefined) {
                return {
                    status: 'failed',
                    reasonCodes: [exports.IDENTITY_SOVEREIGNTY_CAPABILITY_REASON_CODES.subjectAlreadyExists],
                };
            }
            const validation = validateIdentitySovereigntyCapabilityInput(invocation.input);
            if (!validation.valid) {
                return { status: 'failed', reasonCodes: validation.reasons };
            }
            const input = invocation.input;
            // Past this point the input is valid, so `mintSovereignAssetId` and
            // `buildSovereignManifestV1` are expected to succeed. If one of them
            // throws anyway that is a programming or runtime fault, and it is
            // allowed to propagate: SM-03 turns it into a typed implementation
            // fault with sanitized evidence rather than a misleading ordinary
            // capability failure, and nothing is retried.
            const sovereignAssetId = (0, identity_1.mintSovereignAssetId)();
            const manifest = (0, manifest_1.buildSovereignManifestV1)({
                sovereignAssetId,
                // Rebuilt through the canonical builders so a caller cannot hang
                // extra, non-canonicalizable properties off a reference or a digest
                // and have them travel into the sovereign record. The values
                // themselves are copied verbatim, never trimmed or normalized.
                ...(input.externalReference === undefined
                    ? {}
                    : { externalReference: (0, identity_1.buildSovereignExternalReference)(input.externalReference) }),
                ...(input.contentIdentity === undefined
                    ? {}
                    : {
                        contentIdentity: {
                            algorithm: input.contentIdentity.algorithm,
                            digest: input.contentIdentity.digest,
                        },
                    }),
                registrant: input.registrant,
                // A newly created sovereign identity asserts no origin and no
                // authority. Provenance (SM-05) owns those, and auto-populating them
                // here would make Identity quietly become Provenance.
                authorityClaims: [],
                // `manifestVersion` and `state` are deliberately left to the
                // canonical manifest defaults (1 and Active).
            }, clock());
            const subject = Object.freeze((0, identity_1.toSovereignSubjectRef)(manifest));
            return {
                status: 'succeeded',
                output: Object.freeze({ subject, manifest }),
                // Stated explicitly so the SM-03 subject-precedence rule resolves the
                // common result and evidence onto the subject this invocation created.
                subject,
            };
        },
    });
}
