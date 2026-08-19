import type { CanonicalId, UtcDateTime } from '@aoc/protocol/contracts';

import { isValidUtcDateTime } from '../freshness';
import { isValidAssetRequirementId, isValidAssetVerificationCheckId } from '../identifiers';
import type { AssetRequirementId, AssetVerificationCheckId } from '../identifiers';
import type { AssetProfile } from '../profile';
import { AssetRequirementKind } from '../requirements';
import type { AssetVerificationRequirement } from '../requirements';
import { PROTOCOLIZATION_CASE_ERROR_CODES, ProtocolizationCaseError } from '../case/case-errors';
import { deepFreeze } from '../case/case-freeze';
import { isValidProtocolizationTenantId } from '../case/case-identifiers';
import type { ProtocolizationCaseContext } from '../case/case-operations';
import { listProtocolizationCaseRequirementProgress } from '../case/case-progress';
import { ProtocolizationCaseState } from '../case/case-state';
import { validateProtocolizationCase } from '../case/case-validation';
import type { ProtocolizationCase } from '../case/protocolization-case';
import type { EvidenceIntakeReceipt } from '../evidence/evidence-intake-receipt';
import type { ProtocolizationDeclarationRecord } from '../declarations/declaration-record';
import type { VerificationCheckExecution } from './verification-check';
import type { VerificationCheckRegistry } from './verification-check-registry';
import type { VerificationCheckContext } from './verification-context';
import { VERIFICATION_ERROR_CODES, VerificationError } from './verification-errors';
import type { VerificationErrorCode, VerificationErrorDetails } from './verification-errors';
import { PROTOCOLIZATION_VERIFICATION_EVENT_TYPES } from './verification-events';
import type { ProtocolizationVerificationCheckExecutedEvent } from './verification-events';
import { isValidVerificationExecutionId } from './verification-identifiers';
import type { VerificationExecutionId } from './verification-identifiers';
import type { VerificationResolvers } from './verification-ports';
import { PROTOCOLIZATION_VERIFICATION_RESULT_SCHEMA_VERSION } from './verification-result';
import type { ProtocolizationVerificationResult } from './verification-result';
import {
  validateProtocolizationVerificationResult,
  validateVerificationCheckExecution,
} from './verification-validation';

/**
 * The verification execution operations.
 *
 * ### What success means
 *
 * ```text
 * APV executed one check that this case's exact pinned profile version
 * declares for this requirement, against this case as it stood at this
 * revision, and recorded what the check returned.
 * ```
 *
 * That is the entire claim, and it is true whichever of the five outcomes came
 * back. Success here means *the execution happened and is recorded*; it does not
 * mean the check passed, and a `Fail` is as successful an execution as a `Pass`.
 *
 * ### What these operations never do
 *
 * ```text
 * mutate the case                   consume a case revision
 * rewrite an evidence receipt       rewrite a declaration record
 * cancel, reject or suspend a case  transition any case state
 * mark a requirement satisfied      declare a case ready
 * create an attestation             assign a reviewer
 * mint a CanonicalVerification      persist anything
 * ```
 *
 * The first two are worth dwelling on. A verification result is **not** written
 * into the case as APV-04 material, and the decision is deliberate rather than
 * an omission. `ProtocolizationMaterialKind.Verification` carries a
 * `CanonicalVerificationId` — a Protocol record identifier — and a
 * `VerificationExecutionId` is a vertical workflow identifier. Writing one into
 * the other's field would be a type-level lie that every downstream reader would
 * inherit, and minting a real `CanonicalVerification` to avoid it would require
 * fabricating an assertion reference, an issuer and a verifier the check does
 * not have.
 *
 * Keeping results off the case also closes a feedback loop before it can open.
 * If recording a result raised the case revision, the next check in the same
 * batch would evaluate a revision whose only difference from the last was the
 * previous check's own output — verification would generate its own input churn,
 * and no two checks in a run could ever agree on what they had evaluated. As
 * written, a hundred executions against revision `7` all evaluate revision `7`,
 * and the case is byte-for-byte unchanged when they finish. That is why the
 * result model needs no `recordedRevision` beside its `evaluatedCaseRevision`:
 * there is nothing for the second one to differ from.
 *
 * ### Sync core, async edge
 *
 * Everything except the executor call is synchronous and pure: admission,
 * tenancy, lifecycle, profile pinning, declaration checks, plan construction,
 * result construction and validation. Only `execute` may return a promise
 * (`AdapterResult`, the repository's own convention for a port that might need
 * to go somewhere), so only the two operations that invoke one are `async`.
 *
 * ### Nothing is persisted here
 *
 * These operations return a result and an event and store neither, exactly as
 * APV-05 and APV-06 return a receipt or a record without storing it. The
 * composition layer decides when and how to commit, under whatever transactional
 * facility it actually has.
 */

