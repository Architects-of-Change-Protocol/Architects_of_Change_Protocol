# Attestation Expiration Policy

**Constitution Version:** v15.0

## Constitutional rule

Every attestation type must declare an expiration policy. Expiration transitions an `Active` attestation to `Expired`. Expired attestations may not provide endorsement input. Historical records are permanently preserved after expiration.

## Valid expiration triggers

| Trigger | Description |
|---|---|
| Time Limit | Attestation expires after a cataloged maximum duration |
| Trust Decay | Attesting actor's trust score falls below the eligibility threshold |
| Verification Expiration | Attesting actor's required verification expires |
| Reputation Revocation | Attesting actor's reputation is revoked |
| Standing Revocation | Attesting actor's standing is revoked or suspended |
| Governance Decision | A constitutional governance decision causes expiration |
| Constitutional Override | A ratified amendment causes expiration |

## Expiration policy catalog

| Expiration Policy ID | Attestation Class | Valid Expiration Triggers | Expiration Semantics | Re-attestation Permitted | Historical Preservation | Amendment | Status |
|---|---|---|---|---|---|---|---|
| AXP-0001 | Constitutional | Time Limit; Constitutional Override; Governance Decision | Attestation becomes Expired; no new endorsement influence; historical record preserved | Yes | All historical records preserved permanently | AOC-AMD-0010 | Active |
| AXP-0002 | Governance | Time Limit; Standing Revocation; Governance Decision; Constitutional Override | Attestation becomes Expired; no new endorsement influence; historical record preserved | Yes | All historical records preserved permanently | AOC-AMD-0010 | Active |
| AXP-0003 | Runtime | Time Limit; Trust Decay; Verification Expiration; Standing Revocation; Governance Decision | Attestation becomes Expired; no new endorsement influence; historical record preserved | Yes | All historical records preserved permanently | AOC-AMD-0010 | Active |
| AXP-0004 | Operational | Time Limit; Reputation Revocation; Standing Revocation; Governance Decision | Attestation becomes Expired; no new endorsement influence; historical record preserved | Yes | All historical records preserved permanently | AOC-AMD-0010 | Active |

## Expiration invariants

Expiration does not delete an attestation. `Expired` attestations transition to `Retired`. Re-attestation after expiration requires a new attestation instance with fresh eligibility validation and is not a lifecycle restoration of the expired attestation.
