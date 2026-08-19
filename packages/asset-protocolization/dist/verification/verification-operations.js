"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProtocolizationVerificationPlan = listProtocolizationVerificationPlan;
exports.executeProtocolizationVerificationCheck = executeProtocolizationVerificationCheck;
exports.runProtocolizationVerification = runProtocolizationVerification;
exports.reconstituteProtocolizationVerificationResult = reconstituteProtocolizationVerificationResult;
const freshness_1 = require("../freshness");
const identifiers_1 = require("../identifiers");
const requirements_1 = require("../requirements");
const case_errors_1 = require("../case/case-errors");
const case_freeze_1 = require("../case/case-freeze");
const case_identifiers_1 = require("../case/case-identifiers");
const case_progress_1 = require("../case/case-progress");
const case_state_1 = require("../case/case-state");
const case_validation_1 = require("../case/case-validation");
const verification_errors_1 = require("./verification-errors");
const verification_events_1 = require("./verification-events");
const verification_identifiers_1 = require("./verification-identifiers");
const verification_result_1 = require("./verification-result");
const verification_validation_1 = require("./verification-validation");
const MAX_CORRELATION_ID_LENGTH = 128;
function failVerification(code, message, details) {
    throw new verification_errors_1.VerificationError(code, message, details);
}
/**
 * The tenant gate, checked before anything else looks at the case.
 *
 * The acting tenant is the context's, never the case's — a check that reads the
 * tenant off the value it is checking always agrees with itself, which is
 * exactly why APV-04 made the acting tenant a parameter.
 */
function assertActingTenantOwnsCase(context, protocolizationCase) {
    if (!(0, case_identifiers_1.isValidProtocolizationTenantId)(context.tenantId)) {
        failVerification(verification_errors_1.VERIFICATION_ERROR_CODES.invalidTenant, 'A non-blank acting tenantId is required', { reasonCodes: [verification_errors_1.VERIFICATION_ERROR_CODES.invalidTenant] });
    }
    if (protocolizationCase.tenantId !== context.tenantId) {
        failVerification(verification_errors_1.VERIFICATION_ERROR_CODES.tenantMismatch, 'The acting tenant does not own this ProtocolizationCase', {
            reasonCodes: [verification_errors_1.VERIFICATION_ERROR_CODES.tenantMismatch],
            caseId: protocolizationCase.caseId,
            tenantId: context.tenantId,
        });
    }
}
/**
 * Re-validates the aggregate before reading it.
 *
 * The case may have arrived from a store, from a network boundary or from a
 * caller that built it by hand. Evaluating checks against an aggregate whose
 * invariants are already broken would produce findings about a state that never
 * legally existed.
 */
function assertReadableCase(protocolizationCase) {
    const validation = (0, case_validation_1.validateProtocolizationCase)(protocolizationCase);
    if (!validation.valid) {
        throw new case_errors_1.ProtocolizationCaseError(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.invalidCase, `Invalid ProtocolizationCase: ${validation.reasons.join(', ')}`, { reasonCodes: validation.reasons });
    }
}
/**
 * Which lifecycle states admit a new execution.
 *
 * `Draft` and `Active` do; `Cancelled` does not. Cancellation is terminal and a
 * cancelled case accepts no further work — running new checks against one would
 * produce findings nobody asked for about an abandoned attempt. Results recorded
 * *before* cancellation remain readable and auditable forever: this refuses new
 * executions, it does not hide old ones.
 *
 * No state is added, and none is transitioned. An execution — of any outcome —
 * leaves the case in exactly the state it found it.
 */
function assertCaseAcceptsVerification(protocolizationCase) {
    if (protocolizationCase.state === case_state_1.ProtocolizationCaseState.Cancelled) {
        failVerification(verification_errors_1.VERIFICATION_ERROR_CODES.caseCancelled, 'A Cancelled ProtocolizationCase does not accept further verification execution', {
            reasonCodes: [verification_errors_1.VERIFICATION_ERROR_CODES.caseCancelled],
            caseId: protocolizationCase.caseId,
            tenantId: protocolizationCase.tenantId,
        });
    }
}
/**
 * Resolves the exact pinned version and nothing else.
 *
 * There is no fallback to a latest, current or nearest version anywhere in this
 * package, and this is the point at which that matters most: the *check
 * contract* a result is judged under is the pinned profile's. A case pinned to
 * `1.0.0` executes `1.0.0`'s checks after `2.0.0` is registered, and a check
 * that only `2.0.0` declares is rejected rather than quietly admitted.
 */
