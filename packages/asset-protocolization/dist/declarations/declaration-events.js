"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROTOCOLIZATION_DECLARATION_EVENT_TYPES = void 0;
/**
 * The auditable fact the declaration layer produces.
 *
 * One event, because this slice performs one operation. There is no
 * `ProtocolizationClaimPrepared` alongside it: this package prepares no
 * `CanonicalClaim` (see `declaration-submission.ts`), so a second event named
 * for preparing one would describe something that never happens. And there is
 * no `DeclarationVerified`, `DeclarationApproved`, `ClaimProven`,
 * `OwnershipConfirmed`, `AuthorityConfirmed`, `ProfessionalAttested`,
 * `CaseReady` or `AssetProtocolized` — an event named for something that cannot
 * happen yet is a promise the code does not keep, and each of those names would
 * additionally assert a conclusion no part of this vertical is entitled to
 * reach.
 *
 * Read the name literally: *recorded*. Not believed, not accepted as true, not
 * counted toward anything.
 *
 * ### Why this is a separate union from APV-04's
 *
 * A successful declaration mutates the case through APV-04's own
 * `addProtocolizationCaseMaterial`, which emits its own
 * `ProtocolizationMaterialAdded` event. That event is returned unchanged
 * alongside this one. Widening `PROTOCOLIZATION_CASE_EVENT_TYPES` to carry
 * declaration concerns would have made a closed, reviewed union of case facts
 * grow a member that is not a case fact — so this slice declares its own union,
 * exactly as APV-05 did, and APV-04's stays as it was frozen.
 *
 * The two events describe the same instant from two layers: the case says
 * *material was associated*, this says *this participant asserted this
 * proposition and pointed at this evidence*. They share `occurredAt` and
 * `caseRevision`, which is what lets an audit reader join them without
 * inventing an ordering.
 *
 * ### Why the statement is not on the event
 *
 * The human-readable `statement` is deliberately absent. An event is a
 * notification that fans out to subscribers who may have no business reading
 * free text a participant typed, it is the one unstructured field in the slice,
 * and nothing downstream may derive machine meaning from it anyway — `claimType`
 * and `claimSubtype` carry the semantics. A reader who is entitled to the text
 * reads the record.
 *
 * Events are **outputs**, not the source of truth. The record is the record; a
 * dropped event loses a notification, never declaration history.
 */
exports.PROTOCOLIZATION_DECLARATION_EVENT_TYPES = Object.freeze({
    recorded: 'ProtocolizationDeclarationRecorded',
});
