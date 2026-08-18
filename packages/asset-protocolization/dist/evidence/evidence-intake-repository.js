"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInMemoryEvidenceIntakeRepository = createInMemoryEvidenceIntakeRepository;
const case_freeze_1 = require("../case/case-freeze");
const case_identifiers_1 = require("../case/case-identifiers");
const evidence_intake_errors_1 = require("./evidence-intake-errors");
const evidence_intake_validation_1 = require("./evidence-intake-validation");
function storageKey(tenantId, intakeId) {
    // A tenant id cannot contain whitespace or a control character and an intake
    // id cannot contain `\n`, so a newline separator is never ambiguous between
    // two distinct pairs.
    return `${tenantId}\n${intakeId}`;
}
function assertTenant(tenantId) {
    if (!(0, case_identifiers_1.isValidProtocolizationTenantId)(tenantId)) {
        throw new evidence_intake_errors_1.EvidenceIntakeError(evidence_intake_errors_1.EVIDENCE_INTAKE_ERROR_CODES.invalidTenant, 'A non-blank tenantId is required to address an EvidenceIntakeReceipt', { reasonCodes: [evidence_intake_errors_1.EVIDENCE_INTAKE_ERROR_CODES.invalidTenant] });
    }
}
/**
 * A deterministic, in-process implementation of the port.
 *
 * It exists to make the contract executable — tenant isolation, duplicate
 * rejection and append-only history are behaviours a port can state but only an
 * implementation can demonstrate — and it is the reference a database adapter
 * must match. Receipts are validated on the way in and deeply frozen, so a
 * caller cannot mutate stored state by holding on to a reference it saved.
 */
function createInMemoryEvidenceIntakeRepository() {
    const entries = new Map();
    return {
        get(tenantId, intakeId) {
            assertTenant(tenantId);
            return entries.get(storageKey(tenantId, intakeId));
        },
        exists(tenantId, intakeId) {
            assertTenant(tenantId);
            return entries.has(storageKey(tenantId, intakeId));
        },
        listByCase(tenantId, caseId) {
            assertTenant(tenantId);
            return [...entries.values()].filter((receipt) => receipt.tenantId === tenantId && receipt.caseId === caseId);
        },
        save(receipt) {
            const validation = (0, evidence_intake_validation_1.validateEvidenceIntakeReceipt)(receipt);
            if (!validation.admitted) {
                throw new evidence_intake_errors_1.EvidenceIntakeError(evidence_intake_errors_1.EVIDENCE_INTAKE_ERROR_CODES.invalidReceipt, `Refusing to store an invalid EvidenceIntakeReceipt: ${validation.reasons.join(', ')}`, { reasonCodes: validation.reasons });
            }
            const key = storageKey(receipt.tenantId, receipt.intakeId);
            if (entries.has(key)) {
                throw new evidence_intake_errors_1.EvidenceIntakeError(evidence_intake_errors_1.EVIDENCE_INTAKE_ERROR_CODES.duplicateIntake, 'An EvidenceIntakeReceipt with this (tenantId, intakeId) already exists', {
                    reasonCodes: [evidence_intake_errors_1.EVIDENCE_INTAKE_ERROR_CODES.duplicateIntake],
                    intakeId: receipt.intakeId,
                    tenantId: receipt.tenantId,
                    caseId: receipt.caseId,
                });
            }
            entries.set(key, (0, case_freeze_1.deepFreeze)(receipt));
        },
    };
}
