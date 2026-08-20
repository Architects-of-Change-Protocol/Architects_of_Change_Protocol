import type {
  AttestationType,
  CanonicalClaimId,
  CanonicalEvidenceId,
  CanonicalPrincipalRef,
  CanonicalReferenceSource,
  ClaimType,
} from '@aoc/protocol/claims';
import type { UtcDateTime } from '@aoc/protocol/contracts';
import type { ContentIdentity, SovereignSubjectRef } from '@aoc/protocol/identity';

import type { AssetAttesterConstraint } from '../constraints';
import type { AssetFreshnessConstraint } from '../freshness';
import type { AssetRequirementId, AssetVerificationCheckId } from '../identifiers';
import type { JurisdictionRef } from '../jurisdiction';
import type { AssetRequirementObligation } from '../requirements';
import type {
  ProtocolizationCaseId,
  ProtocolizationMaterialId,
  ProtocolizationProfileRef,
  ProtocolizationTenantId,
} from '../case/case-identifiers';
import type { ProtocolizationCaseState } from '../case/case-state';
import type { EvidenceIntakeCategoryId, EvidenceIntakeId } from '../evidence/evidence-intake-identifiers';
import type { DeclarationId } from '../declarations/declaration-identifiers';
import type { VerificationExecutionId, VerificationReasonCode } from '../verification/verification-identifiers';
import type { VerificationCheckOutcome } from '../verification/verification-outcome';
import type { VerificationInputRef } from '../verification/verification-result';
import type { ProfessionalReviewRequestId } from './review-identifiers';
import type { ProfessionalReviewScope } from './review-scope';

/**
 * `ProfessionalReviewPacket` — the bounded, deterministic view of one review
 * basis that a professional is asked to consider.
 *
 * ### It is a projection, not an aggregate
 *
 * Nothing constructs a packet and stores it. Every fact in it comes from a
 * record that is already immutable and already revision-bound — the case at the
 * basis revision, APV-05 receipts, APV-06 declaration records, APV-07 results
 * and the pinned profile document — so a stored packet would be a second copy
 * of state that can drift from the records it copies, and would need its own
 * identity, its own lifecycle and its own persistence for no fact it adds.
 * Rebuilding it from the same inputs produces the same packet, byte for byte.
 *
 * That determinism is why there is **no `builtAt` field**. An instant would be
 * the one thing on this type that changed between two builds of the same basis,
 * and a packet whose bytes move is a packet nobody can prove was the one the
 * reviewer saw.
 *
 * ### It is bounded
 *
 * A reviewer sees this case, at this revision, under this pinned profile
 * version. There is no repository in scope, no catalogue, no other case, no
 * other tenant's anything. What could possibly have been reviewed is readable
 * from this type alone.
 *
 * ### It hides nothing
 *
 * Every APV-07 outcome the basis contains is present, in full:
 *
 * ```text
 * Pass          present     Fail          present
 * Warning       present     ManualReview  present
 * Unavailable   present
 * ```
 *
 * There is deliberately no filter, no severity threshold, no "only show
 * failures", no aggregate verdict and no reduction of any kind. A `Warning` next
 * to four passes stays a `Warning`; a `ManualReview` does not block packet
 * construction, because human review is precisely what a `ManualReview` asks
 * for, and refusing to build the packet that enables it would defeat the whole
 * architecture; and an `Unavailable` is never reinterpreted as a `Fail`.
 *
 * ### It decides nothing
 *
 * There is no `recommendation`, no `readiness`, no `score`, no `eligible` and no
 * `suggestedAction` field anywhere on this type or its parts. Automated checks
 * *inform* the professional; they do not decide for them, and a packet that
 * arrived with an answer already in it would be a packet whose reviewer was
 * ratifying rather than reviewing.
 */
export const PROFESSIONAL_REVIEW_PACKET_SCHEMA_VERSION =
  'aoc-protocolization-professional-review-packet/1';

/** SUBJECT — which subject this review is about, as the case binds it. */
export interface ProfessionalReviewPacketSubject {
  /** The case's own subject reference. Never the reviewer, never the applicant. */
  readonly subjectRef: SovereignSubjectRef;
  /** Present only when the subject has a canonical byte representation. */
  readonly contentIdentity?: ContentIdentity;
  /** The case's lifecycle state at the basis revision. Not a readiness signal. */
  readonly caseState: ProtocolizationCaseState;
}

