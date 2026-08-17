"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTEGRITY_SOVEREIGNTY_CAPABILITY_OPERATIONS = exports.INTEGRITY_SOVEREIGNTY_CAPABILITY_REASON_CODES = void 0;
exports.validateIntegritySovereigntyCapabilityInput = validateIntegritySovereigntyCapabilityInput;
exports.isValidIntegritySovereigntyCapabilityInput = isValidIntegritySovereigntyCapabilityInput;
exports.createIntegritySovereigntyCapabilityImplementation = createIntegritySovereigntyCapabilityImplementation;
const identity_1 = require("../../identity");
const manifest_1 = require("../../manifest");
const canonical_ref_1 = require("./canonical-ref");
/**
 * AOC.INTEGRITY — the production Sovereignty Capability capsule that answers:
 *
 *   "What exact integrity commitment applies to this representation, and does
 *    a representation match a declared commitment?"
 *
 * It is a wrapper over the repository's existing integrity primitives and
 * introduces no new hashing semantics: `computeContentIdentity` remains
 * SHA-256 over the exact bytes, `verifyContentIdentity` remains the explicit
 * comparison, and `computeManifestDigest` remains SHA-256 over the
 * `aoc-canonical-json/1` representation of a manifest. There is no second
 * digest implementation and no second content-hash meaning.
 *
 * ## Independent of identity, location and everything operational
 *
 * Integrity needs no `SovereignAssetId`, no subject, no provider, no locator
 * and no storage: it measures the representation it is handed. The invocation
 * may carry a subject as attribution/context, and that subject can never
 * influence a digest — same bytes under different subjects produce the same
 * `ContentIdentity`, which is exactly why identity and integrity stay
 * separable. This capsule never mints a `SovereignAssetId` and never returns a
 * subject of its own.
 *
 * ## Where the boundary with Verifiability runs
 *
 * `computeManifestDigest` belongs here because it answers "what is the
 * canonical digest of this manifest?". It does **not** answer "was this
 * manifest signed by the right principal?" — signature checking, issuer
 * binding, public-key resolution and proof-payload validation are
 * AOC.VERIFIABILITY, and none of them happen in this file.
 *
 * Generic canonicalization is likewise not exposed as an operation: an
 * `canonicalize-any-json` operation would broaden Integrity into
 * Interoperability's contract. `computeManifestDigest` uses canonicalization
 * internally, which is not the same as offering it.
 */
/** Stable, machine-readable reason codes this capsule can report. */
exports.INTEGRITY_SOVEREIGNTY_CAPABILITY_REASON_CODES = Object.freeze({
    invalidInput: 'INTEGRITY_INVALID_INPUT',
    unsupportedOperation: 'INTEGRITY_UNSUPPORTED_OPERATION',
    invalidBytes: 'INTEGRITY_INVALID_BYTES',
    invalidExpectedContentIdentity: 'INTEGRITY_INVALID_EXPECTED_CONTENT_IDENTITY',
    invalidManifest: 'INTEGRITY_INVALID_MANIFEST',
});
/**
 * The operations AOC.INTEGRITY 1.0.0 supports. The set is closed for this
 * capability version: adding one later is a capability-contract change, and an
 * unrecognized operation is reported rather than guessed at.
 */
exports.INTEGRITY_SOVEREIGNTY_CAPABILITY_OPERATIONS = Object.freeze([
    'compute-content-identity',
    'verify-content-identity',
    'compute-manifest-digest',
]);
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
/**
 * `Uint8Array` and its subclasses (a Node `Buffer` is one) are accepted; an
 * `ArrayBuffer`, a string, a number array and a detached view are not, because
 * silently coercing any of them would change which bytes were actually
 * measured.
 */
function isByteSource(value) {
    return value instanceof Uint8Array;
}
/**
 * Enough structure for `validateSovereignManifestV1` to be safe to call: it
 * iterates `authorityClaims` and reads nested claim fields directly, so a
 * non-object or a manifest missing that array would throw a `TypeError` out of
 * a validator instead of being reported as invalid input.
 */
