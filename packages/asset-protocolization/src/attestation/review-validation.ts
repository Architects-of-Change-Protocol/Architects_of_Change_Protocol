import { AttestationType, CredentialType, PrincipalKind } from '@aoc/protocol/claims';
import type { CanonicalCredentialRef, CanonicalPrincipalRef } from '@aoc/protocol/claims';
import type { CanonicalId } from '@aoc/protocol/contracts';
import { isValidSovereignSubjectRef } from '@aoc/protocol/identity';

import { isValidUtcDateTime } from '../freshness';
import { isValidAssetRequirementId } from '../identifiers';
import {
  PROTOCOLIZATION_IDENTIFIER_MAX_LENGTH,
  isValidProtocolizationCaseId,
  isValidProtocolizationMaterialId,
  isValidProtocolizationProfileRef,
  isValidProtocolizationTenantId,
} from '../case/case-identifiers';
import { isValidEvidenceIntakeCategoryId } from '../evidence/evidence-intake-identifiers';
import { ProfessionalReviewAction, isProfessionalReviewAction } from './review-actions';
import type { ProfessionalReviewDecision } from './review-decision';
import { PROFESSIONAL_REVIEW_DECISION_SCHEMA_VERSION } from './review-decision';
import {
  isValidProfessionalReviewDecisionId,
  isValidProfessionalReviewReasonCode,
  isValidProfessionalReviewRequestId,
} from './review-identifiers';
import { PROFESSIONAL_REVIEW_REQUEST_SCHEMA_VERSION } from './review-request';
import type { ProfessionalReviewRequest } from './review-request';
import { isProfessionalReviewBasisKind } from './review-scope';
import type { ProfessionalReviewScope } from './review-scope';

/**
 * Deterministic **structural** validation for the professional review workflow.
 *
 * Read "validation" here narrowly, exactly as APV-05, APV-06 and APV-07 do:
 * every check below decides whether a value has the *shape* this workflow can
 * carry. Not one of them decides whether a reviewer was right, whether a
 * credential is genuine, whether an attestation is legally sufficient, or
 * whether anything reviewed is true.
 *
 * There are three subjects.
 *
 * **A request** and **a decision** are persisted records coming back across a
 * store or network boundary. They are validated before they are trusted,
 * because a repository can hand back anything and a record whose invariants are
 * already broken would be read as review history that never happened.
 *
 * **A scope** is validated on its own as well, because it is the field that
 * makes an attestation bounded — and a malformed scope is the one defect that
 * would turn a narrow professional statement into an unbounded one.
 *
 * ### Action-conditioned shape
 *
 * The decision validator is where "these four actions are genuinely different"
 * stops being documentation. A scope is required for `Attest` and forbidden
 * elsewhere; a machine-readable material request is required for
 * `RequestMoreEvidence` and forbidden elsewhere; a reason code is required for
 * the three non-attesting actions; and an attestation reference may accompany
 * only `Attest`. A boolean could not express any of that.
 */
