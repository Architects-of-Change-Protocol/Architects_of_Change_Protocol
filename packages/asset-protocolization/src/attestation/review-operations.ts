import type {
  AttestationType,
  CanonicalAttestation,
  CanonicalAttestationId,
  CanonicalClaimId,
  CanonicalCredentialRef,
  CanonicalPrincipalRef,
  CanonicalProofRef,
} from '@aoc/protocol/claims';
import type { CanonicalId, UtcDateTime } from '@aoc/protocol/contracts';

import type { AssetCredentialConstraint } from '../constraints';
import { isValidUtcDateTime } from '../freshness';
import { isValidAssetRequirementId } from '../identifiers';
import type { AssetRequirementId } from '../identifiers';
import type { AssetProfile } from '../profile';
import { AssetRequirementKind, AssetRequirementObligation } from '../requirements';
import type { AssetAttestationRequirement } from '../requirements';
import { PROTOCOLIZATION_CASE_ERROR_CODES, ProtocolizationCaseError } from '../case/case-errors';
import { deepFreeze } from '../case/case-freeze';
import { isValidProtocolizationTenantId, protocolizationProfileRefsEqual } from '../case/case-identifiers';
import type { ProtocolizationMaterialId } from '../case/case-identifiers';
import { addProtocolizationCaseMaterial } from '../case/case-operations';
import type { ProtocolizationCaseContext } from '../case/case-operations';
import type { ProtocolizationCaseEvent } from '../case/case-events';
import { ProtocolizationMaterialKind } from '../case/case-material';
import { listProtocolizationCaseRequirementProgress } from '../case/case-progress';
import {
  ProtocolizationCaseState,
  ProtocolizationRequirementConditionStatus,
  ProtocolizationRequirementMaterialStatus,
} from '../case/case-state';
import { validateProtocolizationCase } from '../case/case-validation';
import type { ProtocolizationCase } from '../case/protocolization-case';
import type { EvidenceIntakeReceipt } from '../evidence/evidence-intake-receipt';
import type { ProtocolizationDeclarationRecord } from '../declarations/declaration-record';
import { VerificationCheckOutcome } from '../verification/verification-outcome';
import { isVerificationResultCurrentForRevision } from '../verification/verification-projections';
import type { ProtocolizationVerificationResult } from '../verification/verification-result';
import { isUsableProofRef, prepareCanonicalAttestationFromReview } from './attestation-preparation';
import type { AttestationSigner } from './attestation-signer';
import { ProfessionalReviewAction, isProfessionalReviewAction } from './review-actions';
import type { ProfessionalReviewDecision, ProfessionalReviewMaterialRequest } from './review-decision';
import { PROFESSIONAL_REVIEW_DECISION_SCHEMA_VERSION } from './review-decision';
import { PROFESSIONAL_REVIEW_ERROR_CODES, ProfessionalReviewError } from './review-errors';
import type {
  ProfessionalReviewErrorCode,
  ProfessionalReviewErrorDetails,
} from './review-errors';
import { PROFESSIONAL_REVIEW_EVENT_TYPES } from './review-events';
import type {
  ProfessionalAttestationRecordedEvent,
  ProfessionalReviewDecisionRecordedEvent,
  ProfessionalReviewRequestedEvent,
} from './review-events';
import {
  isValidProfessionalReviewDecisionId,
  isValidProfessionalReviewRequestId,
} from './review-identifiers';
import type {
  ProfessionalReviewDecisionId,
  ProfessionalReviewReasonCode,
  ProfessionalReviewRequestId,
} from './review-identifiers';
import { PROFESSIONAL_REVIEW_PACKET_SCHEMA_VERSION } from './review-packet';
import type {
  ProfessionalReviewCheckEntry,
  ProfessionalReviewDeclarationEntry,
  ProfessionalReviewEvidenceEntry,
  ProfessionalReviewExceptions,
  ProfessionalReviewPacket,
  ProfessionalReviewParticipant,
  ProfessionalReviewUnexecutedCheck,
} from './review-packet';
import { ProfessionalReviewParticipantRole } from './review-packet';
import { PROFESSIONAL_REVIEW_REQUEST_SCHEMA_VERSION } from './review-request';
import type { ProfessionalReviewRequest } from './review-request';
import type { ProfessionalReviewBasisRef, ProfessionalReviewScope } from './review-scope';
import {
  validateProfessionalReviewDecision,
  validateProfessionalReviewRequest,
  validateProfessionalReviewScope,
} from './review-validation';

/**
 * The professional review operations.
 *
 * ### What success means
 *
 * ```text
 * createProfessionalReviewRequest
 *   APV recorded that professional review was asked for, on one attestation
 *   requirement of this case's exact pinned profile version, bound to the case
 *   revision that stood at that instant.
 *
 * buildProfessionalReviewPacket
 *   APV projected, deterministically, exactly what that request's basis
 *   contains — and nothing added afterwards.
 *
 * recordProfessionalReviewDecision
 *   APV recorded what an identified reviewer decided, and — only for `Attest`,
 *   and only where Protocol's own record could be built without invention —
 *   produced a CanonicalAttestation and associated it to the case.
 * ```
 *
 * Success is *the workflow act happened and is recorded*. It is true for all
 * four actions: a `Reject` is as successful an operation as an `Attest`.
 *
 * ### What these operations never do
 *
 * ```text
 * transition a case state          add READY, Rejected or MoreEvidenceRequired
 * rewrite an evidence receipt      rewrite a declaration record
 * rewrite a verification result    turn a Fail into a Pass
 * mark a requirement satisfied     declare a case ready
 * assign or queue a reviewer       resolve a credential
 * adjudicate between reviewers     interpret a jurisdiction
 * persist anything                 mint a CanonicalAttestationId
 * ```
 *
 * The state line is worth dwelling on. `Reject` adds no `Rejected` state,
 * `RequestMoreEvidence` adds no `MoreEvidenceRequired` state, `Abstain` adds
 * nothing at all, and even a case whose every attestation requirement has been
 * attested gains no `Ready`. APV-04's three states are untouched, and what a
 * professional decision *means* for a case is APV-09's question.
 *
 * The only case mutation this slice can cause is APV-04's own
 * `addProtocolizationCaseMaterial`, called through APV-04's public operation
 * rather than by reaching into the aggregate, and only ever to associate a
 * legitimately constructed `CanonicalAttestation` to a compatible attestation
 * requirement. It moves that requirement from `Pending` to `MaterialPresent` and
 * no further: material present is never a requirement satisfied.
 *
 * ### Sync core, async edge
 *
 * Request creation and packet construction are synchronous and pure. Only
 * `recordProfessionalReviewDecision` is `async`, and only because an injected
 * `AttestationSigner` may need to go somewhere — the repository's own convention
 * for a port that might.
 *
 * ### Nothing is persisted here
 *
 * These operations return records and events and store neither, exactly as
 * APV-05, APV-06 and APV-07 do. A successful `Attest` returns an updated case, a
 * decision, an attestation and three events for the composition layer to commit
 * together under whatever transactional facility it actually has — this package
 * has none, and pretending that independent repository writes were atomic would
 * be worse than admitting they are not.
 */

/** What a review operation needs beyond the case itself. */
export interface ProfessionalReviewContext extends ProtocolizationCaseContext {
  /**
   * The signer, when one is configured.
   *
   * Optional, and its absence is not a way to get an unsigned artifact. Where no
   * signer is configured, a requested `CanonicalAttestation` is constructed only
   * if the caller supplied at least one usable `CanonicalProofRef` of their own;
   * where they did not, the operation fails with
   * `REVIEW_SIGNATURE_UNAVAILABLE` rather than producing an unauditable
   * professional attestation. Nothing is ever fabricated to fill the gap.
   */
  readonly signer?: AttestationSigner;
}

export interface CreateProfessionalReviewRequestInput {
  /** Identity of this request. Unique within the tenant; caller-provided. */
  readonly reviewRequestId: ProfessionalReviewRequestId;
  /** The attestation requirement of the pinned profile review is asked for. */
  readonly attestationRequirementId: AssetRequirementId;
  /** One of that requirement's `acceptedTypes`. */
  readonly requestedAttestationType: AttestationType;
  /** What the reviewer is being asked to attest, machine-readably. */
  readonly requestedScope: ProfessionalReviewScope;
  readonly correlationId?: CanonicalId;
}

/** A raised request: the immutable record, and the fact it produced. */
export interface ProfessionalReviewRequestTransition {
  readonly request: ProfessionalReviewRequest;
  readonly event: ProfessionalReviewRequestedEvent;
}

