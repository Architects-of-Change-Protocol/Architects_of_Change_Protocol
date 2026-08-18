"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVIDENCE_INTAKE_RECEIPT_SCHEMA_VERSION = void 0;
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
exports.EVIDENCE_INTAKE_RECEIPT_SCHEMA_VERSION = 'aoc-protocolization-evidence-intake/1';