/**
 * The roles the workflow has actually observed a principal in.
 *
 * ### Why there is no `Applicant`
 *
 * Because APV-04 models none. A `ProtocolizationCase` has a tenant, a subject,
 * a pinned profile and material; it has no applicant field, no owner field and
 * no party list, and inventing one here would put a fact into a professional's
 * packet that no part of this system ever established. The only participant
 * role the workflow genuinely observes is *who was recorded as declaring
 * something*, which APV-06 carries as `ProtocolizationDeclarationRecord.declarant`.
 *
 * The member set is open to growth by a slice that genuinely learns a new role.
 * It is deliberately not grown speculatively.
 */
export const ProfessionalReviewParticipantRole = {
  /** Recorded by APV-06 as having made a declaration into this case. */
  Declarant: 'Declarant',
} as const;
export type ProfessionalReviewParticipantRole =
  (typeof ProfessionalReviewParticipantRole)[keyof typeof ProfessionalReviewParticipantRole];

/**
 * PARTICIPANTS — the principals this workflow actually knows about.
 *
 * Identity as *recorded*, never as verified. A principal appearing here was
 * named by a caller; nothing in this vertical resolved them, authenticated them
 * or established that they were entitled to act.
 */
export interface ProfessionalReviewParticipant {
  readonly principal: CanonicalPrincipalRef;
  readonly roles: readonly ProfessionalReviewParticipantRole[];
  /** The declarations that put this principal in the packet, in record order. */
  readonly declarationIds: readonly DeclarationId[];
}

/**
 * DECLARATIONS — what participants asserted, as APV-06 recorded it.
 *
 * Reused, never rewritten. A professional attesting after reading a declaration
 * does not turn the declarant's assertion into the attester's: the declaration
 * keeps its own provenance, its own declarant and its own instant, and the
 * attestation is a separate artifact beside it.
 */
export interface ProfessionalReviewDeclarationEntry {
  readonly declarationId: DeclarationId;
  readonly declarant: CanonicalPrincipalRef;
  readonly claimType: ClaimType;
  readonly claimSubtype?: string;
  readonly claimRef: CanonicalClaimId;
  readonly materialId: ProtocolizationMaterialId;
  readonly requirementIds: readonly AssetRequirementId[];
  readonly supportingEvidenceRefs?: readonly CanonicalEvidenceId[];
  /**
   * What the declarant said, as submitted.
   *
   * Present because a professional cannot review a declaration they cannot
   * read. Presentation only, exactly as on the record it comes from: nothing in
   * this package parses it, matches on it or derives machine meaning from it,
   * and it is deliberately absent from every APV-08 event.
   */
  readonly statement?: string;
  readonly declaredAt?: UtcDateTime;
  readonly recordedAt: UtcDateTime;
  readonly sourceRef?: CanonicalReferenceSource;
  /** The case revision this declaration produced. Never after the review basis. */
  readonly caseRevision: number;
}

/**
 * EVIDENCE — what was admitted, as APV-05 receipted it.
 *
 * References and review-relevant metadata, never documents. There are no bytes
 * anywhere in this vertical to copy, and a receipt in this list means the
 * vertical was *told about* evidence — not that the evidence is authentic,
 * authoritative, sufficient or true.
 */
export interface ProfessionalReviewEvidenceEntry {
  readonly intakeId: EvidenceIntakeId;
  readonly categoryId: EvidenceIntakeCategoryId;
  readonly evidenceRef: CanonicalEvidenceId;
  readonly materialId: ProtocolizationMaterialId;
  readonly requirementIds: readonly AssetRequirementId[];
  readonly receivedAt: UtcDateTime;
  /** When the source observed what the evidence describes, when one was supplied. */
  readonly observedAt?: UtcDateTime;
  readonly sourceRef?: CanonicalReferenceSource;
  /** The case revision this intake produced. Never after the review basis. */
  readonly caseRevision: number;
}

/**
 * AUTOMATED CHECKS — what APV-07 found, unreduced.
 *
 * The outcome travels whole. `reasonCode` says why in a machine-readable token,
 * `inputRefs` says over what, and `evaluatedCaseRevision` says against which
 * state of the case — so a professional can tell a `Pass` that examined the case
 * they are reviewing from a `Pass` that examined an older one.
 */
export interface ProfessionalReviewCheckEntry {
  readonly executionId: VerificationExecutionId;
  readonly requirementId: AssetRequirementId;
  readonly checkId: AssetVerificationCheckId;
  readonly outcome: VerificationCheckOutcome;
  readonly reasonCode?: VerificationReasonCode;
  readonly summary?: string;
  readonly inputRefs?: readonly VerificationInputRef[];
  /** The revision this check evaluated. Never after the review basis. */
  readonly evaluatedCaseRevision: number;
  /**
   * Whether this result evaluated exactly the review basis revision.
   *
   * A comparison of two integers, both of which are present beside it, surfaced
   * so a reviewer cannot miss it. It is **not** a validity judgement: a result
   * that evaluated an older revision is not wrong, not expired and not
   * invalidated — it simply saw strictly less than the reviewer is being shown,
   * and the reviewer is entitled to know which.
   */
  readonly currentForReviewBasis: boolean;
  readonly executedAt: UtcDateTime;
}

