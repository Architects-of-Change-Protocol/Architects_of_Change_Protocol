"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProtocolizationCase = createProtocolizationCase;
exports.activateProtocolizationCase = activateProtocolizationCase;
exports.addProtocolizationCaseMaterial = addProtocolizationCaseMaterial;
exports.associateProtocolizationCaseMaterial = associateProtocolizationCaseMaterial;
exports.cancelProtocolizationCase = cancelProtocolizationCase;
exports.reconstituteProtocolizationCase = reconstituteProtocolizationCase;
const freshness_1 = require("../freshness");
const case_errors_1 = require("./case-errors");
const case_events_1 = require("./case-events");
const case_freeze_1 = require("./case-freeze");
const case_identifiers_1 = require("./case-identifiers");
const case_material_1 = require("./case-material");
const case_state_1 = require("./case-state");
const case_subject_1 = require("./case-subject");
const case_validation_1 = require("./case-validation");
const protocolization_case_1 = require("./protocolization-case");
const MAX_CANCELLATION_REASON_LENGTH = 1024;
function fail(code, message, details) {
    throw new case_errors_1.ProtocolizationCaseError(code, message, details);
}
function assertActingTenant(context) {
    if (!(0, case_identifiers_1.isValidProtocolizationTenantId)(context.tenantId)) {
        fail(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.invalidTenant, 'A non-blank acting tenantId is required', {
            reasonCodes: [case_validation_1.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidTenantId],
        });
    }
    return context.tenantId;
}
/**
 * Re-validates the aggregate before touching it, then checks the tenant.
 *
 * The aggregate is re-validated on every operation because it may have arrived
 * from a store, from a network boundary, or from a caller that built it by
 * hand. Operating on a case whose invariants are already broken would produce a
 * new case that is broken in a different way, and the error would surface far
 * from its cause.
 */
function assertOperableCase(context, protocolizationCase) {
    const validation = (0, case_validation_1.validateProtocolizationCase)(protocolizationCase);
    if (!validation.valid) {
        fail(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.invalidCase, `Invalid ProtocolizationCase: ${validation.reasons.join(', ')}`, { reasonCodes: validation.reasons });
    }
    const actingTenant = assertActingTenant(context);
    if (protocolizationCase.tenantId !== actingTenant) {
        fail(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.tenantMismatch, 'The acting tenant does not own this ProtocolizationCase', {
            reasonCodes: [case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.tenantMismatch],
            caseId: protocolizationCase.caseId,
            tenantId: actingTenant,
        });
    }
    return protocolizationCase;
}
/**
 * Resolves the exact pinned version and nothing else.
 *
 * There is no fallback to a latest, current or nearest version anywhere in this
 * package. A profile that has been withdrawn from a catalogue makes its cases
 * fail loudly rather than quietly reassessing them under different rules.
 */
function resolvePinnedProfile(context, ref, caseId) {
    const resolved = context.catalog.get(ref.profileId, ref.profileVersion);
    if (resolved === undefined) {
        fail(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.profileNotFound, `No AssetProfile ${ref.profileId}@${ref.profileVersion} is catalogued`, {
            reasonCodes: [case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.profileNotFound],
            profile: ref,
            ...(caseId === undefined ? {} : { caseId }),
        });
    }
    return resolved;
}
/**
 * Reads the clock and refuses anything that is not a canonical UTC instant, or
 * that would move the case backwards in time. A monotonicity break is a
 * misconfigured clock, and accepting one would produce an aggregate whose own
 * history contradicts itself.
 */