/**
 * The case-scoped records a caller supplies for the packet to project.
 *
 * Supplied rather than fetched, because these operations hold no repository —
 * the same input minimization APV-07 applies. Everything supplied is checked to
 * belong to the acting tenant and this case before any of it reaches a packet.
 */
export interface ProfessionalReviewPacketInputs {
  readonly evidenceReceipts?: readonly EvidenceIntakeReceipt[];
  readonly declarations?: readonly ProtocolizationDeclarationRecord[];
  readonly verificationResults?: readonly ProtocolizationVerificationResult[];
}

/** What an `Attest` supplies when it wants a Protocol attestation produced. */
export interface ProfessionalAttestationInput {
  /** Caller-provided, exactly like every other identifier in this package. */
  readonly attestationId: CanonicalAttestationId;
  /**
   * The claim the attestation is about.
   *
   * Must already be associated to this case as `Declaration` material. A claim
   * this case does not hold is refused rather than attested to.
   */
  readonly claimRef: CanonicalClaimId;
  /** The attester's own words. Never generated from the case. */
  readonly statement: string;
  /** Identity of the APV-04 material association this will produce. */
  readonly materialId: ProtocolizationMaterialId;
  /**
   * Proof references the caller already holds.
   *
   * Where a signer is configured, its proof is appended to these. At least one
   * proof reference must come from one source or the other: a professional
   * attestation associated to a case as `ProtocolizationMaterialKind.Attestation`
   * is auditable or it is not produced. Supplying none here with no signer
   * configured fails the operation with `REVIEW_SIGNATURE_UNAVAILABLE`; it does
   * not quietly yield an unsigned artifact.
   *
   * Presence is not verification. This package resolves no proof and validates
   * no signature — Protocol defines `CanonicalProofRef` as a reference and
   * nothing more.
   */
  readonly proofRefs?: readonly CanonicalProofRef[];
}

export interface RecordProfessionalReviewDecisionInput {
  /** Identity of this decision. Unique within the tenant; caller-provided. */
  readonly decisionId: ProfessionalReviewDecisionId;
  /** Who decided. Never inferred from the tenant, the subject or a declarant. */
  readonly reviewer: CanonicalPrincipalRef;
  /** What the reviewer presented, as presented. Never resolved. */
  readonly reviewerCredentialRefs?: readonly CanonicalCredentialRef[];
  readonly action: ProfessionalReviewAction;
  /** Required for `Attest`; refused for the other three. */
  readonly scope?: ProfessionalReviewScope;
  /** Required for `Attest`: what the reviewer actually read. */
  readonly reviewedRefs?: readonly ProfessionalReviewBasisRef[];
  /** Required for `Reject`, `RequestMoreEvidence` and `Abstain`. */
  readonly reasonCode?: ProfessionalReviewReasonCode;
  /** Required for `RequestMoreEvidence`; refused for the other three. */
  readonly requestedMaterial?: readonly ProfessionalReviewMaterialRequest[];
  /** Bounded human detail. Presentation only; never machine semantics. */
  readonly note?: string;
  /** Permitted only with `Attest`. Absent means "no Protocol artifact". */
  readonly attestation?: ProfessionalAttestationInput;
  readonly correlationId?: CanonicalId;
}

/**
 * What recording a decision produced.
 *
 * A pure result for the composition layer to commit. The case, the case event,
 * the attestation and the attestation event are present together or not at all:
 * they describe one act, and only `Attest` with a legitimate attestation
 * performs it.
 */
export interface ProfessionalReviewDecisionTransition {
  readonly decision: ProfessionalReviewDecision;
  readonly decisionEvent: ProfessionalReviewDecisionRecordedEvent;
  /** Present only where a legitimate attestation was associated to the case. */
  readonly protocolizationCase?: ProtocolizationCase;
  /** APV-04's own material-added event, unchanged. Present with the case. */
  readonly caseEvent?: ProtocolizationCaseEvent;
  /** The Protocol record, where one was legitimately produced. */
  readonly attestation?: CanonicalAttestation;
  readonly attestationEvent?: ProfessionalAttestationRecordedEvent;
}

const MAX_CORRELATION_ID_LENGTH = 128;

function failReview(
  code: ProfessionalReviewErrorCode,
  message: string,
  details: ProfessionalReviewErrorDetails,
): never {
  throw new ProfessionalReviewError(code, message, details);
}

/**
 * The tenant gate, checked before anything else looks at the case.
 *
 * The acting tenant is the context's, never the case's — a check that reads the
 * tenant off the value it is checking always agrees with itself, which is
 * exactly why APV-04 made the acting tenant a parameter.
 */
function assertActingTenantOwnsCase(
  context: ProfessionalReviewContext,
  protocolizationCase: ProtocolizationCase,
): void {
  if (!isValidProtocolizationTenantId(context.tenantId)) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.invalidTenant,
      'A non-blank acting tenantId is required',
      { reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.invalidTenant] },
    );
  }
  if (protocolizationCase.tenantId !== context.tenantId) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.tenantMismatch,
      'The acting tenant does not own this ProtocolizationCase',
      {
        reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.tenantMismatch],
        caseId: protocolizationCase.caseId,
        tenantId: context.tenantId,
      },
    );
  }
}

/**
 * Re-validates the aggregate before reading it.
 *
 * The case may have arrived from a store, from a network boundary or from a
 * caller that built it by hand. Showing a professional a packet projected from
 * an aggregate whose invariants are already broken would be showing them a case
 * that never legally existed.
 */
function assertReadableCase(protocolizationCase: ProtocolizationCase): void {
  const validation = validateProtocolizationCase(protocolizationCase);
  if (!validation.valid) {
    throw new ProtocolizationCaseError(
      PROTOCOLIZATION_CASE_ERROR_CODES.invalidCase,
      `Invalid ProtocolizationCase: ${validation.reasons.join(', ')}`,
      { reasonCodes: validation.reasons },
    );
  }
}

/**
 * Which lifecycle states admit new review workflow.
 *
 * `Draft` and `Active` do; `Cancelled` does not. Cancellation is terminal and a
 * cancelled case accepts no further work — asking a professional to review an
 * abandoned attempt, or recording a decision against one, would be asking for
 * work nobody wanted. Requests and decisions recorded *before* cancellation
 * remain readable and auditable forever, and a packet may still be projected
 * from historical records: this refuses new workflow, it does not hide old
 * review.
 *
 * No state is added and none is transitioned. A review — of any action — leaves
 * the case in exactly the state it found it.
 */
function assertCaseAcceptsReview(protocolizationCase: ProtocolizationCase): void {
  if (protocolizationCase.state === ProtocolizationCaseState.Cancelled) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.caseCancelled,
      'A Cancelled ProtocolizationCase does not accept further professional review',
      {
        reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.caseCancelled],
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
      },
    );
  }
}

/**
 * Resolves the exact pinned version and nothing else.
 *
 * There is no fallback to a latest, current or nearest version anywhere in this
 * package, and this is where it matters most: the *attestation contract* a
 * reviewer is held to — which types are accepted, which principal kinds, which
 * credentials, which jurisdictional context — is the pinned profile's. A case
 * pinned to `1.0.0` reviews under `1.0.0` after `2.0.0` is registered, even when
 * `2.0.0` changes the very same requirement id.
 */
function resolvePinnedProfile(
  context: ProfessionalReviewContext,
  protocolizationCase: ProtocolizationCase,
): AssetProfile {
  const resolved = context.catalog.get(
    protocolizationCase.profile.profileId,
    protocolizationCase.profile.profileVersion,
  );
  if (resolved === undefined) {
    throw new ProtocolizationCaseError(
      PROTOCOLIZATION_CASE_ERROR_CODES.profileNotFound,
      `No AssetProfile ${protocolizationCase.profile.profileId}@${protocolizationCase.profile.profileVersion} is catalogued`,
      {
        reasonCodes: [PROTOCOLIZATION_CASE_ERROR_CODES.profileNotFound],
        profile: protocolizationCase.profile,
        caseId: protocolizationCase.caseId,
      },
    );
  }
  return resolved;
}

