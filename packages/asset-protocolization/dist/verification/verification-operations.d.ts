import type { CanonicalId, UtcDateTime } from '@aoc/protocol/contracts';
import type { AssetRequirementId, AssetVerificationCheckId } from '../identifiers';
import type { ProtocolizationCaseContext } from '../case/case-operations';
import type { ProtocolizationCase } from '../case/protocolization-case';
import type { EvidenceIntakeReceipt } from '../evidence/evidence-intake-receipt';
import type { ProtocolizationDeclarationRecord } from '../declarations/declaration-record';
import type { VerificationCheckRegistry } from './verification-check-registry';
import type { ProtocolizationVerificationCheckExecutedEvent } from './verification-events';
import type { VerificationExecutionId } from './verification-identifiers';
import type { VerificationResolvers } from './verification-ports';
import type { ProtocolizationVerificationResult } from './verification-result';
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
export declare function listProtocolizationVerificationPlan(context: ProtocolizationVerificationContext, protocolizationCase: ProtocolizationCase): readonly ProtocolizationVerificationPlanEntry[];
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
export declare function executeProtocolizationVerificationCheck(context: ProtocolizationVerificationContext, protocolizationCase: ProtocolizationCase, input: ExecuteProtocolizationVerificationInput): Promise<ProtocolizationVerificationTransition>;
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
export declare function runProtocolizationVerification(context: ProtocolizationVerificationContext, protocolizationCase: ProtocolizationCase, input: RunProtocolizationVerificationInput): Promise<ProtocolizationVerificationRun>;
/**
 * Turns an untrusted, persisted value back into a result, or fails.
 *
 * The single supported way to bring a result back across a persistence or
 * network boundary. It validates before it trusts and freezes what it returns,
 * so a store cannot hand a caller a finding the engine would have refused to
 * produce — and cannot hand back one whose outcome is a string outside the
 * closed set.
 */
export declare function reconstituteProtocolizationVerificationResult(value: unknown): ProtocolizationVerificationResult;
//# sourceMappingURL=verification-operations.d.ts.map