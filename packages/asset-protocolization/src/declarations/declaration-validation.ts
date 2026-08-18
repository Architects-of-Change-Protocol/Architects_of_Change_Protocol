import { ClaimType, PrincipalKind, ReferenceSourceKind } from '@aoc/protocol/claims';
import type { CanonicalClaim, CanonicalPrincipalRef, CanonicalReferenceSource } from '@aoc/protocol/claims';
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
import { isValidDeclarationId } from './declaration-identifiers';
import {
  DECLARATION_SUBMISSION_BASE_KEYS,
  DeclarationPathway,
  declarationPathwayKeys,
  isDeclarationPathway,
} from './declaration-submission';
import type { ProtocolizationDeclarationSubmission } from './declaration-submission';
import { PROTOCOLIZATION_DECLARATION_RECORD_SCHEMA_VERSION } from './declaration-record';
import type { ProtocolizationDeclarationRecord } from './declaration-record';

/**
 * Deterministic **structural** validation for the declaration layer.
 *
 * Read the word "validation" here narrowly and literally: every check below
 * decides whether a value has the *shape* this workflow can carry. Not one of
 * them decides whether anything asserted is true, whether the declarant is who
 * they claim to be, whether they were entitled to declare it, whether the
 * evidence they point at supports them, or whether any requirement is
 * satisfied. The vocabulary in this slice says *admitted*, *structurally
 * accepted* and *recorded* precisely so that a reader is never invited to
 * mistake the one for the other.
 *
 * What this module checks:
 *
 * ```text
 * identifiers are well formed        timestamps are canonical UTC
 * required fields are present        optionals are absent rather than undefined
 * unknown fields are rejected        requirement ids are unique and non-empty
 * the declarant ref is usable        the declared claim type is one Protocol declares
 * the statement is bounded text      the pathway matches its payload
 * ```
 *
 * What it deliberately does not check — and could not:
 *
 * ```text
 * the claim record exists            the proposition is true
 * the declarant is authenticated     the declarant has authority
 * the delegation is valid            the linked evidence supports the claim
 * the assertion is legally binding   the requirement is satisfied
 * ```
 *
 * Correlation against the pinned profile, and the existence of the linked
 * evidence inside the case, are deliberately **not** here: both need the case,
 * so they happen where the case is resolved — in
 * `recordProtocolizationDeclaration`.
 *
 * Style follows APV-03/APV-04/APV-05 exactly: stable `SCREAMING_SNAKE` reason
 * codes, a present-but-`undefined` optional treated as invalid rather than
 * absent, and no semantic interpretation anywhere.
 */
export const DECLARATION_VALIDATION_CODES = Object.freeze({
  notAnObject: 'DECLARATION_NOT_AN_OBJECT',
  unknownField: 'DECLARATION_UNKNOWN_FIELD',
  invalidSchemaVersion: 'DECLARATION_SCHEMA_VERSION_INVALID',
  invalidDeclarationId: 'DECLARATION_ID_INVALID',
  invalidTenantId: 'DECLARATION_TENANT_ID_INVALID',
  invalidCaseId: 'DECLARATION_CASE_ID_INVALID',
  invalidMaterialId: 'DECLARATION_MATERIAL_ID_INVALID',
  invalidProfileRef: 'DECLARATION_PROFILE_REF_INVALID',
  invalidDeclarant: 'DECLARATION_DECLARANT_INVALID',
  invalidPathway: 'DECLARATION_PATHWAY_INVALID',
  invalidClaimRef: 'DECLARATION_CLAIM_REF_INVALID',
  invalidClaimDocument: 'DECLARATION_CLAIM_DOCUMENT_INVALID',
  invalidClaimType: 'DECLARATION_CLAIM_TYPE_INVALID',
  invalidClaimSubtype: 'DECLARATION_CLAIM_SUBTYPE_INVALID',
  invalidStatement: 'DECLARATION_STATEMENT_INVALID',
  invalidRequirementIds: 'DECLARATION_REQUIREMENT_IDS_INVALID',
  invalidSupportingEvidenceRefs: 'DECLARATION_SUPPORTING_EVIDENCE_REFS_INVALID',
  invalidDeclaredAt: 'DECLARATION_DECLARED_AT_INVALID',
  invalidRecordedAt: 'DECLARATION_RECORDED_AT_INVALID',
  invalidSourceRef: 'DECLARATION_SOURCE_REF_INVALID',
  invalidCaseRevision: 'DECLARATION_CASE_REVISION_INVALID',
  invalidCorrelationId: 'DECLARATION_CORRELATION_ID_INVALID',
} as const);

export type DeclarationValidationCode =
  (typeof DECLARATION_VALIDATION_CODES)[keyof typeof DECLARATION_VALIDATION_CODES];

