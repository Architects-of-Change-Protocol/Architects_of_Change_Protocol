import type { AssetProfile } from '../profile';
import type { ProtocolizationCase } from './protocolization-case';
/**
 * Structural and cross-field validation for a `ProtocolizationCase`.
 *
 * Follows APV-03's validator contract exactly — `{ valid, reasons, issues }`
 * with stable SCREAMING_SNAKE codes, shape only, fail-closed, and a
 * present-but-`undefined` optional treated as invalid rather than absent — so a
 * consumer that already handles `AssetProfileValidationResult` handles this
 * without learning a second convention.
 *
 * It exists because a persisted aggregate comes back as untrusted data.
 * "It was once internal" is not an integrity guarantee: a case can be
 * hand-edited in a store, truncated by a failed write, or produced by an older
 * version of this package, and letting arbitrary JSON become a trusted
 * aggregate would put every invariant the operations enforce at the mercy of
 * whatever the store happened to return.
 *
 * The profile is optional and additive. Without it this validates everything
 * that is true of a case on its own; with it, it additionally checks that every
 * requirement the case references is declared by the exact pinned profile
 * version.
 */
export declare const PROTOCOLIZATION_CASE_VALIDATION_CODES: Readonly<{
    readonly invalidStructure: "INVALID_CASE_STRUCTURE";
    readonly unsupportedSchemaVersion: "UNSUPPORTED_CASE_SCHEMA_VERSION";
    readonly unknownCaseField: "UNKNOWN_CASE_FIELD";
    readonly invalidCaseId: "INVALID_CASE_ID";
    readonly invalidTenantId: "INVALID_CASE_TENANT_ID";
    readonly invalidProfileRef: "INVALID_CASE_PROFILE_REF";
    readonly invalidSubject: "INVALID_CASE_SUBJECT";
    readonly invalidState: "INVALID_CASE_STATE";
    readonly invalidRevision: "INVALID_CASE_REVISION";
    readonly invalidCreatedAt: "INVALID_CASE_CREATED_AT";
    readonly invalidUpdatedAt: "INVALID_CASE_UPDATED_AT";
    readonly updatedBeforeCreated: "CASE_UPDATED_BEFORE_CREATED";
    readonly invalidActivatedAt: "INVALID_CASE_ACTIVATED_AT";
    readonly unexpectedActivatedAt: "UNEXPECTED_CASE_ACTIVATED_AT";
    readonly invalidCancelledAt: "INVALID_CASE_CANCELLED_AT";
    readonly missingCancelledAt: "MISSING_CASE_CANCELLED_AT";
    readonly unexpectedCancelledAt: "UNEXPECTED_CASE_CANCELLED_AT";
    readonly invalidCancellationReason: "INVALID_CASE_CANCELLATION_REASON";
    readonly unexpectedCancellationReason: "UNEXPECTED_CASE_CANCELLATION_REASON";
    readonly invalidCorrelationId: "INVALID_CASE_CORRELATION_ID";
    readonly invalidRequirementStates: "INVALID_CASE_REQUIREMENT_STATES";
    readonly invalidRequirementState: "INVALID_CASE_REQUIREMENT_STATE";
    readonly duplicateRequirementStateId: "DUPLICATE_CASE_REQUIREMENT_STATE_ID";
    readonly requirementStatusMismatch: "CASE_REQUIREMENT_STATUS_MISMATCH";
    readonly requirementStateMaterialUnknown: "CASE_REQUIREMENT_STATE_MATERIAL_UNKNOWN";
    readonly requirementStateMaterialNotCorrelated: "CASE_REQUIREMENT_STATE_MATERIAL_NOT_CORRELATED";
    readonly invalidMaterials: "INVALID_CASE_MATERIALS";
    readonly invalidMaterial: "INVALID_CASE_MATERIAL";
    readonly duplicateMaterialId: "DUPLICATE_CASE_MATERIAL_ID";
    readonly materialRequirementNotProjected: "CASE_MATERIAL_REQUIREMENT_NOT_PROJECTED";
    readonly materialNotCorrelated: "CASE_MATERIAL_NOT_CORRELATED";
    readonly materialAddedBeforeCreated: "CASE_MATERIAL_ADDED_BEFORE_CREATED";
    readonly requirementNotInProfile: "CASE_REQUIREMENT_NOT_IN_PROFILE";
    readonly profileRefMismatch: "CASE_PROFILE_REF_MISMATCH";
}>;
export type ProtocolizationCaseValidationCode = (typeof PROTOCOLIZATION_CASE_VALIDATION_CODES)[keyof typeof PROTOCOLIZATION_CASE_VALIDATION_CODES];
export interface ProtocolizationCaseValidationIssue {
    readonly code: ProtocolizationCaseValidationCode;
    /** Where the issue was raised, e.g. `materials[2].requirementIds`. */
    readonly path: string;
}
export interface ProtocolizationCaseValidationResult {
    readonly valid: boolean;
    /** Repository-standard reason projection — exactly `issues.map((issue) => issue.code)`. */
    readonly reasons: readonly string[];
    readonly issues: readonly ProtocolizationCaseValidationIssue[];
}
export interface ProtocolizationCaseValidationOptions {
    /**
     * The profile the case is pinned to. When supplied, requirement ids are
     * additionally checked against it; when it is not the pinned version, the
     * case is reported as `CASE_PROFILE_REF_MISMATCH` rather than being validated
     * against the wrong rules.
     */
    readonly profile?: AssetProfile;
}
export declare function validateProtocolizationCase(value: unknown, options?: ProtocolizationCaseValidationOptions): ProtocolizationCaseValidationResult;
export declare function isValidProtocolizationCase(value: unknown, options?: ProtocolizationCaseValidationOptions): value is ProtocolizationCase;
//# sourceMappingURL=case-validation.d.ts.map