function isManifestShaped(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return false;
    return Array.isArray(value.authorityClaims);
}
/**
 * Validates the capability-specific Integrity input.
 *
 * Nested Protocol values reuse their existing canonical validators
 * (`isValidContentIdentity`, `validateSovereignManifestV1`) rather than a
 * second copy of those rules.
 */
function validateIntegritySovereigntyCapabilityInput(value) {
    const codes = exports.INTEGRITY_SOVEREIGNTY_CAPABILITY_REASON_CODES;
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return { valid: false, reasons: [codes.invalidInput] };
    }
    const candidate = value;
    const operation = candidate.operation;
    if (typeof operation !== 'string'
        || !exports.INTEGRITY_SOVEREIGNTY_CAPABILITY_OPERATIONS.includes(operation)) {
        return { valid: false, reasons: [codes.unsupportedOperation] };
    }
    const reasons = [];
    if (operation === 'compute-content-identity' || operation === 'verify-content-identity') {
        if (!isByteSource(candidate.bytes)) {
            reasons.push(codes.invalidBytes);
        }
    }
    if (operation === 'verify-content-identity' && !(0, identity_1.isValidContentIdentity)(candidate.expected)) {
        reasons.push(codes.invalidExpectedContentIdentity);
    }
    if (operation === 'compute-manifest-digest') {
        if (!isManifestShaped(candidate.manifest) || !(0, manifest_1.validateSovereignManifestV1)(candidate.manifest).valid) {
            reasons.push(codes.invalidManifest);
        }
    }
    return { valid: reasons.length === 0, reasons };
}
function isValidIntegritySovereigntyCapabilityInput(value) {
    return validateIntegritySovereigntyCapabilityInput(value).valid;
}
/**
 * Builds the production AOC.INTEGRITY capsule.
 *
 * Stateless — it holds no configuration and needs no dependency injection —
 * but exposed as a factory for symmetry with the Identity capsule and so that
 * importing this module performs no work: nothing is registered, nothing is
 * mutated, no global is touched. Execution goes through
 * `invokeSovereigntyCapability` and nowhere else.
 */
function createIntegritySovereigntyCapabilityImplementation() {
    const capability = (0, canonical_ref_1.requireSovereigntyCapabilityRef)('integrity');
    return Object.freeze({
        capability,
        async invoke(invocation) {
            const validation = validateIntegritySovereigntyCapabilityInput(invocation.input);
            if (!validation.valid) {
                return { status: 'failed', reasonCodes: validation.reasons };
            }
            const input = invocation.input;
            switch (input.operation) {
                case 'compute-content-identity':
                    return {
                        status: 'succeeded',
                        output: Object.freeze({
                            operation: 'compute-content-identity',
                            // The caller's array is handed to the primitive untouched: not
                            // frozen, not cloned, not canonicalized, not re-encoded.
                            contentIdentity: (0, identity_1.computeContentIdentity)(input.bytes),
                        }),
                        // No subject: measuring a representation does not create sovereign
                        // identity, and SM-03 then leaves the invocation's own subject (if
                        // any) in place without this capsule asserting one.
                    };
                case 'verify-content-identity': {
                    // A mismatch is a *successful verification with a negative result*,
                    // not a failed execution. The caller asked "do these bytes match this
                    // commitment?"; "no" is a correct answer, correctly produced.
                    // Reporting it as `status: 'failed'` would conflate "the Integrity
                    // capability did not run properly" with "the integrity assertion does
                    // not hold", and would make the two indistinguishable in evidence.
                    const check = (0, identity_1.verifyContentIdentity)(input.bytes, input.expected);
                    return {
                        status: 'succeeded',
                        output: Object.freeze({
                            operation: 'verify-content-identity',
                            check: Object.freeze({
                                valid: check.valid,
                                ...(check.reason === undefined ? {} : { reason: check.reason }),
                            }),
                        }),
                    };
                }
                case 'compute-manifest-digest':
                    return {
                        status: 'succeeded',
                        output: Object.freeze({
                            operation: 'compute-manifest-digest',
                            manifestDigest: (0, manifest_1.computeManifestDigest)(input.manifest),
                        }),
                    };
            }
        },
    });
}