export interface DeclarationValidationResult {
  /**
   * Structural admissibility only.
   *
   * Named `admitted` rather than `valid` on purpose, exactly as APV-05 named
   * its own. "Valid" is the word that quietly slides from *conforms to a
   * schema* to *is legitimate*, and this layer only ever means the first — which
   * matters more here than anywhere else in the vertical, because the thing
   * being admitted is somebody's assertion about the world.
   */
  readonly admitted: boolean;
  readonly reasons: readonly DeclarationValidationCode[];
}

/**
 * The bound on the human-readable statement.
 *
 * A guard, not a semantic rule: long enough for the couple of sentences a
 * declaration is worth, short enough that the field cannot become a document
 * store, an attachment channel or an unbounded audit-log payload. Internal, for
 * the reason APV-04 kept its cancellation-reason bound internal — the number is
 * an implementation guard, not a contract downstream should branch on.
 */
const STATEMENT_MAX_LENGTH = 4096;

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * A `CanonicalId` naming a Protocol record. Bounded and non-blank; never
 * parsed, never resolved and never checked for existence — the same rule, and
 * the same wording, APV-04 and APV-05 apply to every reference they record.
 */
function isCanonicalRecordId(value: unknown): value is CanonicalId {
  return (
    typeof value === 'string' &&
    value.trim() !== '' &&
    value.length <= PROTOCOLIZATION_IDENTIFIER_MAX_LENGTH
  );
}

export function isClaimType(value: unknown): value is ClaimType {
  return typeof value === 'string' && Object.values<string>(ClaimType).includes(value);
}

function isPrincipalKind(value: unknown): boolean {
  return typeof value === 'string' && Object.values<string>(PrincipalKind).includes(value);
}

function isReferenceSourceKind(value: unknown): boolean {
  return typeof value === 'string' && Object.values<string>(ReferenceSourceKind).includes(value);
}

/**
 * The minimum that makes a supplied principal reference usable as a declarant:
 * it names a principal, and states which generic *kind* of principal Protocol
 * says it is.
 *
 * Deliberately not a restatement of `CanonicalPrincipalRef`'s full shape —
 * `displayName`, `source` and `metadata` are carried through untouched and
 * unexamined — for the anti-drift reason APV-04 gave for
 * `CanonicalRegistryEntryRef` and APV-05 for `CanonicalReferenceSource`: a
 * second, hand-maintained copy of a Protocol contract in this package is a copy
 * that will drift from the contract it copies.
 *
 * `PrincipalKind.Unknown` is admissible, and that is not an oversight. A
 * participant whose canonical identity has not yet been resolved is a
 * first-class case in progressive protocolization: the honest record is "an
 * unresolved principal asserted X", and refusing it would push callers into
 * inventing a kind they do not know.
 *
 * Admitting a declarant ref says nothing whatever about whether that principal
 * exists, is authenticated, or is entitled to declare anything.
 */
export function isUsableDeclarantRef(value: unknown): value is CanonicalPrincipalRef {
  if (!isPlainObject(value)) return false;
  if (!isCanonicalRecordId(value.id)) return false;
  return isPrincipalKind(value.kind);
}

/** The same admission rule APV-05 applies to a supplied provenance source. */
export function isUsableReferenceSource(value: unknown): value is CanonicalReferenceSource {
  if (!isPlainObject(value)) return false;
  if (!isReferenceSourceKind(value.kind)) return false;
  return typeof value.value === 'string' && value.value.trim() !== '';
}

/**
 * The minimum that makes a supplied `CanonicalClaim` admissible as the thing a
 * declaration is carried by: it has a usable id, a declared `ClaimType`, and a
 * canonical issuance instant.
 *
 * Exactly the three fields this layer actually reads — `id` becomes the
 * recorded reference, `type` becomes the declared claim type, `issuedAt` is
 * what makes the document coherent enough to name — and nothing more. This is
 * an *admission* check on a Protocol type, not a second definition of one; if
 * Protocol later publishes its own `CanonicalClaim` validator (it publishes one
 * for `CanonicalStanding` today, and none for claims), this collapses into a
 * call to it.
 *
 * Admitting a claim document says nothing about whether the claim is true, has
 * been verified, was issued by whom it names, or is supported by the evidence
 * it references.
 */
export function isAdmissibleCanonicalClaim(value: unknown): value is CanonicalClaim {
  if (!isPlainObject(value)) return false;
  if (!isCanonicalRecordId(value.id)) return false;
  if (!isClaimType(value.type)) return false;
  return isValidUtcDateTime(value.issuedAt);
}

