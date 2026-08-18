import type { UtcDateTime } from '@aoc/protocol/contracts';
/**
 * The only way this package learns the current instant.
 *
 * Every case operation stamps a timestamp, and a domain that reads the host
 * clock directly is neither deterministic nor testable: two runs of the same
 * operation produce two different aggregates, and an ordering assertion becomes
 * a race. So the clock is a port, and no module under `src/` calls `Date.now()`
 * or an argument-less `new Date()` — a property the vertical's boundary test
 * asserts mechanically rather than by convention.
 *
 * This is a *port*, not an adapter. Binding it to the host clock
 * (`() => new Date().toISOString()`) is one line, and it belongs to the
 * composition layer that also supplies case ids — the same layer, for the same
 * reason: both are non-deterministic inputs, and neither is a domain rule.
 *
 * The returned value must be Protocol's `UtcDateTime` in the canonical
 * offset-free form (`isValidUtcDateTime`). A clock that returns anything else
 * fails the operation rather than being silently repaired.
 */
export interface ProtocolizationClock {
    now(): UtcDateTime;
}
//# sourceMappingURL=case-clock.d.ts.map