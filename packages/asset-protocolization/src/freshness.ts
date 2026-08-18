import type { UtcDateTime } from '@aoc/protocol/contracts';

/**
 * Freshness (staleness) constraints a profile may place on the inputs a later
 * slice supplies.
 *
 * Deliberately generic. A constraint here says *how recently something must
 * have been observed*, never *how long a particular kind of document is legally
 * valid in a particular country* — validity periods are a legal fact that only
 * a later, citation-bearing profile may establish, and never this framework.
 *
 * The instants these constraints are evaluated against are Protocol's, not the
 * vertical's: `CanonicalRegistryLookupResult.observedAt` for a registry
 * observation, `CanonicalEvidence.createdAt` / `CanonicalAttestation.issuedAt`
 * for supplied records, and `CanonicalCredentialRef.status` /
 * `CanonicalCredential.expiresAt` for credential currency. APV-03 declares the
 * constraint; APV-05/APV-07 evaluate it.
 */
export interface AssetFreshnessConstraint {
  /**
   * The observation must be no older than this many seconds at evaluation time.
   * Positive integer.
   */
  readonly maxAgeSeconds?: number;
  /**
   * The observation must be at or after this instant. RFC 3339 with an explicit
   * `Z`, matching Protocol's `UtcDateTime`.
   */
  readonly observedAfter?: UtcDateTime;
  /**
   * The referenced credential or registry entry must not be expired at
   * evaluation time. Expiry is read from the referenced Protocol record; this
   * flag never supplies a period of its own.
   */
  readonly mustNotBeExpired?: boolean;
}

const FRESHNESS_KEYS: readonly string[] = ['maxAgeSeconds', 'observedAfter', 'mustNotBeExpired'];

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

export function isValidUtcDateTime(value: unknown): value is UtcDateTime {
  if (typeof value !== 'string') return false;
  if (!UTC_DATE_TIME_PATTERN.test(value)) return false;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return false;
  // `Date.parse` normalizes impossible calendar dates (2026-02-31 becomes
  // 3 March) instead of rejecting them. Round-tripping the parsed instant back
  // to its calendar spelling catches that: a value that means a different
  // instant than it spells is not a canonical timestamp.
  return new Date(parsed).toISOString().slice(0, 19) === value.slice(0, 19);
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

/**
 * Structural validation. An empty constraint is rejected: a freshness
 * requirement that constrains nothing would read as "freshness was considered"
 * while imposing no obligation at all, which is precisely the kind of
 * false-assurance shape the epistemic invariants forbid.
 */
export function isValidAssetFreshnessConstraint(value: unknown): value is AssetFreshnessConstraint {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const candidate = value as Partial<AssetFreshnessConstraint>;

  for (const key of Object.keys(candidate)) {
    if (!FRESHNESS_KEYS.includes(key)) return false;
  }

  let constrained = false;

  if (hasOwn(candidate, 'maxAgeSeconds')) {
    if (!Number.isSafeInteger(candidate.maxAgeSeconds) || (candidate.maxAgeSeconds as number) <= 0) {
      return false;
    }
    constrained = true;
  }

  if (hasOwn(candidate, 'observedAfter')) {
    if (!isValidUtcDateTime(candidate.observedAfter)) return false;
    constrained = true;
  }

  if (hasOwn(candidate, 'mustNotBeExpired')) {
    if (typeof candidate.mustNotBeExpired !== 'boolean') return false;
    if (candidate.mustNotBeExpired) constrained = true;
  }

  return constrained;
}
