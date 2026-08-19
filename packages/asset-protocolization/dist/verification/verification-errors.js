"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationError = exports.VERIFICATION_ERROR_CODES = void 0;
/**
 * How verification execution fails.
 *
 * Same shape as `DeclarationError`, `EvidenceIntakeError`,
 * `ProtocolizationCaseError` and `AssetProfileError` — a real `Error` that
 * structurally satisfies `ProtocolError` — because a fifth error philosophy in
 * the fifth slice of one package would be a needless divergence. `code` and
 * `details` are the stable machine surface; `message` is a debugging aid and
 * nothing downstream may parse it.
 *
 * ### An outcome is never an error
 *
 * This is the distinction that matters most here, and it is worth stating
 * before the list rather than after it:
 *
 * ```text
 * Fail          a check ran and found a problem            -> result, not error
 * Warning       a check ran and found a concern            -> result, not error
 * ManualReview  a check ran and declined to conclude       -> result, not error
 * Unavailable   a check ran and could not obtain an input  -> result, not error
 *
 * not declared  the profile does not ask for this check    -> error
 * not registered no implementation exists for this check   -> error
 * cancelled     the case accepts no further execution      -> error
 * incompatible  the requirement is not a Verification one  -> error
 * ```
 *
 * Every code below names a *structural or configuration* refusal: something the
 * engine was asked to do that is not a coherent request. None of them means a
 * check disbelieved anything, and there is deliberately no code meaning
 * "verification failed" — that is an outcome, and it comes back as a result.
 *
 * ### Why this list is short
 *
 * Everything about the *case* is APV-04's to refuse, and this layer delegates
 * rather than restating: an unknown requirement id, a case whose invariants are
 * broken, a withdrawn profile version and a clock that moved backwards each
 * already fail deterministically with a stable `PROTOCOLIZATION_CASE_*` code,
 * and re-spelling any of them here would create two codes for one condition.
 */
exports.VERIFICATION_ERROR_CODES = Object.freeze({
    /** The execution request failed structural admission. Carries `reasonCodes`. */
    invalidRequest: 'VERIFICATION_REQUEST_INVALID',
    /** The acting tenant is missing or malformed. */
    invalidTenant: 'VERIFICATION_TENANT_REQUIRED',
    /**
     * The acting tenant does not own the case, or does not own an input the
     * caller supplied alongside it.
     *
     * Deliberately one code whether the offending value is the case, a receipt or
     * a declaration record: distinguishing them would let a caller probe which of
     * another tenant's identifiers exist.
     */
    tenantMismatch: 'VERIFICATION_TENANT_MISMATCH',
    /** The request names a different case than the one being operated on. */
    caseMismatch: 'VERIFICATION_CASE_MISMATCH',
    /** The case is `Cancelled` and accepts no further verification execution. */
    caseCancelled: 'VERIFICATION_CASE_CANCELLED',
    /**
     * The named requirement of the pinned profile is not of kind
     * `AssetRequirementKind.Verification`.
     *
     * A verification execution may only be correlated to a verification
     * requirement. Running one against an Identity, Declaration, Evidence or
     * Attestation requirement would report a check result as progress on a
     * requirement the profile says is answered by something else entirely — the
     * exact class of defect APV-06's targeted audit found in kind-blind
     * correlation. Carries the offending id in `requirementIds`.
     */
    incompatibleRequirement: 'VERIFICATION_REQUIREMENT_INCOMPATIBLE',
    /**
     * The pinned profile's verification requirement does not declare this
     * `checkId`.
     *
     * Knowing that a check is registered is worth nothing: what a case may execute
     * is what *its exact pinned profile version* asked for, against the
     * requirement that asked for it. A check declared only by a later profile
     * version, or only by a different requirement, fails here.
     */
    checkNotDeclared: 'VERIFICATION_CHECK_NOT_DECLARED',
    /**
     * The pinned profile declares this `checkId` and no implementation is
     * registered for it.
     *
     * A deterministic configuration failure, deliberately **not** an `Unavailable`
     * result. `Unavailable` means a known check could not obtain an input; a
     * missing implementation means the deployment cannot perform a check its own
     * profile demands, and recording that as an ordinary outcome would let a
     * mis-deployed system look like a working one with a flaky dependency.
     */
    checkNotRegistered: 'VERIFICATION_CHECK_NOT_REGISTERED',
    /** A check id was registered twice, or is malformed. Carries `checkId`. */
    checkRegistrationInvalid: 'VERIFICATION_CHECK_REGISTRATION_INVALID',
    /**
     * A verification requirement of the pinned profile lists the same `checkId`
     * more than once.
     *
     * Profile validation rejects this shape, so reaching it means a reconstructed
     * or corrupted profile document. Executing the duplicate silently would
     * produce two results whose only difference is an identifier, so it fails
     * loudly instead.
     */
    duplicateDeclaredCheck: 'VERIFICATION_CHECK_DECLARED_TWICE',
    /** An executor returned something this engine will not store. Carries `reasonCodes`. */
    invalidExecution: 'VERIFICATION_CHECK_EXECUTION_INVALID',
    /** A result document failed `validateProtocolizationVerificationResult`. Carries `reasonCodes`. */
    invalidResult: 'VERIFICATION_RESULT_INVALID',
    /** A result with this (tenantId, executionId) already exists. */
    duplicateResult: 'VERIFICATION_RESULT_DUPLICATE',
    /** The injected clock returned a non-canonical instant. */
    invalidTimestamp: 'VERIFICATION_TIMESTAMP_INVALID',
});
class VerificationError extends Error {
    constructor(code, message, details) {
        super(message);
        this.name = 'VerificationError';
        this.code = code;
        this.details = details;
    }
}
exports.VerificationError = VerificationError;
