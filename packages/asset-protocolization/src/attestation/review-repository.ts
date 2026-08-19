import type { AdapterResult } from '@aoc/protocol/adapters';

import { deepFreeze } from '../case/case-freeze';
import { isValidProtocolizationTenantId } from '../case/case-identifiers';
import type { ProtocolizationCaseId, ProtocolizationTenantId } from '../case/case-identifiers';
import type { ProfessionalReviewDecision } from './review-decision';
import { PROFESSIONAL_REVIEW_ERROR_CODES, ProfessionalReviewError } from './review-errors';
import type {
  ProfessionalReviewDecisionId,
  ProfessionalReviewRequestId,
} from './review-identifiers';
import type { ProfessionalReviewRequest } from './review-request';
import {
  validateProfessionalReviewDecision,
  validateProfessionalReviewRequest,
} from './review-validation';

/**
 * Where professional review history lives.
 *
 * In the vertical, for the reason Gate A0 / `U-6` settled for cases, receipts,
 * declaration records and verification results: no vertical workflow persistence
 * port goes into Soberanía Protocol, and Protocol never learns that professional
 * review exists. APV-08 ships the **ports** and one deterministic in-memory
 * implementation of each — no database adapter, no migration, no schema.
 * Binding these interfaces to a store is an infrastructure decision with its own
 * owner and its own review.
 *
 * ### What they store, and what they do not
 *
 * Requests and decisions. Not attestations: a `CanonicalAttestation` is a
 * Protocol record and lives wherever Protocol records live, and there is
 * deliberately no attestation repository in this package — building one would be
 * this vertical taking custody of a substrate it does not own. Not packets
 * either: a packet is a deterministic projection over records that are already
 * stored, so persisting one would duplicate state that can drift.
 *
 * ### Identity model — `(tenantId, id)`
 *
 * Tenant-scoped, exactly like `(tenantId, intakeId)`, `(tenantId,
 * declarationId)` and `(tenantId, executionId)`. Request and decision ids are
 * minted by tenants, so a globally unique constraint would let one tenant's
 * choice of identifier collide with another's — which both leaks the existence
 * of a review across a tenant boundary and makes a legitimate `save` fail for a
 * reason its caller can neither see nor fix.
 *
 * ### Append-only
 *
 * There is no update and no delete on either port. A request records that review
 * was asked for and a decision records what a professional concluded; rewriting
 * either would be rewriting history, and removing one would erase the only
 * evidence that a case was once rejected — or once attested. A reviewer who
 * changes position gets a new request and a new decision, and both remain
 * readable, in order, each bound to the revision it actually reviewed.
 *
 * ### Tenancy
 *
 * Every method takes the tenant. There is deliberately no `get(id)` overload, no
 * `listByCase(caseId)` overload and no cross-tenant enumeration: knowing another
 * tenant's `reviewRequestId`, `decisionId` or `caseId` must be worth nothing. A
 * reviewer principal may legitimately appear in many tenants' workflows, and
 * that fact never widens a read — retrieval still requires tenant context.
 *
 * ### Ordering
 *
 * Every listing is ordered by instant, then by identifier as a stable tie-break
 * — not by insertion order, which would make the reference implementation's
 * `Map` an accidental part of the contract that a database adapter could not
 * reproduce.
 */
export interface ProfessionalReviewRequestRepository {
  /** The request, or `undefined` when this tenant has no such request. */
  get(
    tenantId: ProtocolizationTenantId,
    reviewRequestId: ProfessionalReviewRequestId,
  ): AdapterResult<ProfessionalReviewRequest | undefined>;

  exists(
    tenantId: ProtocolizationTenantId,
    reviewRequestId: ProfessionalReviewRequestId,
  ): AdapterResult<boolean>;

  /**
   * Every review request raised for one of this tenant's cases, in request
   * order. Empty for a case that belongs to another tenant — indistinguishable,
   * on purpose, from a case with no reviews.
   */
  listByCase(
    tenantId: ProtocolizationTenantId,
    caseId: ProtocolizationCaseId,
  ): AdapterResult<readonly ProfessionalReviewRequest[]>;

  /**
   * Records a request. Rejects a duplicate `(tenantId, reviewRequestId)`
   * (`REVIEW_REQUEST_DUPLICATE`) and never overwrites.
   */
  save(request: ProfessionalReviewRequest): AdapterResult<void>;
}

