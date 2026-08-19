"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERIFICATION_VALIDATION_CODES = void 0;
exports.validateVerificationCheckExecution = validateVerificationCheckExecution;
exports.isAdmissibleVerificationCheckExecution = isAdmissibleVerificationCheckExecution;
exports.validateProtocolizationVerificationResult = validateProtocolizationVerificationResult;
exports.isValidProtocolizationVerificationResult = isValidProtocolizationVerificationResult;
const freshness_1 = require("../freshness");
const identifiers_1 = require("../identifiers");
const case_identifiers_1 = require("../case/case-identifiers");
const verification_identifiers_1 = require("./verification-identifiers");
const verification_outcome_1 = require("./verification-outcome");
const verification_result_1 = require("./verification-result");
/**
 * Deterministic **structural** validation for the verification pipeline.
 *
 * Read "validation" here narrowly, exactly as APV-05 and APV-06 do: every check
 * below decides whether a value has the *shape* this workflow can carry. Not one
 * of them decides whether an outcome was the right outcome, whether a check was
 * well written, or whether anything evaluated is true.
 *
 * There are two subjects, and they are different in kind.
 *
 * **An execution** is what an executor just returned. It is validated *before*
 * it becomes a result, so a malformed executor cannot put an arbitrary string
 * where an outcome belongs, smuggle an unknown field into an audit record, or
 * emit an unbounded blob of prose into an event payload. This is the boundary
 * that makes "no executor may return arbitrary strings" mechanical rather than
 * documentary.
 *
 * **A result** is a persisted record coming back across a store or network
 * boundary. It is validated before it is trusted, because a repository can hand
 * back anything and a result whose invariants are already broken would be read
 * as history that never happened.
 */
exports.VERIFICATION_VALIDATION_CODES = Object.freeze({
    notAnObject: 'VERIFICATION_NOT_AN_OBJECT',
    unknownField: 'VERIFICATION_UNKNOWN_FIELD',
    invalidSchemaVersion: 'VERIFICATION_SCHEMA_VERSION_INVALID',
    invalidExecutionId: 'VERIFICATION_EXECUTION_ID_INVALID',
    invalidTenantId: 'VERIFICATION_TENANT_ID_INVALID',
    invalidCaseId: 'VERIFICATION_CASE_ID_INVALID',
    invalidProfileRef: 'VERIFICATION_PROFILE_REF_INVALID',
    invalidRequirementId: 'VERIFICATION_REQUIREMENT_ID_INVALID',
    invalidCheckId: 'VERIFICATION_CHECK_ID_INVALID',
    invalidCaseRevision: 'VERIFICATION_CASE_REVISION_INVALID',
    invalidOutcome: 'VERIFICATION_OUTCOME_INVALID',
    invalidReasonCode: 'VERIFICATION_REASON_CODE_INVALID',
    invalidSummary: 'VERIFICATION_SUMMARY_INVALID',
    invalidInputRefs: 'VERIFICATION_INPUT_REFS_INVALID',
    invalidExecutedAt: 'VERIFICATION_EXECUTED_AT_INVALID',
    invalidCanonicalVerificationRef: 'VERIFICATION_CANONICAL_VERIFICATION_REF_INVALID',
    invalidCorrelationId: 'VERIFICATION_CORRELATION_ID_INVALID',
});
/**
 * The bound on human-readable detail.
 *
 * A guard, not a semantic rule: long enough for the sentence or two a finding is
 * worth, short enough that the field cannot become a log sink, a document store
 * or an unbounded event payload. Internal, for the reason APV-04 kept its
 * cancellation-reason bound internal — the number is an implementation guard,
 * not a contract downstream should branch on.
 */
const SUMMARY_MAX_LENGTH = 1024;
/**
 * The bound on how much basis one execution may cite.
 *
 * Also a guard. A check that needed to name thousands of individual references
 * to explain itself is a check whose finding is not summarizable, and an audit
 * record that carried them would be unreadable by the humans it exists for.
 */
