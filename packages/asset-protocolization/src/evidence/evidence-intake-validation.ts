import { EvidenceType } from '@aoc/protocol/claims';
import { ReferenceSourceKind } from '@aoc/protocol/claims';
import type { CanonicalEvidence, CanonicalReferenceSource } from '@aoc/protocol/claims';
import type { CanonicalId } from '@aoc/protocol/contracts';

import { isValidUtcDateTime } from '../freshness';
import { isValidAssetRequirementId } from '../identifiers';
import type { AssetRequirementId } from '../identifiers';
import {
  PROTOCOLIZATION_IDENTIFIER_MAX_LENGTH,
  isValidProtocolizationCaseId,
  isValidProtocolizationMaterialId,
  isValidProtocolizationProfileRef,
  isValidProtocolizationTenantId,
} from '../case/case-identifiers';
import {
  isValidEvidenceIntakeCategoryId,
  isValidEvidenceIntakeId,
} from './evidence-intake-identifiers';
import {
  EVIDENCE_SUBMISSION_BASE_KEYS,
  EvidenceIntakePathway,
  evidenceIntakePayloadKey,
  isEvidenceIntakePathway,
} from './evidence-submission';
import type { ProtocolizationEvidenceSubmission } from './evidence-submission';
import { EVIDENCE_INTAKE_RECEIPT_SCHEMA_VERSION } from './evidence-intake-receipt';
import type { EvidenceIntakeReceipt } from './evidence-intake-receipt';

/**
 * Deterministic **structural** validation for the intake layer.
 *
 * Read the word "validation" here narrowly and literally: every check below
 * decides whether a value has the *shape* this workflow can carry. Not one of
 * them decides whether anything is true, current, authentic, authoritative,
 * sufficient or legally effective. The vocabulary elsewhere in this slice says
 * *admitted*, *structurally accepted*, *received* and *recorded* precisely so
 * that a reader is never invited to mistake the one for the other.
 *
 * What this module checks:
 *
 * ```text
 * identifiers are well formed         timestamps are canonical UTC
 * required fields are present         optionals are absent rather than undefined
 * unknown fields are rejected         requirement ids are unique and non-empty
 * references are non-blank            declared pathway matches its payload
 * ```
 *
 * What it deliberately does not check — and could not:
 *
 * ```text
 * the evidence record exists          a digest matches any bytes
 * a signature is valid                a document is authentic or unexpired
 * a registry statement is true        a credential belongs to its presenter
 * the evidence is fresh enough        the requirement is satisfied
 * ```
 *
 * Style follows APV-03/APV-04 exactly: stable `SCREAMING_SNAKE` reason codes, a
 * present-but-`undefined` optional treated as invalid rather than absent, and
 * no semantic interpretation anywhere.
 */
export const EVIDENCE_INTAKE_VALIDATION_CODES = Object.freeze({
  notAnObject: 'EVIDENCE_INTAKE_NOT_AN_OBJECT',
  unknownField: 'EVIDENCE_INTAKE_UNKNOWN_FIELD',
  invalidSchemaVersion: 'EVIDENCE_INTAKE_SCHEMA_VERSION_INVALID',
  invalidIntakeId: 'EVIDENCE_INTAKE_ID_INVALID',
  invalidTenantId: 'EVIDENCE_INTAKE_TENANT_ID_INVALID',
  invalidCaseId: 'EVIDENCE_INTAKE_CASE_ID_INVALID',
  invalidMaterialId: 'EVIDENCE_INTAKE_MATERIAL_ID_INVALID',
  invalidProfileRef: 'EVIDENCE_INTAKE_PROFILE_REF_INVALID',
  invalidCategoryId: 'EVIDENCE_INTAKE_CATEGORY_INVALID',
  invalidPathway: 'EVIDENCE_INTAKE_PATHWAY_INVALID',
  invalidEvidenceRef: 'EVIDENCE_INTAKE_EVIDENCE_REF_INVALID',
  invalidEvidenceDocument: 'EVIDENCE_INTAKE_EVIDENCE_DOCUMENT_INVALID',
  invalidRequirementIds: 'EVIDENCE_INTAKE_REQUIREMENT_IDS_INVALID',
  invalidReceivedAt: 'EVIDENCE_INTAKE_RECEIVED_AT_INVALID',
  invalidObservedAt: 'EVIDENCE_INTAKE_OBSERVED_AT_INVALID',
  invalidSourceRef: 'EVIDENCE_INTAKE_SOURCE_REF_INVALID',
  invalidCaseRevision: 'EVIDENCE_INTAKE_CASE_REVISION_INVALID',
  invalidCorrelationId: 'EVIDENCE_INTAKE_CORRELATION_ID_INVALID',
} as const);

