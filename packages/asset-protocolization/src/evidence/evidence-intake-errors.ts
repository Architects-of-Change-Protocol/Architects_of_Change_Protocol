import type { ProtocolError } from '@aoc/protocol/errors';

import type {
  ProtocolizationCaseId,
  ProtocolizationMaterialId,
  ProtocolizationTenantId,
} from '../case/case-identifiers';
import type { EvidenceIntakeCategoryId, EvidenceIntakeId } from './evidence-intake-identifiers';

/**
 * How an evidence intake fails.
 *
 * Same shape as `ProtocolizationCaseError` and `AssetProfileError` — a real
 * `Error` that structurally satisfies `ProtocolError` — because a third error
 * philosophy in the third slice of one package would be a needless divergence.
 * `code` and `details` are the stable machine surface; `message` is a debugging
 * aid and nothing downstream may parse it.
 *
 * ### Why this list is short
 *
 * Everything about the *case* is APV-04's to refuse, and intake delegates to it
 * rather than restating its rules. A cancelled case, an unknown requirement id,
 * a requirement id that only exists in a newer profile version, a duplicate
 * material id, a clock that moved backwards, a case whose invariants are
 * already broken — each of those already fails deterministically with a stable
 * `PROTOCOLIZATION_CASE_*` code, and re-spelling any of them here would create
 * two codes for one condition. What is left, and what this enumerates, is the
 * handful of failures that belong to the intake layer itself.
 *
 * There is deliberately no `EVIDENCE_INTAKE_CASE_NOT_FOUND`: the intake
 * operation is handed the case it operates on, so "no such case" is a
 * repository lookup failure and already spelled `PROTOCOLIZATION_CASE_NOT_FOUND`.
 */
export const EVIDENCE_INTAKE_ERROR_CODES = Object.freeze({
  /** The submission failed structural admission. Carries `reasonCodes`. */
  invalidSubmission: 'EVIDENCE_INTAKE_SUBMISSION_INVALID',
  /** The acting tenant is missing or malformed. */
  invalidTenant: 'EVIDENCE_INTAKE_TENANT_REQUIRED',
  /** The acting tenant does not own the case, or the receipt being addressed. */
  tenantMismatch: 'EVIDENCE_INTAKE_TENANT_MISMATCH',
  /** The submission names a different case than the one being operated on. */
  caseMismatch: 'EVIDENCE_INTAKE_CASE_MISMATCH',
  /** A receipt with this (tenantId, intakeId) already exists. */
  duplicateIntake: 'EVIDENCE_INTAKE_DUPLICATE',
  /** This case already holds evidence material naming this canonical evidence. */
  duplicateEvidence: 'EVIDENCE_INTAKE_DUPLICATE_EVIDENCE',
  /** A receipt document failed `validateEvidenceIntakeReceipt`. Carries `reasonCodes`. */
  invalidReceipt: 'EVIDENCE_INTAKE_RECEIPT_INVALID',
} as const);

export type EvidenceIntakeErrorCode =
  (typeof EVIDENCE_INTAKE_ERROR_CODES)[keyof typeof EVIDENCE_INTAKE_ERROR_CODES];

/**
 * A type alias rather than an interface so TypeScript infers the implicit index
 * signature `ProtocolError.details` requires — the same reason
 * `ProtocolizationCaseErrorDetails` is one.
 */
export type EvidenceIntakeErrorDetails = {
  readonly reasonCodes: readonly string[];
  readonly intakeId?: EvidenceIntakeId;
  readonly tenantId?: ProtocolizationTenantId;
  readonly caseId?: ProtocolizationCaseId;
  readonly materialId?: ProtocolizationMaterialId;
  readonly categoryId?: EvidenceIntakeCategoryId;
  readonly evidenceRef?: string;
};

export class EvidenceIntakeError extends Error implements ProtocolError {
  readonly code: EvidenceIntakeErrorCode;

  readonly details: EvidenceIntakeErrorDetails;

  constructor(code: EvidenceIntakeErrorCode, message: string, details: EvidenceIntakeErrorDetails) {
    super(message);
    this.name = 'EvidenceIntakeError';
    this.code = code;
    this.details = details;
  }
}
