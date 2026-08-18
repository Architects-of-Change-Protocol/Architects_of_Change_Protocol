import type { ProtocolError } from '@aoc/protocol/errors';
import type { ProtocolizationCaseId, ProtocolizationMaterialId, ProtocolizationProfileRef, ProtocolizationTenantId } from './case-identifiers';
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
export declare const PROTOCOLIZATION_CASE_ERROR_CODES: Readonly<{
    /** The case document failed `validateProtocolizationCase`. Carries `reasonCodes`. */
    readonly invalidCase: "PROTOCOLIZATION_CASE_INVALID";
    /** The acting tenant is missing or malformed. */
    readonly invalidTenant: "PROTOCOLIZATION_CASE_INVALID_TENANT";
    /** The acting tenant is not the case's tenant. */
    readonly tenantMismatch: "PROTOCOLIZATION_CASE_TENANT_MISMATCH";
    /** The catalogue holds no profile at this exact (profileId, profileVersion). */
    readonly profileNotFound: "PROTOCOLIZATION_CASE_PROFILE_NOT_FOUND";
    /** A supplied profile document is not the one the case is pinned to. */
    readonly profileMismatch: "PROTOCOLIZATION_CASE_PROFILE_MISMATCH";
    /** A requirement id is not declared by the pinned profile version. */
    readonly unknownRequirement: "PROTOCOLIZATION_CASE_UNKNOWN_REQUIREMENT";
    /** A material id already exists in this case. */
    readonly duplicateMaterial: "PROTOCOLIZATION_CASE_DUPLICATE_MATERIAL";
    /** The material is already associated with the requirement. */
    readonly duplicateAssociation: "PROTOCOLIZATION_CASE_DUPLICATE_ASSOCIATION";
    /** No material with this id exists in this case. */
    readonly unknownMaterial: "PROTOCOLIZATION_CASE_UNKNOWN_MATERIAL";
    /** The operation is not permitted from the case's current state. */
    readonly invalidTransition: "PROTOCOLIZATION_CASE_INVALID_TRANSITION";
    /** The clock returned a value that is not a canonical UTC instant, or moved backwards. */
    readonly invalidTimestamp: "PROTOCOLIZATION_CASE_INVALID_TIMESTAMP";
    /** No case with this (tenantId, caseId) exists. */
    readonly caseNotFound: "PROTOCOLIZATION_CASE_NOT_FOUND";
    /** A case with this (tenantId, caseId) already exists. */
    readonly duplicateCase: "PROTOCOLIZATION_CASE_ALREADY_EXISTS";
    /** The stored revision is not the one this write expected. */
    readonly revisionConflict: "PROTOCOLIZATION_CASE_REVISION_CONFLICT";
}>;
export type ProtocolizationCaseErrorCode = (typeof PROTOCOLIZATION_CASE_ERROR_CODES)[keyof typeof PROTOCOLIZATION_CASE_ERROR_CODES];
/**
 * A type alias rather than an interface so TypeScript infers the implicit index
 * signature `ProtocolError.details` requires — the same reason
 * `AssetProfileErrorDetails` is one.
 */
export type ProtocolizationCaseErrorDetails = {
    readonly reasonCodes: readonly string[];
    readonly caseId?: ProtocolizationCaseId;
    readonly tenantId?: ProtocolizationTenantId;
    readonly profile?: ProtocolizationProfileRef;
    readonly requirementIds?: readonly string[];
    readonly materialId?: ProtocolizationMaterialId;
    readonly fromState?: string;
    readonly toState?: string;
    readonly expectedRevision?: number;
    readonly actualRevision?: number;
};
export declare class ProtocolizationCaseError extends Error implements ProtocolError {
    readonly code: ProtocolizationCaseErrorCode;
    readonly details: ProtocolizationCaseErrorDetails;
    constructor(code: ProtocolizationCaseErrorCode, message: string, details: ProtocolizationCaseErrorDetails);
}
//# sourceMappingURL=case-errors.d.ts.map