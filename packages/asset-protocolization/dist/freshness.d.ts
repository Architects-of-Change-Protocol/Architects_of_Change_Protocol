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
export declare function isValidUtcDateTime(value: unknown): value is UtcDateTime;
/**
 * Structural validation. An empty constraint is rejected: a freshness
 * requirement that constrains nothing would read as "freshness was considered"
 * while imposing no obligation at all, which is precisely the kind of
 * false-assurance shape the epistemic invariants forbid.
 */
export declare function isValidAssetFreshnessConstraint(value: unknown): value is AssetFreshnessConstraint;
//# sourceMappingURL=freshness.d.ts.map