const INPUT_REFS_MAX_LENGTH = 256;
const EXECUTION_KEYS = [
    'outcome',
    'reasonCode',
    'summary',
    'inputRefs',
    'canonicalVerificationRef',
];
const RESULT_KEYS = [
    'schemaVersion',
    'executionId',
    'tenantId',
    'caseId',
    'profile',
    'requirementId',
    'checkId',
    'evaluatedCaseRevision',
    'outcome',
    'reasonCode',
    'summary',
    'inputRefs',
    'executedAt',
    'canonicalVerificationRef',
    'correlationId',
];
const INPUT_REF_KEYS = ['kind', 'ref'];
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
/**
 * A `CanonicalId` naming a Protocol record. Bounded and non-blank; never parsed,
 * never resolved, and never checked for existence — the same guard APV-04 uses
 * for the references it carries.
 */
function isCanonicalRecordId(value) {
    return (typeof value === 'string' &&
        value.trim() !== '' &&
        value.length <= case_identifiers_1.PROTOCOLIZATION_IDENTIFIER_MAX_LENGTH);
}
function isValidSummary(value) {
    return typeof value === 'string' && value.trim() !== '' && value.length <= SUMMARY_MAX_LENGTH;
}
function isValidInputRefList(value) {
    if (!Array.isArray(value) || value.length > INPUT_REFS_MAX_LENGTH)
        return false;
    for (const entry of value) {
        if (typeof entry !== 'object' || entry === null || Array.isArray(entry))
            return false;
        const candidate = entry;
        for (const key of Object.keys(candidate)) {
            if (!INPUT_REF_KEYS.includes(key))
                return false;
        }
        if (!(0, verification_result_1.isVerificationInputKind)(candidate.kind))
            return false;
        if (!isCanonicalRecordId(candidate.ref))
            return false;
    }
    return true;
}
/**
 * Validates what an executor returned, before it is allowed to become history.
 *
 * A present-but-`undefined` optional is invalid rather than absent — the same
 * rule every other validator in this package applies, because `{ reasonCode:
 * undefined }` and `{}` serialize differently and a store that round-trips one
 * into the other would change what the record says.
 */
function validateVerificationCheckExecution(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return { admitted: false, reasons: [exports.VERIFICATION_VALIDATION_CODES.notAnObject] };
    }
    const candidate = value;
    const reasons = [];
    for (const key of Object.keys(candidate)) {
        if (!EXECUTION_KEYS.includes(key)) {
            reasons.push(exports.VERIFICATION_VALIDATION_CODES.unknownField);
            break;
        }
    }
    if (!(0, verification_outcome_1.isVerificationCheckOutcome)(candidate.outcome)) {
        reasons.push(exports.VERIFICATION_VALIDATION_CODES.invalidOutcome);
    }
    if (hasOwn(candidate, 'reasonCode') && !(0, verification_identifiers_1.isValidVerificationReasonCode)(candidate.reasonCode)) {
        reasons.push(exports.VERIFICATION_VALIDATION_CODES.invalidReasonCode);
    }
    if (hasOwn(candidate, 'summary') && !isValidSummary(candidate.summary)) {
        reasons.push(exports.VERIFICATION_VALIDATION_CODES.invalidSummary);
    }
    if (hasOwn(candidate, 'inputRefs') && !isValidInputRefList(candidate.inputRefs)) {
        reasons.push(exports.VERIFICATION_VALIDATION_CODES.invalidInputRefs);
    }
    if (hasOwn(candidate, 'canonicalVerificationRef') &&
        !isCanonicalRecordId(candidate.canonicalVerificationRef)) {
        reasons.push(exports.VERIFICATION_VALIDATION_CODES.invalidCanonicalVerificationRef);
    }
    return { admitted: reasons.length === 0, reasons };
}
function isAdmissibleVerificationCheckExecution(value) {
    return validateVerificationCheckExecution(value).admitted;
}
/**
 * Validates a persisted result document.
 *
 * Structure only. It does not decide that the case still exists, that the
 * profile is still catalogued, that the revision is still current, or that the
 * outcome was correct — none of which a validator could know, and the last of
 * which nothing in this package may re-decide after the fact.
 */
