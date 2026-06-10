# Consensus Recomputation Policy

**Constitution Version:** v13.0

## Constitutional rule

Consensus is a living constitutional state. It must be recomputed when underlying signals change. Recomputation may restore an `Expired` consensus to `Established` if threshold is re-satisfied. Recomputation that fails threshold requirements triggers revocation.

## Recomputation trigger catalog

| Trigger ID | Trigger Name | Trigger Class | Description | Required Action | Amendment | Status |
|---|---|---|---|---|---|---|
| CRC-0001 | Attestation Change | Runtime | An attestation contributing to consensus has been added, expired, or revoked | Recompute consensus threshold | AOC-AMD-0011 | Active |
| CRC-0002 | Verification Change | Runtime | An underlying verification signal has changed or expired | Recompute consensus where verification coverage is required | AOC-AMD-0011 | Active |
| CRC-0003 | Trust Change | Runtime | An underlying trust signal has decayed, changed, or been revoked | Recompute consensus where trust coverage is required | AOC-AMD-0011 | Active |
| CRC-0004 | Reputation Change | Runtime | An underlying reputation signal has changed or been revoked | Recompute consensus where reputation coverage is required | AOC-AMD-0011 | Active |
| CRC-0005 | Standing Change | Governance | A participating actor's standing has changed, been suspended, or revoked | Recompute consensus with updated eligible participant set | AOC-AMD-0011 | Active |
| CRC-0006 | Policy Change | Governance | The threshold policy, model policy, or expiration policy for a consensus has changed | Recompute consensus under new policy | AOC-AMD-0011 | Active |
| CRC-0007 | Governance Event | Governance | A governance decision affecting consensus has been issued | Recompute or retire consensus per governance decision | AOC-AMD-0011 | Active |

## Recomputation invariants

Recomputation uses the current threshold policy, not the policy at consensus creation time, unless a policy change amendment specifies otherwise. Recomputation that re-satisfies the threshold restores `Established` status. Recomputation that fails to satisfy the threshold transitions to `Expired` or `Revoked` depending on the cause. All recomputation events are historically preserved.