export type EvidenceIntakeValidationCode =
  (typeof EVIDENCE_INTAKE_VALIDATION_CODES)[keyof typeof EVIDENCE_INTAKE_VALIDATION_CODES];

export interface EvidenceIntakeValidationResult {
  /**
   * Structural admissibility only.
   *
   * Named `admitted` rather than `valid` on purpose. "Valid" is the word that
   * quietly slides from *conforms to a schema* to *is legitimate*, and this
   * layer only ever means the first.
   */
  readonly admitted: boolean;
  readonly reasons: readonly EvidenceIntakeValidationCode[];
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * A `CanonicalId` naming a Protocol record. Bounded and non-blank; never
 * parsed, never resolved and never checked for existence — the same rule, and
 * the same wording, APV-04 applies to every reference it records.
 */
function isCanonicalRecordId(value: unknown): value is CanonicalId {
  return (
    typeof value === 'string' &&
    value.trim() !== '' &&
    value.length <= PROTOCOLIZATION_IDENTIFIER_MAX_LENGTH
  );
}

function isEvidenceType(value: unknown): value is EvidenceType {
  return typeof value === 'string' && Object.values<string>(EvidenceType).includes(value);
}

function isReferenceSourceKind(value: unknown): boolean {
  return typeof value === 'string' && Object.values<string>(ReferenceSourceKind).includes(value);
}

/**
 * The minimum that makes a supplied source descriptor usable as provenance: it
 * names a source *kind* Protocol declares, and a non-blank locator.
 *
 * Deliberately not a restatement of `CanonicalReferenceSource`'s full shape.
 * APV-04 made the same call for `CanonicalRegistryEntryRef` and the reasoning is
 * unchanged: a second, hand-maintained copy of a Protocol contract in this
 * package is a copy that will drift from the contract it copies. `label` and
 * `metadata` are carried through untouched and unexamined.
 */
export function isUsableReferenceSource(value: unknown): value is CanonicalReferenceSource {
  if (!isPlainObject(value)) return false;
  if (!isReferenceSourceKind(value.kind)) return false;
  return typeof value.value === 'string' && value.value.trim() !== '';
}

/**
 * The minimum that makes a supplied `CanonicalEvidence` document admissible as
 * the thing an intake is about: it has a usable id, a declared `EvidenceType`,
 * and a canonical creation instant.
 *
 * Exactly the three fields intake actually reads — `id` becomes the recorded
 * reference, `type` and `createdAt` are what make the document coherent enough
 * to name — and nothing more, for the same anti-drift reason as above. This is
 * an *admission* check on a Protocol type, not a second definition of it. If
 * Protocol later publishes its own `CanonicalEvidence` validator (it publishes
 * one for `CanonicalStanding` today, and none for evidence), this collapses
 * into a call to it.
 *
 * Admitting a document says nothing whatever about whether the evidence it
 * describes is real, current or honest.
 */
export function isAdmissibleCanonicalEvidence(value: unknown): value is CanonicalEvidence {
  if (!isPlainObject(value)) return false;
  if (!isCanonicalRecordId(value.id)) return false;
  if (!isEvidenceType(value.type)) return false;
  return isValidUtcDateTime(value.createdAt);
}

function checkRequirementIds(
  value: unknown,
  reasons: EvidenceIntakeValidationCode[],
): value is readonly AssetRequirementId[] {
  if (!Array.isArray(value) || value.length === 0) {
    reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidRequirementIds);
    return false;
  }
  const seen = new Set<string>();
  for (const entry of value) {
    if (!isValidAssetRequirementId(entry) || seen.has(entry)) {
      reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidRequirementIds);
      return false;
    }
    seen.add(entry);
  }
  return true;
}

/**
 * Structural admission of one submission.
 *
 * Correlation against the pinned profile is deliberately **not** here: it needs
 * the case and its profile, so it happens where both are resolved — in
 * `intakeProtocolizationEvidence`, delegating to APV-04's own requirement check
 * rather than re-implementing it.
 */
