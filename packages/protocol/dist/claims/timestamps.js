"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCanonicalTimestamp = isCanonicalTimestamp;
/**
 * `Date.prototype.toISOString()` output, i.e. RFC 3339 with an explicit `Z`
 * and no local offset.
 *
 * This is the single structural rule for a `CanonicalTimestamp`
 * (= `UtcDateTime`) in the package: the SM-03 invocation spine's
 * `isUtcTimestamp` delegates here rather than carrying a second copy of the
 * pattern, so the invocation envelope, portable evidence and canonical claims
 * cannot drift into disagreeing about what a canonical timestamp is.
 *
 * A local-offset timestamp (`…+02:00`) is rejected deliberately: two records
 * of the same instant written on differently configured hosts must not
 * canonicalize, hash or compare differently.
 *
 * Internal to the package — not re-exported from `@aoc/protocol/claims`,
 * because timestamp *validation* is not part of the published claims
 * vocabulary and the manifest layer's own `createdAt` rule (a looser
 * `Date.parse` check, unchanged here) predates it.
 */
const CANONICAL_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/;
function isCanonicalTimestamp(value) {
    return (typeof value === 'string'
        && CANONICAL_TIMESTAMP_PATTERN.test(value)
        && !Number.isNaN(Date.parse(value)));
}
