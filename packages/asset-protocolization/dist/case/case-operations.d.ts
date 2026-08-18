import type { CanonicalId } from '@aoc/protocol/contracts';
import type { AssetRequirementId } from '../identifiers';
import type { AssetProfile } from '../profile';
import type { AssetProfileCatalog } from '../profile-catalog';
import type { ProtocolizationClock } from './case-clock';
import type { ProtocolizationCaseEvent } from './case-events';
import type { ProtocolizationCaseId, ProtocolizationMaterialId, ProtocolizationProfileRef, ProtocolizationTenantId } from './case-identifiers';
import type { ProtocolizationCaseMaterial } from './case-material';
import type { ProtocolizationCaseSubject } from './case-subject';
import type { ProtocolizationCase } from './protocolization-case';
/**
 * Every deterministic operation a `ProtocolizationCase` supports.
 *
 * Pure functions over an immutable aggregate: each takes a case, returns a new
 * case plus the one event the transition produced, and mutates nothing. There is
 * no `case.state = ...` anywhere, no setter and no method, so an illegal
 * transition is not something a caller can express — it is something an
 * operation refuses.
 *
 * Nothing here performs I/O. No network call, no database call, no registry
 * lookup, no credential check, no policy evaluation and no tokenizer
 * invocation: the only outside world these functions touch is the clock and the
 * profile catalogue, both injected. That is what keeps the aggregate testable
 * and what keeps infrastructure behind ports where the ADR put it.
 */
/**
 * What an operation needs beyond the case itself.
 *
 * `tenantId` is the *acting* tenant, and it is a parameter rather than a
 * property of the case for a reason: an operation that read the tenant off the
 * case it was handed could never detect a cross-tenant call, because the answer
 * would always agree with itself. Passing the caller's tenant separately is what
 * makes `tenant B mutates tenant A's case` a rejectable event rather than an
 * invisible one.
 */
export interface ProtocolizationCaseContext {
    /** Resolves the exact pinned profile version. Never asked for a latest version. */
    readonly catalog: AssetProfileCatalog;
    readonly clock: ProtocolizationClock;
    readonly tenantId: ProtocolizationTenantId;
}
/** A successful operation: the new aggregate, and the fact it produced. */
export interface ProtocolizationCaseTransition {
    readonly protocolizationCase: ProtocolizationCase;
    readonly event: ProtocolizationCaseEvent;
}
export interface CreateProtocolizationCaseInput {
    readonly caseId: ProtocolizationCaseId;
    /** The exact profile version to pin. Resolved at creation; never re-resolved. */
    readonly profile: ProtocolizationProfileRef;
    readonly subject: ProtocolizationCaseSubject;
    readonly correlationId?: CanonicalId;
}
/** A material association without its `addedAt`, which the clock supplies. */
type WithoutAddedAt<T> = T extends unknown ? Omit<T, 'addedAt'> : never;
export type ProtocolizationCaseMaterialInput = WithoutAddedAt<ProtocolizationCaseMaterial>;
export interface AssociateProtocolizationMaterialInput {
    readonly materialId: ProtocolizationMaterialId;
    /** Requirements to add. Every one must be new for this material. */
    readonly requirementIds: readonly AssetRequirementId[];
}
export interface CancelProtocolizationCaseInput {
    /** Presentation only. Never read by machine semantics. */
    readonly reason?: string;
}
/**
 * Creates a case, or fails.
 *
 * Centralized deliberately: a case built from an object literal somewhere else
 * could carry an unpinned profile, an absent tenant, a requirement projection
 * that does not match the profile, or a state that no transition can produce.
 * This is the only way to obtain a case that has never been persisted.
 *
 * Resolution of the exact `(profileId, profileVersion)` pair is a precondition,
 * not a convenience: a case whose rules cannot be read is a case nobody can
 * assess, and discovering that at readiness time rather than at intake is the
 * expensive order to discover it in.
 */
export declare function createProtocolizationCase(context: ProtocolizationCaseContext, input: CreateProtocolizationCaseInput): ProtocolizationCaseTransition;
/**
 * `Draft -> Active`. The case has been taken up for processing.
 *
 * Activation says nothing about completeness. It does not assert that the
 * subject is identified, that required material has arrived, or that anything
 * has been checked — it records that work on this case has begun.
 */
export declare function activateProtocolizationCase(context: ProtocolizationCaseContext, protocolizationCase: ProtocolizationCase): ProtocolizationCaseTransition;
/**
 * Records that the case was told about a reference, against one or more
 * requirements of its pinned profile.
 *
 * This is an association, not an assertion. A case that has been given an
 * attestation reference is not attested; a case that has been given a
 * verification reference has not been verified; a case whose every required
 * requirement has material is not ready. Deciding any of those needs the
 * referenced records themselves and an evaluator that does not exist in this
 * slice.
 */
export declare function addProtocolizationCaseMaterial(context: ProtocolizationCaseContext, protocolizationCase: ProtocolizationCase, input: ProtocolizationCaseMaterialInput): ProtocolizationCaseTransition;
/**
 * Correlates an existing material with further requirements of the pinned
 * profile — one document that answers two requirements, recorded once and
 * pointed at both.
 *
 * Re-associating a material with a requirement it already answers is rejected
 * rather than ignored. A silent no-op would either emit an event describing an
 * association that did not happen or report success while emitting nothing, and
 * both leave an audit reader with a false account of the case.
 */
export declare function associateProtocolizationCaseMaterial(context: ProtocolizationCaseContext, protocolizationCase: ProtocolizationCase, input: AssociateProtocolizationMaterialInput): ProtocolizationCaseTransition;
/**
 * `Draft | Active -> Cancelled`. Terminal.
 *
 * Cancellation is a state, not a deletion. The case keeps its profile pin, its
 * subject, every material association it accumulated and every timestamp,
 * because the auditable question "what was attempted, and what was supplied,
 * before this was abandoned?" has to stay answerable. Erasure is a data-lifecycle
 * concern with its own authority and retention questions; it is not what
 * cancelling a case means.
 *
 * Cancelling a cancelled case fails rather than succeeding idempotently: the
 * second call would either invent a second cancellation event or claim success
 * with nothing to show for it.
 */
export declare function cancelProtocolizationCase(context: ProtocolizationCaseContext, protocolizationCase: ProtocolizationCase, input?: CancelProtocolizationCaseInput): ProtocolizationCaseTransition;
/**
 * Turns an untrusted, persisted value back into a case, or fails.
 *
 * The single supported way to bring a case back across a persistence or
 * network boundary. It validates before it trusts — including, when a profile
 * is supplied, that every projected requirement is declared by the exact pinned
 * version — and freezes what it returns, so a store cannot hand a caller an
 * aggregate the operations above would have refused to produce.
 */
export declare function reconstituteProtocolizationCase(value: unknown, options?: {
    readonly profile?: AssetProfile;
}): ProtocolizationCase;
export {};
//# sourceMappingURL=case-operations.d.ts.map