import type { CanonicalTimestamp } from './primitives';

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
const CANONICAL_TIMESTAMP_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?Z$/;

/**
 * The calendar components are checked explicitly rather than by trusting
 * `Date.parse`, which *normalizes* impossible dates instead of rejecting them:
 * `2026-02-31T12:00:00Z` parses happily and silently becomes 3 March. A
 * timestamp that means a different instant than it spells is not canonical, and
 * preserving it verbatim in a claim — as these validators do — would record an
 * assertion nobody made. Leap years and per-month lengths therefore have to
 * hold, and out-of-range clock fields are rejected outright.
 */
export function isCanonicalTimestamp(value: unknown): value is CanonicalTimestamp {
  if (typeof value !== 'string') return false;

  const match = CANONICAL_TIMESTAMP_PATTERN.exec(value);
  if (match === null) return false;

  const [, year, month, day, hour, minute, second] = match.map(Number);

  if (month < 1 || month > 12) return false;
  if (hour > 23 || minute > 59 || second > 59) return false;

  // Day 0 is never valid, and the upper bound comes from the calendar rather
  // than a fixed 31: `Date.UTC(y, m, 0)` is the last day of month `m`.
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > daysInMonth) return false;

  return !Number.isNaN(Date.parse(value));
}