/**
 * Resolves one requirement id to the pinned profile's *attestation*
 * requirement, or refuses.
 *
 * ### The mixed-kind lesson, applied structurally
 *
 * APV-06's targeted audit found that APV-04's `correlate` is kind-blind: it
 * moves every id it is handed to `MaterialPresent`, so one declaration offered
 * against `[declarationRequirement, evidenceRequirement]` left the case
 * reporting evidence that did not exist. APV-07 answered that class of defect
 * for verification, and APV-08 answers it for attestation the same way, three
 * times over.
 *
 * First, structurally: a review request names **one** `attestationRequirementId`,
 * never a list. A mixture of kinds is not representable in the request, so it
 * cannot be smuggled past a filter that only looked at the first element.
 *
 * Second, explicitly: that single requirement must be
 * `AssetRequirementKind.Attestation`. Naming an Identity, Declaration, Evidence
 * or Verification requirement is refused here, and it is refused *before* the
 * case is touched — so a rejected request leaves the case byte-for-byte as it
 * was, at the same revision, with every requirement's `materialStatus`
 * untouched, and leaves both review repositories empty.
 *
 * Third, on the way out: the attestation material an `Attest` associates is
 * correlated to exactly this one requirement id and no other, so a legitimate
 * attestation can never move an evidence or declaration requirement to
 * `MaterialPresent`.
 */
function resolveAttestationRequirement(
  profile: AssetProfile,
  protocolizationCase: ProtocolizationCase,
  requirementId: AssetRequirementId,
): AssetAttestationRequirement {
  const requirement = profile.requirements.find((entry) => entry.id === requirementId);
  if (requirement === undefined) {
    // APV-04's code and message for the same condition, so a requirement id
    // borrowed from another profile version fails identically whichever
    // operation notices it first.
    throw new ProtocolizationCaseError(
      PROTOCOLIZATION_CASE_ERROR_CODES.unknownRequirement,
      `Requirement not declared by ${protocolizationCase.profile.profileId}@${protocolizationCase.profile.profileVersion}: ${requirementId}`,
      {
        reasonCodes: [PROTOCOLIZATION_CASE_ERROR_CODES.unknownRequirement],
        caseId: protocolizationCase.caseId,
        profile: protocolizationCase.profile,
        requirementIds: [requirementId],
      },
    );
  }

  if (requirement.kind !== AssetRequirementKind.Attestation) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.incompatibleRequirement,
      `Professional review may only answer an Attestation requirement; ${requirement.id} is ${requirement.kind}`,
      {
        reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.incompatibleRequirement],
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
        requirementIds: [requirement.id],
      },
    );
  }

  return requirement;
}

/**
 * The attestation type must be one *this requirement of this pinned version*
 * accepts.
 *
 * That Protocol defines a member is not permission to request it. A type only a
 * later profile version accepts, or one accepted only by a different
 * requirement, is refused here.
 */
function assertAttestationTypeAccepted(
  requirement: AssetAttestationRequirement,
  protocolizationCase: ProtocolizationCase,
  attestationType: AttestationType,
): void {
  if (!requirement.acceptedTypes.includes(attestationType)) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.incompatibleAttestationType,
      `Requirement ${requirement.id} of ${protocolizationCase.profile.profileId}@${protocolizationCase.profile.profileVersion} does not accept attestation type ${attestationType}`,
      {
        reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.incompatibleAttestationType],
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
        requirementIds: [requirement.id],
      },
    );
  }
}

/**
 * The scope must be structurally sound, and must be about *this* case.
 *
 * The subject check is the one that stops an attestation prepared for one
 * subject being attached to another — inside one tenant, where every other gate
 * would have passed.
 */
function assertScopeMatchesCase(
  protocolizationCase: ProtocolizationCase,
  requirement: AssetAttestationRequirement,
  attestationType: AttestationType,
  basisRevision: number,
  scope: ProfessionalReviewScope,
): void {
  const admission = validateProfessionalReviewScope(scope);
  if (!admission.admitted) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.invalidScope,
      `The review scope was not admitted: ${admission.reasons.join(', ')}`,
      {
        reasonCodes: admission.reasons,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
        requirementIds: [requirement.id],
      },
    );
  }

  const reasons: string[] = [];
  if (scope.requirementId !== requirement.id) reasons.push('SCOPE_REQUIREMENT_MISMATCH');
  if (scope.attestationType !== attestationType) reasons.push('SCOPE_ATTESTATION_TYPE_MISMATCH');
  if (scope.caseRevision !== basisRevision) reasons.push('SCOPE_REVISION_MISMATCH');
  if (scope.subjectRef.sovereignAssetId !== protocolizationCase.subject.subjectRef.sovereignAssetId) {
    reasons.push('SCOPE_SUBJECT_MISMATCH');
  }
  const caseExternal = protocolizationCase.subject.subjectRef.externalReference;
  const scopeExternal = scope.subjectRef.externalReference;
  const externalAgrees =
    (caseExternal === undefined && scopeExternal === undefined) ||
    (caseExternal !== undefined &&
      scopeExternal !== undefined &&
      caseExternal.namespace === scopeExternal.namespace &&
      caseExternal.id === scopeExternal.id);
  if (!externalAgrees) reasons.push('SCOPE_SUBJECT_MISMATCH');

  if (reasons.length > 0) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.invalidScope,
      `The review scope does not describe this case: ${reasons.join(', ')}`,
      {
        reasonCodes: reasons,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
        requirementIds: [requirement.id],
      },
    );
  }
}

/**
 * Reads the clock and refuses anything that is not a canonical UTC instant, or
 * that would place the review before the case's own last change.
 *
 * A decision stamped earlier than the material it considered would be a
 * decision about a state that did not yet exist.
 */
function readClock(
  context: ProfessionalReviewContext,
  protocolizationCase: ProtocolizationCase,
): UtcDateTime {
  const now = context.clock.now();
  if (!isValidUtcDateTime(now)) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.invalidTimestamp,
      'The clock returned a non-canonical instant',
      { reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.invalidTimestamp] },
    );
  }
  if (Date.parse(now) < Date.parse(protocolizationCase.updatedAt)) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.invalidTimestamp,
      'The clock is earlier than the case being reviewed',
      {
        reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.invalidTimestamp],
        caseId: protocolizationCase.caseId,
      },
    );
  }
  return now;
}

function isUsableCorrelationId(value: unknown): boolean {
  return (
    value === undefined ||
    (typeof value === 'string' && value.trim() !== '' && value.length <= MAX_CORRELATION_ID_LENGTH)
  );
}

/**
 * Every review request and decision is bound to the case revision the request
 * named, and the case handed in must actually *be* at that revision.
 *
 * ### Why this is exact rather than "at least"
 *
 * A case is an immutable value in this package: every operation returns a new
 * one and the old one keeps existing. So "the case at revision 12" is a thing a
 * caller can hold, and asking for it is not asking for the impossible.
 *
 * The alternative — accepting a later case and projecting it into an earlier
 * basis — cannot be done honestly. Materials carry an `addedAt` but no revision,
 * and `requirementStates` is a live projection, so a packet built for revision
 * `12` from a case at revision `15` would show requirement progress that three
 * later operations produced. That is precisely the silent absorption this rule
 * exists to prevent, and failing loudly is the only alternative to doing it.
 *
 * A reviewer who should see the newer material gets a *new* request bound to the
 * newer revision. That is not a workaround; it is the intended history.
 */
function assertCaseIsAtBasisRevision(
  protocolizationCase: ProtocolizationCase,
  request: ProfessionalReviewRequest,
): void {
  if (protocolizationCase.revision !== request.reviewBasisRevision) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.invalidBasisRevision,
      `This review request is bound to case revision ${request.reviewBasisRevision}; the case supplied is at revision ${protocolizationCase.revision}`,
      {
        reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.invalidBasisRevision],
        reviewRequestId: request.reviewRequestId,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
      },
    );
  }
}

/**
 * The request must belong to the acting tenant, this case and this pin.
 *
 * Tenant first, before anything else about the request is inspected, so that a
 * caller holding another tenant's request id learns nothing from the error it
 * gets back.
 */
function assertRequestBelongsToCase(
  context: ProfessionalReviewContext,
  protocolizationCase: ProtocolizationCase,
  request: ProfessionalReviewRequest,
): void {
  if (request.tenantId !== context.tenantId) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.tenantMismatch,
      'The acting tenant does not own this ProfessionalReviewRequest',
      {
        reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.tenantMismatch],
        caseId: protocolizationCase.caseId,
        tenantId: context.tenantId,
      },
    );
  }
  if (request.caseId !== protocolizationCase.caseId) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.caseMismatch,
      'This ProfessionalReviewRequest names a different ProtocolizationCase',
      {
        reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.caseMismatch],
        reviewRequestId: request.reviewRequestId,
        caseId: protocolizationCase.caseId,
        tenantId: context.tenantId,
      },
    );
  }
  if (!protocolizationProfileRefsEqual(request.profile, protocolizationCase.profile)) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.profileMismatch,
      'This ProfessionalReviewRequest is pinned to a different AssetProfile version than the case',
      {
        reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.profileMismatch],
        reviewRequestId: request.reviewRequestId,
        caseId: protocolizationCase.caseId,
        tenantId: context.tenantId,
      },
    );
  }
}