function readClock(context, notBefore) {
    const now = context.clock.now();
    if (!(0, freshness_1.isValidUtcDateTime)(now)) {
        fail(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.invalidTimestamp, 'The clock returned a non-canonical instant', {
            reasonCodes: [case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.invalidTimestamp],
        });
    }
    if (notBefore !== undefined && Date.parse(now) < Date.parse(notBefore)) {
        fail(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.invalidTimestamp, 'The clock moved backwards', {
            reasonCodes: [case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.invalidTimestamp],
        });
    }
    return now;
}
function assertKnownRequirements(requirementIds, profile, protocolizationCase) {
    if (requirementIds.length === 0) {
        fail(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.unknownRequirement, 'At least one requirement id is required', {
            reasonCodes: [case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.unknownRequirement],
            caseId: protocolizationCase.caseId,
            requirementIds,
        });
    }
    if (new Set(requirementIds).size !== requirementIds.length) {
        fail(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.duplicateAssociation, 'Duplicate requirement id', {
            reasonCodes: [case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.duplicateAssociation],
            caseId: protocolizationCase.caseId,
            requirementIds,
        });
    }
    // Checked against the pinned profile *and* the case's own projection. The two
    // agree by construction, and checking both is what makes a requirement id
    // borrowed from a different profile version fail rather than accumulate.
    const declared = new Set(profile.requirements.map((requirement) => requirement.id));
    const projected = new Set(protocolizationCase.requirementStates.map((state) => state.requirementId));
    const unknown = requirementIds.filter((id) => !declared.has(id) || !projected.has(id));
    if (unknown.length > 0) {
        fail(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.unknownRequirement, `Requirement not declared by ${protocolizationCase.profile.profileId}@${protocolizationCase.profile.profileVersion}: ${unknown.join(', ')}`, {
            reasonCodes: [case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.unknownRequirement],
            caseId: protocolizationCase.caseId,
            profile: protocolizationCase.profile,
            requirementIds: unknown,
        });
    }
}
/** Adds one material id to each named requirement's state, in association order. */
function correlate(requirementStates, requirementIds, materialId, at) {
    const targeted = new Set(requirementIds);
    return requirementStates.map((state) => {
        if (!targeted.has(state.requirementId))
            return state;
        const materialIds = [...state.materialIds, materialId];
        return {
            requirementId: state.requirementId,
            materialStatus: case_state_1.ProtocolizationRequirementMaterialStatus.MaterialPresent,
            materialIds,
            firstMaterialAt: state.firstMaterialAt ?? at,
            updatedAt: at,
        };
    });
}
/**
 * The last gate before an aggregate leaves this module.
 *
 * An operation either returns a valid case or throws. It never returns a
 * partially valid one, so a caller that receives a case never has to ask
 * whether it is trustworthy.
 */
function sealed(protocolizationCase) {
    const validation = (0, case_validation_1.validateProtocolizationCase)(protocolizationCase);
    if (!validation.valid) {
        fail(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.invalidCase, `Refusing to produce an invalid ProtocolizationCase: ${validation.reasons.join(', ')}`, { reasonCodes: validation.reasons });
    }
    return (0, case_freeze_1.deepFreeze)(protocolizationCase);
}
/**
 * Creates a case, or fails.
 *
 * Centralized deliberately: a case built from an object literal somewhere else
 * could carry an unpinned profile, an absent tenant, a requirement projection
 * that does not match the profile, or a state that no transition can produce.
 * This is the only way to obtain a case that has never been persisted.
 *
 * Resolution of the exact `(profileId, profileVersion)` pair is a precondition,
 * not a convenience: a case whose rules cannot be read is a case nobody can
 * assess, and discovering that at readiness time rather than at intake is the
 * expensive order to discover it in.
 */
