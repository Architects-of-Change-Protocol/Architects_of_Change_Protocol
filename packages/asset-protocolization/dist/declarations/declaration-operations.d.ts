import type { ProtocolizationCaseEvent } from '../case/case-events';
import type { ProtocolizationCaseContext } from '../case/case-operations';
import type { ProtocolizationCase } from '../case/protocolization-case';
import type { ProtocolizationDeclarationRecordedEvent } from './declaration-events';
import type { ProtocolizationDeclarationRecord } from './declaration-record';
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
export declare function recordProtocolizationDeclaration(context: ProtocolizationCaseContext, protocolizationCase: ProtocolizationCase, submission: ProtocolizationDeclarationSubmission): ProtocolizationDeclarationTransition;
/**
 * Turns an untrusted, persisted value back into a declaration record, or fails.
 *
 * The single supported way to bring one back across a persistence or network
 * boundary — the same role, and the same rule, as
 * `reconstituteProtocolizationCase` and `reconstituteEvidenceIntakeReceipt`:
 * validate before trusting, and freeze what is returned, so a store cannot hand
 * a caller a record this package would have refused to produce.
 */
export declare function reconstituteProtocolizationDeclarationRecord(value: unknown): ProtocolizationDeclarationRecord;
//# sourceMappingURL=declaration-operations.d.ts.map