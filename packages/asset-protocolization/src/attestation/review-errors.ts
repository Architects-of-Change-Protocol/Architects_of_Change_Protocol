import type { ProtocolError } from '@aoc/protocol/errors';

import type { AssetRequirementId } from '../identifiers';
import type {
  ProtocolizationCaseId,
  ProtocolizationTenantId,
} from '../case/case-identifiers';
import type {
  ProfessionalReviewDecisionId,
  ProfessionalReviewRequestId,
} from './review-identifiers';

/**
 * How the professional review workflow fails.
 *
 * Same shape as `VerificationError`, `DeclarationError`, `EvidenceIntakeError`,
 * `ProtocolizationCaseError` and `AssetProfileError` — a real `Error` that
 * structurally satisfies `ProtocolError` — because a sixth error philosophy in
 * the sixth slice of one package would be a needless divergence. `code` and
 * `details` are the stable machine surface; `message` is a debugging aid and
 * nothing downstream may parse it.
 *
 * ### A review outcome is never an error
 *
 * This is the distinction that matters most here, and it is worth stating
 * before the list rather than after it:
 *
 * ```text
 * Attest               a reviewer took a position           -> decision, not error
 * Reject               a reviewer declined to attest        -> decision, not error
 * RequestMoreEvidence  a reviewer needs more material       -> decision, not error
 * Abstain              a reviewer stepped back              -> decision, not error
 *
 * wrong tenant         the caller may not see this case     -> error
 * wrong requirement    the id names a Declaration, not an
 *                      Attestation, requirement             -> error
 * no scope on Attest   an unscoped universal attestation    -> error
 * cancelled case       no further workflow mutation         -> error
 * ```
 *
 * Every code below names a *structural or authorization* refusal: something the
 * workflow was asked to do that is not a coherent request. None of them means a
 * professional disbelieved anything, and there is deliberately no code meaning
 * "review failed" or "attestation refused" — those are decisions, and they come
 * back as records.
 *
 * ### Why this list delegates
 *
 * Everything about the *case* is APV-04's to refuse, and this layer delegates
 * rather than restating: an unknown requirement id, a case whose invariants are
 * broken, a withdrawn profile version and a clock that moved backwards each
 * already fail deterministically with a stable `PROTOCOLIZATION_CASE_*` code,
 * and re-spelling any of them here would create two codes for one condition.
 */
