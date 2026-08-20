"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROFESSIONAL_REVIEW_VALIDATION_CODES = void 0;
exports.isUsablePrincipalRef = isUsablePrincipalRef;
exports.isUsableCredentialRef = isUsableCredentialRef;
exports.validateProfessionalReviewScope = validateProfessionalReviewScope;
exports.isValidProfessionalReviewScope = isValidProfessionalReviewScope;
exports.validateProfessionalReviewRequest = validateProfessionalReviewRequest;
exports.isValidProfessionalReviewRequest = isValidProfessionalReviewRequest;
exports.validateProfessionalReviewDecision = validateProfessionalReviewDecision;
exports.isValidProfessionalReviewDecision = isValidProfessionalReviewDecision;
const claims_1 = require("@aoc/protocol/claims");
const identity_1 = require("@aoc/protocol/identity");
const freshness_1 = require("../freshness");
const identifiers_1 = require("../identifiers");
const case_identifiers_1 = require("../case/case-identifiers");
const evidence_intake_identifiers_1 = require("../evidence/evidence-intake-identifiers");
const review_actions_1 = require("./review-actions");
const review_decision_1 = require("./review-decision");
const review_identifiers_1 = require("./review-identifiers");
const review_request_1 = require("./review-request");
const review_scope_1 = require("./review-scope");
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
exports.PROFESSIONAL_REVIEW_VALIDATION_CODES = Object.freeze({
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
});
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
const SCOPE_KEYS = [
    'requirementId',
    'attestationType',
    'subjectRef',
    'caseRevision',
    'propositionRefs',
    'scopeStatement',
    'limitations',
];
const BASIS_REF_KEYS = ['kind', 'ref'];
const MATERIAL_REQUEST_KEYS = [
    'requirementId',
    'evidenceCategoryId',
    'reasonCode',
    'note',
];
const REQUEST_KEYS = [
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
const DECISION_KEYS = [
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
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function hasOnlyKeys(value, keys) {
    return Object.keys(value).every((key) => keys.includes(key));
}
/**
 * A `CanonicalId` naming a Protocol record. Bounded and non-blank; never parsed,
 * never resolved, and never checked for existence — the same guard APV-04 and
 * APV-07 use for the references they carry.
 */
function isCanonicalRecordId(value) {
    return (typeof value === 'string' &&
        value.trim() !== '' &&
        value.length <= case_identifiers_1.PROTOCOLIZATION_IDENTIFIER_MAX_LENGTH);
}
function isBoundedText(value, max) {
    return typeof value === 'string' && value.trim() !== '' && value.length <= max;
}
function isCaseRevision(value) {
    // A case revision is `1` at creation and only ever increments, so a record
    // claiming revision `0` — or a fractional one — describes a state that cannot
    // exist.
    return Number.isSafeInteger(value) && value >= 1;
}
function isAttestationType(value) {
    return typeof value === 'string' && Object.values(claims_1.AttestationType).includes(value);
}
/**
 * A principal reference this workflow will carry.
 *
 * The minimum that makes one usable as a reviewer: it names a principal, of a
 * kind Protocol defines. Restating `CanonicalPrincipalRef`'s full shape here
 * would be a second, drifting copy of a Protocol contract, which is precisely
 * what this package must not build.
 */
function isUsablePrincipalRef(value) {
    if (!isPlainObject(value))
        return false;
    if (!isCanonicalRecordId(value.id))
        return false;
    return typeof value.kind === 'string' && Object.values(claims_1.PrincipalKind).includes(value.kind);
}
/**
 * A credential reference this workflow will carry.
 *
 * Identity and type only. Whether the credential exists, is current, is genuine
 * or confers any authority is emphatically not decided here — this package
 * cannot dereference a credential and must not pretend otherwise.
 */
function isUsableCredentialRef(value) {
    if (!isPlainObject(value))
        return false;
    if (!isCanonicalRecordId(value.id))
        return false;
    return typeof value.type === 'string' && Object.values(claims_1.CredentialType).includes(value.type);
}
function isValidBasisRefList(value) {
    if (!Array.isArray(value) || value.length === 0 || value.length > BASIS_REFS_MAX_COUNT) {
        return false;
    }
    for (const entry of value) {
        if (!isPlainObject(entry) || !hasOnlyKeys(entry, BASIS_REF_KEYS))
            return false;
        if (!(0, review_scope_1.isProfessionalReviewBasisKind)(entry.kind))
            return false;
        if (!isCanonicalRecordId(entry.ref))
            return false;
    }
    return true;
}
function isValidCredentialRefList(value) {
    if (!Array.isArray(value) || value.length === 0 || value.length > CREDENTIAL_REFS_MAX_COUNT) {
        return false;
    }
    return value.every((entry) => isUsableCredentialRef(entry));
}
function isValidMaterialRequestList(value) {
    if (!Array.isArray(value) || value.length === 0 || value.length > MATERIAL_REQUESTS_MAX_COUNT) {
        return false;
    }
    for (const entry of value) {
        if (!isPlainObject(entry) || !hasOnlyKeys(entry, MATERIAL_REQUEST_KEYS))
            return false;
        if (!(0, review_identifiers_1.isValidProfessionalReviewReasonCode)(entry.reasonCode))
            return false;
        if (hasOwn(entry, 'requirementId') && !(0, identifiers_1.isValidAssetRequirementId)(entry.requirementId)) {
            return false;
        }
        if (hasOwn(entry, 'evidenceCategoryId') &&
            !(0, evidence_intake_identifiers_1.isValidEvidenceIntakeCategoryId)(entry.evidenceCategoryId)) {
            return false;
        }
        // A request naming neither a requirement nor an intake category is a
        // request nothing can route. Prose alone is never a machine-readable need.
        if (!hasOwn(entry, 'requirementId') && !hasOwn(entry, 'evidenceCategoryId'))
            return false;
        if (hasOwn(entry, 'note') && !isBoundedText(entry.note, NOTE_MAX_LENGTH))
            return false;
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
function validateProfessionalReviewScope(value) {
    if (!isPlainObject(value)) {
        return { admitted: false, reasons: [exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.notAnObject] };
    }
    const reasons = [];
    if (!hasOnlyKeys(value, SCOPE_KEYS)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.unknownField);
    }
    if (!(0, identifiers_1.isValidAssetRequirementId)(value.requirementId)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidRequirementId);
    }
    if (!isAttestationType(value.attestationType)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidAttestationType);
    }
    if (!(0, identity_1.isValidSovereignSubjectRef)(value.subjectRef)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidScope);
    }
    if (!isCaseRevision(value.caseRevision)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidBasisRevision);
    }
    if (!isValidBasisRefList(value.propositionRefs)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidScope);
    }
    if (hasOwn(value, 'scopeStatement') &&
        !isBoundedText(value.scopeStatement, SCOPE_STATEMENT_MAX_LENGTH)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidScope);
    }
    if (hasOwn(value, 'limitations')) {
        const limitations = value.limitations;
        const usable = Array.isArray(limitations) &&
            limitations.length > 0 &&
            limitations.length <= LIMITATIONS_MAX_COUNT &&
            limitations.every((entry) => isBoundedText(entry, LIMITATION_MAX_LENGTH));
        if (!usable)
            reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidScope);
    }
    return { admitted: reasons.length === 0, reasons };
}
function isValidProfessionalReviewScope(value) {
    return validateProfessionalReviewScope(value).admitted;
}
/**
 * Validates a persisted review request.
 *
 * Structure only. It does not decide that the case still exists, that the
 * profile is still catalogued, that the revision is still current, or that
 * anyone ever reviewed it.
 */