export const PROFESSIONAL_REVIEW_VALIDATION_CODES = Object.freeze({
  notAnObject: 'REVIEW_NOT_AN_OBJECT',
  unknownField: 'REVIEW_UNKNOWN_FIELD',
  invalidSchemaVersion: 'REVIEW_SCHEMA_VERSION_INVALID',
  invalidRequestId: 'REVIEW_REQUEST_ID_INVALID',
  invalidDecisionId: 'REVIEW_DECISION_ID_INVALID',
  invalidTenantId: 'REVIEW_TENANT_ID_INVALID',
  invalidCaseId: 'REVIEW_CASE_ID_INVALID',
  invalidProfileRef: 'REVIEW_PROFILE_REF_INVALID',
  invalidRequirementId: 'REVIEW_REQUIREMENT_ID_INVALID',
  invalidAttestationType: 'REVIEW_ATTESTATION_TYPE_INVALID',
  invalidScope: 'REVIEW_SCOPE_INVALID',
  invalidBasisRevision: 'REVIEW_BASIS_REVISION_INVALID',
  invalidResultingRevision: 'REVIEW_RESULTING_REVISION_INVALID',
  invalidRequestedAt: 'REVIEW_REQUESTED_AT_INVALID',
  invalidDecidedAt: 'REVIEW_DECIDED_AT_INVALID',
  invalidReviewer: 'REVIEW_REVIEWER_INVALID',
  invalidCredentialRefs: 'REVIEW_CREDENTIAL_REFS_INVALID',
  invalidAction: 'REVIEW_ACTION_INVALID',
  invalidReviewedRefs: 'REVIEW_REVIEWED_REFS_INVALID',
  invalidReasonCode: 'REVIEW_REASON_CODE_INVALID',
  invalidRequestedMaterial: 'REVIEW_REQUESTED_MATERIAL_INVALID',
  invalidNote: 'REVIEW_NOTE_INVALID',
  invalidAttestationRef: 'REVIEW_ATTESTATION_REF_INVALID',
  invalidMaterialId: 'REVIEW_MATERIAL_ID_INVALID',
  invalidCorrelationId: 'REVIEW_CORRELATION_ID_INVALID',
  /** A field the recorded action does not carry was present. */
  actionFieldUnexpected: 'REVIEW_ACTION_FIELD_UNEXPECTED',
  /** A field the recorded action requires was absent. */
  actionFieldMissing: 'REVIEW_ACTION_FIELD_MISSING',
} as const);

export type ProfessionalReviewValidationCode =
  (typeof PROFESSIONAL_REVIEW_VALIDATION_CODES)[keyof typeof PROFESSIONAL_REVIEW_VALIDATION_CODES];

export interface ProfessionalReviewValidationResult {
  /**
   * Structural admissibility only.
   *
   * Named `admitted` rather than `valid`, exactly as APV-05, APV-06 and APV-07
   * named theirs. "Valid" is the word that quietly slides from *conforms to a
   * schema* to *is legitimate*, and this layer only ever means the first — which
   * matters here more than anywhere, because the thing being admitted is a
   * professional's recorded position on somebody's case.
   */
  readonly admitted: boolean;
  readonly reasons: readonly ProfessionalReviewValidationCode[];
}

/**
 * Bounds on human-readable text.
 *
 * Guards, not semantic rules: long enough for what a professional is likely to
 * write, short enough that no field can become a log sink, a document store or
 * an unbounded event payload. Internal, for the reason APV-04 kept its
 * cancellation-reason bound internal — the numbers are implementation guards,
 * not contracts downstream should branch on.
 */
const NOTE_MAX_LENGTH = 2048;
const SCOPE_STATEMENT_MAX_LENGTH = 2048;
const LIMITATION_MAX_LENGTH = 512;
const LIMITATIONS_MAX_COUNT = 32;
const BASIS_REFS_MAX_COUNT = 512;
const MATERIAL_REQUESTS_MAX_COUNT = 64;
const CREDENTIAL_REFS_MAX_COUNT = 16;

const SCOPE_KEYS: readonly string[] = [
  'requirementId',
  'attestationType',
  'subjectRef',
  'caseRevision',
  'propositionRefs',
  'scopeStatement',
  'limitations',
];

const BASIS_REF_KEYS: readonly string[] = ['kind', 'ref'];

const MATERIAL_REQUEST_KEYS: readonly string[] = [
  'requirementId',
  'evidenceCategoryId',
  'reasonCode',
  'note',
];

const REQUEST_KEYS: readonly string[] = [
  'schemaVersion',
  'reviewRequestId',
  'tenantId',
  'caseId',
  'profile',
  'attestationRequirementId',
  'requestedAttestationType',
  'requestedScope',
  'reviewBasisRevision',
  'requestedAt',
  'correlationId',
];

