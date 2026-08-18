"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInMemoryProtocolizationCaseRepository = createInMemoryProtocolizationCaseRepository;
const case_errors_1 = require("./case-errors");
const case_freeze_1 = require("./case-freeze");
const case_identifiers_1 = require("./case-identifiers");
const case_validation_1 = require("./case-validation");
function storageKey(tenantId, caseId) {
    // `tenantId` cannot contain whitespace or a control character, and a case id
    // cannot contain `\n` either, so a newline separator can never be ambiguous
    // between two distinct pairs.
    return `${tenantId}\n${caseId}`;
}
function assertTenant(tenantId) {
    if (!(0, case_identifiers_1.isValidProtocolizationTenantId)(tenantId)) {
        throw new case_errors_1.ProtocolizationCaseError(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.invalidTenant, 'A non-blank tenantId is required to address a ProtocolizationCase', { reasonCodes: [case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.invalidTenant] });
    }
}
/**
 * A deterministic, in-process implementation of the port.
 *
 * It exists to make the contract executable — tenant isolation, duplicate
 * rejection and lost-update detection are behaviours a port cannot state, only a
 * implementation can demonstrate — and it is the reference a database adapter
 * must match. It is in-process and synchronous, like
 * `createAssetProfileCatalog`, and it holds nothing but the cases it was given.
 *
 * Stored cases are validated on the way in and deeply frozen, so a caller
 * cannot mutate stored state by holding on to a reference it saved or received.
 * Every mutation goes back through the aggregate operations.
 */
function createInMemoryProtocolizationCaseRepository() {
    const entries = new Map();
    return {
        get(tenantId, caseId) {
            assertTenant(tenantId);
            return entries.get(storageKey(tenantId, caseId));
        },
        exists(tenantId, caseId) {
            assertTenant(tenantId);
            return entries.has(storageKey(tenantId, caseId));
        },
        save(protocolizationCase) {
            const validation = (0, case_validation_1.validateProtocolizationCase)(protocolizationCase);
            if (!validation.valid) {
                throw new case_errors_1.ProtocolizationCaseError(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.invalidCase, `Refusing to store an invalid ProtocolizationCase: ${validation.reasons.join(', ')}`, { reasonCodes: validation.reasons });
            }
            const key = storageKey(protocolizationCase.tenantId, protocolizationCase.caseId);
            const stored = entries.get(key);
            if (stored === undefined) {
                if (protocolizationCase.revision !== 1) {
                    throw new case_errors_1.ProtocolizationCaseError(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.caseNotFound, `No stored ProtocolizationCase to update at revision ${protocolizationCase.revision}`, {
                        reasonCodes: [case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.caseNotFound],
                        caseId: protocolizationCase.caseId,
                        tenantId: protocolizationCase.tenantId,
                        expectedRevision: protocolizationCase.revision - 1,
                    });
                }
            }
            else if (protocolizationCase.revision === 1) {
                throw new case_errors_1.ProtocolizationCaseError(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.duplicateCase, 'A ProtocolizationCase with this (tenantId, caseId) already exists', {
                    reasonCodes: [case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.duplicateCase],
                    caseId: protocolizationCase.caseId,
                    tenantId: protocolizationCase.tenantId,
                });
            }
            else if (protocolizationCase.revision !== stored.revision + 1) {
                throw new case_errors_1.ProtocolizationCaseError(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.revisionConflict, 'This ProtocolizationCase was modified by another writer', {
                    reasonCodes: [case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.revisionConflict],
                    caseId: protocolizationCase.caseId,
                    tenantId: protocolizationCase.tenantId,
                    expectedRevision: stored.revision + 1,
                    actualRevision: protocolizationCase.revision,
                });
            }
            entries.set(key, (0, case_freeze_1.deepFreeze)(protocolizationCase));
        },
    };
}
