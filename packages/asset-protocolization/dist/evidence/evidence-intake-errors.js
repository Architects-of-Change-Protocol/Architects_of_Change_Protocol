"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceIntakeError = exports.EVIDENCE_INTAKE_ERROR_CODES = void 0;
/**
 * How an evidence intake fails.
 *
 * Same shape as `ProtocolizationCaseError` and `AssetProfileError` — a real
 * `Error` that structurally satisfies `ProtocolError` — because a third error
 * philosophy in the third slice of one package would be a needless divergence.
 * `code` and `details` are the stable machine surface; `message` is a debugging
 * aid and nothing downstream may parse it.
 *
 * ### Why this list is short
 *
 * Everything about the *case* is APV-04's to refuse, and intake delegates to it
 * rather than restating its rules. A cancelled case, an unknown requirement id,
 * a requirement id that only exists in a newer profile version, a duplicate
 * material id, a clock that moved backwards, a case whose invariants are
 * already broken — each of those already fails deterministically with a stable
 * `PROTOCOLIZATION_CASE_*` code, and re-spelling any of them here would create
 * two codes for one condition. What is left, and what this enumerates, is the
 * handful of failures that belong to the intake layer itself.
 *
 * There is deliberately no `EVIDENCE_INTAKE_CASE_NOT_FOUND`: the intake
 * operation is handed the case it operates on, so "no such case" is a
 * repository lookup failure and already spelled `PROTOCOLIZATION_CASE_NOT_FOUND`.
 */
exports.EVIDENCE_INTAKE_ERROR_CODES = Object.freeze({
    /** The submission failed structural admission. Carries `reasonCodes`. */
    invalidSubmission: 'EVIDENCE_INTAKE_SUBMISSION_INVALID',
    /** The acting tenant is missing or malformed. */
    invalidTenant: 'EVIDENCE_INTAKE_TENANT_REQUIRED',
    /** The acting tenant does not own the case, or the receipt being addressed. */
    tenantMismatch: 'EVIDENCE_INTAKE_TENANT_MISMATCH',
    /** The submission names a different case than the one being operated on. */
    caseMismatch: 'EVIDENCE_INTAKE_CASE_MISMATCH',
    /** A receipt with this (tenantId, intakeId) already exists. */
    duplicateIntake: 'EVIDENCE_INTAKE_DUPLICATE',
    /** This case already holds evidence material naming this canonical evidence. */
    duplicateEvidence: 'EVIDENCE_INTAKE_DUPLICATE_EVIDENCE',
    /** A receipt document failed `validateEvidenceIntakeReceipt`. Carries `reasonCodes`. */
    invalidReceipt: 'EVIDENCE_INTAKE_RECEIPT_INVALID',
});
class EvidenceIntakeError extends Error {
    constructor(code, message, details) {
        super(message);
        this.name = 'EvidenceIntakeError';
        this.code = code;
        this.details = details;
    }
}
exports.EvidenceIntakeError = EvidenceIntakeError;