const DECISION_KEYS: readonly string[] = [
  'schemaVersion',
  'decisionId',
  'reviewRequestId',
  'tenantId',
  'caseId',
  'profile',
  'attestationRequirementId',
  'reviewer',
  'reviewerCredentialRefs',
  'action',
  'scope',
  'reviewBasisRevision',
  'resultingCaseRevision',
  'reviewedRefs',
  'reasonCode',
  'requestedMaterial',
  'note',
  'canonicalAttestationRef',
  'attestationMaterialId',
  'decidedAt',
  'correlationId',
];

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}

/**
 * A `CanonicalId` naming a Protocol record. Bounded and non-blank; never parsed,
 * never resolved, and never checked for existence — the same guard APV-04 and
 * APV-07 use for the references they carry.
 */
function isCanonicalRecordId(value: unknown): value is CanonicalId {
  return (
    typeof value === 'string' &&
    value.trim() !== '' &&
    value.length <= PROTOCOLIZATION_IDENTIFIER_MAX_LENGTH
  );
}

function isBoundedText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim() !== '' && value.length <= max;
}

function isCaseRevision(value: unknown): value is number {
  // A case revision is `1` at creation and only ever increments, so a record
  // claiming revision `0` — or a fractional one — describes a state that cannot
  // exist.
  return Number.isSafeInteger(value) && (value as number) >= 1;
}

function isAttestationType(value: unknown): value is AttestationType {
  return typeof value === 'string' && Object.values<string>(AttestationType).includes(value);
}

/**
 * A principal reference this workflow will carry.
 *
 * The minimum that makes one usable as a reviewer: it names a principal, of a
 * kind Protocol defines. Restating `CanonicalPrincipalRef`'s full shape here
 * would be a second, drifting copy of a Protocol contract, which is precisely
 * what this package must not build.
 */
export function isUsablePrincipalRef(value: unknown): value is CanonicalPrincipalRef {
  if (!isPlainObject(value)) return false;
  if (!isCanonicalRecordId(value.id)) return false;
  return typeof value.kind === 'string' && Object.values<string>(PrincipalKind).includes(value.kind);
}

/**
 * A credential reference this workflow will carry.
 *
 * Identity and type only. Whether the credential exists, is current, is genuine
 * or confers any authority is emphatically not decided here — this package
 * cannot dereference a credential and must not pretend otherwise.
 */
export function isUsableCredentialRef(value: unknown): value is CanonicalCredentialRef {
  if (!isPlainObject(value)) return false;
  if (!isCanonicalRecordId(value.id)) return false;
  return typeof value.type === 'string' && Object.values<string>(CredentialType).includes(value.type);
}

function isValidBasisRefList(value: unknown): boolean {
  if (!Array.isArray(value) || value.length === 0 || value.length > BASIS_REFS_MAX_COUNT) {
    return false;
  }
  for (const entry of value) {
    if (!isPlainObject(entry) || !hasOnlyKeys(entry, BASIS_REF_KEYS)) return false;
    if (!isProfessionalReviewBasisKind(entry.kind)) return false;
    if (!isCanonicalRecordId(entry.ref)) return false;
  }
  return true;
}

function isValidCredentialRefList(value: unknown): boolean {
  if (!Array.isArray(value) || value.length === 0 || value.length > CREDENTIAL_REFS_MAX_COUNT) {
    return false;
  }
  return value.every((entry) => isUsableCredentialRef(entry));
}

