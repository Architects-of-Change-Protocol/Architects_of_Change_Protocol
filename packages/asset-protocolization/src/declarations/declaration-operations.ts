import type { CanonicalClaimId, ClaimType } from '@aoc/protocol/claims';

import type { AssetRequirementId } from '../identifiers';
import { AssetRequirementKind } from '../requirements';
import type { AssetDeclarationRequirement } from '../requirements';
import type { AssetProfile } from '../profile';
import { PROTOCOLIZATION_CASE_ERROR_CODES, ProtocolizationCaseError } from '../case/case-errors';
import type { ProtocolizationCaseEvent } from '../case/case-events';
import { deepFreeze } from '../case/case-freeze';
import { isValidProtocolizationTenantId } from '../case/case-identifiers';
import { ProtocolizationMaterialKind } from '../case/case-material';
import { addProtocolizationCaseMaterial } from '../case/case-operations';
import type { ProtocolizationCaseContext } from '../case/case-operations';
import type { ProtocolizationCase } from '../case/protocolization-case';
import { DECLARATION_ERROR_CODES, DeclarationError } from './declaration-errors';
import type { DeclarationErrorCode, DeclarationErrorDetails } from './declaration-errors';
import { PROTOCOLIZATION_DECLARATION_EVENT_TYPES } from './declaration-events';
import type { ProtocolizationDeclarationRecordedEvent } from './declaration-events';
import { PROTOCOLIZATION_DECLARATION_RECORD_SCHEMA_VERSION } from './declaration-record';
import type { ProtocolizationDeclarationRecord } from './declaration-record';
import {
  validateProtocolizationDeclarationRecord,
  validateProtocolizationDeclarationSubmission,
} from './declaration-validation';
import { submittedClaimRef, submittedClaimType } from './declaration-submission';
import type { ProtocolizationDeclarationSubmission } from './declaration-submission';

/**
 * The declaration operation — the vertical's "someone asserts X" layer.
 *
 * One pure function over an immutable case. It takes a submission, decides
 * whether the submission is *structurally admissible*, and — if it is — returns
 * the updated case, an immutable record, and the two events that describe what
 * happened. It mutates nothing and performs no I/O: no network call, no
 * database call, no registry lookup, no identity resolution, no signature check
 * and no policy evaluation. The only outside world it touches is the clock and
 * the profile catalogue, both injected through APV-04's context.
 *
 * ### What success means
 *
 * ```text
 * APV recorded that this participant asserted this proposition
 * into this case workflow, at this instant.
 * ```
 *
 * That is the entire claim, and each word of it is load-bearing. It does **not**
 * mean the proposition is true; that the declarant is who they say they are;
 * that the declarant owns, authored, controls or may act for anything; that any
 * evidence they pointed at supports them; that the requirement they were
 * correlated to is satisfied; or that the case is ready. Every one of those is a
 * conclusion a later slice reaches by *reading* what this one recorded.
 *
 * ### Conflicting declarations are input, not a problem to solve
 *
 * Two participants may assert propositions that cannot both be right, and this
 * operation records both. It does not compare a new declaration against the
 * declarations already in the case, does not overwrite one with the other, does
 * not mark either false, and does not emit a failure for the pair. Detecting
 * and adjudicating a conflict is APV-07's work, and it needs both declarations
 * on the record to do it — an intake layer that silently dropped the second one
 * would destroy exactly the input the verification slice depends on.
 *
 * ### Progressive declaration
 *
 * Declarations arrive over the life of a case, in any order relative to
 * evidence, from any number of participants, minutes or months apart. Nothing
 * here assumes a single submit-everything-then-verify transaction: each
 * declaration is independent, each produces its own record at its own instant,
 * and no declaration rewrites, replaces or deletes what an earlier one
 * recorded. A later declaration that corrects an earlier one is simply a
 * further declaration; both remain observable, and formalizing supersession is
 * a later slice's work.
 *
 * ### Why the case mutation goes through APV-04
 *
 * The association is performed by `addProtocolizationCaseMaterial`, not by a
 * parallel declaration list on the case. APV-04 already models exactly this — a
 * `ProtocolizationMaterialKind.Declaration` association naming a
 * `CanonicalClaimId`, correlated to requirements of the pinned profile — and it
 * already enforces the lifecycle rule, the requirement-id rule, the pinned
 * version rule, the duplicate-material rule, the clock rule and the revision
 * rule. Delegating means one implementation of each, one set of error codes,
 * and exactly one revision increment per declaration.
 */

/**
 * What an accepted declaration produces.
 *
 * All four values are returned together, and none of them is persisted here.
 * That is deliberate, for the reason APV-05 gave: a successful declaration has
 * to update the case *and* record a record, and those are two writes to two
 * stores. Performing them inside this function would let it report success
 * after the first one succeeded and the second failed — a case carrying
 * declaration material with no record behind it. A pure operation hands both
 * results to a composition layer that can commit them together under whatever
 * transactional facility it actually has. There is no distributed transaction
 * here and none is pretended.
 */