function validateProfessionalReviewRequest(value) {
    if (!isPlainObject(value)) {
        return { admitted: false, reasons: [exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.notAnObject] };
    }
    const reasons = [];
    if (!hasOnlyKeys(value, REQUEST_KEYS)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.unknownField);
    }
    if (value.schemaVersion !== review_request_1.PROFESSIONAL_REVIEW_REQUEST_SCHEMA_VERSION) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidSchemaVersion);
    }
    if (!(0, review_identifiers_1.isValidProfessionalReviewRequestId)(value.reviewRequestId)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidRequestId);
    }
    if (!(0, case_identifiers_1.isValidProtocolizationTenantId)(value.tenantId)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidTenantId);
    }
    if (!(0, case_identifiers_1.isValidProtocolizationCaseId)(value.caseId)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidCaseId);
    }
    if (!(0, case_identifiers_1.isValidProtocolizationProfileRef)(value.profile)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidProfileRef);
    }
    if (!(0, identifiers_1.isValidAssetRequirementId)(value.attestationRequirementId)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidRequirementId);
    }
    if (!isAttestationType(value.requestedAttestationType)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidAttestationType);
    }
    const scope = validateProfessionalReviewScope(value.requestedScope);
    if (!scope.admitted) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidScope);
    }
    if (!isCaseRevision(value.reviewBasisRevision)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidBasisRevision);
    }
    // A scope that disagreed with the request it belongs to would let a reader
    // answer "which revision was reviewed?" two different ways.
    if (scope.admitted &&
        isCaseRevision(value.reviewBasisRevision) &&
        value.requestedScope.caseRevision !== value.reviewBasisRevision) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidScope);
    }
    if (scope.admitted &&
        value.requestedScope.requirementId !==
            value.attestationRequirementId) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidScope);
    }
    if (scope.admitted &&
        value.requestedScope.attestationType !==
            value.requestedAttestationType) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidScope);
    }
    if (!(0, freshness_1.isValidUtcDateTime)(value.requestedAt)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidRequestedAt);
    }
    if (hasOwn(value, 'correlationId') && !isCanonicalRecordId(value.correlationId)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidCorrelationId);
    }
    return { admitted: reasons.length === 0, reasons };
}
function isValidProfessionalReviewRequest(value) {
    return validateProfessionalReviewRequest(value).admitted;
}
/**
 * The fields each action does, and does not, carry.
 *
 * This table is what makes the four actions mutually explicit at the type
 * boundary rather than only in prose. `required` fields must be present;
 * `forbidden` fields must be absent.
 */
