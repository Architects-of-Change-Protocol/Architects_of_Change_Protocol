"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProtocolizationCaseRequirementProgress = listProtocolizationCaseRequirementProgress;
exports.listProtocolizationCasePendingMaterialRequirements = listProtocolizationCasePendingMaterialRequirements;
exports.getProtocolizationCaseRequirementProgress = getProtocolizationCaseRequirementProgress;
const case_identifiers_1 = require("./case-identifiers");
const case_errors_1 = require("./case-errors");
const case_state_1 = require("./case-state");
const requirements_1 = require("../requirements");
function assertPinnedProfile(protocolizationCase, profile) {
    if (!(0, case_identifiers_1.protocolizationProfileRefsEqual)(protocolizationCase.profile, {
        profileId: profile.profileId,
        profileVersion: profile.version,
    })) {
        throw new case_errors_1.ProtocolizationCaseError(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.profileMismatch, `This case is pinned to ${protocolizationCase.profile.profileId}@${protocolizationCase.profile.profileVersion}`, {
            reasonCodes: [case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.profileMismatch],
            caseId: protocolizationCase.caseId,
            profile: protocolizationCase.profile,
        });
    }
}
/**
 * Projects the case's requirement states against the profile it is pinned to.
 *
 * Supplying a different profile — a later version of the same line, or another
 * line entirely — fails rather than silently reporting progress against rules
 * the case was never assessed under.
 */
function listProtocolizationCaseRequirementProgress(protocolizationCase, profile, filter = {}) {
    assertPinnedProfile(protocolizationCase, profile);
    const states = new Map(protocolizationCase.requirementStates.map((state) => [state.requirementId, state]));
    return profile.requirements
        .flatMap((requirement) => {
        const state = states.get(requirement.id);
        if (state === undefined)
            return [];
        const progress = {
            requirementId: requirement.id,
            kind: requirement.kind,
            obligation: requirement.obligation,
            materialStatus: state.materialStatus,
            conditionStatus: requirement.obligation === requirements_1.AssetRequirementObligation.Conditional
                ? case_state_1.ProtocolizationRequirementConditionStatus.Unresolved
                : case_state_1.ProtocolizationRequirementConditionStatus.NotApplicable,
            materialIds: state.materialIds,
            ...(state.firstMaterialAt === undefined ? {} : { firstMaterialAt: state.firstMaterialAt }),
            updatedAt: state.updatedAt,
        };
        return [progress];
    })
        .filter((progress) => {
        if (filter.kind !== undefined && progress.kind !== filter.kind)
            return false;
        if (filter.obligation !== undefined && progress.obligation !== filter.obligation)
            return false;
        if (filter.materialStatus !== undefined && progress.materialStatus !== filter.materialStatus) {
            return false;
        }
        return true;
    });
}
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
function listProtocolizationCasePendingMaterialRequirements(protocolizationCase, profile) {
    return listProtocolizationCaseRequirementProgress(protocolizationCase, profile).filter((progress) => progress.materialStatus === case_state_1.ProtocolizationRequirementMaterialStatus.Pending &&
        (progress.obligation === requirements_1.AssetRequirementObligation.Required ||
            progress.obligation === requirements_1.AssetRequirementObligation.Conditional));
}
/**
 * Deterministic lookup of one requirement's progress. Returns `undefined` when
 * the profile does not declare it — an ordinary answer, not an error, matching
 * `getAssetProfileRequirement`.
 */
function getProtocolizationCaseRequirementProgress(protocolizationCase, profile, requirementId) {
    return listProtocolizationCaseRequirementProgress(protocolizationCase, profile).find((progress) => progress.requirementId === requirementId);
}
