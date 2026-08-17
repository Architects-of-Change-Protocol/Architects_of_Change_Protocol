"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidSovereigntyCapabilityExecutionOutcome = isValidSovereigntyCapabilityExecutionOutcome;
const identity_1 = require("../identity");
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
function hasValidOptionalOutcomeFields(candidate) {
    if (hasOwn(candidate, 'subject') && !(0, identity_1.isValidSovereignSubjectRef)(candidate.subject)) {
        return false;
    }
    if (hasOwn(candidate, 'evidenceRefs')) {
        const refs = candidate.evidenceRefs;
        if (!Array.isArray(refs) || refs.some((ref) => typeof ref !== 'string' || ref.trim() === '')) {
            return false;
        }
    }
    return true;
}
/**
 * Runtime shape check for a value returned by an *external* implementation.
 *
 * The interface is typed, but an implementation can come from outside this
 * package and from outside TypeScript, so the invoker verifies the outcome
 * rather than trusting it. A malformed outcome is treated as a programming
 * fault, not as a capability failure — inventing a plausible outcome from an
 * unreadable one is precisely how a bug becomes indistinguishable from a
 * legitimate result.
 */
function isValidSovereigntyCapabilityExecutionOutcome(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }
    const candidate = value;
    if (candidate.status === 'succeeded') {
        return hasOwn(candidate, 'output') && hasValidOptionalOutcomeFields(candidate);
    }
    if (candidate.status === 'failed') {
        const { reasonCodes } = candidate;
        if (!Array.isArray(reasonCodes)
            || reasonCodes.length === 0
            || reasonCodes.some((code) => typeof code !== 'string' || code.trim() === '')) {
            return false;
        }
        return hasValidOptionalOutcomeFields(candidate);
    }
    return false;
}