/**
 * Every record the caller supplied must belong to the acting tenant and this
 * case.
 *
 * Without this, cross-tenant isolation would be advisory: a caller could hand
 * the packet builder another tenant's receipts, declarations and results and
 * have a reviewer read them under cover of a case it does own. The gate runs
 * before any of it reaches a packet, and reports the same code for a foreign
 * tenant whichever kind of record carried it.
 */
function assertInputsBelongToCase(
  context: ProfessionalReviewContext,
  protocolizationCase: ProtocolizationCase,
  inputs: ProfessionalReviewPacketInputs,
): void {
  const tenants = [
    ...(inputs.evidenceReceipts ?? []).map((receipt) => receipt.tenantId),
    ...(inputs.declarations ?? []).map((record) => record.tenantId),
    ...(inputs.verificationResults ?? []).map((result) => result.tenantId),
  ];
  if (tenants.some((tenantId) => tenantId !== context.tenantId)) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.tenantMismatch,
      'A supplied review input belongs to another tenant',
      {
        reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.tenantMismatch],
        caseId: protocolizationCase.caseId,
        tenantId: context.tenantId,
      },
    );
  }

  const cases = [
    ...(inputs.evidenceReceipts ?? []).map((receipt) => receipt.caseId),
    ...(inputs.declarations ?? []).map((record) => record.caseId),
    ...(inputs.verificationResults ?? []).map((result) => result.caseId),
  ];
  if (cases.some((caseId) => caseId !== protocolizationCase.caseId)) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.invalidInputs,
      'A supplied review input belongs to another case',
      {
        reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.invalidInputs],
        caseId: protocolizationCase.caseId,
        tenantId: context.tenantId,
      },
    );
  }
}

/**
 * Creates an immutable request for professional review, or fails.
 *
 * Order of checks is part of the contract: tenant, then case validity, then
 * request admission, then lifecycle, then the pinned profile, then requirement
 * kind, then attestation type, then scope, and only then the clock. A failure at
 * any step throws and produces nothing — no request, no event, and, since this
 * operation never touches the case, no mutation of any kind.
 *
 * It does not assign a reviewer, does not queue anything, does not notify
 * anyone, does not create an attestation and does not move the case one
 * revision. The case is byte-for-byte unchanged when it returns.
 */
export function createProfessionalReviewRequest(
  context: ProfessionalReviewContext,
  protocolizationCase: ProtocolizationCase,
  input: CreateProfessionalReviewRequestInput,
): ProfessionalReviewRequestTransition {
  assertActingTenantOwnsCase(context, protocolizationCase);
  assertReadableCase(protocolizationCase);

  const admissionReasons: string[] = [];
  if (!isValidProfessionalReviewRequestId(input.reviewRequestId)) {
    admissionReasons.push('REVIEW_REQUEST_ID_INVALID');
  }
  if (!isValidAssetRequirementId(input.attestationRequirementId)) {
    admissionReasons.push('REVIEW_REQUIREMENT_ID_INVALID');
  }
  if (!isUsableCorrelationId(input.correlationId)) {
    admissionReasons.push('REVIEW_CORRELATION_ID_INVALID');
  }
  if (admissionReasons.length > 0) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.invalidRequest,
      'Cannot request professional review: the request is malformed',
      {
        reasonCodes: admissionReasons,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
      },
    );
  }

  assertCaseAcceptsReview(protocolizationCase);

  const profile = resolvePinnedProfile(context, protocolizationCase);
  const requirement = resolveAttestationRequirement(
    profile,
    protocolizationCase,
    input.attestationRequirementId,
  );
  assertAttestationTypeAccepted(requirement, protocolizationCase, input.requestedAttestationType);
  assertScopeMatchesCase(
    protocolizationCase,
    requirement,
    input.requestedAttestationType,
    protocolizationCase.revision,
    input.requestedScope,
  );

  const requestedAt = readClock(context, protocolizationCase);

  const request: ProfessionalReviewRequest = {
    schemaVersion: PROFESSIONAL_REVIEW_REQUEST_SCHEMA_VERSION,
    reviewRequestId: input.reviewRequestId,
    tenantId: protocolizationCase.tenantId,
    caseId: protocolizationCase.caseId,
    // Copied field by field rather than spread, so the recorded pin is exactly
    // the two frozen fields and nothing can ride along on it.
    profile: {
      profileId: protocolizationCase.profile.profileId,
      profileVersion: protocolizationCase.profile.profileVersion,
    },
    attestationRequirementId: requirement.id,
    requestedAttestationType: input.requestedAttestationType,
    requestedScope: input.requestedScope,
    reviewBasisRevision: protocolizationCase.revision,
    requestedAt,
    ...(input.correlationId === undefined ? {} : { correlationId: input.correlationId }),
  };

  const validation = validateProfessionalReviewRequest(request);
  if (!validation.admitted) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.invalidRequestRecord,
      `Refusing to produce an invalid ProfessionalReviewRequest: ${validation.reasons.join(', ')}`,
      {
        reasonCodes: validation.reasons,
        reviewRequestId: input.reviewRequestId,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
      },
    );
  }

  return {
    request: deepFreeze(request),
    event: deepFreeze<ProfessionalReviewRequestedEvent>({
      eventType: PROFESSIONAL_REVIEW_EVENT_TYPES.reviewRequested,
      reviewRequestId: request.reviewRequestId,
      tenantId: request.tenantId,
      caseId: request.caseId,
      profile: request.profile,
      attestationRequirementId: request.attestationRequirementId,
      requestedAttestationType: request.requestedAttestationType,
      reviewBasisRevision: request.reviewBasisRevision,
      occurredAt: requestedAt,
      ...(request.correlationId === undefined ? {} : { correlationId: request.correlationId }),
    }),
  };
}

/**
 * The revision filter, stated once.
 *
 * A record produced at case revision `n` was part of the case at every revision
 * from `n` onward, so it belongs in a basis of `n` or later and never in an
 * earlier one. Receipts and declaration records carry the revision they
 * *produced*; verification results carry the revision they *evaluated*, which is
 * the same comparison because recording a result never moves the case.
 */
function withinBasis(recordRevision: number, basisRevision: number): boolean {
  return recordRevision <= basisRevision;
}

/**
 * Which verification result speaks for one `(requirementId, checkId)` pair.
 *
 * ### Deterministic relative to the basis, never "latest globally"
 *
 * A check may have run many times. Taking the newest result outright would mean
 * a packet's content depended on when it was built rather than on the basis it
 * describes — and a re-run at revision `15` would appear inside a packet for
 * revision `12`.
 *
 * The rule is therefore: **the latest result whose `evaluatedCaseRevision` is at
 * or before the review basis revision**, tie-broken by execution instant and
 * then by execution id so the answer is total. That is deterministic, stable
 * under later re-runs, and honest about what the reviewer could have seen.
 *
 * Results that evaluated an *earlier* revision are kept, not discarded: a check
 * that ran at revision `9` and has not been re-run is genuinely the most recent
 * thing anyone knows about it, and hiding it would leave the packet silently
 * missing a finding. It is marked `currentForReviewBasis: false` instead, so the
 * reviewer sees both revisions and decides for themselves.
 */
function selectResultsForBasis(
  results: readonly ProtocolizationVerificationResult[],
  basisRevision: number,
): readonly ProtocolizationVerificationResult[] {
  const selected = new Map<string, ProtocolizationVerificationResult>();
  for (const result of results) {
    if (!withinBasis(result.evaluatedCaseRevision, basisRevision)) continue;
    // A requirement id is a dotted token and cannot contain `\n`, so the
    // separator is never ambiguous between two distinct pairs.
    const key = `${result.requirementId}\n${result.checkId}`;
    const held = selected.get(key);
    if (held === undefined || compareResultRecency(held, result) < 0) selected.set(key, result);
  }
  return [...selected.values()].sort(compareResultRecency);
}

