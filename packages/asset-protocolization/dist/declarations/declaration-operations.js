"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordProtocolizationDeclaration = recordProtocolizationDeclaration;
exports.reconstituteProtocolizationDeclarationRecord = reconstituteProtocolizationDeclarationRecord;
const requirements_1 = require("../requirements");
const case_errors_1 = require("../case/case-errors");
const case_freeze_1 = require("../case/case-freeze");
const case_identifiers_1 = require("../case/case-identifiers");
const case_material_1 = require("../case/case-material");
const case_operations_1 = require("../case/case-operations");
const declaration_errors_1 = require("./declaration-errors");
const declaration_events_1 = require("./declaration-events");
const declaration_record_1 = require("./declaration-record");
const declaration_validation_1 = require("./declaration-validation");
const declaration_submission_1 = require("./declaration-submission");
function failDeclaration(code, message, details) {
    throw new declaration_errors_1.DeclarationError(code, message, details);
}
/**
 * The tenant gate, checked before anything else looks at the case.
 *
 * Mirrors APV-04's `assertOperableCase` and APV-05's own gate rather than
 * relying on the delegated call to reach the same conclusion later: this
 * operation reads the case's material list to detect a duplicate claim and to
 * resolve evidence links, and it must not do even that on behalf of a caller
 * acting as a tenant that does not own the case. The acting tenant is the
 * context's, never the case's — a check that reads the tenant off the value it
 * is checking always agrees with itself.
 *
 * The tenant is the workflow isolation boundary and the declarant is a
 * participant; the two are never derived from each other. One tenant routinely
 * processes declarations from many participants, and no participant identity is
 * ever inferred from a tenant id.
 */
