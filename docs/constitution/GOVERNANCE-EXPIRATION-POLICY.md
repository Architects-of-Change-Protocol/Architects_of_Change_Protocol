# Governance Expiration Policy

**Constitution Version:** v18.0

## Purpose

Governance artifacts may expire due to constitutional triggers. Expiration removes current governance effect without deleting the historical record.

## Valid expiration triggers

- `Time Limit`
- `Consensus Expiration`
- `Mandate Expiration`
- `Standing Revocation`
- `Policy Change`
- `Constitutional Override`
- `Governance Decision`

## Expiration semantics

Expiration does not delete history. Expiration only removes current governance effect. An expired governance artifact:

1. May no longer authorize new direction.
2. Preserves its historical record permanently.
3. May not be reactivated except through a new governance process.

## Expiration policy catalog

| Expiration Policy ID | Governance Class | Valid Expiration Triggers | Expiration Semantics | Historical Preservation | Amendment | Status |
|---|---|---|---|---|---|---|
| GXP-0001 | Constitutional | Time Limit; Constitutional Override; Governance Decision | Mandate becomes Expired | Preserved permanently | AOC-AMD-0013 | Active |
| GXP-0002 | Protocol | Time Limit; Policy Change; Constitutional Override; Governance Decision | Mandate becomes Expired | Preserved permanently | AOC-AMD-0013 | Active |
| GXP-0003 | Runtime | Time Limit; Consensus Expiration; Standing Revocation; Policy Change; Governance Decision | Mandate becomes Expired | Preserved permanently | AOC-AMD-0013 | Active |
| GXP-0004 | Operational | Time Limit; Consensus Expiration; Mandate Expiration; Standing Revocation; Governance Decision | Mandate becomes Expired | Preserved permanently | AOC-AMD-0013 | Active |

## Constitutional rule

Expiration of a governance artifact does not invalidate the historical record of that artifact. The governance history is permanently preserved regardless of current expiration status.
