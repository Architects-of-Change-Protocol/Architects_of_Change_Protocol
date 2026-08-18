import type { UtcDateTime } from '@aoc/protocol/contracts';
import type { AssetRequirementId } from '../identifiers';
import type { AssetProfile } from '../profile';
import type { ProtocolizationMaterialId } from './case-identifiers';
import { ProtocolizationRequirementConditionStatus, ProtocolizationRequirementMaterialStatus } from './case-state';
import type { ProtocolizationCase } from './protocolization-case';
import { AssetRequirementObligation } from '../requirements';
import type { AssetRequirementKind } from '../requirements';
/**
 * A structural progress view over one case.
 *
 * **This is not a readiness decision, and it must never be read as one.** Every
 * name here is deliberately about *material* and *structure*: nothing is called
 * `ready`, `verified`, `satisfied`, `complete` or `protocolizable`, because this
 * package cannot honestly say any of those things. What it can say is which
 * requirements the pinned profile declares, what the case has been given
 * against each, and which conditions remain unevaluated.
 *
 * The gap between the two is not a gap in coverage; it is the whole point:
 *
 * - a claim can exist and be untrue;
 * - evidence can exist and fail validation;
 * - an attestation can exist and be invalid, or out of scope;
 * - a registry lookup can exist and be stale;
 * - a credential can exist and be expired or revoked.
 *
 * A future readiness evaluator answers *what prevents this case from becoming
 * ready?* by reading exactly this view plus the referenced Protocol records and
 * the profile's conditions and freshness constraints. APV-04 prepares that
 * question; it does not answer it.
 *
 * Requirement definitions are read from the profile on each call rather than
 * stored on the case, so a caller sees the profile's own `kind` and
 * `obligation` — one copy, in the document that owns them.
 */
export interface ProtocolizationCaseRequirementProgress {
    readonly requirementId: AssetRequirementId;
    /** The profile's requirement family. Read from the profile, never restated by the case. */
    readonly kind: AssetRequirementKind;
    /**
     * The profile's obligation, unflattened. `Required`, `Optional`, `Conditional`
     * and `NotRequired` are reported as declared — collapsing them to a boolean
     * would erase the distinction between "not demanded here" and "demanded only
     * if a condition holds", and a later evaluator needs both.
     */
    readonly obligation: AssetRequirementObligation;
    readonly materialStatus: ProtocolizationRequirementMaterialStatus;
    readonly conditionStatus: ProtocolizationRequirementConditionStatus;
    readonly materialIds: readonly ProtocolizationMaterialId[];
    readonly firstMaterialAt?: UtcDateTime;
    readonly updatedAt: UtcDateTime;
}
export interface ProtocolizationCaseProgressFilter {
    readonly kind?: AssetRequirementKind;
    readonly obligation?: AssetRequirementObligation;
    readonly materialStatus?: ProtocolizationRequirementMaterialStatus;
}
/**
 * Projects the case's requirement states against the profile it is pinned to.
 *
 * Supplying a different profile — a later version of the same line, or another
 * line entirely — fails rather than silently reporting progress against rules
 * the case was never assessed under.
 */
export declare function listProtocolizationCaseRequirementProgress(protocolizationCase: ProtocolizationCase, profile: AssetProfile, filter?: ProtocolizationCaseProgressFilter): readonly ProtocolizationCaseRequirementProgress[];
/**
 * The requirements a readiness evaluation will have to account for that have no
 * material yet: everything `Required` or `Conditional` still `Pending`.
 *
 * Named for what it reports. An empty result means only that material is
 * present everywhere it was structurally expected — it does not mean the case is
 * ready, that the material is any good, or that the conditional requirements it
 * stopped counting actually apply. Those remain unevaluated, and a caller that
 * treats an empty list as readiness has drawn a conclusion this function did not
 * offer.
 */
export declare function listProtocolizationCasePendingMaterialRequirements(protocolizationCase: ProtocolizationCase, profile: AssetProfile): readonly ProtocolizationCaseRequirementProgress[];
/**
 * Deterministic lookup of one requirement's progress. Returns `undefined` when
 * the profile does not declare it — an ordinary answer, not an error, matching
 * `getAssetProfileRequirement`.
 */
export declare function getProtocolizationCaseRequirementProgress(protocolizationCase: ProtocolizationCase, profile: AssetProfile, requirementId: AssetRequirementId): ProtocolizationCaseRequirementProgress | undefined;
//# sourceMappingURL=case-progress.d.ts.map