export interface ProfessionalReviewDecisionRepository {
  /** The decision, or `undefined` when this tenant has no such decision. */
  get(
    tenantId: ProtocolizationTenantId,
    decisionId: ProfessionalReviewDecisionId,
  ): AdapterResult<ProfessionalReviewDecision | undefined>;

  exists(
    tenantId: ProtocolizationTenantId,
    decisionId: ProfessionalReviewDecisionId,
  ): AdapterResult<boolean>;

  /**
   * Every decision recorded for one of this tenant's cases, in decision order.
   *
   * The whole history, including decisions that contradict one another. Two
   * reviewers who reached `Attest` and `Reject` on two valid requests both
   * appear here, in order, and nothing in this package picks between them.
   */
  listByCase(
    tenantId: ProtocolizationTenantId,
    caseId: ProtocolizationCaseId,
  ): AdapterResult<readonly ProfessionalReviewDecision[]>;

  /**
   * The decision answering one request, when one has been recorded.
   *
   * Singular, because a request has one terminal decision. A follow-up review is
   * a new request bound to a new revision, not a second decision quietly
   * replacing the first.
   */
  getByRequest(
    tenantId: ProtocolizationTenantId,
    reviewRequestId: ProfessionalReviewRequestId,
  ): AdapterResult<ProfessionalReviewDecision | undefined>;

  /**
   * Records a decision. Rejects a duplicate `(tenantId, decisionId)`
   * (`REVIEW_DECISION_DUPLICATE`), rejects a second decision for a request that
   * already has one (`REVIEW_REQUEST_ALREADY_DECIDED`), and never overwrites.
   */
  save(decision: ProfessionalReviewDecision): AdapterResult<void>;
}

function storageKey(tenantId: ProtocolizationTenantId, id: string): string {
  // A tenant id cannot contain whitespace or a control character and an
  // instance identifier cannot contain `\n`, so a newline separator is never
  // ambiguous between two distinct pairs.
  return `${tenantId}\n${id}`;
}

function assertTenant(tenantId: ProtocolizationTenantId): void {
  if (!isValidProtocolizationTenantId(tenantId)) {
    throw new ProfessionalReviewError(
      PROFESSIONAL_REVIEW_ERROR_CODES.invalidTenant,
      'A non-blank tenantId is required to address professional review history',
      { reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.invalidTenant] },
    );
  }
}

/**
 * Total order over requests: request instant, then identifier.
 *
 * Exported for reuse *inside* this package only. Two copies of an ordering rule
 * are two orders waiting to disagree.
 */
export function compareProfessionalReviewRequests(
  left: ProfessionalReviewRequest,
  right: ProfessionalReviewRequest,
): number {
  const byInstant = Date.parse(left.requestedAt) - Date.parse(right.requestedAt);
  if (byInstant !== 0) return byInstant < 0 ? -1 : 1;
  if (left.reviewRequestId === right.reviewRequestId) return 0;
  return left.reviewRequestId < right.reviewRequestId ? -1 : 1;
}

/** Total order over decisions: decision instant, then identifier. Internal. */
export function compareProfessionalReviewDecisions(
  left: ProfessionalReviewDecision,
  right: ProfessionalReviewDecision,
): number {
  const byInstant = Date.parse(left.decidedAt) - Date.parse(right.decidedAt);
  if (byInstant !== 0) return byInstant < 0 ? -1 : 1;
  if (left.decisionId === right.decisionId) return 0;
  return left.decisionId < right.decisionId ? -1 : 1;
}

/**
 * A deterministic, in-process implementation of the request port.
 *
 * It exists to make the contract executable — tenant isolation, duplicate
 * rejection, append-only history and deterministic ordering are behaviours a
 * port can state but only an implementation can demonstrate — and it is the
 * reference a database adapter must match. Requests are validated on the way in
 * and deeply frozen, so a caller cannot mutate stored history by holding on to a
 * reference it saved.
 */
