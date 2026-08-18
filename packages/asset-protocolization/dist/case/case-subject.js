"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidProtocolizationCaseSubject = isValidProtocolizationCaseSubject;
const identity_1 = require("@aoc/protocol/identity");
const SUBJECT_KEYS = ['subjectRef', 'contentIdentity'];
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
/**
 * Structural validation only, delegated to Protocol's own validators for both
 * fields. A present-but-`undefined` `contentIdentity` is invalid rather than
 * absent, matching every other optional in this package and the canonical-JSON
 * rule it inherits from.
 */
function isValidProtocolizationCaseSubject(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return false;
    const candidate = value;
    for (const key of Object.keys(candidate)) {
        if (!SUBJECT_KEYS.includes(key))
            return false;
    }
    if (!(0, identity_1.isValidSovereignSubjectRef)(candidate.subjectRef))
        return false;
    if (hasOwn(candidate, 'contentIdentity') && !(0, identity_1.isValidContentIdentity)(candidate.contentIdentity)) {
        return false;
    }
    return true;
}
