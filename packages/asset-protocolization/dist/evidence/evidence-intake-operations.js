"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intakeProtocolizationEvidence = intakeProtocolizationEvidence;
exports.reconstituteEvidenceIntakeReceipt = reconstituteEvidenceIntakeReceipt;
const case_errors_1 = require("../case/case-errors");
const case_freeze_1 = require("../case/case-freeze");
const case_identifiers_1 = require("../case/case-identifiers");
const case_material_1 = require("../case/case-material");
const case_operations_1 = require("../case/case-operations");
const evidence_intake_errors_1 = require("./evidence-intake-errors");
const evidence_intake_events_1 = require("./evidence-intake-events");
const evidence_intake_receipt_1 = require("./evidence-intake-receipt");
const evidence_intake_validation_1 = require("./evidence-intake-validation");
const evidence_submission_1 = require("./evidence-submission");
function failIntake(code, message, details) {
    throw new evidence_intake_errors_1.EvidenceIntakeError(code, message, details);
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
function assertActingTenantOwnsCase(context, protocolizationCase) {
    if (!(0, case_identifiers_1.isValidProtocolizationTenantId)(context.tenantId)) {
        failIntake(evidence_intake_errors_1.EVIDENCE_INTAKE_ERROR_CODES.invalidTenant, 'A non-blank acting tenantId is required', {
            reasonCodes: [evidence_intake_errors_1.EVIDENCE_INTAKE_ERROR_CODES.invalidTenant],
        });
    }
    if (protocolizationCase.tenantId !== context.tenantId) {
        // APV-04's code, deliberately: "the acting tenant does not own this case"
        // is one condition, and one condition gets one machine-readable code.
        throw new case_errors_1.ProtocolizationCaseError(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.tenantMismatch, 'The acting tenant does not own this ProtocolizationCase', {
            reasonCodes: [case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.tenantMismatch],
            caseId: protocolizationCase.caseId,
            tenantId: context.tenantId,
        });
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
function assertEvidenceNotAlreadyInCase(protocolizationCase, evidenceRef, submission) {
    const existing = protocolizationCase.materials.find((material) => material.kind === case_material_1.ProtocolizationMaterialKind.Evidence && material.evidenceRef === evidenceRef);
    if (existing !== undefined) {
        failIntake(evidence_intake_errors_1.EVIDENCE_INTAKE_ERROR_CODES.duplicateEvidence, `This case already holds evidence material ${String(existing.materialId)} for this canonical evidence`, {
            reasonCodes: [evidence_intake_errors_1.EVIDENCE_INTAKE_ERROR_CODES.duplicateEvidence],
            intakeId: submission.intakeId,
            caseId: protocolizationCase.caseId,
            tenantId: protocolizationCase.tenantId,
            materialId: existing.materialId,
            evidenceRef,
        });
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
function intakeProtocolizationEvidence(context, protocolizationCase, submission) {
    assertActingTenantOwnsCase(context, protocolizationCase);
    const admission = (0, evidence_intake_validation_1.validateProtocolizationEvidenceSubmission)(submission);
    if (!admission.admitted) {
        failIntake(evidence_intake_errors_1.EVIDENCE_INTAKE_ERROR_CODES.invalidSubmission, `Evidence submission was not admitted: ${admission.reasons.join(', ')}`, {
            reasonCodes: admission.reasons,
            caseId: protocolizationCase.caseId,
            tenantId: protocolizationCase.tenantId,
        });
    }
    if (submission.caseId !== protocolizationCase.caseId) {
        failIntake(evidence_intake_errors_1.EVIDENCE_INTAKE_ERROR_CODES.caseMismatch, 'The submission names a different ProtocolizationCase', {
            reasonCodes: [evidence_intake_errors_1.EVIDENCE_INTAKE_ERROR_CODES.caseMismatch],
            intakeId: submission.intakeId,
            caseId: protocolizationCase.caseId,
            tenantId: protocolizationCase.tenantId,
        });
    }
    const evidenceRef = (0, evidence_submission_1.submittedEvidenceRef)(submission);
    assertEvidenceNotAlreadyInCase(protocolizationCase, evidenceRef, submission);
    // Everything the case owns — lifecycle, pinned-version requirement
    // correlation, duplicate material ids, the clock, the revision increment and
    // the freeze — is enforced here, once, by the aggregate that owns it. The
    // `CanonicalEvidence` document, if one was supplied, is deliberately not
    // passed on: the case records the reference, never a copy of the record.
    const transition = (0, case_operations_1.addProtocolizationCaseMaterial)(context, protocolizationCase, {
        materialId: submission.materialId,
        kind: case_material_1.ProtocolizationMaterialKind.Evidence,
        evidenceRef,
        requirementIds: submission.requirementIds,
        ...(submission.correlationId === undefined ? {} : { correlationId: submission.correlationId }),
    });
    // The intake instant is the case event's instant, read once. A second clock
    // read would let a receipt and the material it describes disagree about when
    // the same act happened.
    const receivedAt = transition.event.occurredAt;
    const caseRevision = transition.protocolizationCase.revision;
    const receipt = {
        schemaVersion: evidence_intake_receipt_1.EVIDENCE_INTAKE_RECEIPT_SCHEMA_VERSION,
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
    const receiptValidation = (0, evidence_intake_validation_1.validateEvidenceIntakeReceipt)(receipt);
    if (!receiptValidation.admitted) {
        failIntake(evidence_intake_errors_1.EVIDENCE_INTAKE_ERROR_CODES.invalidReceipt, `Refusing to produce an invalid EvidenceIntakeReceipt: ${receiptValidation.reasons.join(', ')}`, { reasonCodes: receiptValidation.reasons, intakeId: submission.intakeId });
    }
    const intakeEvent = {
        eventType: evidence_intake_events_1.PROTOCOLIZATION_EVIDENCE_EVENT_TYPES.received,
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
        receipt: (0, case_freeze_1.deepFreeze)(receipt),
        caseEvent: transition.event,
        intakeEvent: (0, case_freeze_1.deepFreeze)(intakeEvent),
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
function reconstituteEvidenceIntakeReceipt(value) {
    const validation = (0, evidence_intake_validation_1.validateEvidenceIntakeReceipt)(value);
    if (!validation.admitted) {
        failIntake(evidence_intake_errors_1.EVIDENCE_INTAKE_ERROR_CODES.invalidReceipt, `Refusing to reconstitute an invalid EvidenceIntakeReceipt: ${validation.reasons.join(', ')}`, { reasonCodes: validation.reasons });
    }
    return (0, case_freeze_1.deepFreeze)(value);
}