function resolvePinnedProfile(context, protocolizationCase) {
    const resolved = context.catalog.get(protocolizationCase.profile.profileId, protocolizationCase.profile.profileVersion);
    if (resolved === undefined) {
        throw new case_errors_1.ProtocolizationCaseError(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.profileNotFound, `No AssetProfile ${protocolizationCase.profile.profileId}@${protocolizationCase.profile.profileVersion} is catalogued`, {
            reasonCodes: [case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.profileNotFound],
            profile: protocolizationCase.profile,
            caseId: protocolizationCase.caseId,
        });
    }
    return resolved;
}
/**
 * Resolves one requirement id to the pinned profile's *verification*
 * requirement, or refuses.
 *
 * ### The mixed-kind lesson, applied structurally
 *
 * APV-06's targeted audit found that APV-04's `correlate` is kind-blind: it
 * moves every id it is handed to `MaterialPresent`, so one declaration offered
 * against `[declarationRequirement, evidenceRequirement]` left the case
 * reporting evidence that did not exist. APV-07 answers that class of defect
 * twice over.
 *
 * First, structurally: an execution names **one** `requirementId`, never a list.
 * A mixture of kinds is not representable in the request, so it cannot be
 * smuggled past a filter that only looked at the first element.
 *
 * Second, explicitly: that single requirement must be
 * `AssetRequirementKind.Verification`. Naming an Identity, Declaration, Evidence
 * or Attestation requirement is refused *before* anything else happens.
 *
 * And third, by construction: even a refusal that somehow got through could not
 * contaminate anything, because this layer writes no case material at all. A
 * rejected execution leaves the case byte-for-byte as it was, at the same
 * revision, with every requirement's `materialStatus` untouched.
 */
function resolveVerificationRequirement(profile, protocolizationCase, requirementId) {
    const requirement = profile.requirements.find((entry) => entry.id === requirementId);
    if (requirement === undefined) {
        // APV-04's code and message for the same condition, so a requirement id
        // borrowed from another profile version fails identically whichever
        // operation notices it first.
        throw new case_errors_1.ProtocolizationCaseError(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.unknownRequirement, `Requirement not declared by ${protocolizationCase.profile.profileId}@${protocolizationCase.profile.profileVersion}: ${requirementId}`, {
            reasonCodes: [case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.unknownRequirement],
            caseId: protocolizationCase.caseId,
            profile: protocolizationCase.profile,
            requirementIds: [requirementId],
        });
    }
    if (requirement.kind !== requirements_1.AssetRequirementKind.Verification) {
        failVerification(verification_errors_1.VERIFICATION_ERROR_CODES.incompatibleRequirement, `A verification check may only be executed against a Verification requirement; ${requirement.id} is ${requirement.kind}`, {
            reasonCodes: [verification_errors_1.VERIFICATION_ERROR_CODES.incompatibleRequirement],
            caseId: protocolizationCase.caseId,
            tenantId: protocolizationCase.tenantId,
            requirementIds: [requirement.id],
        });
    }
    return requirement;
}
/**
 * The check must be one *this requirement of this pinned version* declares.
 *
 * Global registration is not permission. A deployment may legitimately register
 * a hundred checks; what a given case may run is only what its own profile asked
 * for, correlated to the requirement that asked for it. So a check declared by a
 * different requirement of the same profile is refused here just as firmly as
 * one declared by no requirement at all.
 */
