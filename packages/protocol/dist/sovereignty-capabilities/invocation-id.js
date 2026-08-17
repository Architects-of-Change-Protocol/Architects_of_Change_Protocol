"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintSovereigntyCapabilityInvocationId = mintSovereigntyCapabilityInvocationId;
exports.isValidSovereigntyCapabilityInvocationId = isValidSovereigntyCapabilityInvocationId;
const node_crypto_1 = require("node:crypto");
const INVOCATION_ID_PREFIX = 'aoc:sovereignty-capability-invocation:';
const UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/;
const INVOCATION_ID_PATTERN = new RegExp(`^${INVOCATION_ID_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${UUID_PATTERN.source}$`);
/**
 * Mints a fresh invocation identity. Uses the same `node:crypto`
 * `randomUUID()` source as `mintSovereignAssetId`, so the two AOC minted
 * identifier schemes share one entropy source and one uuid shape rather than
 * introducing a second (or an external dependency).
 *
 * Call once per invocation. Reusing an id across two invocations makes their
 * evidence records indistinguishable, which the evidence spine has no way to
 * detect or repair.
 */
function mintSovereigntyCapabilityInvocationId() {
    return `${INVOCATION_ID_PREFIX}${(0, node_crypto_1.randomUUID)()}`;
}
/**
 * Structural validation only. It does not confirm that the invocation
 * happened, was accepted, or was minted by this runtime.
 */
function isValidSovereigntyCapabilityInvocationId(value) {
    return typeof value === 'string' && INVOCATION_ID_PATTERN.test(value);
}
