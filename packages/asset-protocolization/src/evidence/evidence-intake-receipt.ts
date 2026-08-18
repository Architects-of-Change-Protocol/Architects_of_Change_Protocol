import type { CanonicalEvidenceId, CanonicalReferenceSource } from '@aoc/protocol/claims';
import type { CanonicalId, UtcDateTime } from '@aoc/protocol/contracts';

import type { AssetRequirementId } from '../identifiers';
import type {
  ProtocolizationCaseId,
  ProtocolizationMaterialId,
  ProtocolizationProfileRef,
  ProtocolizationTenantId,
} from '../case/case-identifiers';
import type { EvidenceIntakeCategoryId, EvidenceIntakeId } from './evidence-intake-identifiers';

/**
 * `EvidenceIntakeReceipt` — the immutable record that evidence was
 * **structurally accepted** into one case at one instant and correlated in one
 * way.
 *
 * ### What a receipt means
 *
 * Exactly this, and it is worth spelling out because the temptation to read
 * more into it is the central risk of this whole slice:
 *
 * ```text
 * the vertical was told about this evidence reference,
 * by a caller acting as this tenant,
 * against this case, under this pinned profile version,
 * offered against these requirements,
 * through this intake pathway,
 * at this instant.
 * ```
 *
 * ### What a receipt does not mean
 *
 * ```text
 * the evidence is authentic          the evidence is true
 * the evidence is authoritative      the claim it supports is proven
 * the requirement is satisfied       the identity is resolved
 * the ownership is established       the case is ready
 * ```
 *
 * There is deliberately no `verified`, `valid`, `accepted` boolean, no status
 * field, and no outcome vocabulary anywhere on this type. A receipt existing
 * *is* the record of structural acceptance; nothing else on it is needed to say
 * so, and any additional flag would be read as a verdict this layer cannot
 * reach. Verification outcomes are `CanonicalVerification` records produced by
 * APV-07, referenced through APV-04's own material pathway.
 *
 * ### What it does not carry
 *
 * The `CanonicalEvidence` document itself. A receipt names the evidence by its
 * `CanonicalEvidenceId` and stops there. Snapshotting a Protocol record into
 * vertical workflow state would create a second copy that can drift from the
 * record it copies, and this package neither owns evidence records nor stores
 * them.
 *
 * ### Immutability
 *
 * Every field is fixed when the receipt is created, and there is no operation
 * anywhere in this package that rewrites one. A correction is a *new* intake
 * with a new `intakeId`; a widened correlation is APV-04's
 * `associateProtocolizationCaseMaterial` on the material this receipt names.
 * That is what keeps `requirementIds` honest: it is what *this intake*
 * correlated, a historical fact, not a live view of the material's current
 * associations.
 */
export const EVIDENCE_INTAKE_RECEIPT_SCHEMA_VERSION = 'aoc-protocolization-evidence-intake/1';

export interface EvidenceIntakeReceipt {
  readonly schemaVersion: typeof EVIDENCE_INTAKE_RECEIPT_SCHEMA_VERSION;

  /** Identity of the intake operation this receipt records. Unique within the tenant. */
  readonly intakeId: EvidenceIntakeId;

  /** The tenant that acted. Required and non-blank, exactly as on a case. */
  readonly tenantId: ProtocolizationTenantId;

  readonly caseId: ProtocolizationCaseId;

  /**
   * The profile version the case was pinned to when this intake happened.
   *
   * Recorded rather than re-read, because the correlation below was checked
   * against *this* version's requirements. A pin never changes on a case, so
   * this can never disagree with it — it makes the receipt independently
   * readable without resolving the case.
   */
  readonly profile: ProtocolizationProfileRef;

  /** Which configured intake pathway this arrived through. */
  readonly categoryId: EvidenceIntakeCategoryId;

  /** Protocol's identifier for the evidence. Never dereferenced by this package. */
  readonly evidenceRef: CanonicalEvidenceId;

  /** The APV-04 material association this intake produced. */
  readonly materialId: ProtocolizationMaterialId;

  /** The requirements *this intake* correlated the evidence to. Non-empty, unique. */
  readonly requirementIds: readonly AssetRequirementId[];

  /**
   * When the vertical received it. The intake workflow's own instant, read from
   * the injected clock, and the same instant the resulting material carries as
   * its `addedAt`.
   */
  readonly receivedAt: UtcDateTime;

  /**
   * When the source observed what the evidence describes, when a source
   * supplied one. Preserved verbatim and never compared, defaulted or repaired
   * — a later slice needs the untouched value to evaluate freshness.
   */
  readonly observedAt?: UtcDateTime;

  /** Where the reference came from, as supplied. Recording is not endorsing. */
  readonly sourceRef?: CanonicalReferenceSource;

  /** The case revision this intake produced. Orders receipts against case history. */
  readonly caseRevision: number;

  readonly correlationId?: CanonicalId;
}