function assertCheckDeclared(requirement, protocolizationCase, checkId) {
    const occurrences = requirement.checkIds.filter((declared) => declared === checkId).length;
    if (occurrences === 0) {
        failVerification(verification_errors_1.VERIFICATION_ERROR_CODES.checkNotDeclared, `Requirement ${requirement.id} of ${protocolizationCase.profile.profileId}@${protocolizationCase.profile.profileVersion} does not declare check ${checkId}`, {
            reasonCodes: [verification_errors_1.VERIFICATION_ERROR_CODES.checkNotDeclared],
            caseId: protocolizationCase.caseId,
            tenantId: protocolizationCase.tenantId,
            requirementIds: [requirement.id],
            checkId,
        });
    }
    if (occurrences > 1) {
        failVerification(verification_errors_1.VERIFICATION_ERROR_CODES.duplicateDeclaredCheck, `Requirement ${requirement.id} declares check ${checkId} more than once`, {
            reasonCodes: [verification_errors_1.VERIFICATION_ERROR_CODES.duplicateDeclaredCheck],
            caseId: protocolizationCase.caseId,
            requirementIds: [requirement.id],
            checkId,
        });
    }
}
/**
 * Every input the caller supplied must belong to the acting tenant and this
 * case.
 *
 * Without this, cross-tenant isolation would be advisory: a caller could hand
 * the engine another tenant's receipts and declarations and have a check read
 * them under cover of a case it does own. The gate runs before any check sees
 * anything, and it deliberately reports the same code for a foreign tenant
 * whichever kind of input carried it.
 */
function assertInputsBelongToCase(context, protocolizationCase, inputs) {
    const foreignTenant = [
        ...(inputs.evidenceReceipts ?? []).map((receipt) => receipt.tenantId),
        ...(inputs.declarations ?? []).map((record) => record.tenantId),
    ].some((tenantId) => tenantId !== context.tenantId);
    if (foreignTenant) {
        failVerification(verification_errors_1.VERIFICATION_ERROR_CODES.tenantMismatch, 'A supplied verification input belongs to another tenant', {
            reasonCodes: [verification_errors_1.VERIFICATION_ERROR_CODES.tenantMismatch],
            caseId: protocolizationCase.caseId,
            tenantId: context.tenantId,
        });
    }
    const foreignCase = [
        ...(inputs.evidenceReceipts ?? []).map((receipt) => receipt.caseId),
        ...(inputs.declarations ?? []).map((record) => record.caseId),
    ].some((caseId) => caseId !== protocolizationCase.caseId);
    if (foreignCase) {
        failVerification(verification_errors_1.VERIFICATION_ERROR_CODES.caseMismatch, 'A supplied verification input belongs to another case', {
            reasonCodes: [verification_errors_1.VERIFICATION_ERROR_CODES.caseMismatch],
            caseId: protocolizationCase.caseId,
            tenantId: context.tenantId,
        });
    }
}
/**
 * Reads the clock and refuses anything that is not a canonical UTC instant, or
 * that would place the execution before the case's own last change.
 *
 * A check evaluated "as of" an instant earlier than the material it is reading
 * was added would be reasoning about a state that did not yet exist — and every
 * freshness comparison it made would be meaningless.
 */
function readClock(context, protocolizationCase) {
    const now = context.clock.now();
    if (!(0, freshness_1.isValidUtcDateTime)(now)) {
        failVerification(verification_errors_1.VERIFICATION_ERROR_CODES.invalidTimestamp, 'The clock returned a non-canonical instant', { reasonCodes: [verification_errors_1.VERIFICATION_ERROR_CODES.invalidTimestamp] });
    }
    if (Date.parse(now) < Date.parse(protocolizationCase.updatedAt)) {
        failVerification(verification_errors_1.VERIFICATION_ERROR_CODES.invalidTimestamp, 'The clock is earlier than the case it is verifying', {
            reasonCodes: [verification_errors_1.VERIFICATION_ERROR_CODES.invalidTimestamp],
            caseId: protocolizationCase.caseId,
        });
    }
    return now;
}
function assertAdmissibleRequest(protocolizationCase, input) {
    const reasons = [];
    if (!(0, verification_identifiers_1.isValidVerificationExecutionId)(input.executionId)) {
        reasons.push(verification_errors_1.VERIFICATION_ERROR_CODES.invalidRequest);
    }
    if (!(0, identifiers_1.isValidAssetRequirementId)(input.requirementId)) {
        reasons.push(verification_errors_1.VERIFICATION_ERROR_CODES.invalidRequest);
    }
    if (!(0, identifiers_1.isValidAssetVerificationCheckId)(input.checkId)) {
        reasons.push(verification_errors_1.VERIFICATION_ERROR_CODES.invalidRequest);
    }
    if (input.correlationId !== undefined &&
        (typeof input.correlationId !== 'string' ||
            input.correlationId.trim() === '' ||
            input.correlationId.length > MAX_CORRELATION_ID_LENGTH)) {
        reasons.push(verification_errors_1.VERIFICATION_ERROR_CODES.invalidRequest);
    }
    if (reasons.length > 0) {
        failVerification(verification_errors_1.VERIFICATION_ERROR_CODES.invalidRequest, 'Cannot execute a verification check: the request is malformed', {
            reasonCodes: reasons,
            caseId: protocolizationCase.caseId,
            tenantId: protocolizationCase.tenantId,
        });
    }
}
/**
 * Builds the bounded view one check is allowed to see, and freezes it.
 *
 * Freezing matters: `readonly` is erased at runtime, so without it a check could
 * reach into the arrays it was handed and edit the case's material list, a
 * receipt, or another check's view of the same batch.
 */