export function validateProtocolizationEvidenceSubmission(
  value: unknown,
): EvidenceIntakeValidationResult {
  const reasons: EvidenceIntakeValidationCode[] = [];

  if (!isPlainObject(value)) {
    return { admitted: false, reasons: [EVIDENCE_INTAKE_VALIDATION_CODES.notAnObject] };
  }

  const pathway = value.pathway;
  if (!isEvidenceIntakePathway(pathway)) {
    // Without a pathway there is no way to know which payload key is legal, so
    // the unknown-field scan below would report nonsense. Stop here instead.
    return { admitted: false, reasons: [EVIDENCE_INTAKE_VALIDATION_CODES.invalidPathway] };
  }

  const allowedKeys = [...EVIDENCE_SUBMISSION_BASE_KEYS, evidenceIntakePayloadKey(pathway)];
  for (const key of Object.keys(value)) {
    if (!allowedKeys.includes(key)) {
      reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.unknownField);
      break;
    }
  }

  if (!isValidEvidenceIntakeId(value.intakeId)) {
    reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidIntakeId);
  }
  if (!isValidProtocolizationCaseId(value.caseId)) {
    reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidCaseId);
  }
  if (!isValidProtocolizationMaterialId(value.materialId)) {
    reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidMaterialId);
  }
  if (!isValidEvidenceIntakeCategoryId(value.categoryId)) {
    reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidCategoryId);
  }

  checkRequirementIds(value.requirementIds, reasons);

  if (pathway === EvidenceIntakePathway.Reference) {
    if (!isCanonicalRecordId(value.evidenceRef)) {
      reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidEvidenceRef);
    }
  } else if (!isAdmissibleCanonicalEvidence(value.evidence)) {
    reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidEvidenceDocument);
  }

  if (hasOwn(value, 'observedAt') && !isValidUtcDateTime(value.observedAt)) {
    reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidObservedAt);
  }
  if (hasOwn(value, 'sourceRef') && !isUsableReferenceSource(value.sourceRef)) {
    reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidSourceRef);
  }
  if (hasOwn(value, 'correlationId') && !isCanonicalRecordId(value.correlationId)) {
    reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidCorrelationId);
  }

  return { admitted: reasons.length === 0, reasons };
}

/** Boolean form, for a caller that does not need the reasons. */
export function isAdmissibleProtocolizationEvidenceSubmission(
  value: unknown,
): value is ProtocolizationEvidenceSubmission {
  return validateProtocolizationEvidenceSubmission(value).admitted;
}

const RECEIPT_KEYS: readonly string[] = [
  'schemaVersion',
  'intakeId',
  'tenantId',
  'caseId',
  'profile',
  'categoryId',
  'evidenceRef',
  'materialId',
  'requirementIds',
  'receivedAt',
  'observedAt',
  'sourceRef',
  'caseRevision',
  'correlationId',
];

/**
 * Structural validation of a receipt.
 *
 * Applied to every receipt this package produces before it is returned, and
 * again by the repository before one is stored, for the reason APV-04 gave for
 * re-validating a case on every operation: a receipt may arrive from a store,
 * from a network boundary, or from a caller that built it by hand, and a
 * malformed one must fail where it enters rather than somewhere downstream.
 */
export function validateEvidenceIntakeReceipt(value: unknown): EvidenceIntakeValidationResult {
  const reasons: EvidenceIntakeValidationCode[] = [];

  if (!isPlainObject(value)) {
    return { admitted: false, reasons: [EVIDENCE_INTAKE_VALIDATION_CODES.notAnObject] };
  }

  for (const key of Object.keys(value)) {
    if (!RECEIPT_KEYS.includes(key)) {
      reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.unknownField);
      break;
    }
  }

  if (value.schemaVersion !== EVIDENCE_INTAKE_RECEIPT_SCHEMA_VERSION) {
    reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidSchemaVersion);
  }
  if (!isValidEvidenceIntakeId(value.intakeId)) {
    reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidIntakeId);
  }
  if (!isValidProtocolizationTenantId(value.tenantId)) {
    reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidTenantId);
  }
  if (!isValidProtocolizationCaseId(value.caseId)) {
    reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidCaseId);
  }
  if (!isValidProtocolizationProfileRef(value.profile)) {
    reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidProfileRef);
  }
  if (!isValidEvidenceIntakeCategoryId(value.categoryId)) {
    reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidCategoryId);
  }
  if (!isCanonicalRecordId(value.evidenceRef)) {
    reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidEvidenceRef);
  }
  if (!isValidProtocolizationMaterialId(value.materialId)) {
    reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidMaterialId);
  }

  checkRequirementIds(value.requirementIds, reasons);

  if (!isValidUtcDateTime(value.receivedAt)) {
    reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidReceivedAt);
  }
  if (hasOwn(value, 'observedAt') && !isValidUtcDateTime(value.observedAt)) {
    reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidObservedAt);
  }
  if (hasOwn(value, 'sourceRef') && !isUsableReferenceSource(value.sourceRef)) {
    reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidSourceRef);
  }
  if (!Number.isSafeInteger(value.caseRevision) || (value.caseRevision as number) < 1) {
    reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidCaseRevision);
  }
  if (hasOwn(value, 'correlationId') && !isCanonicalRecordId(value.correlationId)) {
    reasons.push(EVIDENCE_INTAKE_VALIDATION_CODES.invalidCorrelationId);
  }

  return { admitted: reasons.length === 0, reasons };
}

export function isValidEvidenceIntakeReceipt(value: unknown): value is EvidenceIntakeReceipt {
  return validateEvidenceIntakeReceipt(value).admitted;
}