const ACTION_FIELD_RULES = Object.freeze({
    [review_actions_1.ProfessionalReviewAction.Attest]: {
        required: ['scope', 'reviewedRefs'],
        forbidden: ['requestedMaterial'],
    },
    [review_actions_1.ProfessionalReviewAction.Reject]: {
        required: ['reasonCode'],
        forbidden: [
            'scope',
            'requestedMaterial',
            'canonicalAttestationRef',
            'attestationMaterialId',
            'resultingCaseRevision',
        ],
    },
    [review_actions_1.ProfessionalReviewAction.RequestMoreEvidence]: {
        required: ['reasonCode', 'requestedMaterial'],
        forbidden: [
            'scope',
            'canonicalAttestationRef',
            'attestationMaterialId',
            'resultingCaseRevision',
        ],
    },
    [review_actions_1.ProfessionalReviewAction.Abstain]: {
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
function validateProfessionalReviewDecision(value) {
    if (!isPlainObject(value)) {
        return { admitted: false, reasons: [exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.notAnObject] };
    }
    const reasons = [];
    if (!hasOnlyKeys(value, DECISION_KEYS)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.unknownField);
    }
    if (value.schemaVersion !== review_decision_1.PROFESSIONAL_REVIEW_DECISION_SCHEMA_VERSION) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidSchemaVersion);
    }
    if (!(0, review_identifiers_1.isValidProfessionalReviewDecisionId)(value.decisionId)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidDecisionId);
    }
    if (!(0, review_identifiers_1.isValidProfessionalReviewRequestId)(value.reviewRequestId)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidRequestId);
    }
    if (!(0, case_identifiers_1.isValidProtocolizationTenantId)(value.tenantId)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidTenantId);
    }
    if (!(0, case_identifiers_1.isValidProtocolizationCaseId)(value.caseId)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidCaseId);
    }
    if (!(0, case_identifiers_1.isValidProtocolizationProfileRef)(value.profile)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidProfileRef);
    }
    if (!(0, identifiers_1.isValidAssetRequirementId)(value.attestationRequirementId)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidRequirementId);
    }
    if (!isUsablePrincipalRef(value.reviewer)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidReviewer);
    }
    if (hasOwn(value, 'reviewerCredentialRefs') &&
        !isValidCredentialRefList(value.reviewerCredentialRefs)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidCredentialRefs);
    }
    if (!(0, review_actions_1.isProfessionalReviewAction)(value.action)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidAction);
    }
    if (hasOwn(value, 'scope') && !isValidProfessionalReviewScope(value.scope)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidScope);
    }
    if (!isCaseRevision(value.reviewBasisRevision)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidBasisRevision);
    }
    if (hasOwn(value, 'resultingCaseRevision')) {
        // The case gained material because of this decision, so the resulting
        // revision is strictly after the one that was reviewed. Equal or earlier
        // would describe a mutation that did not happen, or one that ran backwards.
        const resulting = value.resultingCaseRevision;
        const coherent = isCaseRevision(resulting) &&
            isCaseRevision(value.reviewBasisRevision) &&
            resulting > value.reviewBasisRevision;
        if (!coherent)
            reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidResultingRevision);
    }
    if (hasOwn(value, 'reviewedRefs') && !isValidBasisRefList(value.reviewedRefs)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidReviewedRefs);
    }
    if (hasOwn(value, 'reasonCode') && !(0, review_identifiers_1.isValidProfessionalReviewReasonCode)(value.reasonCode)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidReasonCode);
    }
    if (hasOwn(value, 'requestedMaterial') && !isValidMaterialRequestList(value.requestedMaterial)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidRequestedMaterial);
    }
    if (hasOwn(value, 'note') && !isBoundedText(value.note, NOTE_MAX_LENGTH)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidNote);
    }
    if (hasOwn(value, 'canonicalAttestationRef') &&
        !isCanonicalRecordId(value.canonicalAttestationRef)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidAttestationRef);
    }
    if (hasOwn(value, 'attestationMaterialId') &&
        !(0, case_identifiers_1.isValidProtocolizationMaterialId)(value.attestationMaterialId)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidMaterialId);
    }
    if (!(0, freshness_1.isValidUtcDateTime)(value.decidedAt)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidDecidedAt);
    }
    if (hasOwn(value, 'correlationId') && !isCanonicalRecordId(value.correlationId)) {
        reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidCorrelationId);
    }
    if ((0, review_actions_1.isProfessionalReviewAction)(value.action)) {
        const rules = ACTION_FIELD_RULES[value.action];
        if (rules.required.some((field) => !hasOwn(value, field))) {
            reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.actionFieldMissing);
        }
        if (rules.forbidden.some((field) => hasOwn(value, field))) {
            reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.actionFieldUnexpected);
        }
        // An attestation reference and the material association it produced travel
        // together or not at all: one without the other describes half an event.
        if (hasOwn(value, 'canonicalAttestationRef') !== hasOwn(value, 'attestationMaterialId') ||
            hasOwn(value, 'canonicalAttestationRef') !== hasOwn(value, 'resultingCaseRevision')) {
            reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.actionFieldMissing);
        }
        if (value.action === review_actions_1.ProfessionalReviewAction.Attest &&
            isValidProfessionalReviewScope(value.scope) &&
            isCaseRevision(value.reviewBasisRevision) &&
            (value.scope.caseRevision !== value.reviewBasisRevision ||
                value.scope.requirementId !== value.attestationRequirementId)) {
            reasons.push(exports.PROFESSIONAL_REVIEW_VALIDATION_CODES.invalidScope);
        }
    }
    return { admitted: reasons.length === 0, reasons };
}
function isValidProfessionalReviewDecision(value) {
    return validateProfessionalReviewDecision(value).admitted;
}