function isValidMaterialRequestList(value: unknown): boolean {
  if (!Array.isArray(value) || value.length === 0 || value.length > MATERIAL_REQUESTS_MAX_COUNT) {
    return false;
  }
  for (const entry of value) {
    if (!isPlainObject(entry) || !hasOnlyKeys(entry, MATERIAL_REQUEST_KEYS)) return false;
    if (!isValidProfessionalReviewReasonCode(entry.reasonCode)) return false;
    if (hasOwn(entry, 'requirementId') && !isValidAssetRequirementId(entry.requirementId)) {
      return false;
    }
    if (
      hasOwn(entry, 'evidenceCategoryId') &&
      !isValidEvidenceIntakeCategoryId(entry.evidenceCategoryId)
    ) {
      return false;
    }
    // A request naming neither a requirement nor an intake category is a
    // request nothing can route. Prose alone is never a machine-readable need.
    if (!hasOwn(entry, 'requirementId') && !hasOwn(entry, 'evidenceCategoryId')) return false;
    if (hasOwn(entry, 'note') && !isBoundedText(entry.note, NOTE_MAX_LENGTH)) return false;
  }
  return true;
}

/**
 * Validates a review scope.
 *
 * The one structural guarantee that makes an attestation bounded, so it is
 * checked as its own subject rather than inline: a requirement, an attestation
 * type, a subject, a revision and at least one proposition reference. A scope
 * that named nothing would be a scope in name only.
 */
export function validateProfessionalReviewScope(
  value: unknown,
): ProfessionalReviewValidationResult {
  if (!isPlainObject(value)) {
    return { admitted: false, reasons: [PROFESSIONAL_REVIEW_VALIDATION_CODES.notAnObject] };
  }
  const reasons: ProfessionalReviewValidationCode[] = [];
  if (!hasOnlyKeys(value, SCOPE_KEYS)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.unknownField);
  }
  if (!isValidAssetRequirementId(value.requirementId)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidRequirementId);
  }
  if (!isAttestationType(value.attestationType)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidAttestationType);
  }
  if (!isValidSovereignSubjectRef(value.subjectRef)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidScope);
  }
  if (!isCaseRevision(value.caseRevision)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidBasisRevision);
  }
  if (!isValidBasisRefList(value.propositionRefs)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidScope);
  }
  if (
    hasOwn(value, 'scopeStatement') &&
    !isBoundedText(value.scopeStatement, SCOPE_STATEMENT_MAX_LENGTH)
  ) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidScope);
  }
  if (hasOwn(value, 'limitations')) {
    const limitations = value.limitations;
    const usable =
      Array.isArray(limitations) &&
      limitations.length > 0 &&
      limitations.length <= LIMITATIONS_MAX_COUNT &&
      limitations.every((entry) => isBoundedText(entry, LIMITATION_MAX_LENGTH));
    if (!usable) reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidScope);
  }
  return { admitted: reasons.length === 0, reasons };
}

export function isValidProfessionalReviewScope(value: unknown): value is ProfessionalReviewScope {
  return validateProfessionalReviewScope(value).admitted;
}

/**
 * Validates a persisted review request.
 *
 * Structure only. It does not decide that the case still exists, that the
 * profile is still catalogued, that the revision is still current, or that
 * anyone ever reviewed it.
 */
export function validateProfessionalReviewRequest(
  value: unknown,
): ProfessionalReviewValidationResult {
  if (!isPlainObject(value)) {
    return { admitted: false, reasons: [PROFESSIONAL_REVIEW_VALIDATION_CODES.notAnObject] };
  }
  const reasons: ProfessionalReviewValidationCode[] = [];

  if (!hasOnlyKeys(value, REQUEST_KEYS)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.unknownField);
  }
  if (value.schemaVersion !== PROFESSIONAL_REVIEW_REQUEST_SCHEMA_VERSION) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidSchemaVersion);
  }
  if (!isValidProfessionalReviewRequestId(value.reviewRequestId)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidRequestId);
  }
  if (!isValidProtocolizationTenantId(value.tenantId)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidTenantId);
  }
  if (!isValidProtocolizationCaseId(value.caseId)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidCaseId);
  }
  if (!isValidProtocolizationProfileRef(value.profile)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidProfileRef);
  }
  if (!isValidAssetRequirementId(value.attestationRequirementId)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidRequirementId);
  }
  if (!isAttestationType(value.requestedAttestationType)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidAttestationType);
  }
  const scope = validateProfessionalReviewScope(value.requestedScope);
  if (!scope.admitted) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidScope);
  }
  if (!isCaseRevision(value.reviewBasisRevision)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidBasisRevision);
  }
  // A scope that disagreed with the request it belongs to would let a reader
  // answer "which revision was reviewed?" two different ways.
  if (
    scope.admitted &&
    isCaseRevision(value.reviewBasisRevision) &&
    (value.requestedScope as ProfessionalReviewScope).caseRevision !== value.reviewBasisRevision
  ) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidScope);
  }
  if (
    scope.admitted &&
    (value.requestedScope as ProfessionalReviewScope).requirementId !==
      value.attestationRequirementId
  ) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidScope);
  }
  if (
    scope.admitted &&
    (value.requestedScope as ProfessionalReviewScope).attestationType !==
      value.requestedAttestationType
  ) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidScope);
  }
  if (!isValidUtcDateTime(value.requestedAt)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidRequestedAt);
  }
  if (hasOwn(value, 'correlationId') && !isCanonicalRecordId(value.correlationId)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidCorrelationId);
  }

  return { admitted: reasons.length === 0, reasons };
}

