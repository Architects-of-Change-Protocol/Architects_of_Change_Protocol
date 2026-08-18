import type { CanonicalEvidenceId } from '@aoc/protocol/claims';

import { PROTOCOLIZATION_CASE_ERROR_CODES, ProtocolizationCaseError } from '../case/case-errors';
import type { ProtocolizationCaseEvent } from '../case/case-events';
import { deepFreeze } from '../case/case-freeze';
import { isValidProtocolizationTenantId } from '../case/case-identifiers';
import { ProtocolizationMaterialKind } from '../case/case-material';
import { addProtocolizationCaseMaterial } from '../case/case-operations';
import type { ProtocolizationCaseContext } from '../case/case-operations';
import type { ProtocolizationCase } from '../case/protocolization-case';
import { EVIDENCE_INTAKE_ERROR_CODES, EvidenceIntakeError } from './evidence-intake-errors';
import type { EvidenceIntakeErrorCode, EvidenceIntakeErrorDetails } from './evidence-intake-errors';
import { PROTOCOLIZATION_EVIDENCE_EVENT_TYPES } from './evidence-intake-events';
import type { ProtocolizationEvidenceReceivedEvent } from './evidence-intake-events';
import { EVIDENCE_INTAKE_RECEIPT_SCHEMA_VERSION } from './evidence-intake-receipt';
import type { EvidenceIntakeReceipt } from './evidence-intake-receipt';
import {
  validateEvidenceIntakeReceipt,
  validateProtocolizationEvidenceSubmission,
} from './evidence-intake-validation';
import { submittedEvidenceRef } from './evidence-submission';
import type { ProtocolizationEvidenceSubmission } from './evidence-submission';

/**
 * The evidence intake operation.
 *
 * One pure function over an immutable case. It takes a submission, decides
 * whether the submission is *structurally admissible*, and — if it is — returns
 * the updated case, an immutable receipt, and the two events that describe what
 * happened. It mutates nothing and performs no I/O: no network call, no
 * database call, no registry lookup, no file read, no digest computation, no
 * signature check. The only outside world it touches is the clock and the
 * profile catalogue, both injected through APV-04's context.
 *
 * ### What success means
 *
 * ```text
 * APV accepted this evidence reference structurally into this case workflow.
 * ```
 *
 * That is the entire claim. It does **not** mean the evidence is authentic,
 * true, authoritative, current, sufficient or admissible in any legal sense; it
 * does not mean the requirements it was offered against are satisfied; it does
 * not mean the identity is resolved, the ownership established or the authority
 * proven; and it does not mean the case is ready. Every one of those is a
 * conclusion a later slice reaches by *reading* what this one recorded.
 *
 * ### Progressive intake
 *
 * Evidence arrives over the life of a case — minutes, weeks or months after it
 * was opened, in any order, from any number of sources. Nothing here assumes a
 * single submit-everything-then-verify transaction: each intake is independent,
 * each produces its own receipt at its own instant, and no intake rewrites,
 * replaces or deletes what an earlier one recorded. Later evidence that
 * supersedes earlier evidence is simply a further intake; both remain
 * observable, and formalizing supersession is a later slice's work.
 *
 * ### Why the case mutation goes through APV-04
 *
 * The association is performed by `addProtocolizationCaseMaterial`, not by a
 * parallel evidence list on the case. APV-04 already models exactly this — a
 * `ProtocolizationMaterialKind.Evidence` association naming a
 * `CanonicalEvidenceId`, correlated to requirements of the pinned profile — and
 * it already enforces the lifecycle rule, the requirement-id rule, the pinned
 * version rule, the duplicate-material rule, the clock rule and the revision
 * rule. Delegating means one implementation of each, one set of error codes,
 * and exactly one revision increment per intake.
 */

/**
 * What an accepted intake produces.
 *
 * All four values are returned together, and none of them is persisted here.
 * That is deliberate: a successful intake has to update the case *and* record a
 * receipt, and those are two writes to two stores. Performing them inside this
 * function would let it report success after the first one succeeded and the
 * second failed — a case carrying material with no receipt behind it. A pure
 * operation hands both results to a composition layer that can commit them
 * together under whatever transactional facility it actually has.
 */
export interface ProtocolizationEvidenceIntakeTransition {
  /** The case with the evidence association added. Deeply frozen. */
  readonly protocolizationCase: ProtocolizationCase;
  /** The immutable record that this intake happened. Deeply frozen. */
  readonly receipt: EvidenceIntakeReceipt;
  /** APV-04's own event for the material association, unchanged. */
  readonly caseEvent: ProtocolizationCaseEvent;
  /** APV-05's event for the intake. Shares `occurredAt` and `caseRevision` with the above. */
  readonly intakeEvent: ProtocolizationEvidenceReceivedEvent;
}

