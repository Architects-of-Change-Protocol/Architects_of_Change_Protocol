import type { AdapterResult } from '@aoc/protocol/adapters';

import type { AssetRequirementId, AssetVerificationCheckId } from '../identifiers';
import { deepFreeze } from '../case/case-freeze';
import { isValidProtocolizationTenantId } from '../case/case-identifiers';
import type { ProtocolizationCaseId, ProtocolizationTenantId } from '../case/case-identifiers';
import { VERIFICATION_ERROR_CODES, VerificationError } from './verification-errors';
import type { VerificationExecutionId } from './verification-identifiers';
import type { ProtocolizationVerificationResult } from './verification-result';
import { validateProtocolizationVerificationResult } from './verification-validation';

/**
 * Where verification results live.
 *
 * In the vertical, for the reason Gate A0 / `U-6` settled for cases, receipts
 * and declaration records: no vertical workflow persistence port goes into
 * Soberanía Protocol, and Protocol never learns that verification execution
 * exists. APV-07 ships the **port** and one deterministic in-memory
 * implementation — no database adapter, no migration, no schema. Binding this
 * interface to a store is an infrastructure decision with its own owner and its
 * own review.
 *
 * ### What it stores, and what it does not
 *
 * Execution results. Not verifications: a `CanonicalVerification` is a Protocol
 * record and lives wherever Protocol records live. This holds the vertical's
 * audit trail of which declared check ran against which case at which revision,
 * when, and what it returned. There is no document body, no content bytes and no
 * PII by construction.
 *
 * ### Identity model — `(tenantId, executionId)`
 *
 * Tenant-scoped, exactly like `(tenantId, intakeId)` and `(tenantId,
 * declarationId)`. Execution ids are minted by tenants, so a globally unique
 * constraint would let one tenant's choice of identifier collide with another's
 * — which both leaks the existence of an execution across a tenant boundary and
 * makes a legitimate `save` fail for a reason its caller can neither see nor
 * fix.
 *
 * ### Append-only
 *
 * There is no update and no delete. A result records that a check ran and what
 * it found; rewriting one would be rewriting history, and removing one would
 * erase the only evidence that a case once passed — or once failed. Re-running a
 * check is a *new* result with a new `executionId`, and both remain readable, in
 * order, each bound to the revision it evaluated. `save` therefore rejects a
 * second write under the same `(tenantId, executionId)` rather than overwriting.
 *
 * There is deliberately no "current result for this check" field or method that
 * mutates. `listByRequirementCheck` returns the whole history and
 * `latestProtocolizationVerificationResults` projects a view over it — a view
 * that reads, and never edits, what came before.
 *
 * ### Tenancy
 *
 * Every method takes the tenant. There is deliberately no `get(executionId)`
 * overload, no `listByCase(caseId)` overload and no cross-tenant enumeration:
 * knowing another tenant's `executionId` or `caseId` must be worth nothing.
 *
 * ### Ordering
 *
 * Every listing is ordered by `executedAt`, then by `executionId` as a stable
 * tie-break — not by insertion order, which would make the reference
 * implementation's `Map` an accidental part of the contract that a database
 * adapter could not reproduce. The tie-break is load-bearing rather than
 * cosmetic: one batch shares a single `executedAt`, so without it the order
 * within a run would be undefined.
 */
export interface VerificationResultRepository {
  /** The result, or `undefined` when this tenant has no such execution. */
  get(
    tenantId: ProtocolizationTenantId,
    executionId: VerificationExecutionId,
  ): AdapterResult<ProtocolizationVerificationResult | undefined>;

  exists(
    tenantId: ProtocolizationTenantId,
    executionId: VerificationExecutionId,
  ): AdapterResult<boolean>;

  /**
   * Every result recorded for one of this tenant's cases, in execution order.
   * Empty for a case that belongs to another tenant — indistinguishable, on
   * purpose, from a case with no executions.
   */
  listByCase(
    tenantId: ProtocolizationTenantId,
    caseId: ProtocolizationCaseId,
  ): AdapterResult<readonly ProtocolizationVerificationResult[]>;

