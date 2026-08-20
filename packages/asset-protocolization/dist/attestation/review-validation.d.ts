import type { CanonicalCredentialRef, CanonicalPrincipalRef } from '@aoc/protocol/claims';
import type { ProfessionalReviewDecision } from './review-decision';
import type { ProfessionalReviewRequest } from './review-request';
import type { ProfessionalReviewScope } from './review-scope';
/**
 * Deterministic **structural** validation for the professional review workflow.
 *
 * Read "validation" here narrowly, exactly as APV-05, APV-06 and APV-07 do:
 * every check below decides whether a value has the *shape* this workflow can
 * carry. Not one of them decides whether a reviewer was right, whether a
 * credential is genuine, whether an attestation is legally sufficient, or
 * whether anything reviewed is true.
 *
 * There are three subjects.
 *
 * **A request** and **a decision** are persisted records coming back across a
 * store or network boundary. They are validated before they are trusted,
 * because a repository can hand back anything and a record whose invariants are
 * already broken would be read as review history that never happened.
 *
 * **A scope** is validated on its own as well, because it is the field that
 * makes an attestation bounded — and a malformed scope is the one defect that
 * would turn a narrow professional statement into an unbounded one.
 *
 * ### Action-conditioned shape
 *
 * The decision validator is where "these four actions are genuinely different"
 * stops being documentation. A scope is required for `Attest` and forbidden
 * elsewhere; a machine-readable material request is required for
 * `RequestMoreEvidence` and forbidden elsewhere; a reason code is required for
 * the three non-attesting actions; and an attestation reference may accompany
 * only `Attest`. A boolean could not express any of that.
 */
export declare const PROFESSIONAL_REVIEW_VALIDATION_CODES: Readonly<{
    readonly notAnObject: "REVIEW_NOT_AN_OBJECT";
    readonly unknownField: "REVIEW_UNKNOWN_FIELD";
    readonly invalidSchemaVersion: "REVIEW_SCHEMA_VERSION_INVALID";
    readonly invalidRequestId: "REVIEW_REQUEST_ID_INVALID";
    readonly invalidDecisionId: "REVIEW_DECISION_ID_INVALID";
    readonly invalidTenantId: "REVIEW_TENANT_ID_INVALID";
    readonly invalidCaseId: "REVIEW_CASE_ID_INVALID";
    readonly invalidProfileRef: "REVIEW_PROFILE_REF_INVALID";
    readonly invalidRequirementId: "REVIEW_REQUIREMENT_ID_INVALID";
    readonly invalidAttestationType: "REVIEW_ATTESTATION_TYPE_INVALID";
    readonly invalidScope: "REVIEW_SCOPE_INVALID";
    readonly invalidBasisRevision: "REVIEW_BASIS_REVISION_INVALID";
    readonly invalidResultingRevision: "REVIEW_RESULTING_REVISION_INVALID";
    readonly invalidRequestedAt: "REVIEW_REQUESTED_AT_INVALID";
    readonly invalidDecidedAt: "REVIEW_DECIDED_AT_INVALID";
    readonly invalidReviewer: "REVIEW_REVIEWER_INVALID";
    readonly invalidCredentialRefs: "REVIEW_CREDENTIAL_REFS_INVALID";
    readonly invalidAction: "REVIEW_ACTION_INVALID";
    readonly invalidReviewedRefs: "REVIEW_REVIEWED_REFS_INVALID";
    readonly invalidReasonCode: "REVIEW_REASON_CODE_INVALID";
    readonly invalidRequestedMaterial: "REVIEW_REQUESTED_MATERIAL_INVALID";
    readonly invalidNote: "REVIEW_NOTE_INVALID";
    readonly invalidAttestationRef: "REVIEW_ATTESTATION_REF_INVALID";
    readonly invalidMaterialId: "REVIEW_MATERIAL_ID_INVALID";
    readonly invalidCorrelationId: "REVIEW_CORRELATION_ID_INVALID";
    /** A field the recorded action does not carry was present. */
    readonly actionFieldUnexpected: "REVIEW_ACTION_FIELD_UNEXPECTED";
    /** A field the recorded action requires was absent. */
    readonly actionFieldMissing: "REVIEW_ACTION_FIELD_MISSING";
}>;
export type ProfessionalReviewValidationCode = (typeof PROFESSIONAL_REVIEW_VALIDATION_CODES)[keyof typeof PROFESSIONAL_REVIEW_VALIDATION_CODES];
export interface ProfessionalReviewValidationResult {
    /**
     * Structural admissibility only.
     *
     * Named `admitted` rather than `valid`, exactly as APV-05, APV-06 and APV-07
     * named theirs. "Valid" is the word that quietly slides from *conforms to a
     * schema* to *is legitimate*, and this layer only ever means the first — which
     * matters here more than anywhere, because the thing being admitted is a
     * professional's recorded position on somebody's case.
     */
    readonly admitted: boolean;
    readonly reasons: readonly ProfessionalReviewValidationCode[];
}
/**
 * A principal reference this workflow will carry.
 *
 * The minimum that makes one usable as a reviewer: it names a principal, of a
 * kind Protocol defines. Restating `CanonicalPrincipalRef`'s full shape here
 * would be a second, drifting copy of a Protocol contract, which is precisely
 * what this package must not build.
 */
export declare function isUsablePrincipalRef(value: unknown): value is CanonicalPrincipalRef;
/**
 * A credential reference this workflow will carry.
 *
 * Identity and type only. Whether the credential exists, is current, is genuine
 * or confers any authority is emphatically not decided here — this package
 * cannot dereference a credential and must not pretend otherwise.
 */
export declare function isUsableCredentialRef(value: unknown): value is CanonicalCredentialRef;
/**
 * Validates a review scope.
 *
 * The one structural guarantee that makes an attestation bounded, so it is
 * checked as its own subject rather than inline: a requirement, an attestation
 * type, a subject, a revision and at least one proposition reference. A scope
 * that named nothing would be a scope in name only.
 */
export declare function validateProfessionalReviewScope(value: unknown): ProfessionalReviewValidationResult;
export declare function isValidProfessionalReviewScope(value: unknown): value is ProfessionalReviewScope;
/**
 * Validates a persisted review request.
 *
 * Structure only. It does not decide that the case still exists, that the
 * profile is still catalogued, that the revision is still current, or that
 * anyone ever reviewed it.
 */
export declare function validateProfessionalReviewRequest(value: unknown): ProfessionalReviewValidationResult;
export declare function isValidProfessionalReviewRequest(value: unknown): value is ProfessionalReviewRequest;
/**
 * Validates a persisted review decision.
 *
 * Structure and action-conditioned shape. It does not decide that the reviewer
 * was entitled to decide, that a presented credential is current, that an
 * attestation is legally sufficient, or that the position taken was correct —
 * none of which a validator could know, and none of which anything in this
 * package may re-decide after the fact.
 */
export declare function validateProfessionalReviewDecision(value: unknown): ProfessionalReviewValidationResult;
export declare function isValidProfessionalReviewDecision(value: unknown): value is ProfessionalReviewDecision;
//# sourceMappingURL=review-validation.d.ts.map