function failIntake(
  code: EvidenceIntakeErrorCode,
  message: string,
  details: EvidenceIntakeErrorDetails,
): never {
  throw new EvidenceIntakeError(code, message, details);
}

/**
 * The tenant gate, checked before anything else looks at the case.
 *
 * Mirrors APV-04's `assertOperableCase` rather than relying on the delegated
 * call to reach the same conclusion later: intake reads the case's material
 * list to detect duplicate evidence, and it must not do even that on behalf of
 * a caller acting as a tenant that does not own the case. The acting tenant is
 * the context's, never the case's — a check that reads the tenant off the value
 * it is checking always agrees with itself.
 */
function assertActingTenantOwnsCase(
  context: ProtocolizationCaseContext,
  protocolizationCase: ProtocolizationCase,
): void {
  if (!isValidProtocolizationTenantId(context.tenantId)) {
    failIntake(EVIDENCE_INTAKE_ERROR_CODES.invalidTenant, 'A non-blank acting tenantId is required', {
      reasonCodes: [EVIDENCE_INTAKE_ERROR_CODES.invalidTenant],
    });
  }
  if (protocolizationCase.tenantId !== context.tenantId) {
    // APV-04's code, deliberately: "the acting tenant does not own this case"
    // is one condition, and one condition gets one machine-readable code.
    throw new ProtocolizationCaseError(
      PROTOCOLIZATION_CASE_ERROR_CODES.tenantMismatch,
      'The acting tenant does not own this ProtocolizationCase',
      {
        reasonCodes: [PROTOCOLIZATION_CASE_ERROR_CODES.tenantMismatch],
        caseId: protocolizationCase.caseId,
        tenantId: context.tenantId,
      },
    );
  }
}

/**
 * Rejects a second intake of the same canonical evidence into the same case.
 *
 * Scoped to the case on purpose. Within one case, two materials naming one
 * evidence record are not two pieces of evidence — they are one piece recorded
 * twice, and silently accepting that would inflate the case's own account of
 * what it holds. Across cases the same evidence record may legitimately be
 * offered again: a single survey, certificate or system record can bear on
 * several subjects, and forbidding that globally would force callers to
 * duplicate a Protocol record to work around a vertical rule.
 *
 * Correlating evidence that is *already* in the case with a further requirement
 * is not an intake at all — it is APV-04's
 * `associateProtocolizationCaseMaterial` on the material this evidence's
 * receipt names.
 */
function assertEvidenceNotAlreadyInCase(
  protocolizationCase: ProtocolizationCase,
  evidenceRef: CanonicalEvidenceId,
  submission: ProtocolizationEvidenceSubmission,
): void {
  const existing = protocolizationCase.materials.find(
    (material) =>
      material.kind === ProtocolizationMaterialKind.Evidence && material.evidenceRef === evidenceRef,
  );
  if (existing !== undefined) {
    failIntake(
      EVIDENCE_INTAKE_ERROR_CODES.duplicateEvidence,
      `This case already holds evidence material ${String(existing.materialId)} for this canonical evidence`,
      {
        reasonCodes: [EVIDENCE_INTAKE_ERROR_CODES.duplicateEvidence],
        intakeId: submission.intakeId,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
        materialId: existing.materialId,
        evidenceRef,
      },
    );
  }
}

/**
 * Receives one piece of evidence into one case, or fails.
 *
 * Order of checks is part of the contract: tenant, then case identity, then
 * structural admission, then case-scoped duplication, then everything APV-04
 * enforces. A failure at any step throws and produces nothing — no receipt, no
 * event, no case mutation and no revision increment. A rejected submission
 * leaves the case byte-for-byte as it was.
 */
