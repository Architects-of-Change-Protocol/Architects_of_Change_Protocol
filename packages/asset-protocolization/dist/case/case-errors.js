"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtocolizationCaseError = exports.PROTOCOLIZATION_CASE_ERROR_CODES = void 0;
/**
 * How a case operation fails.
 *
 * Same shape as `AssetProfileError`, and for the same reason: this repository
 * already has one convention for an operational failure — a real `Error` that
 * structurally satisfies `ProtocolError` (`code` + `message` + `details`) — and
 * a second error philosophy for the second slice of one package would be a
 * needless divergence. `message` and the JS stack are debugging aids;
 * `code` and `details` are the stable, reportable surface.
 *
 * Nothing downstream may parse `message`. The distinction that matters is the
 * one APV-03 drew for validation reasons and this keeps: presentation text
 * carries no machine semantics.
 */
exports.PROTOCOLIZATION_CASE_ERROR_CODES = Object.freeze({
    /** The case document failed `validateProtocolizationCase`. Carries `reasonCodes`. */
    invalidCase: 'PROTOCOLIZATION_CASE_INVALID',
    /** The acting tenant is missing or malformed. */
    invalidTenant: 'PROTOCOLIZATION_CASE_INVALID_TENANT',
    /** The acting tenant is not the case's tenant. */
    tenantMismatch: 'PROTOCOLIZATION_CASE_TENANT_MISMATCH',
    /** The catalogue holds no profile at this exact (profileId, profileVersion). */
    profileNotFound: 'PROTOCOLIZATION_CASE_PROFILE_NOT_FOUND',
    /** A supplied profile document is not the one the case is pinned to. */
    profileMismatch: 'PROTOCOLIZATION_CASE_PROFILE_MISMATCH',
    /** A requirement id is not declared by the pinned profile version. */
    unknownRequirement: 'PROTOCOLIZATION_CASE_UNKNOWN_REQUIREMENT',
    /** A material id already exists in this case. */
    duplicateMaterial: 'PROTOCOLIZATION_CASE_DUPLICATE_MATERIAL',
    /** The material is already associated with the requirement. */
    duplicateAssociation: 'PROTOCOLIZATION_CASE_DUPLICATE_ASSOCIATION',
    /** No material with this id exists in this case. */
    unknownMaterial: 'PROTOCOLIZATION_CASE_UNKNOWN_MATERIAL',
    /** The operation is not permitted from the case's current state. */
    invalidTransition: 'PROTOCOLIZATION_CASE_INVALID_TRANSITION',
    /** The clock returned a value that is not a canonical UTC instant, or moved backwards. */
    invalidTimestamp: 'PROTOCOLIZATION_CASE_INVALID_TIMESTAMP',
    /** No case with this (tenantId, caseId) exists. */
    caseNotFound: 'PROTOCOLIZATION_CASE_NOT_FOUND',
    /** A case with this (tenantId, caseId) already exists. */
    duplicateCase: 'PROTOCOLIZATION_CASE_ALREADY_EXISTS',
    /** The stored revision is not the one this write expected. */
    revisionConflict: 'PROTOCOLIZATION_CASE_REVISION_CONFLICT',
});
class ProtocolizationCaseError extends Error {
    constructor(code, message, details) {
        super(message);
        this.name = 'ProtocolizationCaseError';
        this.code = code;
        this.details = details;
    }
}
exports.ProtocolizationCaseError = ProtocolizationCaseError;