export function isValidProfessionalReviewRequest(
  value: unknown,
): value is ProfessionalReviewRequest {
  return validateProfessionalReviewRequest(value).admitted;
}

/**
 * The fields each action does, and does not, carry.
 *
 * This table is what makes the four actions mutually explicit at the type
 * boundary rather than only in prose. `required` fields must be present;
 * `forbidden` fields must be absent.
 */
const ACTION_FIELD_RULES: Readonly<
  Record<
    ProfessionalReviewAction,
    { readonly required: readonly string[]; readonly forbidden: readonly string[] }
  >
> = Object.freeze({
  [ProfessionalReviewAction.Attest]: {
    required: ['scope', 'reviewedRefs'],
    forbidden: ['requestedMaterial'],
  },
  [ProfessionalReviewAction.Reject]: {
    required: ['reasonCode'],
    forbidden: [
      'scope',
      'requestedMaterial',
      'canonicalAttestationRef',
      'attestationMaterialId',
      'resultingCaseRevision',
    ],
  },
  [ProfessionalReviewAction.RequestMoreEvidence]: {
    required: ['reasonCode', 'requestedMaterial'],
    forbidden: [
      'scope',
      'canonicalAttestationRef',
      'attestationMaterialId',
      'resultingCaseRevision',
    ],
  },
  [ProfessionalReviewAction.Abstain]: {
    required: ['reasonCode'],
    forbidden: [
      'scope',
      'requestedMaterial',
      'canonicalAttestationRef',
      'attestationMaterialId',
      'resultingCaseRevision',
    ],
  },
});

/**
 * Validates a persisted review decision.
 *
 * Structure and action-conditioned shape. It does not decide that the reviewer
 * was entitled to decide, that a presented credential is current, that an
 * attestation is legally sufficient, or that the position taken was correct —
 * none of which a validator could know, and none of which anything in this
 * package may re-decide after the fact.
 */