function buildCheckContext(context, protocolizationCase, profile, requirement, checkId, inputs, now) {
    return (0, case_freeze_1.deepFreeze)({
        tenantId: protocolizationCase.tenantId,
        caseId: protocolizationCase.caseId,
        profile: protocolizationCase.profile,
        assetProfile: profile,
        requirementId: requirement.id,
        requirement,
        checkId,
        subject: protocolizationCase.subject,
        caseState: protocolizationCase.state,
        caseRevision: protocolizationCase.revision,
        requirementProgress: (0, case_progress_1.listProtocolizationCaseRequirementProgress)(protocolizationCase, profile),
        materials: protocolizationCase.materials,
        evidenceReceipts: inputs.evidenceReceipts ?? [],
        declarations: inputs.declarations ?? [],
        now,
        resolvers: context.resolvers ?? {},
    });
}
/**
 * Turns a validated execution into an immutable result and its event.
 *
 * An executor that returns something this engine will not store fails loudly
 * (`VERIFICATION_CHECK_EXECUTION_INVALID`) rather than having its output
 * repaired. Note also what is *not* here: no `try`/`catch` around the executor
 * anywhere in this module. A check that throws — a bug, a broken invariant, a
 * malformed implementation — propagates. Laundering a defect into `Unavailable`
 * would make a broken check indistinguishable from a working one reporting a
 * dependency outage, and the whole point of `Unavailable` is that the difference
 * stays visible.
 */
function sealResult(protocolizationCase, requirement, checkId, executionId, execution, executedAt, correlationId) {
    const admission = (0, verification_validation_1.validateVerificationCheckExecution)(execution);
    if (!admission.admitted) {
        failVerification(verification_errors_1.VERIFICATION_ERROR_CODES.invalidExecution, `Verification check ${checkId} returned a malformed execution: ${admission.reasons.join(', ')}`, {
            reasonCodes: admission.reasons,
            caseId: protocolizationCase.caseId,
            tenantId: protocolizationCase.tenantId,
            requirementIds: [requirement.id],
            checkId,
            executionId,
        });
    }
    const result = {
        schemaVersion: verification_result_1.PROTOCOLIZATION_VERIFICATION_RESULT_SCHEMA_VERSION,
        executionId,
        tenantId: protocolizationCase.tenantId,
        caseId: protocolizationCase.caseId,
        // Copied field by field rather than spread, so the recorded pin is exactly
        // the two frozen fields and nothing can ride along on it.
        profile: {
            profileId: protocolizationCase.profile.profileId,
            profileVersion: protocolizationCase.profile.profileVersion,
        },
        requirementId: requirement.id,
        checkId,
        evaluatedCaseRevision: protocolizationCase.revision,
        outcome: execution.outcome,
        ...(execution.reasonCode === undefined ? {} : { reasonCode: execution.reasonCode }),
        ...(execution.summary === undefined ? {} : { summary: execution.summary }),
        ...(execution.inputRefs === undefined ? {} : { inputRefs: execution.inputRefs }),
        executedAt,
        ...(execution.canonicalVerificationRef === undefined
            ? {}
            : { canonicalVerificationRef: execution.canonicalVerificationRef }),
        ...(correlationId === undefined ? {} : { correlationId }),
    };
    const validation = (0, verification_validation_1.validateProtocolizationVerificationResult)(result);
    if (!validation.admitted) {
        failVerification(verification_errors_1.VERIFICATION_ERROR_CODES.invalidResult, `Refusing to produce an invalid ProtocolizationVerificationResult: ${validation.reasons.join(', ')}`, {
            reasonCodes: validation.reasons,
            caseId: protocolizationCase.caseId,
            tenantId: protocolizationCase.tenantId,
            executionId,
            checkId,
        });
    }
    return {
        result: (0, case_freeze_1.deepFreeze)(result),
        event: (0, case_freeze_1.deepFreeze)({
            eventType: verification_events_1.PROTOCOLIZATION_VERIFICATION_EVENT_TYPES.checkExecuted,
            executionId,
            tenantId: result.tenantId,
            caseId: result.caseId,
            profile: result.profile,
            requirementId: result.requirementId,
            checkId: result.checkId,
            evaluatedCaseRevision: result.evaluatedCaseRevision,
            outcome: result.outcome,
            ...(result.reasonCode === undefined ? {} : { reasonCode: result.reasonCode }),
            occurredAt: executedAt,
            ...(correlationId === undefined ? {} : { correlationId }),
        }),
    };
}
/**
 * The deterministic execution plan for one case: every `(requirementId,
 * checkId)` pair its exact pinned profile version declares.
 *
 * Ordering is the profile's own — verification requirements in declaration
 * order, and within each, `checkIds` in declaration order. It is therefore
 * stable across runs and independent of registration order, which is what makes
 * "execution order does not change results" a property rather than a hope.
 *
 * Checks are independent by construction: nothing here expresses a dependency
 * between two of them, and no dependency is inferred from a check id's spelling.
 * A check that genuinely needed another's output would need an explicit,
 * machine-readable dependency in the profile, and APV-03 declares none — so
 * orchestrating one is a later slice's work, not something to guess at here.
 *
 * Pure and synchronous: it resolves the pinned profile and reads it. It executes
 * nothing.
 */
