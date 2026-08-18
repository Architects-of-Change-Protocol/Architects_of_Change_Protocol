"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROTOCOLIZATION_CASE_VALIDATION_CODES = void 0;
exports.validateProtocolizationCase = validateProtocolizationCase;
exports.isValidProtocolizationCase = isValidProtocolizationCase;
const freshness_1 = require("../freshness");
const case_identifiers_1 = require("./case-identifiers");
const case_material_1 = require("./case-material");
const case_state_1 = require("./case-state");
const case_subject_1 = require("./case-subject");
const protocolization_case_1 = require("./protocolization-case");
/**
 * Structural and cross-field validation for a `ProtocolizationCase`.
 *
 * Follows APV-03's validator contract exactly — `{ valid, reasons, issues }`
 * with stable SCREAMING_SNAKE codes, shape only, fail-closed, and a
 * present-but-`undefined` optional treated as invalid rather than absent — so a
 * consumer that already handles `AssetProfileValidationResult` handles this
 * without learning a second convention.
 *
 * It exists because a persisted aggregate comes back as untrusted data.
 * "It was once internal" is not an integrity guarantee: a case can be
 * hand-edited in a store, truncated by a failed write, or produced by an older
 * version of this package, and letting arbitrary JSON become a trusted
 * aggregate would put every invariant the operations enforce at the mercy of
 * whatever the store happened to return.
 *
 * The profile is optional and additive. Without it this validates everything
 * that is true of a case on its own; with it, it additionally checks that every
 * requirement the case references is declared by the exact pinned profile
 * version.
 */
exports.PROTOCOLIZATION_CASE_VALIDATION_CODES = Object.freeze({
    invalidStructure: 'INVALID_CASE_STRUCTURE',
    unsupportedSchemaVersion: 'UNSUPPORTED_CASE_SCHEMA_VERSION',
    unknownCaseField: 'UNKNOWN_CASE_FIELD',
    invalidCaseId: 'INVALID_CASE_ID',
    invalidTenantId: 'INVALID_CASE_TENANT_ID',
    invalidProfileRef: 'INVALID_CASE_PROFILE_REF',
    invalidSubject: 'INVALID_CASE_SUBJECT',
    invalidState: 'INVALID_CASE_STATE',
    invalidRevision: 'INVALID_CASE_REVISION',
    invalidCreatedAt: 'INVALID_CASE_CREATED_AT',
    invalidUpdatedAt: 'INVALID_CASE_UPDATED_AT',
    updatedBeforeCreated: 'CASE_UPDATED_BEFORE_CREATED',
    invalidActivatedAt: 'INVALID_CASE_ACTIVATED_AT',
    unexpectedActivatedAt: 'UNEXPECTED_CASE_ACTIVATED_AT',
    invalidCancelledAt: 'INVALID_CASE_CANCELLED_AT',
    missingCancelledAt: 'MISSING_CASE_CANCELLED_AT',
    unexpectedCancelledAt: 'UNEXPECTED_CASE_CANCELLED_AT',
    invalidCancellationReason: 'INVALID_CASE_CANCELLATION_REASON',
    unexpectedCancellationReason: 'UNEXPECTED_CASE_CANCELLATION_REASON',
    invalidCorrelationId: 'INVALID_CASE_CORRELATION_ID',
    invalidRequirementStates: 'INVALID_CASE_REQUIREMENT_STATES',
    invalidRequirementState: 'INVALID_CASE_REQUIREMENT_STATE',
    duplicateRequirementStateId: 'DUPLICATE_CASE_REQUIREMENT_STATE_ID',
    requirementStatusMismatch: 'CASE_REQUIREMENT_STATUS_MISMATCH',
    requirementStateMaterialUnknown: 'CASE_REQUIREMENT_STATE_MATERIAL_UNKNOWN',
    requirementStateMaterialNotCorrelated: 'CASE_REQUIREMENT_STATE_MATERIAL_NOT_CORRELATED',
    invalidMaterials: 'INVALID_CASE_MATERIALS',
    invalidMaterial: 'INVALID_CASE_MATERIAL',
    duplicateMaterialId: 'DUPLICATE_CASE_MATERIAL_ID',
    materialRequirementNotProjected: 'CASE_MATERIAL_REQUIREMENT_NOT_PROJECTED',
    materialNotCorrelated: 'CASE_MATERIAL_NOT_CORRELATED',
    materialAddedBeforeCreated: 'CASE_MATERIAL_ADDED_BEFORE_CREATED',
    requirementNotInProfile: 'CASE_REQUIREMENT_NOT_IN_PROFILE',
    profileRefMismatch: 'CASE_PROFILE_REF_MISMATCH',
});
const CASE_KEYS = [
    'schemaVersion',
    'caseId',
    'tenantId',
    'profile',
    'subject',
    'state',
    'revision',
    'requirementStates',
    'materials',
    'createdAt',
    'updatedAt',
    'activatedAt',
    'cancelledAt',
    'cancellationReason',
    'correlationId',
];
const REQUIREMENT_STATE_KEYS = [
    'requirementId',
    'materialStatus',
    'materialIds',
    'firstMaterialAt',
    'updatedAt',
];
const MAX_CANCELLATION_REASON_LENGTH = 1024;
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
/** Canonical UTC instants are lexicographically ordered, so string compare is chronological. */
function isNotBefore(later, earlier) {
    return Date.parse(later) >= Date.parse(earlier);
}
function isValidRequirementStateShape(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return false;
    const candidate = value;
    for (const key of Object.keys(candidate)) {
        if (!REQUIREMENT_STATE_KEYS.includes(key))
            return false;
    }
    if (typeof candidate.requirementId !== 'string' || candidate.requirementId === '')
        return false;
    if (candidate.materialStatus !== case_state_1.ProtocolizationRequirementMaterialStatus.Pending &&
        candidate.materialStatus !== case_state_1.ProtocolizationRequirementMaterialStatus.MaterialPresent) {
        return false;
    }
    if (!Array.isArray(candidate.materialIds))
        return false;
    if (candidate.materialIds.some((entry) => typeof entry !== 'string' || entry === ''))
        return false;
    if (new Set(candidate.materialIds).size !== candidate.materialIds.length)
        return false;
    if (!(0, freshness_1.isValidUtcDateTime)(candidate.updatedAt))
        return false;
    if (hasOwn(candidate, 'firstMaterialAt') && !(0, freshness_1.isValidUtcDateTime)(candidate.firstMaterialAt))
        return false;
    const hasMaterial = candidate.materialIds.length > 0;
    if (hasMaterial !== hasOwn(candidate, 'firstMaterialAt'))
        return false;
    return true;
}
/*
 * One validator over one closed field set. Splitting it into per-field helpers
 * would spread a single document contract across call sites without removing a
 * branch, so it is deliberately long and flat — the same shape as
 * `validateAssetProfile`.
 */
