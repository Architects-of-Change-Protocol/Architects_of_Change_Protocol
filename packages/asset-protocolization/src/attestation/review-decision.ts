import type {
  CanonicalAttestationId,
  CanonicalCredentialRef,
  CanonicalPrincipalRef,
} from '@aoc/protocol/claims';
import type { CanonicalId, UtcDateTime } from '@aoc/protocol/contracts';

import type { AssetRequirementId } from '../identifiers';
import type {
  ProtocolizationCaseId,
  ProtocolizationMaterialId,
  ProtocolizationProfileRef,
  ProtocolizationTenantId,
} from '../case/case-identifiers';
import type { EvidenceIntakeCategoryId } from '../evidence/evidence-intake-identifiers';
import type { ProfessionalReviewAction } from './review-actions';
import type {
  ProfessionalReviewDecisionId,
  ProfessionalReviewReasonCode,
  ProfessionalReviewRequestId,
} from './review-identifiers';
import type { ProfessionalReviewBasisRef, ProfessionalReviewScope } from './review-scope';

/**
 * `ProfessionalReviewDecision` — the immutable record that an identified
 * reviewer **took a position** on one attestation requirement, on one review
 * basis.
 *
 * ### What a decision means
 *
 * Exactly this:
 *
 * ```text
 * this reviewer, presenting these credential references,
 * answering this review request, on this case, under this pinned profile version,
 * against this attestation requirement,
 * having reviewed this basis at this case revision,
 * took this action, for this machine-readable reason,
 * at this instant.
 * ```
 *
 * ### What a decision is not
 *
 * ```text
 * ProfessionalReviewDecision   !=   CanonicalAttestation
 * ```
 *
 * They are different things with different owners, and this slice keeps them
 * apart deliberately. A decision is a *vertical workflow record*: it exists for
 * all four actions, it lives in this package's own repository, and it is
 * addressed by a `ProfessionalReviewDecisionId` that is never written into a
 * `CanonicalAttestationId` field. A `CanonicalAttestation` is a *Protocol
 * record*: it exists only where `Attest` produced one legitimately, it names a
 * claim, an attester, a statement and an instant, and it is referenced from here
 * — never redefined here.
 *
 * That is also why `Reject`, `RequestMoreEvidence` and `Abstain` produce **no
 * canonical artifact at all**. Protocol defines no `CanonicalRejection`, no
 * `CanonicalAbstention` and no attestation variant meaning "declined", and
 * inventing an attestation whose type or statement encoded a refusal would put a
 * counterfeit record into circulation that every later reader would treat as an
 * attestation. The vertical record is sufficient, and it is honest.
 *
 * ### What a decision does not do
 *
 * ```text
 * Attest              != universal truth   != READY   != protocolized
 * Reject              != case Rejected     != fraud   != legal invalidity
 * RequestMoreEvidence != state transition  != deletion of anything
 * Abstain             != Fail              != Reject
 * ```
 *
 * No action transitions any case state. APV-09 owns state; this slice adds
 * none, and none of the four actions reaches for one.
 *
 * ### It never rewrites what it read
 *
 * A decision is written *beside* the basis it considered, never over it. An
 * `Attest` recorded against a basis containing a `Fail` leaves that `Fail`
 * exactly where it was — both facts remain true, both remain readable, and the
 * tension between them is information a later slice may need rather than a
 * contradiction to be tidied away. The same holds for declarations, evidence
 * receipts and claims: none of them gains a `verified`, `accepted` or `approved`
 * flag because a professional looked at it.
 *
 * ### Append-only
 *
 * Every field is fixed at construction and no operation in this package rewrites
 * one — no update, no delete, no retraction, no supersession pointer. A reviewer
 * who changes position does so through a *new* review request bound to a new
 * revision and a new decision beside the old one; overwriting the first would
 * destroy the only evidence of what was originally decided, which is the one
 * thing a professional review log exists to preserve.
 */
export const PROFESSIONAL_REVIEW_DECISION_SCHEMA_VERSION =
  'aoc-protocolization-professional-review-decision/1';

/**
 * One machine-readable thing a reviewer asks for when they cannot decide on the
 * current basis.
 *
 * At least one of `requirementId` and `evidenceCategoryId` must be present, so
 * a follow-up intake can be driven from the record rather than from prose. The
 * `reasonCode` is required for the same reason: "more evidence, please" that
 * nothing can route is a request that nobody can act on.
 */
export interface ProfessionalReviewMaterialRequest {
  /** A requirement of the pinned profile the reviewer needs more against. */
  readonly requirementId?: AssetRequirementId;
  /** An APV-05 intake category the reviewer needs material through. */
  readonly evidenceCategoryId?: EvidenceIntakeCategoryId;
  /** Why it is needed, as a stable machine token. */
  readonly reasonCode: ProfessionalReviewReasonCode;
  /** Bounded human detail. Presentation only; never machine semantics. */
  readonly note?: string;
}

export interface ProfessionalReviewDecision {
  readonly schemaVersion: typeof PROFESSIONAL_REVIEW_DECISION_SCHEMA_VERSION;

  /** Identity of this decision. Unique within the tenant. Never an attestation id. */
  readonly decisionId: ProfessionalReviewDecisionId;

  /** The request this decision answers. One terminal decision per request. */
  readonly reviewRequestId: ProfessionalReviewRequestId;