function isBoundedToken(value: unknown): boolean {
  return (
    typeof value === 'string' &&
    value.trim() !== '' &&
    value.length <= PROTOCOLIZATION_IDENTIFIER_MAX_LENGTH
  );
}

function checkRequirementIds(
  value: unknown,
  reasons: DeclarationValidationCode[],
): value is readonly AssetRequirementId[] {
  if (!Array.isArray(value) || value.length === 0) {
    reasons.push(DECLARATION_VALIDATION_CODES.invalidRequirementIds);
    return false;
  }
  const seen = new Set<string>();
  for (const entry of value) {
    if (!isValidAssetRequirementId(entry) || seen.has(entry)) {
      reasons.push(DECLARATION_VALIDATION_CODES.invalidRequirementIds);
      return false;
    }
    seen.add(entry);
  }
  return true;
}

/**
 * Supporting evidence links, when present: a non-empty list of distinct
 * canonical record ids.
 *
 * A present-but-empty array is rejected rather than treated as "no evidence",
 * for the reason every optional in this package is rejected when present and
 * empty: the absent form already says that, and admitting two spellings of one
 * state means two records of the same declaration can differ without
 * disagreeing.
 */
function checkSupportingEvidenceRefs(value: unknown, reasons: DeclarationValidationCode[]): void {
  if (!Array.isArray(value) || value.length === 0) {
    reasons.push(DECLARATION_VALIDATION_CODES.invalidSupportingEvidenceRefs);
    return;
  }
  const seen = new Set<string>();
  for (const entry of value) {
    if (!isCanonicalRecordId(entry) || seen.has(entry)) {
      reasons.push(DECLARATION_VALIDATION_CODES.invalidSupportingEvidenceRefs);
      return;
    }
    seen.add(entry);
  }
}

function checkStatement(value: unknown, reasons: DeclarationValidationCode[]): void {
  if (typeof value !== 'string' || value.trim() === '' || value.length > STATEMENT_MAX_LENGTH) {
    reasons.push(DECLARATION_VALIDATION_CODES.invalidStatement);
  }
}

function checkSharedOptionals(
  value: Record<string, unknown>,
  reasons: DeclarationValidationCode[],
): void {
  if (hasOwn(value, 'claimSubtype') && !isBoundedToken(value.claimSubtype)) {
    reasons.push(DECLARATION_VALIDATION_CODES.invalidClaimSubtype);
  }
  if (hasOwn(value, 'statement')) {
    checkStatement(value.statement, reasons);
  }
  if (hasOwn(value, 'supportingEvidenceRefs')) {
    checkSupportingEvidenceRefs(value.supportingEvidenceRefs, reasons);
  }
  if (hasOwn(value, 'declaredAt') && !isValidUtcDateTime(value.declaredAt)) {
    reasons.push(DECLARATION_VALIDATION_CODES.invalidDeclaredAt);
  }
  if (hasOwn(value, 'sourceRef') && !isUsableReferenceSource(value.sourceRef)) {
    reasons.push(DECLARATION_VALIDATION_CODES.invalidSourceRef);
  }
  if (hasOwn(value, 'correlationId') && !isCanonicalRecordId(value.correlationId)) {
    reasons.push(DECLARATION_VALIDATION_CODES.invalidCorrelationId);
  }
}

/** Structural admission of one submission. */
export function validateProtocolizationDeclarationSubmission(
  value: unknown,
): DeclarationValidationResult {
  const reasons: DeclarationValidationCode[] = [];

  if (!isPlainObject(value)) {
    return { admitted: false, reasons: [DECLARATION_VALIDATION_CODES.notAnObject] };
  }

  const pathway = value.pathway;
  if (!isDeclarationPathway(pathway)) {
    // Without a pathway there is no way to know which payload keys are legal,
    // so the unknown-field scan below would report nonsense. Stop here instead.
    return { admitted: false, reasons: [DECLARATION_VALIDATION_CODES.invalidPathway] };
  }

  const allowedKeys = [...DECLARATION_SUBMISSION_BASE_KEYS, ...declarationPathwayKeys(pathway)];
  for (const key of Object.keys(value)) {
    if (!allowedKeys.includes(key)) {
      reasons.push(DECLARATION_VALIDATION_CODES.unknownField);
      break;
    }
  }

  if (!isValidDeclarationId(value.declarationId)) {
    reasons.push(DECLARATION_VALIDATION_CODES.invalidDeclarationId);
  }
  if (!isValidProtocolizationCaseId(value.caseId)) {
    reasons.push(DECLARATION_VALIDATION_CODES.invalidCaseId);
  }
  if (!isValidProtocolizationMaterialId(value.materialId)) {
    reasons.push(DECLARATION_VALIDATION_CODES.invalidMaterialId);
  }
  if (!isUsableDeclarantRef(value.declarant)) {
    reasons.push(DECLARATION_VALIDATION_CODES.invalidDeclarant);
  }

  checkRequirementIds(value.requirementIds, reasons);

  if (pathway === DeclarationPathway.Reference) {
    if (!isCanonicalRecordId(value.claimRef)) {
      reasons.push(DECLARATION_VALIDATION_CODES.invalidClaimRef);
    }
    if (!isClaimType(value.claimType)) {
      reasons.push(DECLARATION_VALIDATION_CODES.invalidClaimType);
    }
  } else if (!isAdmissibleCanonicalClaim(value.claim)) {
    reasons.push(DECLARATION_VALIDATION_CODES.invalidClaimDocument);
  }

  checkSharedOptionals(value, reasons);

  return { admitted: reasons.length === 0, reasons };
}

