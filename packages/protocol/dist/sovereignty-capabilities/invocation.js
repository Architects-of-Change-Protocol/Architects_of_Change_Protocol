"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOVEREIGNTY_CAPABILITY_INVOCATION_SCHEMA_VERSION = void 0;
exports.validateSovereigntyCapabilityInvocation = validateSovereigntyCapabilityInvocation;
exports.isValidSovereigntyCapabilityInvocation = isValidSovereigntyCapabilityInvocation;
exports.buildSovereigntyCapabilityInvocation = buildSovereigntyCapabilityInvocation;
const identity_1 = require("../identity");
const capability_ref_1 = require("./capability-ref");
const invocation_id_1 = require("./invocation-id");
const time_1 = require("./time");
/**
 * Version of the *invocation envelope* contract — not of any capability.
 * Bumping a capability's `SovereigntyCapabilityVersion` says its semantics
 * changed; bumping this says the shape of the envelope carrying it changed.
 */
exports.SOVEREIGNTY_CAPABILITY_INVOCATION_SCHEMA_VERSION = 'aoc-sovereignty-capability-invocation/1';
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
/** Matches the `trim()`-based emptiness rule used by `SovereignExternalReference`. */
function isNonBlankString(value) {
    return typeof value === 'string' && value.trim() !== '';
}
/**
 * Validates the invocation *envelope* only.
 *
 * `input` is checked for presence and nothing else — no type constraint, no
 * canonicalization, no size limit — because the common layer does not own it.
 * A present-but-`undefined` optional field is rejected rather than accepted,
 * matching `validateSovereignExternalReference`: an absent optional must be
 * structurally omitted so anything derived from it stays canonicalizable.
 */
function validateSovereigntyCapabilityInvocation(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return { valid: false, reasons: ['INVALID_INVOCATION_STRUCTURE'] };
    }
    const reasons = [];
    const candidate = value;
    if (candidate.schemaVersion !== exports.SOVEREIGNTY_CAPABILITY_INVOCATION_SCHEMA_VERSION) {
        reasons.push('INVALID_INVOCATION_SCHEMA_VERSION');
    }
    if (!(0, invocation_id_1.isValidSovereigntyCapabilityInvocationId)(candidate.invocationId)) {
        reasons.push('INVALID_INVOCATION_ID');
    }
    if (!(0, capability_ref_1.isValidSovereigntyCapabilityRef)(candidate.capability)) {
        reasons.push('INVALID_INVOCATION_CAPABILITY_REF');
    }
    if (!(0, time_1.isUtcTimestamp)(candidate.requestedAt)) {
        reasons.push('INVALID_INVOCATION_REQUESTED_AT');
    }
    if (hasOwn(candidate, 'correlationId') && !isNonBlankString(candidate.correlationId)) {
        reasons.push('INVALID_INVOCATION_CORRELATION_ID');
    }
    if (hasOwn(candidate, 'subject') && !(0, identity_1.isValidSovereignSubjectRef)(candidate.subject)) {
        reasons.push('INVALID_INVOCATION_SUBJECT');
    }
    if (!hasOwn(candidate, 'input')) {
        reasons.push('MISSING_INVOCATION_INPUT');
    }
    return { valid: reasons.length === 0, reasons };
}
function isValidSovereigntyCapabilityInvocation(value) {
    return validateSovereigntyCapabilityInvocation(value).valid;
}
/**
 * Builds and validates an invocation envelope, minting an invocation id and
 * stamping `requestedAt` when they were not supplied. Absent optional fields
 * are omitted structurally, never emitted as `undefined`. Throws rather than
 * repairing malformed input — a construction helper, not a lenient parser.
 */
function buildSovereigntyCapabilityInvocation(input, now = new Date()) {
    const invocation = {
        schemaVersion: exports.SOVEREIGNTY_CAPABILITY_INVOCATION_SCHEMA_VERSION,
        invocationId: input.invocationId ?? (0, invocation_id_1.mintSovereigntyCapabilityInvocationId)(),
        capability: input.capability,
        requestedAt: input.requestedAt ?? (0, time_1.toUtcTimestamp)(now),
        ...(input.correlationId === undefined ? {} : { correlationId: input.correlationId }),
        ...(input.subject === undefined ? {} : { subject: input.subject }),
        input: input.input,
    };
    const validation = validateSovereigntyCapabilityInvocation(invocation);
    if (!validation.valid) {
        throw new Error(`Invalid SovereigntyCapabilityInvocation: ${validation.reasons.join(', ')}`);
    }
    return invocation;
}