  readonly tenantId: ProtocolizationTenantId;
  readonly caseId: ProtocolizationCaseId;

  /** The pin the request carried, recorded so the decision reads independently. */
  readonly profile: ProtocolizationProfileRef;

  /** The attestation requirement of the pinned profile this decision answers. */
  readonly attestationRequirementId: AssetRequirementId;

  /**
   * Who decided.
   *
   * Protocol's own principal reference, and deliberately none of the following:
   *
   * ```text
   * reviewer != tenant      a tenant hosts and isolation-scopes the workflow;
   *                         it does not review, and a reviewer is never
   *                         inferred from a tenant id
   * reviewer != subject     the thing being protocolized is not the person
   *                         reviewing it
   * reviewer != declarant   the person asserting something into the case is
   *                         not assumed to be the person reviewing it
   * ```
   *
   * Recording a reviewer establishes that this principal was named as the
   * decision-maker. It does not authenticate them, resolve their standing, or
   * establish that they were legally entitled to decide.
   */
  readonly reviewer: CanonicalPrincipalRef;

  /**
   * The credential references the reviewer presented, **as presented at decision
   * time**.
   *
   * A snapshot of what was offered, never a live view. If a credential is
   * suspended, revoked or expires next year, this record does not change: the
   * historical fact is that these references were presented then, and rewriting
   * it would destroy the only evidence of what the reviewer actually showed.
   * Whether a later state of the world requires fresh review is APV-09's and
   * APV-10's question.
   *
   * ```text
   * credential ref present  != credential valid
   * credential valid        != authority over this subject
   * ```
   *
   * A reference is a reference. Nothing in this package resolves one, checks its
   * revocation status, contacts its issuer, or concludes anything about the
   * reviewer's professional standing from its presence.
   */
  readonly reviewerCredentialRefs?: readonly CanonicalCredentialRef[];

  readonly action: ProfessionalReviewAction;

  /**
   * What was attested. Present if and only if `action` is `Attest`.
   *
   * Required there, because an unscoped attestation is an assertion about
   * everything. Forbidden on the other three, because a decision that declined
   * to attest must not be readable as a scoped attestation that happened to say
   * no.
   */
  readonly scope?: ProfessionalReviewScope;

  /** The case revision reviewed. Always the request's `reviewBasisRevision`. */
  readonly reviewBasisRevision: number;

  /**
   * The case revision that resulted from recording this decision.
   *
   * Present if and only if this decision added APV-04 attestation material —
   * which only a legitimately constructed `CanonicalAttestation` does. Recorded
   * explicitly and separately from `reviewBasisRevision`, because the two are
   * genuinely different facts and collapsing them would hide a real event:
   *
   * ```text
   * reviewedCaseRevision  10   the state the professional examined
   * resultingCaseRevision 11   the state after their attestation was
   *                            associated to the case — new material the
   *                            reviewer, by definition, did not review
   * ```
   *
   * A reader must never be able to conclude that the attestation covered
   * revision `11`.
   */
  readonly resultingCaseRevision?: number;

  /**
   * What the reviewer actually read.
   *
   * Non-empty for `Attest`, so a later audit can answer *what exactly did the
   * professional review before attesting?* from the record rather than from
   * reconstruction. Broader than `scope.propositionRefs`, which names only what
   * the attestation is about.
   */
  readonly reviewedRefs?: readonly ProfessionalReviewBasisRef[];

  /**
   * Why, as a stable machine token.
   *
   * Required for `Reject`, `RequestMoreEvidence` and `Abstain` — a decision not
   * to attest that gives no routable reason is a decision nothing downstream can
   * act on. Optional for `Attest`, where the scope already says what was
   * concluded.
   */
  readonly reasonCode?: ProfessionalReviewReasonCode;

  /**
   * What further material is needed. Non-empty if and only if `action` is
   * `RequestMoreEvidence`.
   */
  readonly requestedMaterial?: readonly ProfessionalReviewMaterialRequest[];

  /**
   * The reviewer's own words. Bounded.
   *
   * For people, and possibly sensitive: it is the one field on this record a
   * professional might use to describe a person, so it is deliberately absent
   * from every APV-08 event payload and nothing in this package reads it,
   * parses it or branches on it. No state, readiness or eligibility anywhere
   * may depend on free text.
   */
  readonly note?: string;

  /**
   * The Protocol attestation this decision produced, when it legitimately
   * produced one.
   *
   * Present only for `Attest`, and only where every mandatory field of a
   * `CanonicalAttestation` could be established without invention. Absent
   * otherwise — including for an `Attest` whose basis could not support a
   * canonical record, which is a recorded professional position without a
   * Protocol artifact rather than a fabricated artifact.
   *
   * It is Protocol's identifier, never this decision's:
   * `decisionId` is a vertical workflow identifier and is never written here.
   */
  readonly canonicalAttestationRef?: CanonicalAttestationId;

  /** The APV-04 material association the attestation produced, when one was added. */
  readonly attestationMaterialId?: ProtocolizationMaterialId;

  /** When the decision was recorded, from the injected clock. Never `Date.now()`. */
  readonly decidedAt: UtcDateTime;

  /** Correlates this decision with the operation that recorded it. */
  readonly correlationId?: CanonicalId;
}
