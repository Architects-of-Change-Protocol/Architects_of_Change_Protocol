"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidUtcDateTime = isValidUtcDateTime;
exports.isValidAssetFreshnessConstraint = isValidAssetFreshnessConstraint;
const FRESHNESS_KEYS = ['maxAgeSeconds', 'observedAfter', 'mustNotBeExpired'];
/**
 * `Date.prototype.toISOString()` output — RFC 3339 with an explicit `Z` and no
 * local offset.
 *
 * Protocol owns this rule (`packages/protocol/src/claims/timestamps.ts`) but
 * deliberately does not re-export its `isCanonicalTimestamp` from
 * `@aoc/protocol/claims` ("timestamp *validation* is not part of the published
 * claims vocabulary"). This is therefore a local structural guard over a
 * published Protocol *type*, not a second definition of a Protocol primitive —
 * and it is intentionally the stricter, offset-rejecting form so a profile can
 * never carry an instant that two differently-configured hosts would canonicalize
 * differently. If Protocol later publishes the validator, this collapses into a
 * re-export.
 */
const UTC_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/;
function isValidUtcDateTime(value) {
    if (typeof value !== 'string')
        return false;
    if (!UTC_DATE_TIME_PATTERN.test(value))
        return false;
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed))
        return false;
    // `Date.parse` normalizes impossible calendar dates (2026-02-31 becomes
    // 3 March) instead of rejecting them. Round-tripping the parsed instant back
    // to its calendar spelling catches that: a value that means a different
    // instant than it spells is not a canonical timestamp.
    return new Date(parsed).toISOString().slice(0, 19) === value.slice(0, 19);
}
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
/**
 * Structural validation. An empty constraint is rejected: a freshness
 * requirement that constrains nothing would read as "freshness was considered"
 * while imposing no obligation at all, which is precisely the kind of
 * false-assurance shape the epistemic invariants forbid.
 */
function isValidAssetFreshnessConstraint(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return false;
    const candidate = value;
    for (const key of Object.keys(candidate)) {
        if (!FRESHNESS_KEYS.includes(key))
            return false;
    }
    let constrained = false;
    if (hasOwn(candidate, 'maxAgeSeconds')) {
        if (!Number.isSafeInteger(candidate.maxAgeSeconds) || candidate.maxAgeSeconds <= 0) {
            return false;
        }
        constrained = true;
    }
    if (hasOwn(candidate, 'observedAfter')) {
        if (!isValidUtcDateTime(candidate.observedAfter))
            return false;
        constrained = true;
    }
    if (hasOwn(candidate, 'mustNotBeExpired')) {
        if (typeof candidate.mustNotBeExpired !== 'boolean')
            return false;
        if (candidate.mustNotBeExpired)
            constrained = true;
    }
    return constrained;
}
