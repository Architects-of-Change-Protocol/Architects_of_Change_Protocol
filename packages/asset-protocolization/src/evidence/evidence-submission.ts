import type { CanonicalEvidence, CanonicalEvidenceId, CanonicalReferenceSource } from '@aoc/protocol/claims';
import type { CanonicalId, UtcDateTime } from '@aoc/protocol/contracts';

import type { AssetRequirementId } from '../identifiers';
import type { ProtocolizationCaseId, ProtocolizationMaterialId } from '../case/case-identifiers';
import type { EvidenceIntakeCategoryId, EvidenceIntakeId } from './evidence-intake-identifiers';

/**
 * `ProtocolizationEvidenceSubmission` — an *attempt* to introduce evidence into
 * a `ProtocolizationCase`.
 *
 * This is the vertical's intake envelope. It is **not** Protocol's evidence
 * primitive, it does not extend one, and it never becomes one: a submission
 * describes a workflow act — who is offering what, against which requirements,
 * through which pathway, correlated to which request — and it stops existing
 * the moment intake resolves. What survives is an `EvidenceIntakeReceipt` and,
 * for an accepted submission, an APV-04 material association.
 *
 * A submission carries no bytes. There is no file, no blob, no upload, no
 * storage handle and no PII by construction — the same exclusion APV-04 froze
 * for case material and APV-02 §2.3 froze for the result envelope. Evidence
 * whose substance is a document reaches this layer as a *reference* to a
 * Protocol record that already describes it.
 *
 * ### Why there is no `tenantId` field
 *
 * The acting tenant travels in the operation context, exactly as it does for
 * every APV-04 case operation, and for the same reason: a tenant read off the
 * value being operated on can never disagree with itself, so a cross-tenant
 * call would be invisible. A second spelling of the tenant on the submission
 * could also disagree with the context's — and then something would have to
 * decide which one is authoritative. The receipt records the tenant that
 * actually acted.
 */

/**
 * How the caller supplies the canonical evidence this submission is about.
 *
 * Both pathways end at the same place — a `CanonicalEvidenceId` naming a
 * Protocol record — and differ only in what the caller already holds.
 *
 * There is deliberately no third pathway in which this package *constructs* a
 * `CanonicalEvidence`. Constructing one requires an `id`, and minting a
 * canonical record identifier is neither deterministic nor this vertical's to
 * perform; it also requires an `issuer`, a `source` and a `description` that
 * intake frequently does not legitimately know. Faking any of them to make
 * intake convenient would put a fabricated Protocol record into circulation,
 * which is precisely the failure the whole boundary exists to prevent.
 */
export const EvidenceIntakePathway = {
  /**
   * The caller names an already-recorded `CanonicalEvidence` by its id. Nothing
   * here dereferences it: this package has no way to resolve a Protocol record
   * and must not pretend otherwise, so naming one asserts that it exists no
   * more than naming a file asserts that it is readable.
   */
  Reference: 'Reference',
  /**
   * The caller supplies the `CanonicalEvidence` document it constructed
   * elsewhere. Intake reads its `id` — which becomes the recorded reference —
   * checks that the fields it actually reads are structurally admissible, and
   * then **discards the document**. It is not copied onto the receipt and not
   * copied into the case: a second copy of a Protocol record living in vertical
   * workflow state is a copy that can go stale, and storing evidence records is
   * not this layer's job.
   */
  Canonical: 'Canonical',
} as const;
export type EvidenceIntakePathway =
  (typeof EvidenceIntakePathway)[keyof typeof EvidenceIntakePathway];

