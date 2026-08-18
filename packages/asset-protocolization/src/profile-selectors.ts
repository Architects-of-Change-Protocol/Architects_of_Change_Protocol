import type { AssetRequirementId } from './identifiers';
import { GLOBAL_JURISDICTION_CODE } from './jurisdiction';
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

function appliesInJurisdiction(requirement: AssetRequirement, jurisdictionCode: string): boolean {
  if (requirement.jurisdictions === undefined) return true;
  return requirement.jurisdictions.some(
    (jurisdiction) =>
      jurisdiction.code === jurisdictionCode || jurisdiction.code === GLOBAL_JURISDICTION_CODE,
  );
}

/**
 * Deterministic lookup by requirement id. Returns `undefined` rather than
 * throwing: an absent requirement is an ordinary answer to "does this profile
 * require X?", not an error.
 */
export function getAssetProfileRequirement(
  profile: AssetProfile,
  requirementId: AssetRequirementId,
): AssetRequirement | undefined {
  return profile.requirements.find((requirement) => requirement.id === requirementId);
}

export function hasAssetProfileRequirement(
  profile: AssetProfile,
  requirementId: AssetRequirementId,
): boolean {
  return getAssetProfileRequirement(profile, requirementId) !== undefined;
}

/** Requirements matching every supplied filter field, in declaration order. */
export function listAssetProfileRequirements(
  profile: AssetProfile,
  filter: AssetRequirementFilter = {},
): readonly AssetRequirement[] {
  return profile.requirements.filter((requirement) => {
    if (filter.kind !== undefined && requirement.kind !== filter.kind) return false;
    if (filter.obligation !== undefined && requirement.obligation !== filter.obligation) return false;
    if (filter.jurisdictionCode !== undefined && !appliesInJurisdiction(requirement, filter.jurisdictionCode)) {
      return false;
    }
    return true;
  });
}

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
export function listAssetProfileReadinessRequirements(
  profile: AssetProfile,
  jurisdictionCode?: string,
): readonly AssetRequirement[] {
  return profile.requirements.filter((requirement) => {
    if (
      requirement.obligation !== AssetRequirementObligation.Required &&
      requirement.obligation !== AssetRequirementObligation.Conditional
    ) {
      return false;
    }
    if (jurisdictionCode !== undefined && !appliesInJurisdiction(requirement, jurisdictionCode)) {
      return false;
    }
    return true;
  });
}
