import type { CanonicalTimestamp } from './primitives';
/**
 * The calendar components are checked explicitly rather than by trusting
 * `Date.parse`, which *normalizes* impossible dates instead of rejecting them:
 * `2026-02-31T12:00:00Z` parses happily and silently becomes 3 March. A
 * timestamp that means a different instant than it spells is not canonical, and
 * preserving it verbatim in a claim — as these validators do — would record an
 * assertion nobody made. Leap years and per-month lengths therefore have to
 * hold, and out-of-range clock fields are rejected outright.
 */
export declare function isCanonicalTimestamp(value: unknown): value is CanonicalTimestamp;
//# sourceMappingURL=timestamps.d.ts.map