function createProtocolizationCase(context, input) {
    const tenantId = assertActingTenant(context);
    const reasons = [];
    if (!(0, case_identifiers_1.isValidProtocolizationCaseId)(input.caseId)) {
        reasons.push(case_validation_1.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidCaseId);
    }
    if (!(0, case_identifiers_1.isValidProtocolizationProfileRef)(input.profile)) {
        reasons.push(case_validation_1.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidProfileRef);
    }
    if (!(0, case_subject_1.isValidProtocolizationCaseSubject)(input.subject)) {
        reasons.push(case_validation_1.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidSubject);
    }
    if (input.correlationId !== undefined &&
        (typeof input.correlationId !== 'string' || input.correlationId.trim() === '')) {
        reasons.push(case_validation_1.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidCorrelationId);
    }
    if (reasons.length > 0) {
        fail(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.invalidCase, `Cannot create ProtocolizationCase: ${reasons.join(', ')}`, { reasonCodes: reasons, tenantId });
    }
    const profile = resolvePinnedProfile(context, input.profile, input.caseId);
    const createdAt = readClock(context);
    const requirementStates = profile.requirements.map((requirement) => ({
        requirementId: requirement.id,
        materialStatus: case_state_1.ProtocolizationRequirementMaterialStatus.Pending,
        materialIds: [],
        updatedAt: createdAt,
    }));
    const protocolizationCase = {
        schemaVersion: protocolization_case_1.PROTOCOLIZATION_CASE_SCHEMA_VERSION,
        caseId: input.caseId,
        tenantId,
        // Copied field by field rather than spread, so the pin is exactly the two
        // frozen fields and a caller cannot smuggle a third one onto the case.
        profile: { profileId: input.profile.profileId, profileVersion: input.profile.profileVersion },
        subject: input.subject,
        state: case_state_1.INITIAL_PROTOCOLIZATION_CASE_STATE,
        revision: 1,
        requirementStates,
        materials: [],
        createdAt,
        updatedAt: createdAt,
        ...(input.correlationId === undefined ? {} : { correlationId: input.correlationId }),
    };
    return {
        protocolizationCase: sealed(protocolizationCase),
        event: (0, case_freeze_1.deepFreeze)({
            eventType: case_events_1.PROTOCOLIZATION_CASE_EVENT_TYPES.created,
            caseId: protocolizationCase.caseId,
            tenantId,
            profile: protocolizationCase.profile,
            caseRevision: protocolizationCase.revision,
            occurredAt: createdAt,
            subjectRef: input.subject.subjectRef,
            requirementIds: requirementStates.map((state) => state.requirementId),
            ...(input.correlationId === undefined ? {} : { correlationId: input.correlationId }),
        }),
    };
}
/**
 * `Draft -> Active`. The case has been taken up for processing.
 *
 * Activation says nothing about completeness. It does not assert that the
 * subject is identified, that required material has arrived, or that anything
 * has been checked — it records that work on this case has begun.
 */
function activateProtocolizationCase(context, protocolizationCase) {
    const current = assertOperableCase(context, protocolizationCase);
    assertTransition(current, case_state_1.ProtocolizationCaseState.Active);
    const occurredAt = readClock(context, current.updatedAt);
    const next = {
        ...current,
        state: case_state_1.ProtocolizationCaseState.Active,
        revision: current.revision + 1,
        updatedAt: occurredAt,
        activatedAt: occurredAt,
    };
    return {
        protocolizationCase: sealed(next),
        event: (0, case_freeze_1.deepFreeze)({
            eventType: case_events_1.PROTOCOLIZATION_CASE_EVENT_TYPES.activated,
            caseId: next.caseId,
            tenantId: next.tenantId,
            profile: next.profile,
            caseRevision: next.revision,
            occurredAt,
            ...(next.correlationId === undefined ? {} : { correlationId: next.correlationId }),
        }),
    };
}
function assertTransition(current, to) {
    if (!(0, case_state_1.isAllowedProtocolizationCaseTransition)(current.state, to)) {
        fail(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.invalidTransition, `A ProtocolizationCase cannot move from ${current.state} to ${to}`, {
            reasonCodes: [case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.invalidTransition],
            caseId: current.caseId,
            fromState: current.state,
            toState: to,
        });
    }
}
/**
 * Records that the case was told about a reference, against one or more
 * requirements of its pinned profile.
 *
 * This is an association, not an assertion. A case that has been given an
 * attestation reference is not attested; a case that has been given a
 * verification reference has not been verified; a case whose every required
 * requirement has material is not ready. Deciding any of those needs the
 * referenced records themselves and an evaluator that does not exist in this
 * slice.
 */
