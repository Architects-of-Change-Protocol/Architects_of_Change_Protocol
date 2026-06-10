# Verification Expiration Policy

**Constitution Version:** v14.0

## Constitutional rule

Every verification type has an expiration policy. A verification that expires becomes `Expired` and may no longer influence decisions until re-verified. Historical records are preserved on expiration.

## Verification expiration policy catalog

| Expiration Policy ID | Applies To Class | Valid Expiration Triggers | Expiration Semantics | Re-verification Permitted | Historical Preservation | Amendment | Status |
|---|---|---|---|---|---|---|---|
| VXP-0001 | Constitutional | Evidence Expiration; Time Limit; Governance Decision; Constitutional Override | Verification becomes Expired; no new validation influence; historical record preserved | Yes | Required | AOC-AMD-0008 | Active |
| VXP-0002 | Governance | Evidence Expiration; Time Limit; Claim Supersession; Governance Decision | Verification becomes Expired; no new validation influence; historical record preserved | Yes | Required | AOC-AMD-0008 | Active |
| VXP-0003 | Runtime | Evidence Expiration; Time Limit; Claim Supersession; Trust Revocation; Governance Decision | Verification becomes Expired; no new validation influence; historical record preserved | Yes | Required | AOC-AMD-0008 | Active |
| VXP-0004 | Operational | Evidence Expiration; Time Limit; Governance Decision; Constitutional Override | Verification becomes Expired; no new validation influence; historical record preserved | Yes | Required | AOC-AMD-0008 | Active |

## Valid expiration triggers

| Trigger | Description |
|---|---|
| Evidence Expiration | Supporting evidence no longer satisfies freshness rules |
| Time Limit | Verification period elapsed per verification type definition |
| Claim Supersession | Underlying claim superseded by a newer claim |
| Trust Revocation | Underlying trust signal revoked |
| Governance Decision | Ratified governance decision terminates verification |
| Constitutional Override | Constitutional amendment supersedes verification |
