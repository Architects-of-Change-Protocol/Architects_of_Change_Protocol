import type { VerificationCheckExecution } from './verification-check';
import type { ProtocolizationVerificationResult } from './verification-result';
/**
 * Deterministic **structural** validation for the verification pipeline.
 *
 * Read "validation" here narrowly, exactly as APV-05 and APV-06 do: every check
 * below decides whether a value has the *shape* this workflow can carry. Not one
 * of them decides whether an outcome was the right outcome, whether a check was
 * well written, or whether anything evaluated is true.
 *
 * There are two subjects, and they are different in kind.
 *
 * **An execution** is what an executor just returned. It is validated *before*
 * it becomes a result, so a malformed executor cannot put an arbitrary string
 * where an outcome belongs, smuggle an unknown field into an audit record, or
 * emit an unbounded blob of prose into an event payload. This is the boundary
 * that makes "no executor may return arbitrary strings" mechanical rather than
 * documentary.
 *
 * **A result** is a persisted record coming back across a store or network
 * boundary. It is validated before it is trusted, because a repository can hand
 * back anything and a result whose invariants are already broken would be read
 * as history that never happened.
 */
export declare const VERIFICATION_VALIDATION_CODES: Readonly<{
    readonly notAnObject: "VERIFICATION_NOT_AN_OBJECT";
    readonly unknownField: "VERIFICATION_UNKNOWN_FIELD";
    readonly invalidSchemaVersion: "VERIFICATION_SCHEMA_VERSION_INVALID";
    readonly invalidExecutionId: "VERIFICATION_EXECUTION_ID_INVALID";
    readonly invalidTenantId: "VERIFICATION_TENANT_ID_INVALID";
    readonly invalidCaseId: "VERIFICATION_CASE_ID_INVALID";
    readonly invalidProfileRef: "VERIFICATION_PROFILE_REF_INVALID";
    readonly invalidRequirementId: "VERIFICATION_REQUIREMENT_ID_INVALID";
    readonly invalidCheckId: "VERIFICATION_CHECK_ID_INVALID";
    readonly invalidCaseRevision: "VERIFICATION_CASE_REVISION_INVALID";
    readonly invalidOutcome: "VERIFICATION_OUTCOME_INVALID";
    readonly invalidReasonCode: "VERIFICATION_REASON_CODE_INVALID";
    readonly invalidSummary: "VERIFICATION_SUMMARY_INVALID";
    readonly invalidInputRefs: "VERIFICATION_INPUT_REFS_INVALID";
    readonly invalidExecutedAt: "VERIFICATION_EXECUTED_AT_INVALID";
    readonly invalidCanonicalVerificationRef: "VERIFICATION_CANONICAL_VERIFICATION_REF_INVALID";
    readonly invalidCorrelationId: "VERIFICATION_CORRELATION_ID_INVALID";
}>;
export type VerificationValidationCode = (typeof VERIFICATION_VALIDATION_CODES)[keyof typeof VERIFICATION_VALIDATION_CODES];
export interface VerificationValidationResult {
    /**
     * Structural admissibility only.
     *
     * Named `admitted` rather than `valid`, exactly as APV-05 and APV-06 named
     * theirs. "Valid" is the word that quietly slides from *conforms to a schema*
     * to *is legitimate*, and this layer only ever means the first — which matters
     * here because the thing being admitted is a finding about somebody's case.
     */
    readonly admitted: boolean;
    readonly reasons: readonly VerificationValidationCode[];
}
/**
 * Validates what an executor returned, before it is allowed to become history.
 *
 * A present-but-`undefined` optional is invalid rather than absent — the same
 * rule every other validator in this package applies, because `{ reasonCode:
 * undefined }` and `{}` serialize differently and a store that round-trips one
 * into the other would change what the record says.
 */
export declare function validateVerificationCheckExecution(value: unknown): VerificationValidationResult;
export declare function isAdmissibleVerificationCheckExecution(value: unknown): value is VerificationCheckExecution;
/**
 * Validates a persisted result document.
 *
 * Structure only. It does not decide that the case still exists, that the
 * profile is still catalogued, that the revision is still current, or that the
 * outcome was correct — none of which a validator could know, and the last of
 * which nothing in this package may re-decide after the fact.
 */
export declare function validateProtocolizationVerificationResult(value: unknown): VerificationValidationResult;
export declare function isValidProtocolizationVerificationResult(value: unknown): value is ProtocolizationVerificationResult;
//# sourceMappingURL=verification-validation.d.ts.map