export function intakeProtocolizationEvidence(
  context: ProtocolizationCaseContext,
  protocolizationCase: ProtocolizationCase,
  submission: ProtocolizationEvidenceSubmission,
): ProtocolizationEvidenceIntakeTransition {
  assertActingTenantOwnsCase(context, protocolizationCase);

  const admission = validateProtocolizationEvidenceSubmission(submission);
  if (!admission.admitted) {
    failIntake(
      EVIDENCE_INTAKE_ERROR_CODES.invalidSubmission,
      `Evidence submission was not admitted: ${admission.reasons.join(', ')}`,
      {
        reasonCodes: admission.reasons,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
      },
    );
  }

  if (submission.caseId !== protocolizationCase.caseId) {
    failIntake(
      EVIDENCE_INTAKE_ERROR_CODES.caseMismatch,
      'The submission names a different ProtocolizationCase',
      {
        reasonCodes: [EVIDENCE_INTAKE_ERROR_CODES.caseMismatch],
        intakeId: submission.intakeId,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
      },
    );
  }

  const evidenceRef = submittedEvidenceRef(submission);
  assertEvidenceNotAlreadyInCase(protocolizationCase, evidenceRef, submission);

  // Everything the case owns — lifecycle, pinned-version requirement
  // correlation, duplicate material ids, the clock, the revision increment and
  // the freeze — is enforced here, once, by the aggregate that owns it. The
  // `CanonicalEvidence` document, if one was supplied, is deliberately not
  // passed on: the case records the reference, never a copy of the record.
  const transition = addProtocolizationCaseMaterial(context, protocolizationCase, {
    materialId: submission.materialId,
    kind: ProtocolizationMaterialKind.Evidence,
    evidenceRef,
    requirementIds: submission.requirementIds,
    ...(submission.correlationId === undefined ? {} : { correlationId: submission.correlationId }),
  });

  // The intake instant is the case event's instant, read once. A second clock
  // read would let a receipt and the material it describes disagree about when
  // the same act happened.
  const receivedAt = transition.event.occurredAt;
  const caseRevision = transition.protocolizationCase.revision;

  const receipt: EvidenceIntakeReceipt = {
    schemaVersion: EVIDENCE_INTAKE_RECEIPT_SCHEMA_VERSION,
    intakeId: submission.intakeId,
    tenantId: transition.protocolizationCase.tenantId,
    caseId: transition.protocolizationCase.caseId,
    profile: transition.protocolizationCase.profile,
    categoryId: submission.categoryId,
    evidenceRef,
    materialId: submission.materialId,
    requirementIds: [...submission.requirementIds],
    receivedAt,
    ...(submission.observedAt === undefined ? {} : { observedAt: submission.observedAt }),
    ...(submission.sourceRef === undefined ? {} : { sourceRef: submission.sourceRef }),
    caseRevision,
    ...(submission.correlationId === undefined ? {} : { correlationId: submission.correlationId }),
  };

  const receiptValidation = validateEvidenceIntakeReceipt(receipt);
  if (!receiptValidation.admitted) {
    failIntake(
      EVIDENCE_INTAKE_ERROR_CODES.invalidReceipt,
      `Refusing to produce an invalid EvidenceIntakeReceipt: ${receiptValidation.reasons.join(', ')}`,
      { reasonCodes: receiptValidation.reasons, intakeId: submission.intakeId },
    );
  }

  const intakeEvent: ProtocolizationEvidenceReceivedEvent = {
    eventType: PROTOCOLIZATION_EVIDENCE_EVENT_TYPES.received,
    intakeId: receipt.intakeId,
    tenantId: receipt.tenantId,
    caseId: receipt.caseId,
    profile: receipt.profile,
    categoryId: receipt.categoryId,
    evidenceRef: receipt.evidenceRef,
    materialId: receipt.materialId,
    requirementIds: receipt.requirementIds,
    occurredAt: receivedAt,
    ...(receipt.observedAt === undefined ? {} : { observedAt: receipt.observedAt }),
    caseRevision,
    ...(receipt.correlationId === undefined ? {} : { correlationId: receipt.correlationId }),
  };

  return {
    protocolizationCase: transition.protocolizationCase,
    receipt: deepFreeze(receipt),
    caseEvent: transition.event,
    intakeEvent: deepFreeze(intakeEvent),
  };
}

/**
 * Turns an untrusted, persisted value back into a receipt, or fails.
 *
 * The single supported way to bring a receipt back across a persistence or
 * network boundary — the same role, and the same rule, as
 * `reconstituteProtocolizationCase`: validate before trusting, and freeze what
 * is returned, so a store cannot hand a caller a receipt this package would
 * have refused to produce.
 */
export function reconstituteEvidenceIntakeReceipt(value: unknown): EvidenceIntakeReceipt {
  const validation = validateEvidenceIntakeReceipt(value);
  if (!validation.admitted) {
    failIntake(
      EVIDENCE_INTAKE_ERROR_CODES.invalidReceipt,
      `Refusing to reconstitute an invalid EvidenceIntakeReceipt: ${validation.reasons.join(', ')}`,
      { reasonCodes: validation.reasons },
    );
  }
  return deepFreeze(value as EvidenceIntakeReceipt);
}
