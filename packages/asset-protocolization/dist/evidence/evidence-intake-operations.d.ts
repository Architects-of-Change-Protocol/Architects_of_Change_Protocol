import type { ProtocolizationCaseEvent } from '../case/case-events';
import type { ProtocolizationCaseContext } from '../case/case-operations';
import type { ProtocolizationCase } from '../case/protocolization-case';
import type { ProtocolizationEvidenceReceivedEvent } from './evidence-intake-events';
import type { EvidenceIntakeReceipt } from './evidence-intake-receipt';
import type { ProtocolizationEvidenceSubmission } from './evidence-submission';
/**
 * The evidence intake operation.
 *
 * One pure function over an immutable case. It takes a submission, decides
 * whether the submission is *structurally admissible*, and — if it is — returns
 * the updated case, an immutable receipt, and the two events that describe what
 * happened. It mutates nothing and performs no I/O: no network call, no
 * database call, no registry lookup, no file read, no digest computation, no
 * signature check. The only outside world it touches is the clock and the
 * profile catalogue, both injected through APV-04's context.
 *
 * ### What success means
 *
 * ```text
 * APV accepted this evidence reference structurally into this case workflow.
 * ```
 *
 * That is the entire claim. It does **not** mean the evidence is authentic,
 * true, authoritative, current, sufficient or admissible in any legal sense; it
 * does not mean the requirements it was offered against are satisfied; it does
 * not mean the identity is resolved, the ownership established or the authority
 * proven; and it does not mean the case is ready. Every one of those is a
 * conclusion a later slice reaches by *reading* what this one recorded.
 *
 * ### Progressive intake
 *
 * Evidence arrives over the life of a case — minutes, weeks or months after it
 * was opened, in any order, from any number of sources. Nothing here assumes a
 * single submit-everything-then-verify transaction: each intake is independent,
 * each produces its own receipt at its own instant, and no intake rewrites,
 * replaces or deletes what an earlier one recorded. Later evidence that
 * supersedes earlier evidence is simply a further intake; both remain
 * observable, and formalizing supersession is a later slice's work.
 *
 * ### Why the case mutation goes through APV-04
 *
 * The association is performed by `addProtocolizationCaseMaterial`, not by a
 * parallel evidence list on the case. APV-04 already models exactly this — a
 * `ProtocolizationMaterialKind.Evidence` association naming a
 * `CanonicalEvidenceId`, correlated to requirements of the pinned profile — and
 * it already enforces the lifecycle rule, the requirement-id rule, the pinned
 * version rule, the duplicate-material rule, the clock rule and the revision
 * rule. Delegating means one implementation of each, one set of error codes,
 * and exactly one revision increment per intake.
 */
/**
 * What an accepted intake produces.
 *
 * All four values are returned together, and none of them is persisted here.
 * That is deliberate: a successful intake has to update the case *and* record a
 * receipt, and those are two writes to two stores. Performing them inside this
 * function would let it report success after the first one succeeded and the
 * second failed — a case carrying material with no receipt behind it. A pure
 * operation hands both results to a composition layer that can commit them
 * together under whatever transactional facility it actually has.
 */
export interface ProtocolizationEvidenceIntakeTransition {
    /** The case with the evidence association added. Deeply frozen. */
    readonly protocolizationCase: ProtocolizationCase;
    /** The immutable record that this intake happened. Deeply frozen. */
    readonly receipt: EvidenceIntakeReceipt;
    /** APV-04's own event for the material association, unchanged. */
    readonly caseEvent: ProtocolizationCaseEvent;
    /** APV-05's event for the intake. Shares `occurredAt` and `caseRevision` with the above. */
    readonly intakeEvent: ProtocolizationEvidenceReceivedEvent;
}
/**
 * Receives one piece of evidence into one case, or fails.
 *
 * Order of checks is part of the contract: tenant, then case identity, then
 * structural admission, then case-scoped duplication, then everything APV-04
 * enforces. A failure at any step throws and produces nothing — no receipt, no
 * event, no case mutation and no revision increment. A rejected submission
 * leaves the case byte-for-byte as it was.
 */
export declare function intakeProtocolizationEvidence(context: ProtocolizationCaseContext, protocolizationCase: ProtocolizationCase, submission: ProtocolizationEvidenceSubmission): ProtocolizationEvidenceIntakeTransition;
/**
 * Turns an untrusted, persisted value back into a receipt, or fails.
 *
 * The single supported way to bring a receipt back across a persistence or
 * network boundary — the same role, and the same rule, as
 * `reconstituteProtocolizationCase`: validate before trusting, and freeze what
 * is returned, so a store cannot hand a caller a receipt this package would
 * have refused to produce.
 */
export declare function reconstituteEvidenceIntakeReceipt(value: unknown): EvidenceIntakeReceipt;
//# sourceMappingURL=evidence-intake-operations.d.ts.map