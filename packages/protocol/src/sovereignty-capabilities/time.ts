import type { UtcDateTime } from '../contracts';

/**
 * Time source for the invocation spine.
 *
 * The repository's existing convention for injectable time is a trailing
 * `now: Date = new Date()` parameter (`buildSovereignManifestV1`,
 * `signSovereignPayload`). The invoker cannot use that shape: it has to read
 * the clock a second time *after* the capability implementation has
 * returned, so `completedAt` reflects when execution actually finished
 * rather than when the call was set up. A nullary function is therefore the
 * smallest faithful generalisation of the existing convention, and it is all
 * a deterministic test needs. No `Clock` port existed in Protocol to reuse.
 */
export type SovereigntyCapabilityClock = () => Date;

export const systemSovereigntyCapabilityClock: SovereigntyCapabilityClock = () => new Date();

/**
 * `Date.prototype.toISOString()` output, i.e. RFC 3339 with an explicit `Z`
 * and no local offset. Stricter than the manifest layer's `Date.parse`
 * check, deliberately: a portable evidence record compared across processes
 * must not depend on whether the producing host wrote `…+02:00` or `…Z`, and
 * a local-offset timestamp is exactly the ambiguity §30 of the invocation
 * contract exists to exclude.
 */
const UTC_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/;

export function isUtcTimestamp(value: unknown): value is UtcDateTime {
  return typeof value === 'string' && UTC_TIMESTAMP_PATTERN.test(value) && !Number.isNaN(Date.parse(value));
}

export function toUtcTimestamp(now: Date): UtcDateTime {
  return now.toISOString();
}