export const PROFESSIONAL_REVIEW_ERROR_CODES = Object.freeze({
  /** A request or decision input failed structural admission. Carries `reasonCodes`. */
  invalidRequest: 'REVIEW_REQUEST_INVALID',
  /** The acting tenant is missing or malformed. */
  invalidTenant: 'REVIEW_TENANT_REQUIRED',
  /**
   * The acting tenant does not own the case, the review request, or an input
   * supplied alongside them.
   *
   * Deliberately one code whichever value is foreign: distinguishing them would
   * let a caller probe which of another tenant's identifiers exist.
   */
  tenantMismatch: 'REVIEW_TENANT_MISMATCH',
  /** The request names a different case than the one being operated on. */
  caseMismatch: 'REVIEW_CASE_MISMATCH',
  /** The request's pin is not the case's pin. */
  profileMismatch: 'REVIEW_PROFILE_MISMATCH',
  /** The case is `Cancelled` and accepts no further review workflow. */
  caseCancelled: 'REVIEW_CASE_CANCELLED',
  /**
   * The named requirement of the pinned profile is not of kind
   * `AssetRequirementKind.Attestation`.
   *
   * Professional review may only answer an attestation requirement. Correlating
   * it to an Identity, Declaration, Evidence or Verification requirement would
   * report an attestation as progress on a requirement the profile says is
   * answered by something else entirely — the exact class of defect APV-06's
   * targeted audit found in kind-blind correlation. Carries the offending id in
   * `requirementIds`.
   */
  incompatibleRequirement: 'REVIEW_REQUIREMENT_INCOMPATIBLE',
  /**
   * The requested attestation type is not one the pinned requirement accepts.
   *
   * Knowing that Protocol defines an `AttestationType` is worth nothing: what a
   * case may request is what *its exact pinned profile version* asked for,
   * against the requirement that asked for it.
   */
  incompatibleAttestationType: 'REVIEW_ATTESTATION_TYPE_INCOMPATIBLE',
  /** The case is not at the revision the request bound, or the revision is malformed. */
  invalidBasisRevision: 'REVIEW_BASIS_REVISION_INVALID',
  /** No reviewer was supplied. */
  reviewerRequired: 'REVIEWER_REQUIRED',
  /** The reviewer is malformed, or is not a principal kind the profile accepts. */
  invalidReviewer: 'REVIEWER_INVALID',
  /** The pinned requirement demands a credential and none was presented. */
  credentialRequired: 'REVIEWER_CREDENTIAL_REQUIRED',
  /**
   * A presented credential reference contradicts a constraint the profile
   * states mechanically — a type or a declared status the requirement does not
   * accept.
   *
   * Structural incompatibility only. This never means the credential is
   * invalid, revoked, or insufficient in law: this package resolves no
   * credential and adjudicates no professional licensing.
   */
  incompatibleCredential: 'REVIEWER_CREDENTIAL_INCOMPATIBLE',
  /** `Attest` was recorded without a scope. */
  scopeRequired: 'REVIEW_SCOPE_REQUIRED',
  /** A supplied scope is malformed, or does not match the request it answers. */
  invalidScope: 'REVIEW_SCOPE_INVALID',
  /** The action is not one of the four. */
  invalidAction: 'REVIEW_ACTION_INVALID',
  /** The action requires a machine-readable reason code and none was supplied. */
  reasonCodeRequired: 'REVIEW_REASON_CODE_REQUIRED',
  /** `RequestMoreEvidence` was recorded without a machine-readable request. */
  emptyMaterialRequest: 'REVIEW_MORE_EVIDENCE_EMPTY',
  /** A field was supplied that this action does not carry. Carries `reasonCodes`. */
  unexpectedActionField: 'REVIEW_ACTION_FIELD_UNEXPECTED',
  /**
   * A `CanonicalAttestation` was asked for and cannot be constructed without
   * inventing something Protocol — or this vertical's own professional
   * attestation contract — requires.
   *
   * The record is refused rather than repaired, and the whole operation fails
   * with it: a caller who asked for a Protocol artifact and cannot legitimately
   * have one gets no decision either, rather than a half-outcome they never
   * requested. Recording the professional's position without an artifact is a
   * different call — the same `Attest` with the attestation input omitted.
   *
   * A partial or fabricated attestation is worse than none: none is an honest
   * absence, and a fabricated one is a counterfeit Protocol record every later
   * reader inherits.
   */
  attestationCannotBeConstructed: 'REVIEW_ATTESTATION_CANNOT_BE_CONSTRUCTED',
  /**
   * A requested `CanonicalAttestation` could not obtain a usable
   * `CanonicalProofRef`.
   *
   * Three conditions, one meaning — *no proof reference is available for this
   * professional attestation*:
   *
   * ```text
   * no signer configured and the caller supplied none
   * the configured signer threw or rejected
   * the configured signer returned something that is not a usable reference
   * ```
   *
   * Protocol permits a `CanonicalAttestation` with no `proofRefs`; APV-08 does
   * not produce one. An artifact this vertical associates to a case as
   * `ProtocolizationMaterialKind.Attestation` is a professional attestation that
   * something downstream will be asked to rely on, and one referencing no proof
   * at all cannot be audited by whoever inherits it.
   *
   * This code says a reference is missing. It never means a proof was checked
   * and failed: nothing in this package resolves or verifies one.
   */
  signatureUnavailable: 'REVIEW_SIGNATURE_UNAVAILABLE',
  /** A request document failed `validateProfessionalReviewRequest`. Carries `reasonCodes`. */
  invalidRequestRecord: 'REVIEW_REQUEST_RECORD_INVALID',
  /** A decision document failed `validateProfessionalReviewDecision`. Carries `reasonCodes`. */
  invalidDecision: 'REVIEW_DECISION_INVALID',
  /** A request with this (tenantId, reviewRequestId) already exists. */
  duplicateRequest: 'REVIEW_REQUEST_DUPLICATE',
  /** A decision with this (tenantId, decisionId) already exists. */
  duplicateDecision: 'REVIEW_DECISION_DUPLICATE',
  /**
   * This review request already has a decision.
   *
   * One terminal decision per request. A second review of the same case is a
   * *new* request bound to a new revision, which is what keeps the history
   * readable and keeps a reviewer from silently replacing their own earlier
   * position.
   */
  alreadyDecided: 'REVIEW_REQUEST_ALREADY_DECIDED',
  /** A supplied packet input belongs to another tenant or another case. */
  invalidInputs: 'REVIEW_INPUTS_INVALID',
  /** The injected clock returned a non-canonical instant. */
  invalidTimestamp: 'REVIEW_TIMESTAMP_INVALID',
} as const);

export type ProfessionalReviewErrorCode =
  (typeof PROFESSIONAL_REVIEW_ERROR_CODES)[keyof typeof PROFESSIONAL_REVIEW_ERROR_CODES];

/**
 * A type alias rather than an interface so TypeScript infers the implicit index
 * signature `ProtocolError.details` requires — the same reason
 * `VerificationErrorDetails` and `DeclarationErrorDetails` are ones.
 */
export type ProfessionalReviewErrorDetails = {
  readonly reasonCodes: readonly string[];
  readonly reviewRequestId?: ProfessionalReviewRequestId;
  readonly decisionId?: ProfessionalReviewDecisionId;
  readonly tenantId?: ProtocolizationTenantId;
  readonly caseId?: ProtocolizationCaseId;
  readonly requirementIds?: readonly AssetRequirementId[];
};

export class ProfessionalReviewError extends Error implements ProtocolError {
  readonly code: ProfessionalReviewErrorCode;

  readonly details: ProfessionalReviewErrorDetails;

  constructor(
    code: ProfessionalReviewErrorCode,
    message: string,
    details: ProfessionalReviewErrorDetails,
  ) {
    super(message);
    this.name = 'ProfessionalReviewError';
    this.code = code;
    this.details = details;
  }
}