/** What a verification execution needs beyond the case itself. */
export interface ProtocolizationVerificationContext extends ProtocolizationCaseContext {
  /** Resolves `checkId -> implementation`. System-level; carries no tenant. */
  readonly checks: VerificationCheckRegistry;
  /**
   * The ports the executions may use. Every one optional: a check that needs a
   * port it was not given reports `Unavailable` rather than failing.
   */
  readonly resolvers?: VerificationResolvers;
}

/**
 * The case-scoped material a caller supplies for the checks to read.
 *
 * Supplied rather than fetched, because the engine holds no repository. That is
 * `input minimization` in practice: a check sees this case's receipts and this
 * case's declarations, and there is no object graph in scope through which it
 * could reach a second case, a second tenant, or a store. Everything supplied is
 * checked to belong to the acting tenant and this case before any check runs.
 */
export interface ProtocolizationVerificationInputs {
  readonly evidenceReceipts?: readonly EvidenceIntakeReceipt[];
  readonly declarations?: readonly ProtocolizationDeclarationRecord[];
}

export interface ExecuteProtocolizationVerificationInput extends ProtocolizationVerificationInputs {
  /** Identity of this execution. Unique within the tenant; caller-provided. */
  readonly executionId: VerificationExecutionId;
  /** The verification requirement of the pinned profile this execution answers. */
  readonly requirementId: AssetRequirementId;
  /** One of that requirement's declared `checkIds`. */
  readonly checkId: AssetVerificationCheckId;
  readonly correlationId?: CanonicalId;
}

/** A completed execution: the immutable result, and the fact it produced. */
export interface ProtocolizationVerificationTransition {
  readonly result: ProtocolizationVerificationResult;
  readonly event: ProtocolizationVerificationCheckExecutedEvent;
}

/** One `(requirementId, checkId)` pair the pinned profile declares. */
export interface ProtocolizationVerificationPlanEntry {
  readonly requirementId: AssetRequirementId;
  readonly checkId: AssetVerificationCheckId;
}

export interface RunProtocolizationVerificationInput extends ProtocolizationVerificationInputs {
  /**
   * One execution id per plan entry, in plan order.
   *
   * The count must match the plan exactly. A caller that supplied too few would
   * silently get a partial run, and one that supplied too many would be
   * expecting checks the pinned profile does not declare — both are
   * misunderstandings worth failing on rather than absorbing.
   */
  readonly executionIds: readonly VerificationExecutionId[];
  readonly correlationId?: CanonicalId;
}

/**
 * What a batch produced.
 *
 * Deliberately a list of independent results and **not** a verdict. There is no
 * `passed`, no `outcome`, no score, no percentage and no worst-outcome-wins
 * reduction anywhere on this type: reducing a set of findings to one answer is
 * the case-level judgement APV-09 owns, and a professional reviewer needs to see
 * every finding rather than a summary that already decided for them.
 */