function validateProtocolizationCase(value, options = {}) {
    const issues = [];
    const report = (code, path) => {
        issues.push({ code, path });
    };
    const result = () => ({
        valid: issues.length === 0,
        reasons: issues.map((issue) => issue.code),
        issues,
    });
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidStructure, '');
        return result();
    }
    const candidate = value;
    for (const key of Object.keys(candidate)) {
        if (!CASE_KEYS.includes(key))
            report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.unknownCaseField, key);
    }
    if (candidate.schemaVersion !== protocolization_case_1.PROTOCOLIZATION_CASE_SCHEMA_VERSION) {
        report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.unsupportedSchemaVersion, 'schemaVersion');
    }
    if (!(0, case_identifiers_1.isValidProtocolizationCaseId)(candidate.caseId)) {
        report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidCaseId, 'caseId');
    }
    if (!(0, case_identifiers_1.isValidProtocolizationTenantId)(candidate.tenantId)) {
        report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidTenantId, 'tenantId');
    }
    if (!(0, case_identifiers_1.isValidProtocolizationProfileRef)(candidate.profile)) {
        report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidProfileRef, 'profile');
    }
    if (!(0, case_subject_1.isValidProtocolizationCaseSubject)(candidate.subject)) {
        report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidSubject, 'subject');
    }
    if (!(0, case_state_1.isProtocolizationCaseState)(candidate.state)) {
        report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidState, 'state');
    }
    if (!Number.isSafeInteger(candidate.revision) || candidate.revision < 1) {
        report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidRevision, 'revision');
    }
    const createdAtValid = (0, freshness_1.isValidUtcDateTime)(candidate.createdAt);
    if (!createdAtValid)
        report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidCreatedAt, 'createdAt');
    const updatedAtValid = (0, freshness_1.isValidUtcDateTime)(candidate.updatedAt);
    if (!updatedAtValid)
        report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidUpdatedAt, 'updatedAt');
    if (createdAtValid &&
        updatedAtValid &&
        !isNotBefore(candidate.updatedAt, candidate.createdAt)) {
        report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.updatedBeforeCreated, 'updatedAt');
    }
    if (hasOwn(candidate, 'activatedAt')) {
        if (!(0, freshness_1.isValidUtcDateTime)(candidate.activatedAt)) {
            report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidActivatedAt, 'activatedAt');
        }
        else if (createdAtValid && !isNotBefore(candidate.activatedAt, candidate.createdAt)) {
            report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidActivatedAt, 'activatedAt');
        }
    }
    // A case is `Active` only by being activated, so the two must agree. A
    // `Cancelled` case may or may not have been activated first, which is why the
    // check is one-directional.
    if (candidate.state === case_state_1.ProtocolizationCaseState.Active && !hasOwn(candidate, 'activatedAt')) {
        report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidActivatedAt, 'activatedAt');
    }
    if (candidate.state === case_state_1.ProtocolizationCaseState.Draft && hasOwn(candidate, 'activatedAt')) {
        report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.unexpectedActivatedAt, 'activatedAt');
    }
    const cancelled = candidate.state === case_state_1.ProtocolizationCaseState.Cancelled;
    if (hasOwn(candidate, 'cancelledAt')) {
        if (!cancelled)
            report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.unexpectedCancelledAt, 'cancelledAt');
        if (!(0, freshness_1.isValidUtcDateTime)(candidate.cancelledAt)) {
            report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidCancelledAt, 'cancelledAt');
        }
        else if (createdAtValid && !isNotBefore(candidate.cancelledAt, candidate.createdAt)) {
            report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidCancelledAt, 'cancelledAt');
        }
    }
    else if (cancelled) {
        report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.missingCancelledAt, 'cancelledAt');
    }
    if (hasOwn(candidate, 'cancellationReason')) {
        if (!cancelled) {
            report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.unexpectedCancellationReason, 'cancellationReason');
        }
        if (typeof candidate.cancellationReason !== 'string' ||
            candidate.cancellationReason.trim() === '' ||
            candidate.cancellationReason.length > MAX_CANCELLATION_REASON_LENGTH) {
            report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidCancellationReason, 'cancellationReason');
        }
    }
    if (hasOwn(candidate, 'correlationId')) {
        if (typeof candidate.correlationId !== 'string' || candidate.correlationId.trim() === '') {
            report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidCorrelationId, 'correlationId');
        }
    }
    const materialIds = new Set();
    const materialRequirements = new Map();
    if (!Array.isArray(candidate.materials)) {
        report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidMaterials, 'materials');
    }
    else {
        candidate.materials.forEach((material, index) => {
            const path = `materials[${index}]`;
            if (!(0, case_material_1.isValidProtocolizationCaseMaterial)(material)) {
                report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidMaterial, path);
                return;
            }
            if (materialIds.has(material.materialId)) {
                report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.duplicateMaterialId, `${path}.materialId`);
            }
            materialIds.add(material.materialId);
            materialRequirements.set(material.materialId, new Set(material.requirementIds));
            if (createdAtValid && !isNotBefore(material.addedAt, candidate.createdAt)) {
                report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.materialAddedBeforeCreated, `${path}.addedAt`);
            }
        });
    }
    const projectedRequirementIds = new Set();
    if (!Array.isArray(candidate.requirementStates)) {
        report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidRequirementStates, 'requirementStates');
    }
    else {
        candidate.requirementStates.forEach((state, index) => {
            const path = `requirementStates[${index}]`;
            if (!isValidRequirementStateShape(state)) {
                report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidRequirementState, path);
                return;
            }
            const requirementId = state.requirementId;
            if (projectedRequirementIds.has(requirementId)) {
                report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.duplicateRequirementStateId, `${path}.requirementId`);
            }
            projectedRequirementIds.add(requirementId);
            const stateMaterialIds = state.materialIds;
            const expectedStatus = stateMaterialIds.length === 0
                ? case_state_1.ProtocolizationRequirementMaterialStatus.Pending
                : case_state_1.ProtocolizationRequirementMaterialStatus.MaterialPresent;
            if (state.materialStatus !== expectedStatus) {
                report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.requirementStatusMismatch, `${path}.materialStatus`);
            }
            for (const materialId of stateMaterialIds) {
                if (!materialIds.has(materialId)) {
                    report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.requirementStateMaterialUnknown, `${path}.materialIds`);
                    continue;
                }
                if (!materialRequirements.get(materialId)?.has(requirementId)) {
                    report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.requirementStateMaterialNotCorrelated, `${path}.materialIds`);
                }
            }
        });
    }
    // Every requirement a material names must be projected on the case, and the
    // projection must point back. A one-sided link means the two views of the same
    // correlation disagree, which is exactly what a later evaluator would read.
    if (Array.isArray(candidate.materials)) {
        candidate.materials.forEach((material, index) => {
            if (!(0, case_material_1.isValidProtocolizationCaseMaterial)(material))
                return;
            for (const requirementId of material.requirementIds) {
                if (!projectedRequirementIds.has(requirementId)) {
                    report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.materialRequirementNotProjected, `materials[${index}].requirementIds`);
                    continue;
                }
                const projected = candidate.requirementStates.find((state) => state.requirementId === requirementId);
                if (!projected?.materialIds?.includes(material.materialId)) {
                    report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.materialNotCorrelated, `materials[${index}].requirementIds`);
                }
            }
        });
    }
    const profile = options.profile;
    if (profile !== undefined) {
        if (!(0, case_identifiers_1.isValidProtocolizationProfileRef)(candidate.profile) ||
            !(0, case_identifiers_1.protocolizationProfileRefsEqual)(candidate.profile, {
                profileId: profile.profileId,
                profileVersion: profile.version,
            })) {
            report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.profileRefMismatch, 'profile');
        }
        else {
            const declared = new Set(profile.requirements.map((requirement) => requirement.id));
            for (const requirementId of projectedRequirementIds) {
                if (!declared.has(requirementId)) {
                    report(exports.PROTOCOLIZATION_CASE_VALIDATION_CODES.requirementNotInProfile, 'requirementStates');
                }
            }
        }
    }
    return result();
}
function isValidProtocolizationCase(value, options = {}) {
    return validateProtocolizationCase(value, options).valid;
}