function assertActingTenantOwnsCase(context, protocolizationCase) {
    if (!(0, case_identifiers_1.isValidProtocolizationTenantId)(context.tenantId)) {
        failDeclaration(declaration_errors_1.DECLARATION_ERROR_CODES.invalidTenant, 'A non-blank acting tenantId is required', { reasonCodes: [declaration_errors_1.DECLARATION_ERROR_CODES.invalidTenant] });
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
 * Rejects a second declaration naming the same canonical claim in the same case.
 *
 * Scoped to the case, exactly as APV-05 scoped duplicate evidence, and for the
 * same reason: within one case, two materials naming one claim record are not
 * two declarations — they are one declaration recorded twice, and silently
 * accepting that would inflate the case's own account of what it holds. Across
 * cases the same claim may legitimately be named again.
 *
 * This is the *only* replay rule that looks at what a declaration says. It
 * keys on the claim identifier, never on the statement text: two participants
 * who type the same sentence have made two declarations, and one participant
 * who rewords the same claim has not made two. Text is never identity here.
 *
 * Correlating a declaration that is *already* in the case with a further
 * requirement is not a new declaration at all — it is APV-04's
 * `associateProtocolizationCaseMaterial` on the material this record names.
 */
function assertClaimNotAlreadyInCase(protocolizationCase, claimRef, submission) {
    const existing = protocolizationCase.materials.find((material) => material.kind === case_material_1.ProtocolizationMaterialKind.Declaration && material.claimRef === claimRef);
    if (existing !== undefined) {
        failDeclaration(declaration_errors_1.DECLARATION_ERROR_CODES.duplicateClaim, `This case already holds declaration material ${String(existing.materialId)} for this canonical claim`, {
            reasonCodes: [declaration_errors_1.DECLARATION_ERROR_CODES.duplicateClaim],
            declarationId: submission.declarationId,
            caseId: protocolizationCase.caseId,
            tenantId: protocolizationCase.tenantId,
            materialId: existing.materialId,
            claimRef,
        });
    }
}
/**
 * Every supporting evidence reference must already be evidence material in
 * *this* case.
 *
 * This is the whole of what a link means, and the whole of what can be checked.
 * It is knowable — the case carries its own material list — and checking it
 * keeps a record from pointing at evidence that never entered the workflow.
 *
 * It is also, without any tenant comparison at all, what makes another tenant's
 * evidence unlinkable: a case holds only material that was admitted into it, so
 * a reference to evidence living in a different tenant's case simply is not
 * there. The failure is indistinguishable from "no such evidence anywhere",
 * which is the answer a caller is entitled to.
 *
 * What is emphatically *not* checked, because it cannot be: whether the
 * evidence bears on the declaration at all. A link records that the declarant
 * pointed at it. The evidence may support the assertion, contradict it, be
 * irrelevant to it, or be false, and nothing here reaches or records any of
 * those.
 */
function assertEvidenceLinksResolve(protocolizationCase, submission) {
    if (submission.supportingEvidenceRefs === undefined)
        return;
    const admitted = new Set(protocolizationCase.materials
        .filter((material) => material.kind === case_material_1.ProtocolizationMaterialKind.Evidence)
        .map((material) => material.evidenceRef));
    for (const evidenceRef of submission.supportingEvidenceRefs) {
        if (!admitted.has(evidenceRef)) {
            failDeclaration(declaration_errors_1.DECLARATION_ERROR_CODES.unknownEvidenceLink, 'A supporting evidence reference is not evidence material in this case', {
                reasonCodes: [declaration_errors_1.DECLARATION_ERROR_CODES.unknownEvidenceLink],
                declarationId: submission.declarationId,
                caseId: protocolizationCase.caseId,
                tenantId: protocolizationCase.tenantId,
                evidenceRef,
            });
        }
    }
}
/**
 * The one compatibility rule APV-03 genuinely encodes, and not one rule more.
 *
 * APV-03 gives every requirement a `kind`, and an `AssetDeclarationRequirement`
 * states mechanically *which* declaration it requires: a `ClaimType`, optionally
 * narrowed by a `claimSubtype` token. Both are checkable without interpreting
 * anything, so both are checked:
 *
 * ```text
 * every correlated requirement is a Declaration requirement
 * every correlated requirement names this claimType
 * every correlated requirement's claimSubtype, when it declares one,
 *   is the subtype this submission carries
 * ```
 *
 * ### Why *every*, and not merely *at least one*
 *
 * Because APV-04's `correlate` is kind-blind. It moves **every** id in
 * `requirementIds` to `MaterialPresent` and stamps each with this material's
 * id. A declaration offered against `[declarationRequirement,
 * evidenceRequirement]` would therefore leave the case reporting that evidence
 * material is present when no evidence exists — and a later reader inspecting
 * that requirement would find a `CanonicalClaimId` sitting where a
 * `CanonicalEvidenceId` belongs, with nothing to mark the difference. "Someone
 * asserted something" is not a document, not a check and not an attestation,
 * and a profile that asked for one of those has not been answered by an
 * assertion.
 *
 * This is not an invented semantic judgement: APV-03 froze the requirement
 * `kind` vocabulary, and this reads it. What is deliberately *not* inferred is
 * anything about whether the declaration is true, adequate, or counts toward
 * the requirement's `minimumCount`.
 *
 * Note what correlation is *not*: satisfaction. Passing this check means the
 * profile asked for a declaration of this type and one was offered. Whether the
 * declaration is true, whether it counts, and whether the requirement's
 * `minimumCount` is met are all questions for a later evaluator.
 *
 * Requirement ids that the pinned profile does not declare are not this
 * function's business — APV-04 owns that refusal and produces a better error
 * for it — so an unresolvable id short-circuits the check and falls through to
 * `addProtocolizationCaseMaterial`.
 *
 * The check runs *before* any case mutation, so a rejected association leaves
 * the case byte-for-byte as it was and never consumes a revision.
 */
function assertDeclarationRequirementCompatibility(context, protocolizationCase, submission, claimType) {
    const profile = context.catalog.get(protocolizationCase.profile.profileId, protocolizationCase.profile.profileVersion);
    if (profile === undefined) {
        // APV-04's code and message for the same condition, so a withdrawn profile
        // fails identically whichever operation notices it first.
        throw new case_errors_1.ProtocolizationCaseError(case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.profileNotFound, `No AssetProfile ${protocolizationCase.profile.profileId}@${protocolizationCase.profile.profileVersion} is catalogued`, {
            reasonCodes: [case_errors_1.PROTOCOLIZATION_CASE_ERROR_CODES.profileNotFound],
            profile: protocolizationCase.profile,
            caseId: protocolizationCase.caseId,
        });
    }
    const byId = new Map(profile.requirements.map((requirement) => [requirement.id, requirement]));
    const resolved = submission.requirementIds.map((id) => byId.get(id));
    if (resolved.some((requirement) => requirement === undefined))
        return;
    // Every correlated requirement must be a declaration requirement — not merely
    // one of them. APV-04's `correlate` is kind-blind: it moves *every* id in
    // `requirementIds` to `MaterialPresent` and stamps it with this material's
    // id. So a single declaration offered against
    // `[declarationRequirement, evidenceRequirement]` would leave the case
    // reporting that evidence material is present when no evidence exists, and a
    // later reader has no way to tell that the id under that requirement belongs
    // to a claim. Rejecting the whole association is the only honest answer: this
    // layer cannot correlate a declaration to a requirement the profile says is
    // answered by something other than a declaration.
    const incompatible = resolved.filter((requirement) => requirement?.kind !== requirements_1.AssetRequirementKind.Declaration);
    if (incompatible.length > 0) {
        failDeclaration(declaration_errors_1.DECLARATION_ERROR_CODES.incompatibleRequirement, `A declaration may only be correlated to declaration requirements of the pinned profile; these are not: ${incompatible
            .map((requirement) => `${requirement?.id} (${requirement?.kind})`)
            .join(', ')}`, {
            reasonCodes: [declaration_errors_1.DECLARATION_ERROR_CODES.incompatibleRequirement],
            declarationId: submission.declarationId,
            caseId: protocolizationCase.caseId,
            tenantId: protocolizationCase.tenantId,
            requirementIds: incompatible.map((requirement) => requirement?.id),
        });
    }
    // Non-empty by structural admission, and now known to be entirely of kind
    // Declaration, so this narrowing is total.
    const declarationRequirements = resolved;
    const mismatched = declarationRequirements.filter((requirement) => requirement.claimType !== claimType ||
        (requirement.claimSubtype !== undefined &&
            requirement.claimSubtype !== submission.claimSubtype));
    if (mismatched.length > 0) {
        failDeclaration(declaration_errors_1.DECLARATION_ERROR_CODES.claimTypeMismatch, `The pinned profile requires a different declaration for: ${mismatched.map((requirement) => requirement.id).join(', ')}`, {
            reasonCodes: [declaration_errors_1.DECLARATION_ERROR_CODES.claimTypeMismatch],
            declarationId: submission.declarationId,
            caseId: protocolizationCase.caseId,
            tenantId: protocolizationCase.tenantId,
            requirementIds: mismatched.map((requirement) => requirement.id),
        });
    }
}
/**
 * Records one declaration into one case, or fails.
 *
 * Order of checks is part of the contract: tenant, then case identity, then
 * structural admission, then case-scoped claim duplication, then evidence
 * links, then profile compatibility, then everything APV-04 enforces. A failure
 * at any step throws and produces nothing — no record, no event, no case
 * mutation and no revision increment. A rejected submission leaves the case
 * byte-for-byte as it was.
 */
function recordProtocolizationDeclaration(context, protocolizationCase, submission) {
    assertActingTenantOwnsCase(context, protocolizationCase);
    const admission = (0, declaration_validation_1.validateProtocolizationDeclarationSubmission)(submission);
    if (!admission.admitted) {
        failDeclaration(declaration_errors_1.DECLARATION_ERROR_CODES.invalidSubmission, `Declaration submission was not admitted: ${admission.reasons.join(', ')}`, {
            reasonCodes: admission.reasons,
            caseId: protocolizationCase.caseId,
            tenantId: protocolizationCase.tenantId,
        });
    }
    if (submission.caseId !== protocolizationCase.caseId) {
        failDeclaration(declaration_errors_1.DECLARATION_ERROR_CODES.caseMismatch, 'The submission names a different ProtocolizationCase', {
            reasonCodes: [declaration_errors_1.DECLARATION_ERROR_CODES.caseMismatch],
            declarationId: submission.declarationId,
            caseId: protocolizationCase.caseId,
            tenantId: protocolizationCase.tenantId,
        });
    }
    const claimRef = (0, declaration_submission_1.submittedClaimRef)(submission);
    const claimType = (0, declaration_submission_1.submittedClaimType)(submission);
    assertClaimNotAlreadyInCase(protocolizationCase, claimRef, submission);
    assertEvidenceLinksResolve(protocolizationCase, submission);
    assertDeclarationRequirementCompatibility(context, protocolizationCase, submission, claimType);
    // Everything the case owns — lifecycle, pinned-version requirement
    // correlation, duplicate material ids, the clock, the revision increment and
    // the freeze — is enforced here, once, by the aggregate that owns it. The
    // `CanonicalClaim` document, if one was supplied, is deliberately not passed
    // on: the case records the reference, never a copy of the record.
    const transition = (0, case_operations_1.addProtocolizationCaseMaterial)(context, protocolizationCase, {
        materialId: submission.materialId,
        kind: case_material_1.ProtocolizationMaterialKind.Declaration,
        claimRef,
        requirementIds: submission.requirementIds,
        ...(submission.correlationId === undefined ? {} : { correlationId: submission.correlationId }),
    });
    // The recording instant is the case event's instant, read once. A second
    // clock read would let a record and the material it describes disagree about
    // when the same act happened.
    const recordedAt = transition.event.occurredAt;
    const caseRevision = transition.protocolizationCase.revision;
    const record = {
        schemaVersion: declaration_record_1.PROTOCOLIZATION_DECLARATION_RECORD_SCHEMA_VERSION,
        declarationId: submission.declarationId,
        tenantId: transition.protocolizationCase.tenantId,
        caseId: transition.protocolizationCase.caseId,
        profile: transition.protocolizationCase.profile,
        declarant: submission.declarant,
        claimType,
        ...(submission.claimSubtype === undefined ? {} : { claimSubtype: submission.claimSubtype }),
        claimRef,
        materialId: submission.materialId,
        requirementIds: [...submission.requirementIds],
        ...(submission.supportingEvidenceRefs === undefined
            ? {}
            : { supportingEvidenceRefs: [...submission.supportingEvidenceRefs] }),
        ...(submission.statement === undefined ? {} : { statement: submission.statement }),
        ...(submission.declaredAt === undefined ? {} : { declaredAt: submission.declaredAt }),
        recordedAt,
        ...(submission.sourceRef === undefined ? {} : { sourceRef: submission.sourceRef }),
        caseRevision,
        ...(submission.correlationId === undefined ? {} : { correlationId: submission.correlationId }),
    };
    const recordValidation = (0, declaration_validation_1.validateProtocolizationDeclarationRecord)(record);
    if (!recordValidation.admitted) {
        failDeclaration(declaration_errors_1.DECLARATION_ERROR_CODES.invalidRecord, `Refusing to produce an invalid ProtocolizationDeclarationRecord: ${recordValidation.reasons.join(', ')}`, { reasonCodes: recordValidation.reasons, declarationId: submission.declarationId });
    }
    const declarationEvent = {
        eventType: declaration_events_1.PROTOCOLIZATION_DECLARATION_EVENT_TYPES.recorded,
        declarationId: record.declarationId,
        tenantId: record.tenantId,
        caseId: record.caseId,
        profile: record.profile,
        declarant: record.declarant,
        claimType: record.claimType,
        ...(record.claimSubtype === undefined ? {} : { claimSubtype: record.claimSubtype }),
        claimRef: record.claimRef,
        materialId: record.materialId,
        requirementIds: record.requirementIds,
        ...(record.supportingEvidenceRefs === undefined
            ? {}
            : { supportingEvidenceRefs: record.supportingEvidenceRefs }),
        occurredAt: recordedAt,
        ...(record.declaredAt === undefined ? {} : { declaredAt: record.declaredAt }),
        caseRevision,
        ...(record.correlationId === undefined ? {} : { correlationId: record.correlationId }),
    };
    return {
        protocolizationCase: transition.protocolizationCase,
        record: (0, case_freeze_1.deepFreeze)(record),
        caseEvent: transition.event,
        declarationEvent: (0, case_freeze_1.deepFreeze)(declarationEvent),
    };
}
/**
 * Turns an untrusted, persisted value back into a declaration record, or fails.
 *
 * The single supported way to bring one back across a persistence or network
 * boundary — the same role, and the same rule, as
 * `reconstituteProtocolizationCase` and `reconstituteEvidenceIntakeReceipt`:
 * validate before trusting, and freeze what is returned, so a store cannot hand
 * a caller a record this package would have refused to produce.
 */
function reconstituteProtocolizationDeclarationRecord(value) {
    const validation = (0, declaration_validation_1.validateProtocolizationDeclarationRecord)(value);
    if (!validation.admitted) {
        failDeclaration(declaration_errors_1.DECLARATION_ERROR_CODES.invalidRecord, `Refusing to reconstitute an invalid ProtocolizationDeclarationRecord: ${validation.reasons.join(', ')}`, { reasonCodes: validation.reasons });
    }
    return (0, case_freeze_1.deepFreeze)(value);
}
