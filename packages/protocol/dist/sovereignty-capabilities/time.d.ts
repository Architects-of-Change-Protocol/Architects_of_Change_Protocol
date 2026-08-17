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
export declare const systemSovereigntyCapabilityClock: SovereigntyCapabilityClock;
export declare function isUtcTimestamp(value: unknown): value is UtcDateTime;
export declare function toUtcTimestamp(now: Date): UtcDateTime;
//# sourceMappingURL=time.d.ts.map