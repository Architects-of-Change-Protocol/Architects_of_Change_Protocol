import type { UtcDateTime } from '@aoc/protocol/contracts';

import type { AssetRequirementId, AssetVerificationCheckId } from '../identifiers';
import type { AssetProfile } from '../profile';
import type { AssetVerificationRequirement } from '../requirements';
import type {
  ProtocolizationCaseId,
  ProtocolizationProfileRef,
  ProtocolizationTenantId,
} from '../case/case-identifiers';
import type { ProtocolizationCaseMaterial } from '../case/case-material';
import type { ProtocolizationCaseRequirementProgress } from '../case/case-progress';
import type { ProtocolizationCaseState } from '../case/case-state';
import type { ProtocolizationCaseSubject } from '../case/case-subject';
import type { EvidenceIntakeReceipt } from '../evidence/evidence-intake-receipt';
import type { ProtocolizationDeclarationRecord } from '../declarations/declaration-record';
import type { VerificationResolvers } from './verification-ports';

/**
 * Everything one check execution is allowed to see.
 *
 * ### Bounded on purpose
 *
 * A check receives a *view* of one case under one pinned profile version, and
 * nothing else. It is handed no repository, no profile catalogue, no clock port,
 * no other case, no other tenant's anything, no environment and no ambient
 * globals — so a check cannot widen its own basis, and a reader of a result can
 * tell from this type alone what could possibly have been evaluated.
 *
 * The instant is a *value*, not a port: the engine reads the injected
 * `ProtocolizationClock` once, validates it, and passes the result through. A
 * check that could read its own clock would be non-deterministic, and two
 * checks in one batch could disagree about when "now" was while claiming to
 * have evaluated the same case revision.
 *
 * ### Everything here is deeply frozen
 *
 * A check cannot mutate the case, the profile, the receipts, the declarations
 * or its own context. Verification produces *new* records; it never edits the
 * material it read. Nothing here offers a way to mark evidence verified, a
 * declaration accepted, or a requirement satisfied — those fields do not exist,
 * on any of these types, by design.
 */
export interface VerificationCheckContext {
  readonly tenantId: ProtocolizationTenantId;
  readonly caseId: ProtocolizationCaseId;

  /** The exact pin. Identical to `assetProfile`'s own identity, and never re-resolved. */
  readonly profile: ProtocolizationProfileRef;

  /**
   * The pinned profile document.
   *
   * The check contract lives in the profile, so a check that could not read it
   * would have nothing to evaluate against. This is a system-level, immutable,
   * shared definition — not tenant data — and it is the exact version the case
   * pinned, never a later one.
   */
  readonly assetProfile: AssetProfile;

  /** The verification requirement that declares this check. */
  readonly requirementId: AssetRequirementId;
  readonly requirement: AssetVerificationRequirement;

  /** The check being executed. Always one of `requirement.checkIds`. */
  readonly checkId: AssetVerificationCheckId;

  readonly subject: ProtocolizationCaseSubject;
  readonly caseState: ProtocolizationCaseState;

  /**
   * The revision this execution evaluates, and the revision the result will
   * record. Fixed for the whole execution: the case is immutable and this layer
   * never mutates it, so there is no window in which it could move.
   */
  readonly caseRevision: number;

  /** APV-04's own projection of the case against the pinned profile. */
  readonly requirementProgress: readonly ProtocolizationCaseRequirementProgress[];

  /** Every material association on the case, in association order. */
  readonly materials: readonly ProtocolizationCaseMaterial[];

  /**
   * APV-05 receipts for this case, as the caller supplied them.
   *
   * Reused, never duplicated: this slice builds no second evidence substrate and
   * re-reads no evidence document. The engine checks that every receipt handed
   * to it belongs to this tenant and this case before any check sees it.
   */
  readonly evidenceReceipts: readonly EvidenceIntakeReceipt[];

  /**
   * APV-06 records for this case, as the caller supplied them.
   *
   * Reused, never duplicated, and never rewritten. A check may read a
   * declaration and reach a finding about it; the declaration itself is
   * unchanged by the finding, including when the finding is `Fail`.
   */
  readonly declarations: readonly ProtocolizationDeclarationRecord[];

  /** The execution instant, from the injected clock. Never read by a check itself. */
  readonly now: UtcDateTime;

  /** The ports this execution was given. Every one optional; an absent one means `Unavailable`. */
  readonly resolvers: VerificationResolvers;
}
