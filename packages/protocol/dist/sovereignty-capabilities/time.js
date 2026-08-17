"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemSovereigntyCapabilityClock = void 0;
exports.isUtcTimestamp = isUtcTimestamp;
exports.toUtcTimestamp = toUtcTimestamp;
const timestamps_1 = require("../claims/timestamps");
const systemSovereigntyCapabilityClock = () => new Date();
exports.systemSovereigntyCapabilityClock = systemSovereigntyCapabilityClock;
/**
 * `Date.prototype.toISOString()` output, i.e. RFC 3339 with an explicit `Z`
 * and no local offset. Stricter than the manifest layer's `Date.parse`
 * check, deliberately: a portable evidence record compared across processes
 * must not depend on whether the producing host wrote `…+02:00` or `…Z`, and
 * a local-offset timestamp is exactly the ambiguity §30 of the invocation
 * contract exists to exclude.
 *
 * The rule itself lives with `CanonicalTimestamp` in `../claims/timestamps`
 * (SM-05), so the invocation envelope, portable evidence and canonical
 * provenance claims share one definition of a canonical timestamp rather
 * than three copies of a pattern. Behaviour is unchanged; this is the same
 * check under its owning module.
 */
function isUtcTimestamp(value) {
    return (0, timestamps_1.isCanonicalTimestamp)(value);
}
function toUtcTimestamp(now) {
    return now.toISOString();
}