export interface ProtocolizationDeclarationTransition {
  /** The case with the declaration association added. Deeply frozen. */
  readonly protocolizationCase: ProtocolizationCase;
  /** The immutable record that this declaration was made. Deeply frozen. */
  readonly record: ProtocolizationDeclarationRecord;
  /** APV-04's own event for the material association, unchanged. */
  readonly caseEvent: ProtocolizationCaseEvent;
  /** APV-06's event. Shares `occurredAt` and `caseRevision` with the above. */
  readonly declarationEvent: ProtocolizationDeclarationRecordedEvent;
}

function failDeclaration(
  code: DeclarationErrorCode,
  message: string,
  details: DeclarationErrorDetails,
): never {
  throw new DeclarationError(code, message, details);
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
function assertActingTenantOwnsCase(
  context: ProtocolizationCaseContext,
  protocolizationCase: ProtocolizationCase,
): void {
  if (!isValidProtocolizationTenantId(context.tenantId)) {
    failDeclaration(
      DECLARATION_ERROR_CODES.invalidTenant,
      'A non-blank acting tenantId is required',
      { reasonCodes: [DECLARATION_ERROR_CODES.invalidTenant] },
    );
  }
  if (protocolizationCase.tenantId !== context.tenantId) {
    // APV-04's code, deliberately: "the acting tenant does not own this case"
    // is one condition, and one condition gets one machine-readable code.
    throw new ProtocolizationCaseError(
      PROTOCOLIZATION_CASE_ERROR_CODES.tenantMismatch,
      'The acting tenant does not own this ProtocolizationCase',
      {
        reasonCodes: [PROTOCOLIZATION_CASE_ERROR_CODES.tenantMismatch],
        caseId: protocolizationCase.caseId,
        tenantId: context.tenantId,
      },
    );
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
function assertClaimNotAlreadyInCase(
  protocolizationCase: ProtocolizationCase,
  claimRef: CanonicalClaimId,
  submission: ProtocolizationDeclarationSubmission,
): void {
  const existing = protocolizationCase.materials.find(
    (material) =>
      material.kind === ProtocolizationMaterialKind.Declaration && material.claimRef === claimRef,
  );
  if (existing !== undefined) {
    failDeclaration(
      DECLARATION_ERROR_CODES.duplicateClaim,
      `This case already holds declaration material ${String(existing.materialId)} for this canonical claim`,
      {
        reasonCodes: [DECLARATION_ERROR_CODES.duplicateClaim],
        declarationId: submission.declarationId,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
        materialId: existing.materialId,
        claimRef,
      },
    );
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
function assertEvidenceLinksResolve(
  protocolizationCase: ProtocolizationCase,
  submission: ProtocolizationDeclarationSubmission,
): void {
  if (submission.supportingEvidenceRefs === undefined) return;

  const admitted = new Set(
    protocolizationCase.materials
      .filter((material) => material.kind === ProtocolizationMaterialKind.Evidence)
      .map((material) => material.evidenceRef),
  );

  for (const evidenceRef of submission.supportingEvidenceRefs) {
    if (!admitted.has(evidenceRef)) {
      failDeclaration(
        DECLARATION_ERROR_CODES.unknownEvidenceLink,
        'A supporting evidence reference is not evidence material in this case',
        {
          reasonCodes: [DECLARATION_ERROR_CODES.unknownEvidenceLink],
          declarationId: submission.declarationId,
          caseId: protocolizationCase.caseId,
          tenantId: protocolizationCase.tenantId,
          evidenceRef,
        },
      );
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
function assertDeclarationRequirementCompatibility(
  context: ProtocolizationCaseContext,
  protocolizationCase: ProtocolizationCase,
  submission: ProtocolizationDeclarationSubmission,
  claimType: ClaimType,
): void {
  const profile: AssetProfile | undefined = context.catalog.get(
    protocolizationCase.profile.profileId,
    protocolizationCase.profile.profileVersion,
  );
  if (profile === undefined) {
    // APV-04's code and message for the same condition, so a withdrawn profile
    // fails identically whichever operation notices it first.
    throw new ProtocolizationCaseError(
      PROTOCOLIZATION_CASE_ERROR_CODES.profileNotFound,
      `No AssetProfile ${protocolizationCase.profile.profileId}@${protocolizationCase.profile.profileVersion} is catalogued`,
      {
        reasonCodes: [PROTOCOLIZATION_CASE_ERROR_CODES.profileNotFound],
        profile: protocolizationCase.profile,
        caseId: protocolizationCase.caseId,
      },
    );
  }

  const byId = new Map(profile.requirements.map((requirement) => [requirement.id, requirement]));
  const resolved = submission.requirementIds.map((id) => byId.get(id));
  if (resolved.some((requirement) => requirement === undefined)) return;

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
  const incompatible = resolved.filter(
    (requirement) => requirement?.kind !== AssetRequirementKind.Declaration,
  );

  if (incompatible.length > 0) {
    failDeclaration(
      DECLARATION_ERROR_CODES.incompatibleRequirement,
      `A declaration may only be correlated to declaration requirements of the pinned profile; these are not: ${incompatible
        .map((requirement) => `${requirement?.id} (${requirement?.kind})`)
        .join(', ')}`,
      {
        reasonCodes: [DECLARATION_ERROR_CODES.incompatibleRequirement],
        declarationId: submission.declarationId,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
        requirementIds: incompatible.map((requirement) => requirement?.id as AssetRequirementId),
      },
    );
  }

  // Non-empty by structural admission, and now known to be entirely of kind
  // Declaration, so this narrowing is total.
  const declarationRequirements = resolved as readonly AssetDeclarationRequirement[];

  const mismatched = declarationRequirements.filter(
    (requirement) =>
      requirement.claimType !== claimType ||
      (requirement.claimSubtype !== undefined &&
        requirement.claimSubtype !== submission.claimSubtype),
  );

  if (mismatched.length > 0) {
    failDeclaration(
      DECLARATION_ERROR_CODES.claimTypeMismatch,
      `The pinned profile requires a different declaration for: ${mismatched.map((requirement) => requirement.id).join(', ')}`,
      {
        reasonCodes: [DECLARATION_ERROR_CODES.claimTypeMismatch],
        declarationId: submission.declarationId,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
        requirementIds: mismatched.map((requirement) => requirement.id),
      },
    );
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
export function recordProtocolizationDeclaration(
  context: ProtocolizationCaseContext,
  protocolizationCase: ProtocolizationCase,
  submission: ProtocolizationDeclarationSubmission,
): ProtocolizationDeclarationTransition {
  assertActingTenantOwnsCase(context, protocolizationCase);

  const admission = validateProtocolizationDeclarationSubmission(submission);
  if (!admission.admitted) {
    failDeclaration(
      DECLARATION_ERROR_CODES.invalidSubmission,
      `Declaration submission was not admitted: ${admission.reasons.join(', ')}`,
      {
        reasonCodes: admission.reasons,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
      },
    );
  }

  if (submission.caseId !== protocolizationCase.caseId) {
    failDeclaration(
      DECLARATION_ERROR_CODES.caseMismatch,
      'The submission names a different ProtocolizationCase',
      {
        reasonCodes: [DECLARATION_ERROR_CODES.caseMismatch],
        declarationId: submission.declarationId,
        caseId: protocolizationCase.caseId,
        tenantId: protocolizationCase.tenantId,
      },
    );
  }

  const claimRef = submittedClaimRef(submission);
  const claimType = submittedClaimType(submission);

  assertClaimNotAlreadyInCase(protocolizationCase, claimRef, submission);
  assertEvidenceLinksResolve(protocolizationCase, submission);
  assertDeclarationRequirementCompatibility(context, protocolizationCase, submission, claimType);

  // Everything the case owns — lifecycle, pinned-version requirement
  // correlation, duplicate material ids, the clock, the revision increment and
  // the freeze — is enforced here, once, by the aggregate that owns it. The
  // `CanonicalClaim` document, if one was supplied, is deliberately not passed
  // on: the case records the reference, never a copy of the record.
  const transition = addProtocolizationCaseMaterial(context, protocolizationCase, {
    materialId: submission.materialId,
    kind: ProtocolizationMaterialKind.Declaration,
    claimRef,
    requirementIds: submission.requirementIds,
    ...(submission.correlationId === undefined ? {} : { correlationId: submission.correlationId }),
  });

  // The recording instant is the case event's instant, read once. A second
  // clock read would let a record and the material it describes disagree about
  // when the same act happened.
  const recordedAt = transition.event.occurredAt;
  const caseRevision = transition.protocolizationCase.revision;

  const record: ProtocolizationDeclarationRecord = {
    schemaVersion: PROTOCOLIZATION_DECLARATION_RECORD_SCHEMA_VERSION,
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

  const recordValidation = validateProtocolizationDeclarationRecord(record);
  if (!recordValidation.admitted) {
    failDeclaration(
      DECLARATION_ERROR_CODES.invalidRecord,
      `Refusing to produce an invalid ProtocolizationDeclarationRecord: ${recordValidation.reasons.join(', ')}`,
      { reasonCodes: recordValidation.reasons, declarationId: submission.declarationId },
    );
  }

  const declarationEvent: ProtocolizationDeclarationRecordedEvent = {
    eventType: PROTOCOLIZATION_DECLARATION_EVENT_TYPES.recorded,
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
    record: deepFreeze(record),
    caseEvent: transition.event,
    declarationEvent: deepFreeze(declarationEvent),
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
export function reconstituteProtocolizationDeclarationRecord(
  value: unknown,
): ProtocolizationDeclarationRecord {
  const validation = validateProtocolizationDeclarationRecord(value);
  if (!validation.admitted) {
    failDeclaration(
      DECLARATION_ERROR_CODES.invalidRecord,
      `Refusing to reconstitute an invalid ProtocolizationDeclarationRecord: ${validation.reasons.join(', ')}`,
      { reasonCodes: validation.reasons },
    );
  }
  return deepFreeze(value as ProtocolizationDeclarationRecord);
}
