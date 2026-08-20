import type { AttestationType, CanonicalAttestationId, CanonicalPrincipalRef } from '@aoc/protocol/claims';
import type { CanonicalId, UtcDateTime } from '@aoc/protocol/contracts';
import type { AssetRequirementId } from '../identifiers';
import type { ProtocolizationCaseId, ProtocolizationMaterialId, ProtocolizationProfileRef, ProtocolizationTenantId } from '../case/case-identifiers';
import type { ProfessionalReviewAction } from './review-actions';
import type { ProfessionalReviewDecisionId, ProfessionalReviewReasonCode, ProfessionalReviewRequestId } from './review-identifiers';
/**
 * The auditable facts the professional review workflow produces.
 *
 * Three events, because this slice performs three distinguishable acts: review
 * was requested, a reviewer decided, and — only where one was legitimately
 * produced — a Protocol attestation came into existence. Read each name
 * literally. *Requested*, not assigned. *Decided*, not approved. *Recorded*, not
 * verified, satisfied, ready or protocolized.
 *
 * There is deliberately no `CaseApproved`, `ProfessionalApproved`,
 * `AssetVerified`, `RequirementSatisfied`, `CaseReady` or `AssetProtocolized`.
 * Each of those names a conclusion no part of this vertical is entitled to
 * reach, and an event named for something that cannot happen yet is a promise
 * the code does not keep.
 *
 * ### Why this is a separate union
 *
 * APV-05, APV-06 and APV-07 each declared their own slice-scoped event union
 * rather than widening APV-04's closed case-event union, and this follows them.
 * Where a decision genuinely mutates the case — an `Attest` that associates a
 * legitimate attestation — APV-04's own `ProtocolizationMaterialAdded` event is
 * returned *unchanged* beside these, rather than being replaced or re-spelled
 * here.
 *
 * ### Why the payloads are narrow
 *
 * An event fans out to subscribers who may have no business reading what a
 * reviewer read. These carry identifiers, the action and the machine reason —
 * never reviewer notes, scope statements, limitations, declaration statements,
 * evidence, check summaries, credential references, personal data or secrets.
 * Notably absent are `note` and `scopeStatement`: they are the unstructured,
 * possibly personal fields of the slice, nothing may derive machine meaning from
 * them, and a reader entitled to them reads the decision.
 *
 * `reviewerCredentialRefs` is absent for a second reason on top of that one: a
 * credential reference in a broadcast payload invites a subscriber to treat its
 * presence as standing, which is exactly the inference this slice refuses to
 * support.
 *
 * Events are **outputs**, not the source of truth. The request and the decision
 * are the records; a dropped event loses a notification, never review history.
 */
export declare const PROFESSIONAL_REVIEW_EVENT_TYPES: Readonly<{
    readonly reviewRequested: "ProfessionalReviewRequested";
    readonly decisionRecorded: "ProfessionalReviewDecisionRecorded";
    readonly attestationRecorded: "ProfessionalAttestationRecorded";
}>;
export type ProfessionalReviewEventType = (typeof PROFESSIONAL_REVIEW_EVENT_TYPES)[keyof typeof PROFESSIONAL_REVIEW_EVENT_TYPES];
/** "Professional review of this attestation requirement was asked for, at this revision." */
export interface ProfessionalReviewRequestedEvent {
    readonly eventType: typeof PROFESSIONAL_REVIEW_EVENT_TYPES.reviewRequested;
    readonly reviewRequestId: ProfessionalReviewRequestId;
    readonly tenantId: ProtocolizationTenantId;
    readonly caseId: ProtocolizationCaseId;
    readonly profile: ProtocolizationProfileRef;
    readonly attestationRequirementId: AssetRequirementId;
    readonly requestedAttestationType: AttestationType;
    /** The case revision this request binds. Unchanged by the request. */
    readonly reviewBasisRevision: number;
    readonly occurredAt: UtcDateTime;
    readonly correlationId?: CanonicalId;
}
/** "This reviewer took this position on this request, at this revision." */
export interface ProfessionalReviewDecisionRecordedEvent {
    readonly eventType: typeof PROFESSIONAL_REVIEW_EVENT_TYPES.decisionRecorded;
    readonly decisionId: ProfessionalReviewDecisionId;
    readonly reviewRequestId: ProfessionalReviewRequestId;
    readonly tenantId: ProtocolizationTenantId;
    readonly caseId: ProtocolizationCaseId;
    readonly profile: ProtocolizationProfileRef;
    readonly attestationRequirementId: AssetRequirementId;
    /** Who decided. The reference only; never credentials, never a standing claim. */
    readonly reviewer: CanonicalPrincipalRef;
    readonly action: ProfessionalReviewAction;
    readonly reasonCode?: ProfessionalReviewReasonCode;
    /** The revision reviewed. */
    readonly reviewBasisRevision: number;
    /** The revision after the decision, when the decision added case material. */
    readonly resultingCaseRevision?: number;
    readonly canonicalAttestationRef?: CanonicalAttestationId;
    readonly occurredAt: UtcDateTime;
    readonly correlationId?: CanonicalId;
}
/**
 * "A Protocol attestation was legitimately produced by this decision, and
 * associated to this case."
 *
 * Emitted only where a `CanonicalAttestation` genuinely came into existence.
 * There is no counterpart event for a `Reject`, a `RequestMoreEvidence` or an
 * `Abstain`, because no canonical artifact is produced for any of them.
 */
export interface ProfessionalAttestationRecordedEvent {
    readonly eventType: typeof PROFESSIONAL_REVIEW_EVENT_TYPES.attestationRecorded;
    readonly decisionId: ProfessionalReviewDecisionId;
    readonly reviewRequestId: ProfessionalReviewRequestId;
    readonly tenantId: ProtocolizationTenantId;
    readonly caseId: ProtocolizationCaseId;
    readonly profile: ProtocolizationProfileRef;
    readonly attestationRequirementId: AssetRequirementId;
    readonly canonicalAttestationRef: CanonicalAttestationId;
    readonly attestationType: AttestationType;
    readonly attester: CanonicalPrincipalRef;
    /** The APV-04 material association the attestation produced. */
    readonly materialId: ProtocolizationMaterialId;
    /** The revision the attester reviewed. */
    readonly reviewBasisRevision: number;
    /** The revision the association produced. Always after `reviewBasisRevision`. */
    readonly resultingCaseRevision: number;
    readonly occurredAt: UtcDateTime;
    readonly correlationId?: CanonicalId;
}
export type ProfessionalReviewEvent = ProfessionalReviewRequestedEvent | ProfessionalReviewDecisionRecordedEvent | ProfessionalAttestationRecordedEvent;
//# sourceMappingURL=review-events.d.ts.map