function compareResultRecency(
  left: ProtocolizationVerificationResult,
  right: ProtocolizationVerificationResult,
): number {
  if (left.evaluatedCaseRevision !== right.evaluatedCaseRevision) {
    return left.evaluatedCaseRevision < right.evaluatedCaseRevision ? -1 : 1;
  }
  const byInstant = Date.parse(left.executedAt) - Date.parse(right.executedAt);
  if (byInstant !== 0) return byInstant < 0 ? -1 : 1;
  if (left.executionId === right.executionId) return 0;
  return left.executionId < right.executionId ? -1 : 1;
}

/**
 * PARTICIPANTS, from what the workflow actually knows.
 *
 * One entry per distinct declarant principal, in first-appearance order, each
 * carrying the declarations that put it there. No applicant is invented, no
 * owner is inferred, and the reviewer themselves never appears here — a reviewer
 * is not a participant in the case they are reviewing.
 */
function projectParticipants(
  declarations: readonly ProtocolizationDeclarationRecord[],
): readonly ProfessionalReviewParticipant[] {
  const byPrincipal = new Map<string, { principal: CanonicalPrincipalRef; declarationIds: string[] }>();
  for (const record of declarations) {
    // Two references naming the same id and kind are the same principal. The
    // key is never normalized, case-folded or parsed: an opaque identifier
    // that got folded would merge two distinct principals.
    const key = `${record.declarant.kind}\n${record.declarant.id}`;
    const held = byPrincipal.get(key);
    if (held === undefined) {
      byPrincipal.set(key, { principal: record.declarant, declarationIds: [record.declarationId] });
    } else {
      held.declarationIds.push(record.declarationId);
    }
  }
  return [...byPrincipal.values()].map((entry) => ({
    principal: entry.principal,
    roles: [ProfessionalReviewParticipantRole.Declarant],
    declarationIds: entry.declarationIds,
  }));
}

function projectExceptions(
  protocolizationCase: ProtocolizationCase,
  profile: AssetProfile,
  checks: readonly ProfessionalReviewCheckEntry[],
): ProfessionalReviewExceptions {
  const withOutcome = (outcome: VerificationCheckOutcome): readonly string[] =>
    checks.filter((entry) => entry.outcome === outcome).map((entry) => entry.executionId);

  const executed = new Set(checks.map((entry) => `${entry.requirementId}\n${entry.checkId}`));
  const unexecuted: ProfessionalReviewUnexecutedCheck[] = [];
  for (const requirement of profile.requirements) {
    if (requirement.kind !== AssetRequirementKind.Verification) continue;
    for (const checkId of requirement.checkIds) {
      if (!executed.has(`${requirement.id}\n${checkId}`)) {
        unexecuted.push({ requirementId: requirement.id, checkId });
      }
    }
  }

  const progress = listProtocolizationCaseRequirementProgress(protocolizationCase, profile);

  return {
    failedCheckExecutionIds: withOutcome(VerificationCheckOutcome.Fail),
    warningCheckExecutionIds: withOutcome(VerificationCheckOutcome.Warning),
    manualReviewCheckExecutionIds: withOutcome(VerificationCheckOutcome.ManualReview),
    unavailableCheckExecutionIds: withOutcome(VerificationCheckOutcome.Unavailable),
    staleCheckExecutionIds: checks
      .filter((entry) => !entry.currentForReviewBasis)
      .map((entry) => entry.executionId),
    unexecutedChecks: unexecuted,
    pendingMaterialRequirementIds: progress
      .filter(
        (entry) =>
          entry.materialStatus === ProtocolizationRequirementMaterialStatus.Pending &&
          entry.obligation !== AssetRequirementObligation.NotRequired,
      )
      .map((entry) => entry.requirementId),
    unresolvedConditionalRequirementIds: progress
      .filter(
        (entry) => entry.conditionStatus === ProtocolizationRequirementConditionStatus.Unresolved,
      )
      .map((entry) => entry.requirementId),
  } as ProfessionalReviewExceptions;
}

/**
 * Projects the bounded, deterministic view of one review basis.
 *
 * Pure and synchronous: no clock, no repository, no I/O, no mutation. Building
 * a packet twice from the same inputs produces the same packet, and building one
 * never changes a case, a receipt, a declaration or a result.
 *
 * ### What it refuses
 *
 * A request from another tenant, for another case, under another pin, naming an
 * unknown requirement or one of the wrong kind, or bound to a revision the
 * supplied case is not at. It repairs none of those: a packet silently built
 * from a corrected reference would be a packet describing a review that was
 * never requested.
 *
 * ### What it never filters
 *
 * Outcomes. Every APV-07 result in the basis appears, whatever it says. A
 * `ManualReview` in particular does not block construction — a packet is exactly
 * what a `ManualReview` is asking for, and refusing to build it would defeat the
 * architecture that emitted it.
 */
export function buildProfessionalReviewPacket(
  context: ProfessionalReviewContext,
  protocolizationCase: ProtocolizationCase,
  request: ProfessionalReviewRequest,
  inputs: ProfessionalReviewPacketInputs = {},
): ProfessionalReviewPacket {
  assertActingTenantOwnsCase(context, protocolizationCase);
  assertReadableCase(protocolizationCase);
  assertRequestBelongsToCase(context, protocolizationCase, request);
  assertCaseIsAtBasisRevision(protocolizationCase, request);
  assertInputsBelongToCase(context, protocolizationCase, inputs);

  const profile = resolvePinnedProfile(context, protocolizationCase);
  const requirement = resolveAttestationRequirement(
    profile,
    protocolizationCase,
    request.attestationRequirementId,
  );

  const basisRevision = request.reviewBasisRevision;

  const declarations: readonly ProtocolizationDeclarationRecord[] = (inputs.declarations ?? [])
    .filter((record) => withinBasis(record.caseRevision, basisRevision))
    .slice()
    .sort((left, right) =>
      left.caseRevision === right.caseRevision
        ? left.declarationId < right.declarationId
          ? -1
          : left.declarationId > right.declarationId
            ? 1
            : 0
        : left.caseRevision - right.caseRevision,
    );

  const receipts: readonly EvidenceIntakeReceipt[] = (inputs.evidenceReceipts ?? [])
    .filter((receipt) => withinBasis(receipt.caseRevision, basisRevision))
    .slice()
    .sort((left, right) =>
      left.caseRevision === right.caseRevision
        ? left.intakeId < right.intakeId
          ? -1
          : left.intakeId > right.intakeId
            ? 1
            : 0
        : left.caseRevision - right.caseRevision,
    );

  const results = selectResultsForBasis(inputs.verificationResults ?? [], basisRevision);

  const declarationEntries: readonly ProfessionalReviewDeclarationEntry[] = declarations.map(
    (record) => ({
      declarationId: record.declarationId,
      declarant: record.declarant,
      claimType: record.claimType,
      ...(record.claimSubtype === undefined ? {} : { claimSubtype: record.claimSubtype }),
      claimRef: record.claimRef,
      materialId: record.materialId,
      requirementIds: record.requirementIds,
      ...(record.supportingEvidenceRefs === undefined
        ? {}
        : { supportingEvidenceRefs: record.supportingEvidenceRefs }),
      ...(record.statement === undefined ? {} : { statement: record.statement }),
      ...(record.declaredAt === undefined ? {} : { declaredAt: record.declaredAt }),
      recordedAt: record.recordedAt,
      ...(record.sourceRef === undefined ? {} : { sourceRef: record.sourceRef }),
      caseRevision: record.caseRevision,
    }),
  );

  const evidenceEntries: readonly ProfessionalReviewEvidenceEntry[] = receipts.map((receipt) => ({
    intakeId: receipt.intakeId,
    categoryId: receipt.categoryId,
    evidenceRef: receipt.evidenceRef,
    materialId: receipt.materialId,
    requirementIds: receipt.requirementIds,
    receivedAt: receipt.receivedAt,
    ...(receipt.observedAt === undefined ? {} : { observedAt: receipt.observedAt }),
    ...(receipt.sourceRef === undefined ? {} : { sourceRef: receipt.sourceRef }),
    caseRevision: receipt.caseRevision,
  }));

  const checkEntries: readonly ProfessionalReviewCheckEntry[] = results.map((result) => ({
    executionId: result.executionId,
    requirementId: result.requirementId,
    checkId: result.checkId,
    outcome: result.outcome,
    ...(result.reasonCode === undefined ? {} : { reasonCode: result.reasonCode }),
    ...(result.summary === undefined ? {} : { summary: result.summary }),
    ...(result.inputRefs === undefined ? {} : { inputRefs: result.inputRefs }),
    evaluatedCaseRevision: result.evaluatedCaseRevision,
    currentForReviewBasis: isVerificationResultCurrentForRevision(result, basisRevision),
    executedAt: result.executedAt,
  }));

  const packet: ProfessionalReviewPacket = {
    schemaVersion: PROFESSIONAL_REVIEW_PACKET_SCHEMA_VERSION,
    reviewRequestId: request.reviewRequestId,
    tenantId: request.tenantId,
    caseId: request.caseId,
    profile: request.profile,
    reviewBasisRevision: basisRevision,
    subject: {
      subjectRef: protocolizationCase.subject.subjectRef,
      ...(protocolizationCase.subject.contentIdentity === undefined
        ? {}
        : { contentIdentity: protocolizationCase.subject.contentIdentity }),
      caseState: protocolizationCase.state,
    },
    participants: projectParticipants(declarations),
    declarations: declarationEntries,
    evidence: evidenceEntries,
    automatedChecks: checkEntries,
    exceptions: projectExceptions(protocolizationCase, profile, checkEntries),
    attestationRequested: {
      requirementId: requirement.id,
      obligation: requirement.obligation,
      acceptedTypes: requirement.acceptedTypes,
      requestedAttestationType: request.requestedAttestationType,
      ...(requirement.minimumCount === undefined ? {} : { minimumCount: requirement.minimumCount }),
      ...(requirement.attester === undefined ? {} : { attester: requirement.attester }),
      ...(requirement.jurisdictions === undefined
        ? {}
        : { jurisdictions: requirement.jurisdictions }),
      ...(requirement.freshness === undefined ? {} : { freshness: requirement.freshness }),
    },
    scope: request.requestedScope,
  };

  return deepFreeze(packet);
}

