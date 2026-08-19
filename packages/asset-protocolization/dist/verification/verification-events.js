"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROTOCOLIZATION_VERIFICATION_EVENT_TYPES = void 0;
/**
 * The auditable fact the verification pipeline produces.
 *
 * One event, because this slice performs one operation: a declared check was
 * executed and returned an outcome. Read the name literally — *executed*. Not
 * verified, not approved, not satisfied, not passed in any sense broader than
 * the outcome field says.
 *
 * There is deliberately no `AssetVerified`, `OwnershipVerified`,
 * `IdentityConfirmed`, `RequirementSatisfied`, `CaseApproved`, `CaseReady`,
 * `ProfessionalApproved` or `AssetProtocolized`. Each of those names a
 * conclusion no part of this vertical is entitled to reach, and an event named
 * for something that cannot happen yet is a promise the code does not keep.
 * There is also no `VerificationRunCompleted`: a batch is a convenience over
 * independent executions, not a fact of its own, and an event for it would
 * invite a reader to treat the batch as a verdict.
 *
 * ### Why this is a separate union
 *
 * APV-05 and APV-06 each declared their own slice-scoped event union rather than
 * widening APV-04's closed case-event union, and this follows them. It also has
 * a stronger reason to: recording a verification result mutates no case at all,
 * so there is no case event to widen and no case revision to consume. A batch of
 * fifty executions leaves the case byte-for-byte as it was.
 *
 * ### Why the payload is narrow
 *
 * An event fans out to subscribers who may have no business reading the material
 * a check looked at. It therefore carries identifiers, the outcome and the
 * machine reason — never evidence documents, claim records, declaration
 * statements, resolved content bytes, personal data or secrets. Notably absent
 * is `summary`: it is the one unstructured field in the slice, nothing may
 * derive machine meaning from it, and a reader entitled to it reads the result.
 * `inputRefs` is likewise absent — the result carries the full basis, and an
 * event is a notification rather than an audit record.
 *
 * Events are **outputs**, not the source of truth. The result is the record; a
 * dropped event loses a notification, never verification history.
 */
exports.PROTOCOLIZATION_VERIFICATION_EVENT_TYPES = Object.freeze({
    checkExecuted: 'ProtocolizationVerificationCheckExecuted',
});