function listProtocolizationVerificationPlan(context, protocolizationCase) {
    assertActingTenantOwnsCase(context, protocolizationCase);
    assertReadableCase(protocolizationCase);
    const profile = resolvePinnedProfile(context, protocolizationCase);
    return profile.requirements.flatMap((requirement) => {
        if (requirement.kind !== requirements_1.AssetRequirementKind.Verification)
            return [];
        const seen = new Set();
        return requirement.checkIds.map((checkId) => {
            if (seen.has(checkId)) {
                failVerification(verification_errors_1.VERIFICATION_ERROR_CODES.duplicateDeclaredCheck, `Requirement ${requirement.id} declares check ${checkId} more than once`, {
                    reasonCodes: [verification_errors_1.VERIFICATION_ERROR_CODES.duplicateDeclaredCheck],
                    caseId: protocolizationCase.caseId,
                    requirementIds: [requirement.id],
                    checkId,
                });
            }
            seen.add(checkId);
            return { requirementId: requirement.id, checkId };
        });
    });
}
/**
 * Executes one profile-declared check against one case, or fails.
 *
 * Order of checks is part of the contract: tenant, then case validity, then
 * request admission, then case identity, then lifecycle, then the pinned
 * profile, then requirement kind, then check declaration, then registration,
 * then supplied-input ownership, then the clock — and only then does an executor
 * run. A failure at any step throws and produces nothing: no result, no event,
 * and — since this layer never touches the case — no mutation of any kind.
 */
async function executeProtocolizationVerificationCheck(context, protocolizationCase, input) {
    assertActingTenantOwnsCase(context, protocolizationCase);
    assertReadableCase(protocolizationCase);
    assertAdmissibleRequest(protocolizationCase, input);
    assertCaseAcceptsVerification(protocolizationCase);
    const profile = resolvePinnedProfile(context, protocolizationCase);
    const requirement = resolveVerificationRequirement(profile, protocolizationCase, input.requirementId);
    assertCheckDeclared(requirement, protocolizationCase, input.checkId);
    const check = context.checks.get(input.checkId);
    if (check === undefined) {
        failVerification(verification_errors_1.VERIFICATION_ERROR_CODES.checkNotRegistered, `No verification check implementation is registered for ${input.checkId}`, {
            reasonCodes: [verification_errors_1.VERIFICATION_ERROR_CODES.checkNotRegistered],
            caseId: protocolizationCase.caseId,
            tenantId: protocolizationCase.tenantId,
            requirementIds: [requirement.id],
            checkId: input.checkId,
        });
    }
    assertInputsBelongToCase(context, protocolizationCase, input);
    const executedAt = readClock(context, protocolizationCase);
    const execution = await check.execute(buildCheckContext(context, protocolizationCase, profile, requirement, input.checkId, input, executedAt));
    return sealResult(protocolizationCase, requirement, input.checkId, input.executionId, execution, executedAt, input.correlationId);
}
/**
 * Executes every check the pinned profile declares, against one case revision.
 *
 * ### It does not stop at the first failure
 *
 * Deliberately. Short-circuiting would hand a later reviewer one finding and
 * hide the rest, and the reviewer's question is almost never "is there a
 * problem?" but "what is the complete set of problems?". A run of eight checks
 * that fails on the second still executes all eight.
 *
 * ### It produces no verdict
 *
 * The return value is the results, the shared revision and the shared instant.
 * There is no aggregate outcome, no score and no readiness signal, because a
 * batch of independent findings is not a decision — and turning it into one is
 * APV-09's job, not this function's.
 *
 * ### It is not a run entity
 *
 * No `VerificationRun` record is created. Everything a run aggregate would carry
 * is already on every result and identical across the batch
 * (`evaluatedCaseRevision`, `executedAt`, `correlationId`), so the entity would
 * add an identifier and no fact.
 */