/**
 * Structural compatibility between a reviewer and what the pinned profile's
 * attester constraint mechanically states.
 *
 * ### What is enforced
 *
 * ```text
 * acceptedPrincipalKinds   the reviewer's PrincipalKind must be listed
 * credential.acceptedTypes at least one presented credential ref must be of an
 *                          accepted CredentialType
 * credential.acceptedStatuses
 *                          where the profile names acceptable statuses, the
 *                          matching credential ref must *declare* one of them
 * ```
 *
 * ### What is deliberately not enforced, and why
 *
 * ```text
 * acceptedRoles            an opaque vertical role token with no structurally
 *                          comparable field on any Protocol principal record.
 *                          Guessing at one — reading a display name, parsing an
 *                          id, matching metadata by convention — would be this
 *                          package deciding what a profession is, which is the
 *                          exact leak the vertical boundary exists to prevent.
 *                          It travels into the packet, where a human reads it.
 *
 * credential.acceptedIssuerNamespaces
 *                          a CanonicalCredentialIssuer carries an id and a
 *                          kind, not a namespace. Parsing the id for one would
 *                          be inventing a grammar Protocol does not define.
 *
 * credential.freshness     expiry lives on a CanonicalCredential, and this
 *                          workflow receives a CanonicalCredentialRef. There is
 *                          no instant here to compare, and inferring one would
 *                          be manufacturing currency out of nothing.
 *
 * jurisdictions            recorded context, never interpreted. This package
 *                          knows no jurisdiction's law and resolves no
 *                          standing anywhere.
 * ```
 *
 * ### What none of this establishes
 *
 * ```text
 * principal kind matches  != this reviewer is who they say they are
 * credential ref present  != the credential exists
 * credential type matches != the credential is valid
 * declared status Active  != the credential is currently active
 * all constraints match   != this reviewer may lawfully issue this attestation
 * ```
 *
 * A declared status is what somebody *wrote on a reference*; Protocol's own
 * contract for `CanonicalCredentialStatusRef` is that it describes a status
 * "without checking revocation, evaluating standing, or verifying the
 * credential". Establishing real professional authority needs an external
 * verification this vertical does not perform, and pretending otherwise here
 * would be manufacturing legal authority out of a type check.
 */
function assertReviewerSatisfiesConstraints(
  protocolizationCase: ProtocolizationCase,
  requirement: AssetAttestationRequirement,
  reviewer: CanonicalPrincipalRef,
  credentialRefs: readonly CanonicalCredentialRef[] | undefined,
): void {
  const attester = requirement.attester;
  if (attester === undefined) return;

  if (
    attester.acceptedPrincipalKinds !== undefined &&
    !attester.acceptedPrincipalKinds.includes(reviewer.kind)
  ) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.invalidReviewer,
      `Requirement ${requirement.id} does not accept a reviewer of principal kind ${reviewer.kind}`,
      {
        reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.invalidReviewer],
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
        requirementIds: [requirement.id],
      },
    );
  }

  const credential: AssetCredentialConstraint | undefined = attester.credential;
  if (credential === undefined) return;

  if (credentialRefs === undefined || credentialRefs.length === 0) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.credentialRequired,
      `Requirement ${requirement.id} requires a credential reference and none was presented`,
      {
        reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.credentialRequired],
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
        requirementIds: [requirement.id],
      },
    );
  }

  const typeMatches = credentialRefs.filter((ref) => credential.acceptedTypes.includes(ref.type));
  if (typeMatches.length === 0) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.incompatibleCredential,
      `Requirement ${requirement.id} accepts credential types [${credential.acceptedTypes.join(', ')}]; none was presented`,
      {
        reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.incompatibleCredential],
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
        requirementIds: [requirement.id],
      },
    );
  }

  const acceptedStatuses = credential.acceptedStatuses;
  if (acceptedStatuses !== undefined) {
    // A profile that names acceptable statuses is stating something mechanical,
    // so a reference that declares no status at all cannot satisfy it — and is
    // never treated as though it had declared an acceptable one.
    const statusMatches = typeMatches.some(
      (ref) => ref.status !== undefined && acceptedStatuses.includes(ref.status.status),
    );
    if (!statusMatches) {
      failReview(
        PROFESSIONAL_REVIEW_ERROR_CODES.incompatibleCredential,
        `Requirement ${requirement.id} accepts declared credential statuses [${acceptedStatuses.join(', ')}]; no presented reference declares one`,
        {
          reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.incompatibleCredential],
          caseId: protocolizationCase.caseId,
          tenantId: protocolizationCase.tenantId,
          requirementIds: [requirement.id],
        },
      );
    }
  }
}

/**
 * The claim an attestation is about must be one this case already holds.
 *
 * See `attestation-preparation.ts` for why this is the rule that keeps the whole
 * construction honest. A claim the case does not carry is not attested to; it is
 * refused.
 */
function assertClaimIsInCase(
  protocolizationCase: ProtocolizationCase,
  request: ProfessionalReviewRequest,
  claimRef: CanonicalClaimId,
): void {
  const held = protocolizationCase.materials.some(
    (material) =>
      material.kind === ProtocolizationMaterialKind.Declaration && material.claimRef === claimRef,
  );
  if (!held) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.attestationCannotBeConstructed,
      'A CanonicalAttestation must be about a claim this case already holds; no Declaration material names this claim',
      {
        reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.attestationCannotBeConstructed],
        reviewRequestId: request.reviewRequestId,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
        requirementIds: [request.attestationRequirementId],
      },
    );
  }
}

/** Fields an action does not carry, refused before anything is built. */
function assertActionShape(
  protocolizationCase: ProtocolizationCase,
  request: ProfessionalReviewRequest,
  input: RecordProfessionalReviewDecisionInput,
): void {
  if (!isProfessionalReviewAction(input.action)) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.invalidAction,
      'A professional review action must be one of Attest, Reject, RequestMoreEvidence or Abstain',
      {
        reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.invalidAction],
        reviewRequestId: request.reviewRequestId,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
      },
    );
  }

  const reasons: string[] = [];
  const isAttest = input.action === ProfessionalReviewAction.Attest;

  if (isAttest) {
    if (input.scope === undefined) {
      failReview(
        PROFESSIONAL_REVIEW_ERROR_CODES.scopeRequired,
        'An Attest decision requires a machine-readable scope; an unscoped attestation is not representable',
        {
          reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.scopeRequired],
          reviewRequestId: request.reviewRequestId,
          caseId: protocolizationCase.caseId,
          tenantId: protocolizationCase.tenantId,
        },
      );
    }
    if (input.reviewedRefs === undefined || input.reviewedRefs.length === 0) {
      reasons.push('REVIEWED_REFS_REQUIRED');
    }
    if (input.requestedMaterial !== undefined) reasons.push('REQUESTED_MATERIAL_UNEXPECTED');
  } else {
    if (input.scope !== undefined) reasons.push('SCOPE_UNEXPECTED');
    if (input.attestation !== undefined) reasons.push('ATTESTATION_UNEXPECTED');
    if (input.reasonCode === undefined) {
      failReview(
        PROFESSIONAL_REVIEW_ERROR_CODES.reasonCodeRequired,
        `A ${input.action} decision requires a machine-readable reason code`,
        {
          reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.reasonCodeRequired],
          reviewRequestId: request.reviewRequestId,
          caseId: protocolizationCase.caseId,
          tenantId: protocolizationCase.tenantId,
        },
      );
    }
    if (input.action === ProfessionalReviewAction.RequestMoreEvidence) {
      if (input.requestedMaterial === undefined || input.requestedMaterial.length === 0) {
        failReview(
          PROFESSIONAL_REVIEW_ERROR_CODES.emptyMaterialRequest,
          'A RequestMoreEvidence decision must identify what is needed, machine-readably',
          {
            reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.emptyMaterialRequest],
            reviewRequestId: request.reviewRequestId,
            caseId: protocolizationCase.caseId,
            tenantId: protocolizationCase.tenantId,
          },
        );
      }
    } else if (input.requestedMaterial !== undefined) {
      reasons.push('REQUESTED_MATERIAL_UNEXPECTED');
    }
  }

  if (reasons.length > 0) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.unexpectedActionField,
      `This review action does not carry these fields: ${reasons.join(', ')}`,
      {
        reasonCodes: reasons,
        reviewRequestId: request.reviewRequestId,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
      },
    );
  }
}

