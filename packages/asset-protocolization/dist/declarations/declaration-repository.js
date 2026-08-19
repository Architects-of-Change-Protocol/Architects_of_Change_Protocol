"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInMemoryDeclarationRepository = createInMemoryDeclarationRepository;
const case_freeze_1 = require("../case/case-freeze");
const case_identifiers_1 = require("../case/case-identifiers");
const declaration_errors_1 = require("./declaration-errors");
const declaration_validation_1 = require("./declaration-validation");
function storageKey(tenantId, declarationId) {
    // A tenant id cannot contain whitespace or a control character and a
    // declaration id cannot contain `\n`, so a newline separator is never
    // ambiguous between two distinct pairs.
    return `${tenantId}\n${declarationId}`;
}
function assertTenant(tenantId) {
    if (!(0, case_identifiers_1.isValidProtocolizationTenantId)(tenantId)) {
        throw new declaration_errors_1.DeclarationError(declaration_errors_1.DECLARATION_ERROR_CODES.invalidTenant, 'A non-blank tenantId is required to address a ProtocolizationDeclarationRecord', { reasonCodes: [declaration_errors_1.DECLARATION_ERROR_CODES.invalidTenant] });
    }
}
/**
 * A deterministic, in-process implementation of the port.
 *
 * It exists to make the contract executable — tenant isolation, duplicate
 * rejection and append-only history are behaviours a port can state but only an
 * implementation can demonstrate — and it is the reference a database adapter
 * must match. Records are validated on the way in and deeply frozen, so a
 * caller cannot mutate stored history by holding on to a reference it saved.
 */
function createInMemoryDeclarationRepository() {
    const entries = new Map();
    return {
        get(tenantId, declarationId) {
            assertTenant(tenantId);
            return entries.get(storageKey(tenantId, declarationId));
        },
        exists(tenantId, declarationId) {
            assertTenant(tenantId);
            return entries.has(storageKey(tenantId, declarationId));
        },
        listByCase(tenantId, caseId) {
            assertTenant(tenantId);
            return [...entries.values()].filter((record) => record.tenantId === tenantId && record.caseId === caseId);
        },
        save(record) {
            const validation = (0, declaration_validation_1.validateProtocolizationDeclarationRecord)(record);
            if (!validation.admitted) {
                throw new declaration_errors_1.DeclarationError(declaration_errors_1.DECLARATION_ERROR_CODES.invalidRecord, `Refusing to store an invalid ProtocolizationDeclarationRecord: ${validation.reasons.join(', ')}`, { reasonCodes: validation.reasons });
            }
            const key = storageKey(record.tenantId, record.declarationId);
            if (entries.has(key)) {
                throw new declaration_errors_1.DeclarationError(declaration_errors_1.DECLARATION_ERROR_CODES.duplicateDeclaration, 'A ProtocolizationDeclarationRecord with this (tenantId, declarationId) already exists', {
                    reasonCodes: [declaration_errors_1.DECLARATION_ERROR_CODES.duplicateDeclaration],
                    declarationId: record.declarationId,
                    tenantId: record.tenantId,
                    caseId: record.caseId,
                });
            }
            entries.set(key, (0, case_freeze_1.deepFreeze)(record));
        },
    };
}