export interface ProtocolizationVerificationRun {
  readonly results: readonly ProtocolizationVerificationResult[];
  readonly events: readonly ProtocolizationVerificationCheckExecutedEvent[];
  /** The revision every result in this batch evaluated. */
  readonly evaluatedCaseRevision: number;
  /** The instant every result in this batch carries. Read once, from the injected clock. */
  readonly executedAt: UtcDateTime;
}

const MAX_CORRELATION_ID_LENGTH = 128;

function failVerification(
  code: VerificationErrorCode,
  message: string,
  details: VerificationErrorDetails,
): never {
  throw new VerificationError(code, message, details);
}

/**
 * The tenant gate, checked before anything else looks at the case.
 *
 * The acting tenant is the context's, never the case's — a check that reads the
 * tenant off the value it is checking always agrees with itself, which is
 * exactly why APV-04 made the acting tenant a parameter.
 */
function assertActingTenantOwnsCase(
  context: ProtocolizationVerificationContext,
  protocolizationCase: ProtocolizationCase,
): void {
  if (!isValidProtocolizationTenantId(context.tenantId)) {
    failVerification(
      VERIFICATION_ERROR_CODES.invalidTenant,
      'A non-blank acting tenantId is required',
      { reasonCodes: [VERIFICATION_ERROR_CODES.invalidTenant] },
    );
  }
  if (protocolizationCase.tenantId !== context.tenantId) {
    failVerification(
      VERIFICATION_ERROR_CODES.tenantMismatch,
      'The acting tenant does not own this ProtocolizationCase',
      {
        reasonCodes: [VERIFICATION_ERROR_CODES.tenantMismatch],
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
 * caller that built it by hand. Evaluating checks against an aggregate whose
 * invariants are already broken would produce findings about a state that never
 * legally existed.
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
 * Which lifecycle states admit a new execution.
 *
 * `Draft` and `Active` do; `Cancelled` does not. Cancellation is terminal and a
 * cancelled case accepts no further work — running new checks against one would
 * produce findings nobody asked for about an abandoned attempt. Results recorded
 * *before* cancellation remain readable and auditable forever: this refuses new
 * executions, it does not hide old ones.
 *
 * No state is added, and none is transitioned. An execution — of any outcome —
 * leaves the case in exactly the state it found it.
 */
function assertCaseAcceptsVerification(protocolizationCase: ProtocolizationCase): void {
  if (protocolizationCase.state === ProtocolizationCaseState.Cancelled) {
    failVerification(
      VERIFICATION_ERROR_CODES.caseCancelled,
      'A Cancelled ProtocolizationCase does not accept further verification execution',
      {
        reasonCodes: [VERIFICATION_ERROR_CODES.caseCancelled],
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
 * package, and this is the point at which that matters most: the *check
 * contract* a result is judged under is the pinned profile's. A case pinned to
 * `1.0.0` executes `1.0.0`'s checks after `2.0.0` is registered, and a check
 * that only `2.0.0` declares is rejected rather than quietly admitted.
 */
function resolvePinnedProfile(
  context: ProtocolizationVerificationContext,
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
 * Resolves one requirement id to the pinned profile's *verification*
 * requirement, or refuses.
 *
 * ### The mixed-kind lesson, applied structurally
 *
 * APV-06's targeted audit found that APV-04's `correlate` is kind-blind: it
 * moves every id it is handed to `MaterialPresent`, so one declaration offered
 * against `[declarationRequirement, evidenceRequirement]` left the case
 * reporting evidence that did not exist. APV-07 answers that class of defect
 * twice over.
 *
 * First, structurally: an execution names **one** `requirementId`, never a list.
 * A mixture of kinds is not representable in the request, so it cannot be
 * smuggled past a filter that only looked at the first element.
 *
 * Second, explicitly: that single requirement must be
 * `AssetRequirementKind.Verification`. Naming an Identity, Declaration, Evidence
 * or Attestation requirement is refused *before* anything else happens.
 *
 * And third, by construction: even a refusal that somehow got through could not
 * contaminate anything, because this layer writes no case material at all. A
 * rejected execution leaves the case byte-for-byte as it was, at the same
 * revision, with every requirement's `materialStatus` untouched.
 */
function resolveVerificationRequirement(
  profile: AssetProfile,
  protocolizationCase: ProtocolizationCase,
  requirementId: AssetRequirementId,
): AssetVerificationRequirement {
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

  if (requirement.kind !== AssetRequirementKind.Verification) {
    failVerification(
      VERIFICATION_ERROR_CODES.incompatibleRequirement,
      `A verification check may only be executed against a Verification requirement; ${requirement.id} is ${requirement.kind}`,
      {
        reasonCodes: [VERIFICATION_ERROR_CODES.incompatibleRequirement],
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
        requirementIds: [requirement.id],
      },
    );
  }

  return requirement;
}

/**
 * The check must be one *this requirement of this pinned version* declares.
 *
 * Global registration is not permission. A deployment may legitimately register
 * a hundred checks; what a given case may run is only what its own profile asked
 * for, correlated to the requirement that asked for it. So a check declared by a
 * different requirement of the same profile is refused here just as firmly as
 * one declared by no requirement at all.
 */
function assertCheckDeclared(
  requirement: AssetVerificationRequirement,
  protocolizationCase: ProtocolizationCase,
  checkId: AssetVerificationCheckId,
): void {
  const occurrences = requirement.checkIds.filter((declared) => declared === checkId).length;
  if (occurrences === 0) {
    failVerification(
      VERIFICATION_ERROR_CODES.checkNotDeclared,
      `Requirement ${requirement.id} of ${protocolizationCase.profile.profileId}@${protocolizationCase.profile.profileVersion} does not declare check ${checkId}`,
      {
        reasonCodes: [VERIFICATION_ERROR_CODES.checkNotDeclared],
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
        requirementIds: [requirement.id],
        checkId,
      },
    );
  }
  if (occurrences > 1) {
    failVerification(
      VERIFICATION_ERROR_CODES.duplicateDeclaredCheck,
      `Requirement ${requirement.id} declares check ${checkId} more than once`,
      {
        reasonCodes: [VERIFICATION_ERROR_CODES.duplicateDeclaredCheck],
        caseId: protocolizationCase.caseId,
        requirementIds: [requirement.id],
        checkId,
      },
    );
  }
}

/**
 * Every input the caller supplied must belong to the acting tenant and this
 * case.
 *
 * Without this, cross-tenant isolation would be advisory: a caller could hand
 * the engine another tenant's receipts and declarations and have a check read
 * them under cover of a case it does own. The gate runs before any check sees
 * anything, and it deliberately reports the same code for a foreign tenant
 * whichever kind of input carried it.
 */
function assertInputsBelongToCase(
  context: ProtocolizationVerificationContext,
  protocolizationCase: ProtocolizationCase,
  inputs: ProtocolizationVerificationInputs,
): void {
  const foreignTenant = [
    ...(inputs.evidenceReceipts ?? []).map((receipt) => receipt.tenantId),
    ...(inputs.declarations ?? []).map((record) => record.tenantId),
  ].some((tenantId) => tenantId !== context.tenantId);
  if (foreignTenant) {
    failVerification(
      VERIFICATION_ERROR_CODES.tenantMismatch,
      'A supplied verification input belongs to another tenant',
      {
        reasonCodes: [VERIFICATION_ERROR_CODES.tenantMismatch],
        caseId: protocolizationCase.caseId,
        tenantId: context.tenantId,
      },
    );
  }

  const foreignCase = [
    ...(inputs.evidenceReceipts ?? []).map((receipt) => receipt.caseId),
    ...(inputs.declarations ?? []).map((record) => record.caseId),
  ].some((caseId) => caseId !== protocolizationCase.caseId);
  if (foreignCase) {
    failVerification(
      VERIFICATION_ERROR_CODES.caseMismatch,
      'A supplied verification input belongs to another case',
      {
        reasonCodes: [VERIFICATION_ERROR_CODES.caseMismatch],
        caseId: protocolizationCase.caseId,
        tenantId: context.tenantId,
      },
    );
  }
}

/**
 * Reads the clock and refuses anything that is not a canonical UTC instant, or
 * that would place the execution before the case's own last change.
 *
 * A check evaluated "as of" an instant earlier than the material it is reading
 * was added would be reasoning about a state that did not yet exist — and every
 * freshness comparison it made would be meaningless.
 */
function readClock(
  context: ProtocolizationVerificationContext,
  protocolizationCase: ProtocolizationCase,
): UtcDateTime {
  const now = context.clock.now();
  if (!isValidUtcDateTime(now)) {
    failVerification(
      VERIFICATION_ERROR_CODES.invalidTimestamp,
      'The clock returned a non-canonical instant',
      { reasonCodes: [VERIFICATION_ERROR_CODES.invalidTimestamp] },
    );
  }
  if (Date.parse(now) < Date.parse(protocolizationCase.updatedAt)) {
    failVerification(
      VERIFICATION_ERROR_CODES.invalidTimestamp,
      'The clock is earlier than the case it is verifying',
      {
        reasonCodes: [VERIFICATION_ERROR_CODES.invalidTimestamp],
        caseId: protocolizationCase.caseId,
      },
    );
  }
  return now;
}

function assertAdmissibleRequest(
  protocolizationCase: ProtocolizationCase,
  input: ExecuteProtocolizationVerificationInput,
): void {
  const reasons: string[] = [];
  if (!isValidVerificationExecutionId(input.executionId)) {
    reasons.push(VERIFICATION_ERROR_CODES.invalidRequest);
  }
  if (!isValidAssetRequirementId(input.requirementId)) {
    reasons.push(VERIFICATION_ERROR_CODES.invalidRequest);
  }
  if (!isValidAssetVerificationCheckId(input.checkId)) {
    reasons.push(VERIFICATION_ERROR_CODES.invalidRequest);
  }
  if (
    input.correlationId !== undefined &&
    (typeof input.correlationId !== 'string' ||
      input.correlationId.trim() === '' ||
      input.correlationId.length > MAX_CORRELATION_ID_LENGTH)
  ) {
    reasons.push(VERIFICATION_ERROR_CODES.invalidRequest);
  }
  if (reasons.length > 0) {
    failVerification(
      VERIFICATION_ERROR_CODES.invalidRequest,
      'Cannot execute a verification check: the request is malformed',
      {
        reasonCodes: reasons,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
      },
    );
  }
}

/**
 * Builds the bounded view one check is allowed to see, and freezes it.
 *
 * Freezing matters: `readonly` is erased at runtime, so without it a check could
 * reach into the arrays it was handed and edit the case's material list, a
 * receipt, or another check's view of the same batch.
 */
function buildCheckContext(
  context: ProtocolizationVerificationContext,
  protocolizationCase: ProtocolizationCase,
  profile: AssetProfile,
  requirement: AssetVerificationRequirement,
  checkId: AssetVerificationCheckId,
  inputs: ProtocolizationVerificationInputs,
  now: UtcDateTime,
): VerificationCheckContext {
  return deepFreeze<VerificationCheckContext>({
    tenantId: protocolizationCase.tenantId,
    caseId: protocolizationCase.caseId,
    profile: protocolizationCase.profile,
    assetProfile: profile,
    requirementId: requirement.id,
    requirement,
    checkId,
    subject: protocolizationCase.subject,
    caseState: protocolizationCase.state,
    caseRevision: protocolizationCase.revision,
    requirementProgress: listProtocolizationCaseRequirementProgress(protocolizationCase, profile),
    materials: protocolizationCase.materials,
    evidenceReceipts: inputs.evidenceReceipts ?? [],
    declarations: inputs.declarations ?? [],
    now,
    resolvers: context.resolvers ?? {},
  });
}

/**
 * Turns a validated execution into an immutable result and its event.
 *
 * An executor that returns something this engine will not store fails loudly
 * (`VERIFICATION_CHECK_EXECUTION_INVALID`) rather than having its output
 * repaired. Note also what is *not* here: no `try`/`catch` around the executor
 * anywhere in this module. A check that throws — a bug, a broken invariant, a
 * malformed implementation — propagates. Laundering a defect into `Unavailable`
 * would make a broken check indistinguishable from a working one reporting a
 * dependency outage, and the whole point of `Unavailable` is that the difference
 * stays visible.
 */
function sealResult(
  protocolizationCase: ProtocolizationCase,
  requirement: AssetVerificationRequirement,
  checkId: AssetVerificationCheckId,
  executionId: VerificationExecutionId,
  execution: VerificationCheckExecution,
  executedAt: UtcDateTime,
  correlationId: CanonicalId | undefined,
): ProtocolizationVerificationTransition {
  const admission = validateVerificationCheckExecution(execution);
  if (!admission.admitted) {
    failVerification(
      VERIFICATION_ERROR_CODES.invalidExecution,
      `Verification check ${checkId} returned a malformed execution: ${admission.reasons.join(', ')}`,
      {
        reasonCodes: admission.reasons,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
        requirementIds: [requirement.id],
        checkId,
        executionId,
      },
    );
  }

  const result: ProtocolizationVerificationResult = {
    schemaVersion: PROTOCOLIZATION_VERIFICATION_RESULT_SCHEMA_VERSION,
    executionId,
    tenantId: protocolizationCase.tenantId,
    caseId: protocolizationCase.caseId,
    // Copied field by field rather than spread, so the recorded pin is exactly
    // the two frozen fields and nothing can ride along on it.
    profile: {
      profileId: protocolizationCase.profile.profileId,
      profileVersion: protocolizationCase.profile.profileVersion,
    },
    requirementId: requirement.id,
    checkId,
    evaluatedCaseRevision: protocolizationCase.revision,
    outcome: execution.outcome,
    ...(execution.reasonCode === undefined ? {} : { reasonCode: execution.reasonCode }),
    ...(execution.summary === undefined ? {} : { summary: execution.summary }),
    ...(execution.inputRefs === undefined ? {} : { inputRefs: execution.inputRefs }),
    executedAt,
    ...(execution.canonicalVerificationRef === undefined
      ? {}
      : { canonicalVerificationRef: execution.canonicalVerificationRef }),
    ...(correlationId === undefined ? {} : { correlationId }),
  };

  const validation = validateProtocolizationVerificationResult(result);
  if (!validation.admitted) {
    failVerification(
      VERIFICATION_ERROR_CODES.invalidResult,
      `Refusing to produce an invalid ProtocolizationVerificationResult: ${validation.reasons.join(', ')}`,
      {
        reasonCodes: validation.reasons,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
        executionId,
        checkId,
      },
    );
  }

  return {
    result: deepFreeze(result),
    event: deepFreeze<ProtocolizationVerificationCheckExecutedEvent>({
      eventType: PROTOCOLIZATION_VERIFICATION_EVENT_TYPES.checkExecuted,
      executionId,
      tenantId: result.tenantId,
      caseId: result.caseId,
      profile: result.profile,
      requirementId: result.requirementId,
      checkId: result.checkId,
      evaluatedCaseRevision: result.evaluatedCaseRevision,
      outcome: result.outcome,
      ...(result.reasonCode === undefined ? {} : { reasonCode: result.reasonCode }),
      occurredAt: executedAt,
      ...(correlationId === undefined ? {} : { correlationId }),
    }),
  };
}

/**
 * The deterministic execution plan for one case: every `(requirementId,
 * checkId)` pair its exact pinned profile version declares.
 *
 * Ordering is the profile's own — verification requirements in declaration
 * order, and within each, `checkIds` in declaration order. It is therefore
 * stable across runs and independent of registration order, which is what makes
 * "execution order does not change results" a property rather than a hope.
 *
 * Checks are independent by construction: nothing here expresses a dependency
 * between two of them, and no dependency is inferred from a check id's spelling.
 * A check that genuinely needed another's output would need an explicit,
 * machine-readable dependency in the profile, and APV-03 declares none — so
 * orchestrating one is a later slice's work, not something to guess at here.
 *
 * Pure and synchronous: it resolves the pinned profile and reads it. It executes
 * nothing.
 */
export function listProtocolizationVerificationPlan(
  context: ProtocolizationVerificationContext,
  protocolizationCase: ProtocolizationCase,
): readonly ProtocolizationVerificationPlanEntry[] {
  assertActingTenantOwnsCase(context, protocolizationCase);
  assertReadableCase(protocolizationCase);
  const profile = resolvePinnedProfile(context, protocolizationCase);

  return profile.requirements.flatMap((requirement) => {
    if (requirement.kind !== AssetRequirementKind.Verification) return [];
    const seen = new Set<AssetVerificationCheckId>();
    return requirement.checkIds.map((checkId) => {
      if (seen.has(checkId)) {
        failVerification(
          VERIFICATION_ERROR_CODES.duplicateDeclaredCheck,
          `Requirement ${requirement.id} declares check ${checkId} more than once`,
          {
            reasonCodes: [VERIFICATION_ERROR_CODES.duplicateDeclaredCheck],
            caseId: protocolizationCase.caseId,
            requirementIds: [requirement.id],
            checkId,
          },
        );
      }
      seen.add(checkId);
      return { requirementId: requirement.id, checkId };
    });
  });
}

/**
 * Executes one profile-declared check against one case, or fails.
 *
 * Order of checks is part of the contract: tenant, then case validity, then
 * request admission, then case identity, then lifecycle, then the pinned
 * profile, then requirement kind, then check declaration, then registration,
 * then supplied-input ownership, then the clock — and only then does an executor
 * run. A failure at any step throws and produces nothing: no result, no event,
 * and — since this layer never touches the case — no mutation of any kind.
 */
export async function executeProtocolizationVerificationCheck(
  context: ProtocolizationVerificationContext,
  protocolizationCase: ProtocolizationCase,
  input: ExecuteProtocolizationVerificationInput,
): Promise<ProtocolizationVerificationTransition> {
  assertActingTenantOwnsCase(context, protocolizationCase);
  assertReadableCase(protocolizationCase);
  assertAdmissibleRequest(protocolizationCase, input);
  assertCaseAcceptsVerification(protocolizationCase);

  const profile = resolvePinnedProfile(context, protocolizationCase);
  const requirement = resolveVerificationRequirement(
    profile,
    protocolizationCase,
    input.requirementId,
  );
  assertCheckDeclared(requirement, protocolizationCase, input.checkId);

  const check = context.checks.get(input.checkId);
  if (check === undefined) {
    failVerification(
      VERIFICATION_ERROR_CODES.checkNotRegistered,
      `No verification check implementation is registered for ${input.checkId}`,
      {
        reasonCodes: [VERIFICATION_ERROR_CODES.checkNotRegistered],
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
        requirementIds: [requirement.id],
        checkId: input.checkId,
      },
    );
  }

  assertInputsBelongToCase(context, protocolizationCase, input);
  const executedAt = readClock(context, protocolizationCase);

  const execution = await check.execute(
    buildCheckContext(
      context,
      protocolizationCase,
      profile,
      requirement,
      input.checkId,
      input,
      executedAt,
    ),
  );

  return sealResult(
    protocolizationCase,
    requirement,
    input.checkId,
    input.executionId,
    execution,
    executedAt,
    input.correlationId,
  );
}

/**
 * Executes every check the pinned profile declares, against one case revision.
 *
 * ### It does not stop at the first failure
 *
 * Deliberately. Short-circuiting would hand a later reviewer one finding and
 * hide the rest, and the reviewer's question is almost never "is there a
 * problem?" but "what is the complete set of problems?". A run of eight checks
 * that fails on the second still executes all eight.
 *
 * ### It produces no verdict
 *
 * The return value is the results, the shared revision and the shared instant.
 * There is no aggregate outcome, no score and no readiness signal, because a
 * batch of independent findings is not a decision — and turning it into one is
 * APV-09's job, not this function's.
 *
 * ### It is not a run entity
 *
 * No `VerificationRun` record is created. Everything a run aggregate would carry
 * is already on every result and identical across the batch
 * (`evaluatedCaseRevision`, `executedAt`, `correlationId`), so the entity would
 * add an identifier and no fact.
 */
export async function runProtocolizationVerification(
  context: ProtocolizationVerificationContext,
  protocolizationCase: ProtocolizationCase,
  input: RunProtocolizationVerificationInput,
): Promise<ProtocolizationVerificationRun> {
  assertActingTenantOwnsCase(context, protocolizationCase);
  assertReadableCase(protocolizationCase);
  assertCaseAcceptsVerification(protocolizationCase);

  const plan = listProtocolizationVerificationPlan(context, protocolizationCase);
  if (
    !Array.isArray(input.executionIds) ||
    input.executionIds.length !== plan.length
  ) {
    failVerification(
      VERIFICATION_ERROR_CODES.invalidRequest,
      `This case's pinned profile declares ${plan.length} check execution(s); exactly that many execution ids are required`,
      {
        reasonCodes: [VERIFICATION_ERROR_CODES.invalidRequest],
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
      },
    );
  }
  if (new Set(input.executionIds).size !== input.executionIds.length) {
    failVerification(
      VERIFICATION_ERROR_CODES.invalidRequest,
      'Execution ids within one run must be distinct',
      {
        reasonCodes: [VERIFICATION_ERROR_CODES.invalidRequest],
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
      },
    );
  }

  const results: ProtocolizationVerificationResult[] = [];
  const events: ProtocolizationVerificationCheckExecutedEvent[] = [];

  // Sequential on purpose. The clock is read once per execution and the case is
  // immutable, so concurrency would change nothing about the basis — but it
  // would make the order in which resolvers are consulted non-deterministic,
  // and a deterministic engine is worth more here than a marginally faster one.
  for (const [index, entry] of plan.entries()) {
    const transition = await executeProtocolizationVerificationCheck(context, protocolizationCase, {
      executionId: input.executionIds[index] as VerificationExecutionId,
      requirementId: entry.requirementId,
      checkId: entry.checkId,
      ...(input.evidenceReceipts === undefined ? {} : { evidenceReceipts: input.evidenceReceipts }),
      ...(input.declarations === undefined ? {} : { declarations: input.declarations }),
      ...(input.correlationId === undefined ? {} : { correlationId: input.correlationId }),
    });
    results.push(transition.result);
    events.push(transition.event);
  }

  const executedAt =
    results[0]?.executedAt ?? readClock(context, protocolizationCase);

  return deepFreeze<ProtocolizationVerificationRun>({
    results,
    events,
    evaluatedCaseRevision: protocolizationCase.revision,
    executedAt,
  });
}

/**
 * Turns an untrusted, persisted value back into a result, or fails.
 *
 * The single supported way to bring a result back across a persistence or
 * network boundary. It validates before it trusts and freezes what it returns,
 * so a store cannot hand a caller a finding the engine would have refused to
 * produce — and cannot hand back one whose outcome is a string outside the
 * closed set.
 */
export function reconstituteProtocolizationVerificationResult(
  value: unknown,
): ProtocolizationVerificationResult {
  const validation = validateProtocolizationVerificationResult(value);
  if (!validation.admitted) {
    failVerification(
      VERIFICATION_ERROR_CODES.invalidResult,
      `Refusing to reconstitute an invalid ProtocolizationVerificationResult: ${validation.reasons.join(', ')}`,
      { reasonCodes: validation.reasons },
    );
  }
  return deepFreeze(value as ProtocolizationVerificationResult);
}