interface ProtocolizationEvidenceSubmissionBase {
  /** Identity of this intake attempt. Unique within the tenant. */
  readonly intakeId: EvidenceIntakeId;
  /** The case this evidence is offered to. Must be the case being operated on. */
  readonly caseId: ProtocolizationCaseId;
  /**
   * Identity the resulting APV-04 material association will carry.
   *
   * Supplied rather than derived from `intakeId`. Deriving it would make two
   * different layers share one identifier space, so a later change to either
   * layer's identity rules would silently constrain the other.
   */
  readonly materialId: ProtocolizationMaterialId;
  /** Which configured intake pathway this arrived through. Recorded, never branched on. */
  readonly categoryId: EvidenceIntakeCategoryId;
  readonly pathway: EvidenceIntakePathway;
  /**
   * Requirements of the case's pinned profile this evidence is offered against.
   * Non-empty and unique; every id is checked against the pinned version.
   */
  readonly requirementIds: readonly AssetRequirementId[];
  /**
   * When the *source* observed what this evidence describes — a registry
   * lookup's `observedAt`, a sensor reading, a snapshot instant.
   *
   * Optional and never invented. A submission that does not supply one leaves
   * it absent rather than defaulting to the intake instant, because "we
   * observed this now" and "we received this now" are different assertions and
   * only one of them is ours to make.
   */
  readonly observedAt?: UtcDateTime;
  /**
   * Where the evidence reference came from, as Protocol's own provenance
   * primitive.
   *
   * `CanonicalReferenceSource { kind, value, label?, metadata? }` already names
   * a source namespace or locator without implying authority over it, which is
   * exactly the assertion intake is entitled to make. The vertical therefore
   * declares no provenance type of its own.
   *
   * Recording a source does **not** make it trustworthy. It records who said
   * where this came from, so a later evaluator — and an auditor — can weigh it.
   */
  readonly sourceRef?: CanonicalReferenceSource;
  /** Correlates this attempt with the request that produced it. */
  readonly correlationId?: CanonicalId;
}

export interface ReferencedEvidenceSubmission extends ProtocolizationEvidenceSubmissionBase {
  readonly pathway: typeof EvidenceIntakePathway.Reference;
  readonly evidenceRef: CanonicalEvidenceId;
}

export interface CanonicalEvidenceSubmission extends ProtocolizationEvidenceSubmissionBase {
  readonly pathway: typeof EvidenceIntakePathway.Canonical;
  /** Protocol's `CanonicalEvidence`, reused as-is. Read, then discarded. */
  readonly evidence: CanonicalEvidence;
}

export type ProtocolizationEvidenceSubmission =
  | ReferencedEvidenceSubmission
  | CanonicalEvidenceSubmission;

/** The payload key one pathway carries, so a reader needs no per-pathway branch. */
const PATHWAY_PAYLOAD_KEY: Readonly<Record<EvidenceIntakePathway, string>> = Object.freeze({
  [EvidenceIntakePathway.Reference]: 'evidenceRef',
  [EvidenceIntakePathway.Canonical]: 'evidence',
});

export function evidenceIntakePayloadKey(pathway: EvidenceIntakePathway): string {
  return PATHWAY_PAYLOAD_KEY[pathway];
}

export function isEvidenceIntakePathway(value: unknown): value is EvidenceIntakePathway {
  return typeof value === 'string' && Object.values<string>(EvidenceIntakePathway).includes(value);
}

export const EVIDENCE_SUBMISSION_BASE_KEYS: readonly string[] = [
  'intakeId',
  'caseId',
  'materialId',
  'categoryId',
  'pathway',
  'requirementIds',
  'observedAt',
  'sourceRef',
  'correlationId',
];

/**
 * The `CanonicalEvidenceId` a submission resolves to, whichever pathway it used.
 *
 * Total over *structurally admitted* submissions only — validation runs first,
 * so by the time this is called a `Canonical` submission is known to carry an
 * evidence document with an admissible `id`.
 */
export function submittedEvidenceRef(
  submission: ProtocolizationEvidenceSubmission,
): CanonicalEvidenceId {
  return submission.pathway === EvidenceIntakePathway.Canonical
    ? submission.evidence.id
    : submission.evidenceRef;
}
