"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSovereigntyCapabilityRef = requireSovereigntyCapabilityRef;
const capability_ref_1 = require("../capability-ref");
/**
 * Resolves the canonical ref a production capsule advertises, from the SM-01
 * registry.
 *
 * Capsules deliberately never write an `{ id: 'aoc:sovereignty-capability:…',
 * version: '1.0.0' }` literal: the registry is the single source of both
 * values, so a capability version bump cannot leave a stale hard-coded pair
 * behind inside an implementation and silently start advertising a version it
 * does not implement.
 *
 * `getSovereigntyCapabilityRefByKey` is intentionally total-with-`undefined`
 * for unknown ids, which is right for a lookup over untrusted input but wrong
 * here: a capsule for one of the canonical eight cannot meaningfully continue
 * if its own capability is missing from the closed inventory. Resolution is
 * therefore performed inside each capsule's factory rather than at module
 * scope, so importing this module still has no side effects and cannot throw.
 */
function requireSovereigntyCapabilityRef(key) {
    const ref = (0, capability_ref_1.getSovereigntyCapabilityRefByKey)(key);
    if (ref === undefined) {
        throw new Error(`Canonical Sovereignty Capability '${key}' is not defined by the registry`);
    }
    return ref;
}
