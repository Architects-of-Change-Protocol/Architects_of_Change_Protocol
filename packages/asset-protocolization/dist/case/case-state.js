"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INITIAL_PROTOCOLIZATION_CASE_STATE = exports.ProtocolizationRequirementConditionStatus = exports.ProtocolizationRequirementMaterialStatus = exports.ProtocolizationCaseState = void 0;
exports.isProtocolizationCaseState = isProtocolizationCaseState;
exports.isAllowedProtocolizationCaseTransition = isAllowedProtocolizationCaseTransition;
exports.acceptsProtocolizationMaterial = acceptsProtocolizationMaterial;
/**
 * The `ProtocolizationCase` lifecycle.
 *
 * Deliberately three states. APV-04 is the foundation of the lifecycle, not the
 * lifecycle: a state is added when an operation in this package can actually
 * reach it, and every state a later slice will need — readiness, verification
 * outcomes, protocolization, rejection — depends on evaluation machinery that
 * does not exist yet. Adding those names now would mean either leaving them
 * unreachable or, far worse, making one reachable on a rule that only looks
 * like the real one.
 *
 * `Ready` is the specific trap. Every input a readiness decision needs is
 * structurally available (see `case-progress.ts`), which makes it tempting to
 * declare a case ready once material is present for every required requirement.
 * That would be false: a claim can exist and be untrue, evidence can exist and
 * fail validation, an attestation can exist and be invalid, a registry lookup
 * can exist and be stale, a credential can exist and be expired. Presence is
 * not truth, and this enum must never let a reader believe otherwise.
 */
exports.ProtocolizationCaseState = {
    /** Created and being assembled. Material may be attached. */
    Draft: 'Draft',
    /** Explicitly taken up for processing. Material may still be attached. */
    Active: 'Active',
    /** Terminal. Retained and readable; no further mutation is accepted. */
    Cancelled: 'Cancelled',
};
/**
 * What the case knows about *material* for one requirement. Not a verification
 * outcome, not a satisfaction judgement, and never a legal conclusion.
 *
 * Two members, because the case can honestly distinguish exactly two situations
 * without evaluating anything: something has been associated with this
 * requirement, or nothing has. A third member such as `Blocked` would have to
 * be decided by someone — and "who may declare a requirement blocked" is an
 * authority question this slice does not answer.
 */
exports.ProtocolizationRequirementMaterialStatus = {
    /** No material is associated with this requirement yet. */
    Pending: 'Pending',
    /**
     * At least one material reference is associated.
     *
     * This says a reference was recorded. It does not say the reference is
     * valid, current, sufficient, checked, or that the requirement is satisfied.
     */
    MaterialPresent: 'MaterialPresent',
};
/**
 * Whether a `Conditional` requirement's condition has been resolved.
 *
 * APV-04 evaluates no condition, so every conditional requirement reports
 * `Unresolved`. That is the honest answer, and it is deliberately not spelled as
 * a boolean: a condition that has not been evaluated is neither "applies" nor
 * "does not apply", and collapsing it to either would silently drop a
 * requirement from a later readiness evaluation or invent one that never
 * applied. `NotApplicable` means only that the requirement is not conditional.
 */
exports.ProtocolizationRequirementConditionStatus = {
    /** The requirement's obligation is not `Conditional`; there is no condition. */
    NotApplicable: 'NotApplicable',
    /** The requirement is `Conditional` and its condition has not been evaluated. */
    Unresolved: 'Unresolved',
};
/**
 * The complete transition table. Anything absent is rejected, so the set of
 * legal moves is readable in one place rather than distributed across the
 * operations that perform them.
 *
 * `Active -> Draft` is absent: a case that has been taken up cannot quietly
 * become a draft again, which would make "when was this activated?" unanswerable
 * from the aggregate. `Cancelled -> *` is absent: reopening a cancelled case is
 * a governance concept — who may reopen, on what authority — and inventing it
 * here would be the waiver mechanism APV-04 is explicitly forbidden to build.
 * Neither is a permanent decision; both are additive amendments when a frozen
 * artifact actually requires them.
 */
const ALLOWED_TRANSITIONS = Object.freeze({
    [exports.ProtocolizationCaseState.Draft]: [exports.ProtocolizationCaseState.Active, exports.ProtocolizationCaseState.Cancelled],
    [exports.ProtocolizationCaseState.Active]: [exports.ProtocolizationCaseState.Cancelled],
    [exports.ProtocolizationCaseState.Cancelled]: [],
});
/** The state every case starts in. */
exports.INITIAL_PROTOCOLIZATION_CASE_STATE = exports.ProtocolizationCaseState.Draft;
function isProtocolizationCaseState(value) {
    return typeof value === 'string' && Object.values(exports.ProtocolizationCaseState).includes(value);
}
function isAllowedProtocolizationCaseTransition(from, to) {
    return (ALLOWED_TRANSITIONS[from] ?? []).includes(to);
}
/** Which states still accept material. Cancelled cases are read-only. */
function acceptsProtocolizationMaterial(state) {
    return state === exports.ProtocolizationCaseState.Draft || state === exports.ProtocolizationCaseState.Active;
}
