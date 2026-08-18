import type { CanonicalId, UtcDateTime } from '@aoc/protocol/contracts';
import type { AssetRequirementId } from '../identifiers';
import type { ProtocolizationCaseId, ProtocolizationMaterialId, ProtocolizationProfileRef, ProtocolizationTenantId } from './case-identifiers';
import type { ProtocolizationCaseMaterial } from './case-material';
import type { ProtocolizationCaseState, ProtocolizationRequirementMaterialStatus } from './case-state';
import type { ProtocolizationCaseSubject } from './case-subject';
/**
 * `ProtocolizationCase` — one tenant's attempt to protocolize one subject under
 * one frozen `AssetProfile` version.
 *
 * ### What it is
 *
 * The workflow aggregate. It records what is happening in this attempt: which
 * profile governs it, which subject it is about, what has been supplied, where
 * it is in its lifecycle, and when each of those became true.
 *
 * ### What it is not
 *
 * It is not the protocolized asset — that is a signed `SovereignManifestV1`
 * that does not exist yet. It is not a `ProtocolizationResultV1` — that envelope
 * (APV-02 §2.1) exists only for a case that finished, and deliberately carries
 * no case state. It is not an Enterprise governance object, not a tokenization
 * request, and not a transaction of any kind.
 *
 * ### Profile versus case
 *
 * An `AssetProfile` answers *what does this category of asset require?* — it is
 * system-level, versioned, reusable and shared. A case answers *what is
 * happening in this specific attempt?* — it is tenant-bound, instance-specific
 * and stateful. A case never alters the semantics of its profile: it does not
 * copy requirement definitions, restate obligations, or hold a mutable snapshot
 * that could drift from the catalogued document. It holds the pin and reads
 * through it.
 *
 * ### Shape
 *
 * A plain immutable object, matching every other type in this package and in
 * Protocol. Operations are pure functions that return a new case plus the event
 * the transition produced (`case-operations.ts`); there is no setter, no
 * method, and no in-place mutation anywhere.
 */
export declare const PROTOCOLIZATION_CASE_SCHEMA_VERSION = "aoc-protocolization-case/1";
/**
 * What one case knows about its progress toward one requirement of the pinned
 * profile.
 *
 * It carries the requirement's **id** and nothing else from the profile. Label,
 * kind, obligation, conditions, freshness and every other definition stay in the
 * profile document, where exactly one copy of them exists. A case that restated
 * them could disagree with the rules it is being assessed under — the same
 * failure APV-03 refused when it derived readiness requirements from
 * `obligation` instead of maintaining a second hand-written list.
 *
 * `materialStatus` is a projection of `materialIds`, materialized so persisted
 * state can be validated rather than trusted, and checked for agreement on every
 * reconstruction: `Pending` if and only if `materialIds` is empty.
 */
export interface ProtocolizationCaseRequirementState {
    readonly requirementId: AssetRequirementId;
    readonly materialStatus: ProtocolizationRequirementMaterialStatus;
    /** Ids of materials associated with this requirement, in association order. */
    readonly materialIds: readonly ProtocolizationMaterialId[];
    /** When the first material was associated. Absent while `Pending`. */
    readonly firstMaterialAt?: UtcDateTime;
    /** When this requirement's case-level state last changed. */
    readonly updatedAt: UtcDateTime;
}
export interface ProtocolizationCase {
    readonly schemaVersion: typeof PROTOCOLIZATION_CASE_SCHEMA_VERSION;
    /** Stable identity. Immutable; unique within the tenant. */
    readonly caseId: ProtocolizationCaseId;
    /**
     * The tenant this case belongs to. Required, non-blank and immutable —
     * unlike Protocol's advisory `tenantId?`, which the substrate never enforces
     * (APV-00 F-4). Every operation takes an acting tenant and fails if it is not
     * this one.
     */
    readonly tenantId: ProtocolizationTenantId;
    /**
     * The exact profile version this case is assessed under. Fixed at creation
     * and never re-resolved: a case created under `1.0.0` still means `1.0.0`
     * after `2.0.0` is published, because nothing in this package ever asks the
     * catalogue for a latest, current or default version.
     */
    readonly profile: ProtocolizationProfileRef;
    /** Which subject this attempt is about. Immutable. */
    readonly subject: ProtocolizationCaseSubject;
    readonly state: ProtocolizationCaseState;
    /**
     * Monotonic counter, `1` at creation and incremented once per successful
     * operation.
     *
     * Follows `SovereignManifestV1.manifestVersion`, the repository's existing
     * aggregate-revision precedent, rather than introducing an event-sourcing
     * mechanism: events are *outputs* of deterministic operations here, never the
     * source of truth. The revision orders those outputs and gives the repository
     * port a lost-update check with no distributed machinery behind it.
     */
    readonly revision: number;
    /**
     * One entry per requirement of the pinned profile, projected at creation in
     * the profile's declaration order. Every obligation is projected —
     * `Optional`, `Conditional` and `NotRequired` included — because dropping the
     * ones that look irrelevant would silently flatten the profile's vocabulary
     * into required/not-required.
     */
    readonly requirementStates: readonly ProtocolizationCaseRequirementState[];
    /** Every material association, in the order it was added. */
    readonly materials: readonly ProtocolizationCaseMaterial[];
    readonly createdAt: UtcDateTime;
    /** Instant of the most recent successful operation. Never before `createdAt`. */
    readonly updatedAt: UtcDateTime;
    /** Present if and only if the case has been activated. */
    readonly activatedAt?: UtcDateTime;
    /** Present if and only if the case is `Cancelled`. */
    readonly cancelledAt?: UtcDateTime;
    /**
     * Optional human-readable note on why the case was cancelled.
     *
     * Presentation only, exactly like `AssetProfileMetadata`: no machine
     * semantics in this package read it, no operation branches on it, and there
     * is deliberately no reason taxonomy — a closed vocabulary of cancellation
     * reasons is a policy artifact, and policy is not this slice's to define.
     */
    readonly cancellationReason?: string;
    /** Correlates this case with the request or operation that opened it. */
    readonly correlationId?: CanonicalId;
}
//# sourceMappingURL=protocolization-case.d.ts.map