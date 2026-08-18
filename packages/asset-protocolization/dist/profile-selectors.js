"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssetProfileRequirement = getAssetProfileRequirement;
exports.hasAssetProfileRequirement = hasAssetProfileRequirement;
exports.listAssetProfileRequirements = listAssetProfileRequirements;
exports.listAssetProfileReadinessRequirements = listAssetProfileReadinessRequirements;
const jurisdiction_1 = require("./jurisdiction");
const requirements_1 = require("./requirements");
function appliesInJurisdiction(requirement, jurisdictionCode) {
    if (requirement.jurisdictions === undefined)
        return true;
    return requirement.jurisdictions.some((jurisdiction) => jurisdiction.code === jurisdictionCode || jurisdiction.code === jurisdiction_1.GLOBAL_JURISDICTION_CODE);
}
/**
 * Deterministic lookup by requirement id. Returns `undefined` rather than
 * throwing: an absent requirement is an ordinary answer to "does this profile
 * require X?", not an error.
 */
function getAssetProfileRequirement(profile, requirementId) {
    return profile.requirements.find((requirement) => requirement.id === requirementId);
}
function hasAssetProfileRequirement(profile, requirementId) {
    return getAssetProfileRequirement(profile, requirementId) !== undefined;
}
/** Requirements matching every supplied filter field, in declaration order. */
function listAssetProfileRequirements(profile, filter = {}) {
    return profile.requirements.filter((requirement) => {
        if (filter.kind !== undefined && requirement.kind !== filter.kind)
            return false;
        if (filter.obligation !== undefined && requirement.obligation !== filter.obligation)
            return false;
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
function listAssetProfileReadinessRequirements(profile, jurisdictionCode) {
    return profile.requirements.filter((requirement) => {
        if (requirement.obligation !== requirements_1.AssetRequirementObligation.Required &&
            requirement.obligation !== requirements_1.AssetRequirementObligation.Conditional) {
            return false;
        }
        if (jurisdictionCode !== undefined && !appliesInJurisdiction(requirement, jurisdictionCode)) {
            return false;
        }
        return true;
    });
}
