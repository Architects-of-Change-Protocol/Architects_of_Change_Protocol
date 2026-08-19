"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareVerificationResults = compareVerificationResults;
exports.createInMemoryVerificationResultRepository = createInMemoryVerificationResultRepository;
const case_freeze_1 = require("../case/case-freeze");
const case_identifiers_1 = require("../case/case-identifiers");
const verification_errors_1 = require("./verification-errors");
const verification_validation_1 = require("./verification-validation");
function storageKey(tenantId, executionId) {
    // A tenant id cannot contain whitespace or a control character and an
    // execution id cannot contain `\n`, so a newline separator is never ambiguous
    // between two distinct pairs.
    return `${tenantId}\n${executionId}`;
}
function assertTenant(tenantId) {
    if (!(0, case_identifiers_1.isValidProtocolizationTenantId)(tenantId)) {
        throw new verification_errors_1.VerificationError(verification_errors_1.VERIFICATION_ERROR_CODES.invalidTenant, 'A non-blank tenantId is required to address a ProtocolizationVerificationResult', { reasonCodes: [verification_errors_1.VERIFICATION_ERROR_CODES.invalidTenant] });
    }
}
/**
 * Total order over results: execution instant, then identifier.
 *
 * Exported for reuse *inside* this package only — the projections read the same
 * order, and two copies of an ordering rule are two orders waiting to disagree.
 */
function compareVerificationResults(left, right) {
    const byInstant = Date.parse(left.executedAt) - Date.parse(right.executedAt);
    if (byInstant !== 0)
        return byInstant < 0 ? -1 : 1;
    if (left.executionId === right.executionId)
        return 0;
    return left.executionId < right.executionId ? -1 : 1;
}
/**
 * A deterministic, in-process implementation of the port.
 *
 * It exists to make the contract executable — tenant isolation, duplicate
 * rejection, append-only history and deterministic ordering are behaviours a
 * port can state but only an implementation can demonstrate — and it is the
 * reference a database adapter must match. Results are validated on the way in
 * and deeply frozen, so a caller cannot mutate stored history by holding on to a
 * reference it saved.
 */
function createInMemoryVerificationResultRepository() {
    const entries = new Map();
    const forCase = (tenantId, caseId) => [...entries.values()]
        .filter((result) => result.tenantId === tenantId && result.caseId === caseId)
        .sort(compareVerificationResults);
    return {
        get(tenantId, executionId) {
            assertTenant(tenantId);
            return entries.get(storageKey(tenantId, executionId));
        },
        exists(tenantId, executionId) {
            assertTenant(tenantId);
            return entries.has(storageKey(tenantId, executionId));
        },
        listByCase(tenantId, caseId) {
            assertTenant(tenantId);
            return forCase(tenantId, caseId);
        },
        listByRequirementCheck(tenantId, caseId, requirementId, checkId) {
            assertTenant(tenantId);
            return forCase(tenantId, caseId).filter((result) => result.requirementId === requirementId && result.checkId === checkId);
        },
        save(result) {
            const validation = (0, verification_validation_1.validateProtocolizationVerificationResult)(result);
            if (!validation.admitted) {
                throw new verification_errors_1.VerificationError(verification_errors_1.VERIFICATION_ERROR_CODES.invalidResult, `Refusing to store an invalid ProtocolizationVerificationResult: ${validation.reasons.join(', ')}`, { reasonCodes: validation.reasons });
            }
            const key = storageKey(result.tenantId, result.executionId);
            if (entries.has(key)) {
                throw new verification_errors_1.VerificationError(verification_errors_1.VERIFICATION_ERROR_CODES.duplicateResult, 'A ProtocolizationVerificationResult with this (tenantId, executionId) already exists', {
                    reasonCodes: [verification_errors_1.VERIFICATION_ERROR_CODES.duplicateResult],
                    executionId: result.executionId,
                    tenantId: result.tenantId,
                    caseId: result.caseId,
                });
            }
            entries.set(key, (0, case_freeze_1.deepFreeze)(result));
        },
    };
}