function addProtocolizationCaseMaterial(context, protocolizationCase, input) {
    const current = assertOperableCase(context, protocolizationCase);
    if (!(0, case_state_1.acceptsProtocolizationMaterial)(current.state)) {
        fail(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.invalidTransition, `A ${current.state} ProtocolizationCase does not accept material`, {
            reasonCodes: [case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.invalidTransition],
            caseId: current.caseId,
            fromState: current.state,
        });
    }
    const profile = resolvePinnedProfile(context, current.profile, current.caseId);
    if (current.materials.some((material) => material.materialId === input.materialId)) {
        fail(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.duplicateMaterial, `Material ${String(input.materialId)} already exists in this case`, {
            reasonCodes: [case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.duplicateMaterial],
            caseId: current.caseId,
            materialId: input.materialId,
        });
    }
    assertKnownRequirements(input.requirementIds, profile, current);
    const addedAt = readClock(context, current.updatedAt);
    const material = { ...input, addedAt };
    if (!(0, case_material_1.isValidProtocolizationCaseMaterial)(material)) {
        fail(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.invalidCase, 'Malformed case material', {
            reasonCodes: [case_validation_1.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidMaterial],
            caseId: current.caseId,
            materialId: input.materialId,
        });
    }
    const next = {
        ...current,
        revision: current.revision + 1,
        updatedAt: addedAt,
        materials: [...current.materials, material],
        requirementStates: correlate(current.requirementStates, material.requirementIds, material.materialId, addedAt),
    };
    return {
        protocolizationCase: sealed(next),
        event: (0, case_freeze_1.deepFreeze)({
            eventType: case_events_1.PROTOCOLIZATION_CASE_EVENT_TYPES.materialAdded,
            caseId: next.caseId,
            tenantId: next.tenantId,
            profile: next.profile,
            caseRevision: next.revision,
            occurredAt: addedAt,
            materialId: material.materialId,
            materialKind: material.kind,
            requirementIds: material.requirementIds,
            ...(material.correlationId === undefined ? {} : { correlationId: material.correlationId }),
        }),
    };
}
/**
 * Correlates an existing material with further requirements of the pinned
 * profile — one document that answers two requirements, recorded once and
 * pointed at both.
 *
 * Re-associating a material with a requirement it already answers is rejected
 * rather than ignored. A silent no-op would either emit an event describing an
 * association that did not happen or report success while emitting nothing, and
 * both leave an audit reader with a false account of the case.
 */
