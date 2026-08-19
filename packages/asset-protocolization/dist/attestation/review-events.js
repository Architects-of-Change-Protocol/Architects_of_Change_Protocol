"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROFESSIONAL_REVIEW_EVENT_TYPES = void 0;
/**
 * The auditable facts the professional review workflow produces.
 *
 * Three events, because this slice performs three distinguishable acts: review
 * was requested, a reviewer decided, and — only where one was legitimately
 * produced — a Protocol attestation came into existence. Read each name
 * literally. *Requested*, not assigned. *Decided*, not approved. *Recorded*, not
 * verified, satisfied, ready or protocolized.
 *
 * There is deliberately no `CaseApproved`, `ProfessionalApproved`,
 * `AssetVerified`, `RequirementSatisfied`, `CaseReady` or `AssetProtocolized`.
 * Each of those names a conclusion no part of this vertical is entitled to
 * reach, and an event named for something that cannot happen yet is a promise
 * the code does not keep.
 *
 * ### Why this is a separate union
 *
 * APV-05, APV-06 and APV-07 each declared their own slice-scoped event union
 * rather than widening APV-04's closed case-event union, and this follows them.
 * Where a decision genuinely mutates the case — an `Attest` that associates a
 * legitimate attestation — APV-04's own `ProtocolizationMaterialAdded` event is
 * returned *unchanged* beside these, rather than being replaced or re-spelled
 * here.
 *
 * ### Why the payloads are narrow
 *
 * An event fans out to subscribers who may have no business reading what a
 * reviewer read. These carry identifiers, the action and the machine reason —
 * never reviewer notes, scope statements, limitations, declaration statements,
 * evidence, check summaries, credential references, personal data or secrets.
 * Notably absent are `note` and `scopeStatement`: they are the unstructured,
 * possibly personal fields of the slice, nothing may derive machine meaning from
 * them, and a reader entitled to them reads the decision.
 *
 * `reviewerCredentialRefs` is absent for a second reason on top of that one: a
 * credential reference in a broadcast payload invites a subscriber to treat its
 * presence as standing, which is exactly the inference this slice refuses to
 * support.
 *
 * Events are **outputs**, not the source of truth. The request and the decision
 * are the records; a dropped event loses a notification, never review history.
 */
exports.PROFESSIONAL_REVIEW_EVENT_TYPES = Object.freeze({
    reviewRequested: 'ProfessionalReviewRequested',
    decisionRecorded: 'ProfessionalReviewDecisionRecorded',
    attestationRecorded: 'ProfessionalAttestationRecorded',
});
