"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemSovereigntyCapabilityClock = void 0;
exports.isUtcTimestamp = isUtcTimestamp;
exports.toUtcTimestamp = toUtcTimestamp;
const systemSovereigntyCapabilityClock = () => new Date();
exports.systemSovereigntyCapabilityClock = systemSovereigntyCapabilityClock;
/**
 * `Date.prototype.toISOString()` output, i.e. RFC 3339 with an explicit `Z`
 * and no local offset. Stricter than the manifest layer's `Date.parse`
 * check, deliberately: a portable evidence record compared across processes
 * must not depend on whether the producing host wrote `…+02:00` or `…Z`, and
 * a local-offset timestamp is exactly the ambiguity §30 of the invocation
 * contract exists to exclude.
 */
const UTC_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/;
function isUtcTimestamp(value) {
    return typeof value === 'string' && UTC_TIMESTAMP_PATTERN.test(value) && !Number.isNaN(Date.parse(value));
}
function toUtcTimestamp(now) {
    return now.toISOString();
}
