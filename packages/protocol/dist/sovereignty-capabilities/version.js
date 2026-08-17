"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSovereigntyCapabilityVersion = isSovereigntyCapabilityVersion;
const CAPABILITY_VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
/**
 * Authoritative structural check for a capability version: exactly three
 * dot-separated runs of digits, no sign, exponent, pre-release or build
 * metadata. Every canonical definition satisfies this.
 */
function isSovereigntyCapabilityVersion(value) {
    return typeof value === 'string' && CAPABILITY_VERSION_PATTERN.test(value);
}