/** Boolean form, for a caller that does not need the reasons. */
export function isAdmissibleProtocolizationDeclarationSubmission(
  value: unknown,
): value is ProtocolizationDeclarationSubmission {
  return validateProtocolizationDeclarationSubmission(value).admitted;
}

const RECORD_KEYS: readonly string[] = [
  'schemaVersion',
  'declarationId',
  'tenantId',
  'caseId',
  'profile',
  'declarant',
  'claimType',
  'claimSubtype',
  'claimRef',
  'materialId',
  'requirementIds',
  'supportingEvidenceRefs',
  'statement',
  'declaredAt',
  'recordedAt',
  'sourceRef',
  'caseRevision',
  'correlationId',
];

/**
 * Structural validation of a declaration record.
 *
 * Applied to every record this package produces before it is returned, and
 * again by the repository before one is stored, for the reason APV-04 gave for
 * re-validating a case on every operation: a record may arrive from a store,
 * from a network boundary, or from a caller that built it by hand, and a
 * malformed one must fail where it enters rather than somewhere downstream.
 */
export function validateProtocolizationDeclarationRecord(
  value: unknown,
): DeclarationValidationResult {
  const reasons: DeclarationValidationCode[] = [];

  if (!isPlainObject(value)) {
    return { admitted: false, reasons: [DECLARATION_VALIDATION_CODES.notAnObject] };
  }

  for (const key of Object.keys(value)) {
    if (!RECORD_KEYS.includes(key)) {
      reasons.push(DECLARATION_VALIDATION_CODES.unknownField);
      break;
    }
  }

  if (value.schemaVersion !== PROTOCOLIZATION_DECLARATION_RECORD_SCHEMA_VERSION) {
    reasons.push(DECLARATION_VALIDATION_CODES.invalidSchemaVersion);
  }
  if (!isValidDeclarationId(value.declarationId)) {
    reasons.push(DECLARATION_VALIDATION_CODES.invalidDeclarationId);
  }
  if (!isValidProtocolizationTenantId(value.tenantId)) {
    reasons.push(DECLARATION_VALIDATION_CODES.invalidTenantId);
  }
  if (!isValidProtocolizationCaseId(value.caseId)) {
    reasons.push(DECLARATION_VALIDATION_CODES.invalidCaseId);
  }
  if (!isValidProtocolizationProfileRef(value.profile)) {
    reasons.push(DECLARATION_VALIDATION_CODES.invalidProfileRef);
  }
  if (!isUsableDeclarantRef(value.declarant)) {
    reasons.push(DECLARATION_VALIDATION_CODES.invalidDeclarant);
  }
  if (!isClaimType(value.claimType)) {
    reasons.push(DECLARATION_VALIDATION_CODES.invalidClaimType);
  }
  if (!isCanonicalRecordId(value.claimRef)) {
    reasons.push(DECLARATION_VALIDATION_CODES.invalidClaimRef);
  }
  if (!isValidProtocolizationMaterialId(value.materialId)) {
    reasons.push(DECLARATION_VALIDATION_CODES.invalidMaterialId);
  }

  checkRequirementIds(value.requirementIds, reasons);

  if (!isValidUtcDateTime(value.recordedAt)) {
    reasons.push(DECLARATION_VALIDATION_CODES.invalidRecordedAt);
  }
  if (!Number.isSafeInteger(value.caseRevision) || (value.caseRevision as number) < 1) {
    reasons.push(DECLARATION_VALIDATION_CODES.invalidCaseRevision);
  }

  checkSharedOptionals(value, reasons);

  return { admitted: reasons.length === 0, reasons };
}

export function isValidProtocolizationDeclarationRecord(
  value: unknown,
): value is ProtocolizationDeclarationRecord {
  return validateProtocolizationDeclarationRecord(value).admitted;
}
