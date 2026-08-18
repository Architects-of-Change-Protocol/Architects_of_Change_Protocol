import type { UtcDateTime } from '@aoc/protocol/contracts';

import type { AssetRequirementId } from '../identifiers';
import type { AssetProfile } from '../profile';
import { protocolizationProfileRefsEqual } from './case-identifiers';
import type { ProtocolizationMaterialId } from './case-identifiers';
import { PROTOCOLIZATION_CASE_ERROR_CODES, ProtocolizationCaseError } from './case-errors';
import {
  ProtocolizationRequirementConditionStatus,
  ProtocolizationRequirementMaterialStatus,
} from './case-state';
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

function assertPinnedProfile(protocolizationCase: ProtocolizationCase, profile: AssetProfile): void {
  if (
    !protocolizationProfileRefsEqual(protocolizationCase.profile, {
      profileId: profile.profileId,
      profileVersion: profile.version,
    })
  ) {
    throw new ProtocolizationCaseError(
      PROTOCOLIZATION_CASE_ERROR_CODES.profileMismatch,
      `This case is pinned to ${protocolizationCase.profile.profileId}@${protocolizationCase.profile.profileVersion}`,
      {
        reasonCodes: [PROTOCOLIZATION_CASE_ERROR_CODES.profileMismatch],
        caseId: protocolizationCase.caseId,
        profile: protocolizationCase.profile,
      },
    );
  }
}

/**
 * Projects the case's requirement states against the profile it is pinned to.
 *
 * Supplying a different profile — a later version of the same line, or another
 * line entirely — fails rather than silently reporting progress against rules
 * the case was never assessed under.
 */
export function listProtocolizationCaseRequirementProgress(
  protocolizationCase: ProtocolizationCase,
  profile: AssetProfile,
  filter: ProtocolizationCaseProgressFilter = {},
): readonly ProtocolizationCaseRequirementProgress[] {
  assertPinnedProfile(protocolizationCase, profile);

  const states = new Map(
    protocolizationCase.requirementStates.map((state) => [state.requirementId, state]),
  );

  return profile.requirements
    .flatMap((requirement) => {
      const state = states.get(requirement.id);
      if (state === undefined) return [];
      const progress: ProtocolizationCaseRequirementProgress = {
        requirementId: requirement.id,
        kind: requirement.kind,
        obligation: requirement.obligation,
        materialStatus: state.materialStatus,
        conditionStatus:
          requirement.obligation === AssetRequirementObligation.Conditional
            ? ProtocolizationRequirementConditionStatus.Unresolved
            : ProtocolizationRequirementConditionStatus.NotApplicable,
        materialIds: state.materialIds,
        ...(state.firstMaterialAt === undefined ? {} : { firstMaterialAt: state.firstMaterialAt }),
        updatedAt: state.updatedAt,
      };
      return [progress];
    })
    .filter((progress) => {
      if (filter.kind !== undefined && progress.kind !== filter.kind) return false;
      if (filter.obligation !== undefined && progress.obligation !== filter.obligation) return false;
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
export function listProtocolizationCasePendingMaterialRequirements(
  protocolizationCase: ProtocolizationCase,
  profile: AssetProfile,
): readonly ProtocolizationCaseRequirementProgress[] {
  return listProtocolizationCaseRequirementProgress(protocolizationCase, profile).filter(
    (progress) =>
      progress.materialStatus === ProtocolizationRequirementMaterialStatus.Pending &&
      (progress.obligation === AssetRequirementObligation.Required ||
        progress.obligation === AssetRequirementObligation.Conditional),
  );
}

/**
 * Deterministic lookup of one requirement's progress. Returns `undefined` when
 * the profile does not declare it — an ordinary answer, not an error, matching
 * `getAssetProfileRequirement`.
 */
export function getProtocolizationCaseRequirementProgress(
  protocolizationCase: ProtocolizationCase,
  profile: AssetProfile,
  requirementId: AssetRequirementId,
): ProtocolizationCaseRequirementProgress | undefined {
  return listProtocolizationCaseRequirementProgress(protocolizationCase, profile).find(
    (progress) => progress.requirementId === requirementId,
  );
}