/** One `(requirement, check)` pair the pinned profile declares and the basis has no result for. */
export interface ProfessionalReviewUnexecutedCheck {
  readonly requirementId: AssetRequirementId;
  readonly checkId: AssetVerificationCheckId;
}

/**
 * EXCEPTIONS — a deterministic projection over the sections above.
 *
 * ### Not a second verification system
 *
 * Every list here is computed by reading structured fields that already exist:
 * an outcome, a revision comparison, a material status, an obligation. Nothing
 * is re-evaluated, nothing is re-decided, and no source record is touched. Remove
 * this section and not one fact would be lost — it exists so that a reviewer
 * opening a packet with sixty check results does not have to find the four that
 * need their attention by reading all sixty.
 *
 * ### Not a verdict either
 *
 * A non-empty `failedCheckExecutionIds` does not mean the review must be
 * rejected, and an empty one does not mean it may be attested. There is no
 * threshold, no count that triggers anything and no field on this type that any
 * operation branches on.
 */
export interface ProfessionalReviewExceptions {
  readonly failedCheckExecutionIds: readonly VerificationExecutionId[];
  readonly warningCheckExecutionIds: readonly VerificationExecutionId[];
  readonly manualReviewCheckExecutionIds: readonly VerificationExecutionId[];
  readonly unavailableCheckExecutionIds: readonly VerificationExecutionId[];
  /** Results that evaluated a revision earlier than the review basis. */
  readonly staleCheckExecutionIds: readonly VerificationExecutionId[];
  /** Checks the pinned profile declares for which the basis holds no result. */
  readonly unexecutedChecks: readonly ProfessionalReviewUnexecutedCheck[];
  /** Requirements of the pinned profile with no material at the review basis. */
  readonly pendingMaterialRequirementIds: readonly AssetRequirementId[];
  /** `Conditional` requirements whose condition nothing has evaluated. */
  readonly unresolvedConditionalRequirementIds: readonly AssetRequirementId[];
}

/**
 * ATTESTATION REQUESTED — what, exactly, the reviewer is being asked for.
 *
 * Read straight off the pinned profile's attestation requirement at packet
 * build time, so it is a view of the profile rather than a copy that could
 * drift from it. It states the obligation, the accepted types, the attester
 * constraints and the jurisdictional context the profile declares — and states
 * them as *requirements*, never as facts about the reviewer.
 */
export interface ProfessionalReviewAttestationRequest {
  readonly requirementId: AssetRequirementId;
  readonly obligation: AssetRequirementObligation;
  readonly acceptedTypes: readonly AttestationType[];
  readonly requestedAttestationType: AttestationType;
  readonly minimumCount?: number;
  /**
   * The attester constraint the profile declares, verbatim.
   *
   * Carried, not interpreted. `acceptedRoles` in particular is an opaque list of
   * vertical role tokens with no structurally comparable field on any Protocol
   * principal record, so this package cannot and does not mechanically enforce
   * it — it shows it, and a human decides. Hard-coding what a role means is
   * exactly the leak the vertical boundary exists to prevent.
   */
  readonly attester?: AssetAttesterConstraint;
  /**
   * The jurisdictional context the requirement declares, when it declares one.
   *
   * Context, never law. Nothing in this package resolves a jurisdiction,
   * interprets one, or knows what any of them require.
   */
  readonly jurisdictions?: readonly JurisdictionRef[];
  readonly freshness?: AssetFreshnessConstraint;
}

export interface ProfessionalReviewPacket {
  readonly schemaVersion: typeof PROFESSIONAL_REVIEW_PACKET_SCHEMA_VERSION;

  readonly reviewRequestId: ProfessionalReviewRequestId;
  readonly tenantId: ProtocolizationTenantId;
  readonly caseId: ProtocolizationCaseId;
  readonly profile: ProtocolizationProfileRef;

  /** The revision every section below describes. */
  readonly reviewBasisRevision: number;

  readonly subject: ProfessionalReviewPacketSubject;
  readonly participants: readonly ProfessionalReviewParticipant[];
  readonly declarations: readonly ProfessionalReviewDeclarationEntry[];
  readonly evidence: readonly ProfessionalReviewEvidenceEntry[];
  readonly automatedChecks: readonly ProfessionalReviewCheckEntry[];
  readonly exceptions: ProfessionalReviewExceptions;
  readonly attestationRequested: ProfessionalReviewAttestationRequest;
  readonly scope: ProfessionalReviewScope;
}