export function validateProfessionalReviewDecision(
  value: unknown,
): ProfessionalReviewValidationResult {
  if (!isPlainObject(value)) {
    return { admitted: false, reasons: [PROFESSIONAL_REVIEW_VALIDATION_CODES.notAnObject] };
  }
  const reasons: ProfessionalReviewValidationCode[] = [];

  if (!hasOnlyKeys(value, DECISION_KEYS)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.unknownField);
  }
  if (value.schemaVersion !== PROFESSIONAL_REVIEW_DECISION_SCHEMA_VERSION) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidSchemaVersion);
  }
  if (!isValidProfessionalReviewDecisionId(value.decisionId)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidDecisionId);
  }
  if (!isValidProfessionalReviewRequestId(value.reviewRequestId)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidRequestId);
  }
  if (!isValidProtocolizationTenantId(value.tenantId)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidTenantId);
  }
  if (!isValidProtocolizationCaseId(value.caseId)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidCaseId);
  }
  if (!isValidProtocolizationProfileRef(value.profile)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidProfileRef);
  }
  if (!isValidAssetRequirementId(value.attestationRequirementId)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidRequirementId);
  }
  if (!isUsablePrincipalRef(value.reviewer)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidReviewer);
  }
  if (
    hasOwn(value, 'reviewerCredentialRefs') &&
    !isValidCredentialRefList(value.reviewerCredentialRefs)
  ) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidCredentialRefs);
  }
  if (!isProfessionalReviewAction(value.action)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidAction);
  }
  if (hasOwn(value, 'scope') && !isValidProfessionalReviewScope(value.scope)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidScope);
  }
  if (!isCaseRevision(value.reviewBasisRevision)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidBasisRevision);
  }
  if (hasOwn(value, 'resultingCaseRevision')) {
    // The case gained material because of this decision, so the resulting
    // revision is strictly after the one that was reviewed. Equal or earlier
    // would describe a mutation that did not happen, or one that ran backwards.
    const resulting = value.resultingCaseRevision;
    const coherent =
      isCaseRevision(resulting) &&
      isCaseRevision(value.reviewBasisRevision) &&
      (resulting as number) > (value.reviewBasisRevision as number);
    if (!coherent) reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidResultingRevision);
  }
  if (hasOwn(value, 'reviewedRefs') && !isValidBasisRefList(value.reviewedRefs)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidReviewedRefs);
  }
  if (hasOwn(value, 'reasonCode') && !isValidProfessionalReviewReasonCode(value.reasonCode)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidReasonCode);
  }
  if (hasOwn(value, 'requestedMaterial') && !isValidMaterialRequestList(value.requestedMaterial)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidRequestedMaterial);
  }
  if (hasOwn(value, 'note') && !isBoundedText(value.note, NOTE_MAX_LENGTH)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidNote);
  }
  if (
    hasOwn(value, 'canonicalAttestationRef') &&
    !isCanonicalRecordId(value.canonicalAttestationRef)
  ) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidAttestationRef);
  }
  if (
    hasOwn(value, 'attestationMaterialId') &&
    !isValidProtocolizationMaterialId(value.attestationMaterialId)
  ) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidMaterialId);
  }
  if (!isValidUtcDateTime(value.decidedAt)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidDecidedAt);
  }
  if (hasOwn(value, 'correlationId') && !isCanonicalRecordId(value.correlationId)) {
    reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidCorrelationId);
  }

  if (isProfessionalReviewAction(value.action)) {
    const rules = ACTION_FIELD_RULES[value.action];
    if (rules.required.some((field) => !hasOwn(value, field))) {
      reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.actionFieldMissing);
    }
    if (rules.forbidden.some((field) => hasOwn(value, field))) {
      reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.actionFieldUnexpected);
    }
    // An attestation reference and the material association it produced travel
    // together or not at all: one without the other describes half an event.
    if (
      hasOwn(value, 'canonicalAttestationRef') !== hasOwn(value, 'attestationMaterialId') ||
      hasOwn(value, 'canonicalAttestationRef') !== hasOwn(value, 'resultingCaseRevision')
    ) {
      reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.actionFieldMissing);
    }
    if (
      value.action === ProfessionalReviewAction.Attest &&
      isValidProfessionalReviewScope(value.scope) &&
      isCaseRevision(value.reviewBasisRevision) &&
      ((value.scope as ProfessionalReviewScope).caseRevision !== value.reviewBasisRevision ||
        (value.scope as ProfessionalReviewScope).requirementId !== value.attestationRequirementId)
    ) {
      reasons.push(PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidScope);
    }
  }

  return { admitted: reasons.length === 0, reasons };
}

export function isValidProfessionalReviewDecision(
  value: unknown,
): value is ProfessionalReviewDecision {
  return validateProfessionalReviewDecision(value).admitted;
}
