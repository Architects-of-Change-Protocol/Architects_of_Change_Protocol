# Consensus Expiration Policy

**Constitution Version:** v16.0

## Constitutional rule

Consensus is not permanent. Every consensus authority must declare an expiration policy. Expiration transitions a consensus from `Established` to `Expired` without deleting historical records. Expired consensus may trigger recomputation.

## Expiration policy catalog

| Expiration Policy ID | Consensus Class | Valid Expiration Triggers | Expiration Semantics | Recomputation Permitted | Historical Preservation | Amendment | Status |
|---|---|---|---|---|---|---|---|
| CXP-0001 | Constitutional | Attestation Expiration; Constitutional Override | Consensus becomes Expired | Yes | Preserved permanently | AOC-AMD-0011 | Active |
| CXP-0002 | Governance | Attestation Expiration; Standing Revocation; Governance Decision | Consensus becomes Expired | Yes | Preserved permanently | AOC-AMD-0011 | Active |
| CXP-0003 | Runtime | Attestation Expiration; Trust Decay; Verification Expiration; Standing Revocation; Threshold Failure | Consensus becomes Expired | Yes | Preserved permanently | AOC-AMD-0011 | Active |
| CXP-0004 | Operational | Attestation Expiration; Trust Decay; Governance Decision; Constitutional Override | Consensus becomes Expired | Yes | Preserved permanently | AOC-AMD-0011 | Active |

## Expiration triggers

- **Attestation Expiration**: One or more constituent attestations have expired.
- **Trust Decay**: Underlying trust signals have decayed below required threshold.
- **Verification Expiration**: Underlying verification signals have expired.
- **Standing Revocation**: A participating actor's standing has been revoked.
- **Threshold Failure**: Recomputation fails to satisfy the threshold policy.
- **Governance Decision**: A governance decision triggers consensus expiration.
- **Constitutional Override**: A constitutional amendment overrides an established consensus.