  /**
   * Every result for one `(requirementId, checkId)` pair of one case, in
   * execution order — the re-execution history of a single check.
   *
   * Scoped to the pair rather than to the check alone, because one `checkId` may
   * legitimately be declared by several verification requirements of the same
   * profile. Correlating by check alone would merge two distinct obligations
   * into one history.
   */
  listByRequirementCheck(
    tenantId: ProtocolizationTenantId,
    caseId: ProtocolizationCaseId,
    requirementId: AssetRequirementId,
    checkId: AssetVerificationCheckId,
  ): AdapterResult<readonly ProtocolizationVerificationResult[]>;

  /**
   * Records a result. Rejects a duplicate `(tenantId, executionId)`
   * (`VERIFICATION_RESULT_DUPLICATE`) and never overwrites.
   */
  save(result: ProtocolizationVerificationResult): AdapterResult<void>;
}

function storageKey(
  tenantId: ProtocolizationTenantId,
  executionId: VerificationExecutionId,
): string {
  // A tenant id cannot contain whitespace or a control character and an
  // execution id cannot contain `\n`, so a newline separator is never ambiguous
  // between two distinct pairs.
  return `${tenantId}\n${executionId}`;
}

function assertTenant(tenantId: ProtocolizationTenantId): void {
  if (!isValidProtocolizationTenantId(tenantId)) {
    throw new VerificationError(
      VERIFICATION_ERROR_CODES.invalidTenant,
      'A non-blank tenantId is required to address a ProtocolizationVerificationResult',
      { reasonCodes: [VERIFICATION_ERROR_CODES.invalidTenant] },
    );
  }
}

/**
 * Total order over results: execution instant, then identifier.
 *
 * Exported for reuse *inside* this package only — the projections read the same
 * order, and two copies of an ordering rule are two orders waiting to disagree.
 */
export function compareVerificationResults(
  left: ProtocolizationVerificationResult,
  right: ProtocolizationVerificationResult,
): number {
  const byInstant = Date.parse(left.executedAt) - Date.parse(right.executedAt);
  if (byInstant !== 0) return byInstant < 0 ? -1 : 1;
  if (left.executionId === right.executionId) return 0;
  return left.executionId < right.executionId ? -1 : 1;
}

/**
 * A deterministic, in-process implementation of the port.
 *
 * It exists to make the contract executable — tenant isolation, duplicate
 * rejection, append-only history and deterministic ordering are behaviours a
 * port can state but only an implementation can demonstrate — and it is the
 * reference a database adapter must match. Results are validated on the way in
 * and deeply frozen, so a caller cannot mutate stored history by holding on to a
 * reference it saved.
 */
export function createInMemoryVerificationResultRepository(): VerificationResultRepository {
  const entries = new Map<string, ProtocolizationVerificationResult>();

  const forCase = (
    tenantId: ProtocolizationTenantId,
    caseId: ProtocolizationCaseId,
  ): readonly ProtocolizationVerificationResult[] =>
    [...entries.values()]
      .filter((result) => result.tenantId === tenantId && result.caseId === caseId)
      .sort(compareVerificationResults);

  return {
    get(tenantId, executionId) {
      assertTenant(tenantId);
      return entries.get(storageKey(tenantId, executionId));
    },

    exists(tenantId, executionId) {
      assertTenant(tenantId);
      return entries.has(storageKey(tenantId, executionId));
    },

    listByCase(tenantId, caseId) {
      assertTenant(tenantId);
      return forCase(tenantId, caseId);
    },

    listByRequirementCheck(tenantId, caseId, requirementId, checkId) {
      assertTenant(tenantId);
      return forCase(tenantId, caseId).filter(
        (result) => result.requirementId === requirementId && result.checkId === checkId,
      );
    },

    save(result) {
      const validation = validateProtocolizationVerificationResult(result);
      if (!validation.admitted) {
        throw new VerificationError(
          VERIFICATION_ERROR_CODES.invalidResult,
          `Refusing to store an invalid ProtocolizationVerificationResult: ${validation.reasons.join(', ')}`,
          { reasonCodes: validation.reasons },
        );
      }

      const key = storageKey(result.tenantId, result.executionId);
      if (entries.has(key)) {
        throw new VerificationError(
          VERIFICATION_ERROR_CODES.duplicateResult,
          'A ProtocolizationVerificationResult with this (tenantId, executionId) already exists',
          {
            reasonCodes: [VERIFICATION_ERROR_CODES.duplicateResult],
            executionId: result.executionId,
            tenantId: result.tenantId,
            caseId: result.caseId,
          },
        );
      }

      entries.set(key, deepFreeze(result));
    },
  };
}