/**
 * Records what a reviewer decided, or fails.
 *
 * Order of checks is part of the contract: tenant, then case validity, then
 * request ownership, then basis revision, then input admission, then lifecycle,
 * then the pinned profile, then requirement kind, then the action's own shape,
 * then the reviewer against the profile's attester constraints, then the scope,
 * then — only for an `Attest` that asked for one — the claim, the proof
 * references and the attestation. A failure at any step throws and produces
 * nothing: no decision, no attestation, no event, and no case mutation.
 *
 * ### Asking for an artifact is atomic; not asking for one is a workflow
 *
 * These are two different calls, and the distinction is the whole reason a
 * refusal here can be absolute:
 *
 * ```text
 * Attest, `attestation` omitted     -> a complete vertical decision, with no
 *                                      canonicalAttestationRef, no Attestation
 *                                      material and no resultingCaseRevision
 *
 * Attest, `attestation` supplied    -> the decision and the CanonicalAttestation
 *                                      and the material association, together,
 *                                      or nothing at all
 * ```
 *
 * So a caller who asked APV to produce a Protocol artifact and cannot
 * legitimately have one — the claim is not the case's, no proof reference can be
 * obtained, the record would not satisfy Protocol's shape — receives an error,
 * not a silently downgraded decision. Downgrading would answer a request nobody
 * made and would hide, behind a success, that the artifact the caller is about
 * to look for does not exist. A professional who wants the position on record
 * without the artifact expresses that by omitting the input, which is a
 * supported outcome and always was.
 *
 * ### None of the four actions is an error
 *
 * A `Reject`, a `RequestMoreEvidence` and an `Abstain` all return successfully.
 * The only things that throw are malformed, unauthorized or incoherent
 * *operations* — never a professional's substantive conclusion.
 *
 * ### Automated results never decide this
 *
 * There is no branch anywhere in this function on an APV-07 outcome. No
 * `if (allPass) attest`, no `if (anyFail) reject`, no threshold, no score. A
 * reviewer may attest over a `Fail` within a narrower scope, and may reject with
 * every check passing; both are recorded exactly as given, and the tension
 * between an automated finding and a professional position stays visible for
 * APV-09 to weigh.
 */
export async function recordProfessionalReviewDecision(
  context: ProfessionalReviewContext,
  protocolizationCase: ProtocolizationCase,
  request: ProfessionalReviewRequest,
  input: RecordProfessionalReviewDecisionInput,
): Promise<ProfessionalReviewDecisionTransition> {
  assertActingTenantOwnsCase(context, protocolizationCase);
  assertReadableCase(protocolizationCase);
  assertRequestBelongsToCase(context, protocolizationCase, request);
  assertCaseIsAtBasisRevision(protocolizationCase, request);

  const admissionReasons: string[] = [];
  if (!isValidProfessionalReviewDecisionId(input.decisionId)) {
    admissionReasons.push('REVIEW_DECISION_ID_INVALID');
  }
  if (!isUsableCorrelationId(input.correlationId)) {
    admissionReasons.push('REVIEW_CORRELATION_ID_INVALID');
  }
  if (admissionReasons.length > 0) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.invalidRequest,
      'Cannot record a professional review decision: the request is malformed',
      {
        reasonCodes: admissionReasons,
        reviewRequestId: request.reviewRequestId,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
      },
    );
  }

  if (input.reviewer === undefined || input.reviewer === null) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.reviewerRequired,
      'A professional review decision must identify its reviewer',
      {
        reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.reviewerRequired],
        reviewRequestId: request.reviewRequestId,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
      },
    );
  }

  assertCaseAcceptsReview(protocolizationCase);

  const profile = resolvePinnedProfile(context, protocolizationCase);
  const requirement = resolveAttestationRequirement(
    profile,
    protocolizationCase,
    request.attestationRequirementId,
  );

  assertActionShape(protocolizationCase, request, input);
  assertReviewerSatisfiesConstraints(
    protocolizationCase,
    requirement,
    input.reviewer,
    input.reviewerCredentialRefs,
  );

  const isAttest = input.action === ProfessionalReviewAction.Attest;
  if (isAttest) {
    assertScopeMatchesCase(
      protocolizationCase,
      requirement,
      request.requestedAttestationType,
      request.reviewBasisRevision,
      input.scope as ProfessionalReviewScope,
    );
  }

  const decidedAt = readClock(context, protocolizationCase);

  let attestation: CanonicalAttestation | undefined;
  let caseTransition:
    | { readonly protocolizationCase: ProtocolizationCase; readonly event: ProtocolizationCaseEvent }
    | undefined;

  if (isAttest && input.attestation !== undefined) {
    const wanted = input.attestation;
    assertClaimIsInCase(protocolizationCase, request, wanted.claimRef);

    const proofRefs = await collectProofRefs(context, protocolizationCase, request, input, wanted, decidedAt);

    attestation = prepareCanonicalAttestationFromReview({
      attestationId: wanted.attestationId,
      attestationType: request.requestedAttestationType,
      attester: input.reviewer,
      claimRef: wanted.claimRef,
      statement: wanted.statement,
      issuedAt: decidedAt,
      ...(input.reviewerCredentialRefs === undefined
        ? {}
        : { credentialRefs: input.reviewerCredentialRefs }),
      proofRefs,
    });

    // Everything the case owns — lifecycle, pinned-version requirement
    // correlation, duplicate material ids, the clock, the revision increment and
    // the freeze — is enforced here, once, by the aggregate that owns it. The
    // attestation document itself is deliberately not passed on: the case
    // records the reference, never a copy of the Protocol record.
    caseTransition = addProtocolizationCaseMaterial(context, protocolizationCase, {
      materialId: wanted.materialId,
      kind: ProtocolizationMaterialKind.Attestation,
      attestationRef: attestation.id,
      // Exactly the one attestation requirement this review answers. Never a
      // list, so a legitimate attestation can never move a requirement of
      // another kind to `MaterialPresent`.
      requirementIds: [requirement.id],
      ...(input.correlationId === undefined ? {} : { correlationId: input.correlationId }),
    });
  }

  const resultingCaseRevision = caseTransition?.protocolizationCase.revision;

  const decision: ProfessionalReviewDecision = {
    schemaVersion: PROFESSIONAL_REVIEW_DECISION_SCHEMA_VERSION,
    decisionId: input.decisionId,
    reviewRequestId: request.reviewRequestId,
    tenantId: protocolizationCase.tenantId,
    caseId: protocolizationCase.caseId,
    profile: {
      profileId: request.profile.profileId,
      profileVersion: request.profile.profileVersion,
    },
    attestationRequirementId: requirement.id,
    reviewer: input.reviewer,
    ...(input.reviewerCredentialRefs === undefined
      ? {}
      : { reviewerCredentialRefs: [...input.reviewerCredentialRefs] }),
    action: input.action,
    ...(input.scope === undefined ? {} : { scope: input.scope }),
    reviewBasisRevision: request.reviewBasisRevision,
    ...(resultingCaseRevision === undefined ? {} : { resultingCaseRevision }),
    ...(input.reviewedRefs === undefined ? {} : { reviewedRefs: [...input.reviewedRefs] }),
    ...(input.reasonCode === undefined ? {} : { reasonCode: input.reasonCode }),
    ...(input.requestedMaterial === undefined
      ? {}
      : { requestedMaterial: [...input.requestedMaterial] }),
    ...(input.note === undefined ? {} : { note: input.note }),
    ...(attestation === undefined ? {} : { canonicalAttestationRef: attestation.id }),
    ...(input.attestation === undefined || attestation === undefined
      ? {}
      : { attestationMaterialId: input.attestation.materialId }),
    decidedAt,
    ...(input.correlationId === undefined ? {} : { correlationId: input.correlationId }),
  };

  const validation = validateProfessionalReviewDecision(decision);
  if (!validation.admitted) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.invalidDecision,
      `Refusing to produce an invalid ProfessionalReviewDecision: ${validation.reasons.join(', ')}`,
      {
        reasonCodes: validation.reasons,
        decisionId: input.decisionId,
        reviewRequestId: request.reviewRequestId,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
      },
    );
  }

  const decisionEvent: ProfessionalReviewDecisionRecordedEvent = {
    eventType: PROFESSIONAL_REVIEW_EVENT_TYPES.decisionRecorded,
    decisionId: decision.decisionId,
    reviewRequestId: decision.reviewRequestId,
    tenantId: decision.tenantId,
    caseId: decision.caseId,
    profile: decision.profile,
    attestationRequirementId: decision.attestationRequirementId,
    reviewer: decision.reviewer,
    action: decision.action,
    ...(decision.reasonCode === undefined ? {} : { reasonCode: decision.reasonCode }),
    reviewBasisRevision: decision.reviewBasisRevision,
    ...(decision.resultingCaseRevision === undefined
      ? {}
      : { resultingCaseRevision: decision.resultingCaseRevision }),
    ...(decision.canonicalAttestationRef === undefined
      ? {}
      : { canonicalAttestationRef: decision.canonicalAttestationRef }),
    occurredAt: decidedAt,
    ...(decision.correlationId === undefined ? {} : { correlationId: decision.correlationId }),
  };

  if (attestation === undefined || caseTransition === undefined || input.attestation === undefined) {
    return deepFreeze<ProfessionalReviewDecisionTransition>({
      decision,
      decisionEvent,
    });
  }

  const attestationEvent: ProfessionalAttestationRecordedEvent = {
    eventType: PROFESSIONAL_REVIEW_EVENT_TYPES.attestationRecorded,
    decisionId: decision.decisionId,
    reviewRequestId: decision.reviewRequestId,
    tenantId: decision.tenantId,
    caseId: decision.caseId,
    profile: decision.profile,
    attestationRequirementId: decision.attestationRequirementId,
    canonicalAttestationRef: attestation.id,
    attestationType: attestation.type,
    attester: input.reviewer,
    materialId: input.attestation.materialId,
    reviewBasisRevision: decision.reviewBasisRevision,
    resultingCaseRevision: caseTransition.protocolizationCase.revision,
    occurredAt: decidedAt,
    ...(decision.correlationId === undefined ? {} : { correlationId: decision.correlationId }),
  };

  return deepFreeze<ProfessionalReviewDecisionTransition>({
    decision,
    decisionEvent,
    protocolizationCase: caseTransition.protocolizationCase,
    caseEvent: caseTransition.event,
    attestation,
    attestationEvent,
  });
}