async function runProtocolizationVerification(context, protocolizationCase, input) {
    assertActingTenantOwnsCase(context, protocolizationCase);
    assertReadableCase(protocolizationCase);
    assertCaseAcceptsVerification(protocolizationCase);
    const plan = listProtocolizationVerificationPlan(context, protocolizationCase);
    if (!Array.isArray(input.executionIds) ||
        input.executionIds.length !== plan.length) {
        failVerification(verification_errors_1.VERIFICATION_ERROR_CODES.invalidRequest, `This case's pinned profile declares ${plan.length} check execution(s); exactly that many execution ids are required`, {
            reasonCodes: [verification_errors_1.VERIFICATION_ERROR_CODES.invalidRequest],
            caseId: protocolizationCase.caseId,
            tenantId: protocolizationCase.tenantId,
        });
    }
    if (new Set(input.executionIds).size !== input.executionIds.length) {
        failVerification(verification_errors_1.VERIFICATION_ERROR_CODES.invalidRequest, 'Execution ids within one run must be distinct', {
            reasonCodes: [verification_errors_1.VERIFICATION_ERROR_CODES.invalidRequest],
            caseId: protocolizationCase.caseId,
            tenantId: protocolizationCase.tenantId,
        });
    }
    const results = [];
    const events = [];
    // Sequential on purpose. The clock is read once per execution and the case is
    // immutable, so concurrency would change nothing about the basis — but it
    // would make the order in which resolvers are consulted non-deterministic,
    // and a deterministic engine is worth more here than a marginally faster one.
    for (const [index, entry] of plan.entries()) {
        const transition = await executeProtocolizationVerificationCheck(context, protocolizationCase, {
            executionId: input.executionIds[index],
            requirementId: entry.requirementId,
            checkId: entry.checkId,
            ...(input.evidenceReceipts === undefined ? {} : { evidenceReceipts: input.evidenceReceipts }),
            ...(input.declarations === undefined ? {} : { declarations: input.declarations }),
            ...(input.correlationId === undefined ? {} : { correlationId: input.correlationId }),
        });
        results.push(transition.result);
        events.push(transition.event);
    }
    const executedAt = results[0]?.executedAt ?? readClock(context, protocolizationCase);
    return (0, case_freeze_1.deepFreeze)({
        results,
        events,
        evaluatedCaseRevision: protocolizationCase.revision,
        executedAt,
    });
}
/**
 * Turns an untrusted, persisted value back into a result, or fails.
 *
 * The single supported way to bring a result back across a persistence or
 * network boundary. It validates before it trusts and freezes what it returns,
 * so a store cannot hand a caller a finding the engine would have refused to
 * produce — and cannot hand back one whose outcome is a string outside the
 * closed set.
 */
function reconstituteProtocolizationVerificationResult(value) {
    const validation = (0, verification_validation_1.validateProtocolizationVerificationResult)(value);
    if (!validation.admitted) {
        failVerification(verification_errors_1.VERIFICATION_ERROR_CODES.invalidResult, `Refusing to reconstitute an invalid ProtocolizationVerificationResult: ${validation.reasons.join(', ')}`, { reasonCodes: validation.reasons });
    }
    return (0, case_freeze_1.deepFreeze)(value);
}