function validateProtocolizationVerificationResult(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return { admitted: false, reasons: [exports.VERIFICATION_VALIDATION_CODES.notAnObject] };
    }
    const candidate = value;
    const reasons = [];
    for (const key of Object.keys(candidate)) {
        if (!RESULT_KEYS.includes(key)) {
            reasons.push(exports.VERIFICATION_VALIDATION_CODES.unknownField);
            break;
        }
    }
    if (candidate.schemaVersion !== verification_result_1.PROTOCOLIZATION_VERIFICATION_RESULT_SCHEMA_VERSION) {
        reasons.push(exports.VERIFICATION_VALIDATION_CODES.invalidSchemaVersion);
    }
    if (!(0, verification_identifiers_1.isValidVerificationExecutionId)(candidate.executionId)) {
        reasons.push(exports.VERIFICATION_VALIDATION_CODES.invalidExecutionId);
    }
    if (!(0, case_identifiers_1.isValidProtocolizationTenantId)(candidate.tenantId)) {
        reasons.push(exports.VERIFICATION_VALIDATION_CODES.invalidTenantId);
    }
    if (!(0, case_identifiers_1.isValidProtocolizationCaseId)(candidate.caseId)) {
        reasons.push(exports.VERIFICATION_VALIDATION_CODES.invalidCaseId);
    }
    if (!(0, case_identifiers_1.isValidProtocolizationProfileRef)(candidate.profile)) {
        reasons.push(exports.VERIFICATION_VALIDATION_CODES.invalidProfileRef);
    }
    if (!(0, identifiers_1.isValidAssetRequirementId)(candidate.requirementId)) {
        reasons.push(exports.VERIFICATION_VALIDATION_CODES.invalidRequirementId);
    }
    if (!(0, identifiers_1.isValidAssetVerificationCheckId)(candidate.checkId)) {
        reasons.push(exports.VERIFICATION_VALIDATION_CODES.invalidCheckId);
    }
    // A case revision is `1` at creation and only ever increments, so a result
    // claiming to have evaluated revision `0` — or a fractional one — describes a
    // case state that cannot exist.
    if (!Number.isSafeInteger(candidate.evaluatedCaseRevision) ||
        candidate.evaluatedCaseRevision < 1) {
        reasons.push(exports.VERIFICATION_VALIDATION_CODES.invalidCaseRevision);
    }
    if (!(0, verification_outcome_1.isVerificationCheckOutcome)(candidate.outcome)) {
        reasons.push(exports.VERIFICATION_VALIDATION_CODES.invalidOutcome);
    }
    if (hasOwn(candidate, 'reasonCode') && !(0, verification_identifiers_1.isValidVerificationReasonCode)(candidate.reasonCode)) {
        reasons.push(exports.VERIFICATION_VALIDATION_CODES.invalidReasonCode);
    }
    if (hasOwn(candidate, 'summary') && !isValidSummary(candidate.summary)) {
        reasons.push(exports.VERIFICATION_VALIDATION_CODES.invalidSummary);
    }
    if (hasOwn(candidate, 'inputRefs') && !isValidInputRefList(candidate.inputRefs)) {
        reasons.push(exports.VERIFICATION_VALIDATION_CODES.invalidInputRefs);
    }
    if (!(0, freshness_1.isValidUtcDateTime)(candidate.executedAt)) {
        reasons.push(exports.VERIFICATION_VALIDATION_CODES.invalidExecutedAt);
    }
    if (hasOwn(candidate, 'canonicalVerificationRef') &&
        !isCanonicalRecordId(candidate.canonicalVerificationRef)) {
        reasons.push(exports.VERIFICATION_VALIDATION_CODES.invalidCanonicalVerificationRef);
    }
    if (hasOwn(candidate, 'correlationId') && !isCanonicalRecordId(candidate.correlationId)) {
        reasons.push(exports.VERIFICATION_VALIDATION_CODES.invalidCorrelationId);
    }
    return { admitted: reasons.length === 0, reasons };
}
function isValidProtocolizationVerificationResult(value) {
    return validateProtocolizationVerificationResult(value).admitted;
}