/**
 * Obtains the proof references a requested attestation will carry, or fails.
 *
 * Two legitimate sources, in this order: references the caller already held, and
 * a reference an injected `AttestationSigner` produced. At least one usable
 * reference must come back from one of them, because a professional attestation
 * this vertical produces is auditable or it is not produced.
 *
 * ```text
 * caller refs, no signer          -> the caller's refs
 * caller refs + signer            -> the caller's refs, plus the signer's
 * no caller refs, signer signs    -> the signer's ref
 * no caller refs, no signer       -> REVIEW_SIGNATURE_UNAVAILABLE
 * signer throws or rejects        -> REVIEW_SIGNATURE_UNAVAILABLE
 * signer returns an unusable ref  -> REVIEW_SIGNATURE_UNAVAILABLE
 * ```
 *
 * Every failure path refuses the whole decision rather than producing an
 * attestation with a placeholder proof or none at all. The signer's own return
 * value is checked for structural usability *here*, because a signer returning a
 * non-reference is the port misbehaving; caller-supplied references are checked
 * once, in `prepareCanonicalAttestationFromReview`, where malformed caller input
 * belongs (`REVIEW_ATTESTATION_CANNOT_BE_CONSTRUCTED`). One condition, one code,
 * either way.
 *
 * None of this verifies a proof. `CanonicalProofRef` is a reference to an
 * artifact this package never resolves, and requiring the reference to be
 * present says nothing about whether the artifact behind it holds.
 */
async function collectProofRefs(
  context: ProfessionalReviewContext,
  protocolizationCase: ProtocolizationCase,
  request: ProfessionalReviewRequest,
  input: RecordProfessionalReviewDecisionInput,
  wanted: ProfessionalAttestationInput,
  issuedAt: UtcDateTime,
): Promise<readonly CanonicalProofRef[]> {
  const supplied = wanted.proofRefs === undefined ? [] : [...wanted.proofRefs];
  if (context.signer === undefined) {
    if (supplied.length === 0) {
      failReview(
        PROFESSIONAL_REVIEW_ERROR_CODES.signatureUnavailable,
        'A CanonicalAttestation was requested with no proof reference and no configured AttestationSigner; a professional attestation is not produced without one',
        {
          reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.signatureUnavailable],
          reviewRequestId: request.reviewRequestId,
          decisionId: input.decisionId,
          caseId: protocolizationCase.caseId,
          tenantId: protocolizationCase.tenantId,
          requirementIds: [request.attestationRequirementId],
        },
      );
    }
    return supplied;
  }

  let signed: CanonicalProofRef;
  try {
    signed = await context.signer.sign({
      tenantId: protocolizationCase.tenantId,
      caseId: protocolizationCase.caseId,
      reviewRequestId: request.reviewRequestId,
      decisionId: input.decisionId,
      attestationId: wanted.attestationId,
      attestationType: request.requestedAttestationType,
      attester: input.reviewer,
      claimRef: wanted.claimRef,
      statement: wanted.statement,
      issuedAt,
    });
  } catch (cause) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.signatureUnavailable,
      `The configured AttestationSigner could not produce a proof: ${String(cause)}`,
      {
        reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.signatureUnavailable],
        reviewRequestId: request.reviewRequestId,
        decisionId: input.decisionId,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
      },
    );
  }

  if (!isUsableProofRef(signed)) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.signatureUnavailable,
      'The configured AttestationSigner returned something this package will not carry as a CanonicalProofRef',
      {
        reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.signatureUnavailable],
        reviewRequestId: request.reviewRequestId,
        decisionId: input.decisionId,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
      },
    );
  }

  return [...supplied, signed];
}

/**
 * Turns an untrusted, persisted value back into a review request, or fails.
 *
 * The single supported way to bring one back across a persistence or network
 * boundary. It validates before it trusts and freezes what it returns, so a
 * store cannot hand a caller a request the workflow would have refused to
 * produce.
 */
export function reconstituteProfessionalReviewRequest(value: unknown): ProfessionalReviewRequest {
  const validation = validateProfessionalReviewRequest(value);
  if (!validation.admitted) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.invalidRequestRecord,
      `Refusing to reconstitute an invalid ProfessionalReviewRequest: ${validation.reasons.join(', ')}`,
      { reasonCodes: validation.reasons },
    );
  }
  return deepFreeze(value as ProfessionalReviewRequest);
}

/**
 * Turns an untrusted, persisted value back into a review decision, or fails.
 *
 * Same discipline, and one extra guarantee that matters here: a decision whose
 * action is a string outside the closed set, or whose action-conditioned shape
 * is wrong — a `Reject` carrying an attestation reference, an `Attest` with no
 * scope — is refused rather than repaired.
 */
export function reconstituteProfessionalReviewDecision(value: unknown): ProfessionalReviewDecision {
  const validation = validateProfessionalReviewDecision(value);
  if (!validation.admitted) {
    failReview(
      PROFESSIONAL_REVIEW_ERROR_CODES.invalidDecision,
      `Refusing to reconstitute an invalid ProfessionalReviewDecision: ${validation.reasons.join(', ')}`,
      { reasonCodes: validation.reasons },
    );
  }
  return deepFreeze(value as ProfessionalReviewDecision);
}