function associateProtocolizationCaseMaterial(context, protocolizationCase, input) {
    const current = assertOperableCase(context, protocolizationCase);
    if (!(0, case_state_1.acceptsProtocolizationMaterial)(current.state)) {
        fail(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.invalidTransition, `A ${current.state} ProtocolizationCase does not accept material`, {
            reasonCodes: [case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.invalidTransition],
            caseId: current.caseId,
            fromState: current.state,
        });
    }
    const profile = resolvePinnedProfile(context, current.profile, current.caseId);
    const existing = current.materials.find((material) => material.materialId === input.materialId);
    if (existing === undefined) {
        fail(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.unknownMaterial, `No material ${String(input.materialId)} exists in this case`, {
            reasonCodes: [case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.unknownMaterial],
            caseId: current.caseId,
            materialId: input.materialId,
        });
    }
    assertKnownRequirements(input.requirementIds, profile, current);
    const alreadyAssociated = input.requirementIds.filter((id) => existing.requirementIds.includes(id));
    if (alreadyAssociated.length > 0) {
        fail(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.duplicateAssociation, `Material ${String(input.materialId)} is already associated with: ${alreadyAssociated.join(', ')}`, {
            reasonCodes: [case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.duplicateAssociation],
            caseId: current.caseId,
            materialId: input.materialId,
            requirementIds: alreadyAssociated,
        });
    }
    const occurredAt = readClock(context, current.updatedAt);
    const next = {
        ...current,
        revision: current.revision + 1,
        updatedAt: occurredAt,
        materials: current.materials.map((material) => material.materialId === input.materialId
            ? { ...material, requirementIds: [...material.requirementIds, ...input.requirementIds] }
            : material),
        requirementStates: correlate(current.requirementStates, input.requirementIds, input.materialId, occurredAt),
    };
    return {
        protocolizationCase: sealed(next),
        event: (0, case_freeze_1.deepFreeze)({
            eventType: case_events_1.PROTOCOLIZATION_CASE_EVENT_TYPES.materialAssociated,
            caseId: next.caseId,
            tenantId: next.tenantId,
            profile: next.profile,
            caseRevision: next.revision,
            occurredAt,
            materialId: input.materialId,
            requirementIds: input.requirementIds,
            ...(existing.correlationId === undefined ? {} : { correlationId: existing.correlationId }),
        }),
    };
}
/**
 * `Draft | Active -> Cancelled`. Terminal.
 *
 * Cancellation is a state, not a deletion. The case keeps its profile pin, its
 * subject, every material association it accumulated and every timestamp,
 * because the auditable question "what was attempted, and what was supplied,
 * before this was abandoned?" has to stay answerable. Erasure is a data-lifecycle
 * concern with its own authority and retention questions; it is not what
 * cancelling a case means.
 *
 * Cancelling a cancelled case fails rather than succeeding idempotently: the
 * second call would either invent a second cancellation event or claim success
 * with nothing to show for it.
 */
function cancelProtocolizationCase(context, protocolizationCase, input = {}) {
    const current = assertOperableCase(context, protocolizationCase);
    assertTransition(current, case_state_1.ProtocolizationCaseState.Cancelled);
    if (input.reason !== undefined &&
        (typeof input.reason !== 'string' ||
            input.reason.trim() === '' ||
            input.reason.length > MAX_CANCELLATION_REASON_LENGTH)) {
        fail(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.invalidCase, 'Malformed cancellation reason', {
            reasonCodes: [case_validation_1.PROTOCOLIZATION_CASE_VALIDATION_CODES.invalidCancellationReason],
            caseId: current.caseId,
        });
    }
    const occurredAt = readClock(context, current.updatedAt);
    const next = {
        ...current,
        state: case_state_1.ProtocolizationCaseState.Cancelled,
        revision: current.revision + 1,
        updatedAt: occurredAt,
        cancelledAt: occurredAt,
        ...(input.reason === undefined ? {} : { cancellationReason: input.reason }),
    };
    return {
        protocolizationCase: sealed(next),
        event: (0, case_freeze_1.deepFreeze)({
            eventType: case_events_1.PROTOCOLIZATION_CASE_EVENT_TYPES.cancelled,
            caseId: next.caseId,
            tenantId: next.tenantId,
            profile: next.profile,
            caseRevision: next.revision,
            occurredAt,
            ...(input.reason === undefined ? {} : { reason: input.reason }),
            ...(next.correlationId === undefined ? {} : { correlationId: next.correlationId }),
        }),
    };
}
/**
 * Turns an untrusted, persisted value back into a case, or fails.
 *
 * The single supported way to bring a case back across a persistence or
 * network boundary. It validates before it trusts — including, when a profile
 * is supplied, that every projected requirement is declared by the exact pinned
 * version — and freezes what it returns, so a store cannot hand a caller an
 * aggregate the operations above would have refused to produce.
 */
function reconstituteProtocolizationCase(value, options = {}) {
    const validation = (0, case_validation_1.validateProtocolizationCase)(value, options);
    if (!validation.valid) {
        fail(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.invalidCase, `Refusing to reconstitute an invalid ProtocolizationCase: ${validation.reasons.join(', ')}`, { reasonCodes: validation.reasons });
    }
    return (0, case_freeze_1.deepFreeze)(value);
}
