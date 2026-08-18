import type { AssetRequirementId } from './identifiers';
import type { AssetProfile } from './profile';
import { AssetRequirementObligation } from './requirements';
import type { AssetRequirement, AssetRequirementKind } from './requirements';
/**
 * Read-only selectors over a profile's requirement set.
 *
 * These are what lets a later slice answer *"what must be satisfied before this
 * case may become READY?"* without APV-03 owning any case state. They are pure
 * functions over the profile document: no I/O, no clock, no case, no tenant.
 *
 * Readiness is derived from `obligation` rather than duplicated into a separate
 * list on the profile. A second, hand-maintained list of "the required ones"
 * would be free to drift out of agreement with the obligations it claims to
 * summarize, and a profile that disagrees with itself about what is required is
 * exactly the failure this framework exists to make impossible.
 */
export interface AssetRequirementFilter {
    readonly kind?: AssetRequirementKind;
    readonly obligation?: AssetRequirementObligation;
    /**
     * Keep only requirements that apply in this jurisdiction. A requirement with
     * no jurisdictions of its own applies wherever the profile applies, and one
     * scoped to `GLOBAL` applies everywhere.
     */
    readonly jurisdictionCode?: string;
}
/**
 * Deterministic lookup by requirement id. Returns `undefined` rather than
 * throwing: an absent requirement is an ordinary answer to "does this profile
 * require X?", not an error.
 */
export declare function getAssetProfileRequirement(profile: AssetProfile, requirementId: AssetRequirementId): AssetRequirement | undefined;
export declare function hasAssetProfileRequirement(profile: AssetProfile, requirementId: AssetRequirementId): boolean;
/** Requirements matching every supplied filter field, in declaration order. */
export declare function listAssetProfileRequirements(profile: AssetProfile, filter?: AssetRequirementFilter): readonly AssetRequirement[];
/**
 * The requirements a case must account for before it can be considered ready:
 * everything unconditionally `Required`, plus everything `Conditional`, whose
 * condition a later slice evaluates.
 *
 * `Optional` and `NotRequired` are excluded — an optional requirement never
 * blocks readiness, and `NotRequired` is a recorded decision that something is
 * *not* demanded.
 *
 * This returns the requirements to evaluate. It does not evaluate them, and
 * returning a non-empty list asserts nothing about whether any of them hold.
 */
export declare function listAssetProfileReadinessRequirements(profile: AssetProfile, jurisdictionCode?: string): readonly AssetRequirement[];
//# sourceMappingURL=profile-selectors.d.ts.map