export function createInMemoryProfessionalReviewRequestRepository(): ProfessionalReviewRequestRepository {
  const entries = new Map<string, ProfessionalReviewRequest>();

  return {
    get(tenantId, reviewRequestId) {
      assertTenant(tenantId);
      return entries.get(storageKey(tenantId, reviewRequestId));
    },

    exists(tenantId, reviewRequestId) {
      assertTenant(tenantId);
      return entries.has(storageKey(tenantId, reviewRequestId));
    },

    listByCase(tenantId, caseId) {
      assertTenant(tenantId);
      return [...entries.values()]
        .filter((request) => request.tenantId === tenantId && request.caseId === caseId)
        .sort(compareProfessionalReviewRequests);
    },

    save(request) {
      const validation = validateProfessionalReviewRequest(request);
      if (!validation.admitted) {
        throw new ProfessionalReviewError(
          PROFESSIONAL_REVIEW_ERROR_CODES.invalidRequestRecord,
          `Refusing to store an invalid ProfessionalReviewRequest: ${validation.reasons.join(', ')}`,
          { reasonCodes: validation.reasons },
        );
      }

      const key = storageKey(request.tenantId, request.reviewRequestId);
      if (entries.has(key)) {
        throw new ProfessionalReviewError(
          PROFESSIONAL_REVIEW_ERROR_CODES.duplicateRequest,
          'A ProfessionalReviewRequest with this (tenantId, reviewRequestId) already exists',
          {
            reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.duplicateRequest],
            reviewRequestId: request.reviewRequestId,
            tenantId: request.tenantId,
            caseId: request.caseId,
          },
        );
      }

      entries.set(key, deepFreeze(request));
    },
  };
}

/**
 * A deterministic, in-process implementation of the decision port.
 *
 * This is also where *one terminal decision per request* is enforced. The domain
 * operation is pure and holds no repository — exactly as APV-05, APV-06 and
 * APV-07 hold none — so terminality is enforced where decisions actually live,
 * on the same terms as duplicate rejection. A retry that replays the same
 * decision is refused rather than producing a second position, and a second
 * attestation can therefore never be created by re-running a commit.
 */
export function createInMemoryProfessionalReviewDecisionRepository(): ProfessionalReviewDecisionRepository {
  const entries = new Map<string, ProfessionalReviewDecision>();
  const byRequest = new Map<string, ProfessionalReviewDecisionId>();

  return {
    get(tenantId, decisionId) {
      assertTenant(tenantId);
      return entries.get(storageKey(tenantId, decisionId));
    },

    exists(tenantId, decisionId) {
      assertTenant(tenantId);
      return entries.has(storageKey(tenantId, decisionId));
    },

    listByCase(tenantId, caseId) {
      assertTenant(tenantId);
      return [...entries.values()]
        .filter((decision) => decision.tenantId === tenantId && decision.caseId === caseId)
        .sort(compareProfessionalReviewDecisions);
    },

    getByRequest(tenantId, reviewRequestId) {
      assertTenant(tenantId);
      const decisionId = byRequest.get(storageKey(tenantId, reviewRequestId));
      if (decisionId === undefined) return undefined;
      return entries.get(storageKey(tenantId, decisionId));
    },

    save(decision) {
      const validation = validateProfessionalReviewDecision(decision);
      if (!validation.admitted) {
        throw new ProfessionalReviewError(
          PROFESSIONAL_REVIEW_ERROR_CODES.invalidDecision,
          `Refusing to store an invalid ProfessionalReviewDecision: ${validation.reasons.join(', ')}`,
          { reasonCodes: validation.reasons },
        );
      }

      const key = storageKey(decision.tenantId, decision.decisionId);
      if (entries.has(key)) {
        throw new ProfessionalReviewError(
          PROFESSIONAL_REVIEW_ERROR_CODES.duplicateDecision,
          'A ProfessionalReviewDecision with this (tenantId, decisionId) already exists',
          {
            reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.duplicateDecision],
            decisionId: decision.decisionId,
            tenantId: decision.tenantId,
            caseId: decision.caseId,
          },
        );
      }

      const requestKey = storageKey(decision.tenantId, decision.reviewRequestId);
      if (byRequest.has(requestKey)) {
        throw new ProfessionalReviewError(
          PROFESSIONAL_REVIEW_ERROR_CODES.alreadyDecided,
          'This ProfessionalReviewRequest already has a decision; a further review needs a new request',
          {
            reasonCodes: [PROFESSIONAL_REVIEW_ERROR_CODES.alreadyDecided],
            decisionId: decision.decisionId,
            reviewRequestId: decision.reviewRequestId,
            tenantId: decision.tenantId,
            caseId: decision.caseId,
          },
        );
      }

      entries.set(key, deepFreeze(decision));
      byRequest.set(requestKey, decision.decisionId);
    },
  };
}
