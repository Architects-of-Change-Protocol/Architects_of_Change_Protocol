"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeclarationError = exports.DECLARATION_ERROR_CODES = void 0;
/**
 * How recording a declaration fails.
 *
 * Same shape as `EvidenceIntakeError`, `ProtocolizationCaseError` and
 * `AssetProfileError` — a real `Error` that structurally satisfies
 * `ProtocolError` — because a fourth error philosophy in the fourth slice of
 * one package would be a needless divergence. `code` and `details` are the
 * stable machine surface; `message` is a debugging aid and nothing downstream
 * may parse it.
 *
 * ### Why this list is short
 *
 * Everything about the *case* is APV-04's to refuse, and this layer delegates
 * to it rather than restating its rules. A cancelled case, an unknown
 * requirement id, a requirement id that only exists in a newer profile version,
 * a duplicate material id, a clock that moved backwards, a case whose
 * invariants are already broken — each of those already fails deterministically
 * with a stable `PROTOCOLIZATION_CASE_*` code, and re-spelling any of them here
 * would create two codes for one condition.
 *
 * ### Why not one of these is an outcome
 *
 * Every code below names a *structural* refusal: a shape this workflow cannot
 * carry, or a correlation the pinned profile does not describe. There is no
 * code meaning the declaration was disbelieved, contradicted, unsupported,
 * unauthorized or rejected on its merits, because refusing a declaration on its
 * merits is an evaluation this slice does not perform. A structurally
 * admissible declaration is always recorded — including one that flatly
 * contradicts a declaration already in the case.
 */
exports.DECLARATION_ERROR_CODES = Object.freeze({
    /** The submission failed structural admission. Carries `reasonCodes`. */
    invalidSubmission: 'DECLARATION_SUBMISSION_INVALID',
    /** The acting tenant is missing or malformed. */
    invalidTenant: 'DECLARATION_TENANT_REQUIRED',
    /** The acting tenant does not own the case, or the record being addressed. */
    tenantMismatch: 'DECLARATION_TENANT_MISMATCH',
    /** The submission names a different case than the one being operated on. */
    caseMismatch: 'DECLARATION_CASE_MISMATCH',
    /** A record with this (tenantId, declarationId) already exists. */
    duplicateDeclaration: 'DECLARATION_DUPLICATE',
    /** This case already holds declaration material naming this canonical claim. */
    duplicateClaim: 'DECLARATION_DUPLICATE_CLAIM',
    /**
     * A correlated requirement of the pinned profile is not a declaration
     * requirement. A declaration may only be correlated to requirements APV-03
     * marks `AssetRequirementKind.Declaration`, because APV-04's correlation is
     * kind-blind and would otherwise report a claim reference as material for an
     * evidence, verification, attestation or identity requirement. Carries the
     * offending ids in `requirementIds`.
     */
    incompatibleRequirement: 'DECLARATION_REQUIREMENT_INCOMPATIBLE',
    /**
     * A correlated declaration requirement names a different `claimType`, or a
     * `claimSubtype` this submission does not carry. Carries `requirementIds`.
     */
    claimTypeMismatch: 'DECLARATION_CLAIM_TYPE_MISMATCH',
    /**
     * A supporting evidence reference is not evidence material in this case.
     *
     * Deliberately one code for "no such evidence here", whether the evidence
     * does not exist at all, exists in another case, or exists in another
     * tenant's case. Distinguishing them would answer a question the caller is
     * not entitled to ask.
     */
    unknownEvidenceLink: 'DECLARATION_EVIDENCE_LINK_UNKNOWN',
    /** A record document failed `validateProtocolizationDeclarationRecord`. Carries `reasonCodes`. */
    invalidRecord: 'DECLARATION_RECORD_INVALID',
});
class DeclarationError extends Error {
    constructor(code, message, details) {
        super(message);
        this.name = 'DeclarationError';
        this.code = code;
        this.details = details;
    }
}
exports.DeclarationError = DeclarationError;
