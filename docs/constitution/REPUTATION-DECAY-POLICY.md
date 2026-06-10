# Reputation Decay Policy

**Constitution Version:** v15.0

## Constitutional rule

Reputation decays over time and in response to governed events. Decay affects the current reputation score. Decay does not delete historical reputation records. Every reputation type must define its decay triggers, decay rate, floor, and historical preservation rule.

## Valid decay triggers

| Trigger | Description |
|---|---|
| Time | Elapsed time since last positive source event |
| Inactivity | No governed activity contributing to sources within the aggregation window |
| Evidence Expiration | Source evidence expires per its governing expiration policy |
| Trust Decay | Contributing trust signals decay per the trust decay policy |
| Verification Expiration | Contributing verification records expire per the verification expiration policy |
| Claim Supersession | Contributing claim records are superseded |
| Decision Revocation | Contributing decision records are revoked |
| Standing Revocation | Contributing standing records are revoked |
| Governance Events | Constitutional governance decisions affecting source validity |

## Reputation decay policy catalog

| Decay Policy ID | Reputation Class | Decay Triggers | Decay Rate | Floor | Re-evaluation Permitted | Historical Preservation | Amendment | Status |
|---|---|---|---|---|---|---|---|---|
| RDP-0001 | Constitutional | Time; Inactivity; Evidence Expiration; Decision Revocation; Governance Events | Linear decay of 0.05 per 30-day period of inactivity beyond aggregation window | Floor of 0.1 until all sources expire; then 0.0 | Yes; re-evaluation requires new source events within aggregation window | All historical reputation records preserved permanently; current score separate | AOC-AMD-0009 | Active |
| RDP-0002 | Governance | Time; Inactivity; Evidence Expiration; Trust Decay; Decision Revocation; Standing Revocation; Governance Events | Linear decay of 0.08 per 30-day period of inactivity beyond aggregation window | Floor of 0.1 until all sources expire; then 0.0 | Yes; re-evaluation requires new source events within aggregation window | All historical reputation records preserved permanently; current score separate | AOC-AMD-0009 | Active |
| RDP-0003 | Runtime | Time; Inactivity; Evidence Expiration; Trust Decay; Verification Expiration; Claim Supersession; Decision Revocation; Standing Revocation | Linear decay of 0.10 per 30-day period of inactivity beyond aggregation window | Floor of 0.0 when all runtime sources expire | Yes; re-evaluation requires new source events within aggregation window | All historical reputation records preserved permanently; current score separate | AOC-AMD-0009 | Active |
| RDP-0004 | Operational | Time; Inactivity; Evidence Expiration; Claim Supersession; Decision Revocation; Governance Events | Linear decay of 0.10 per 30-day period of inactivity beyond aggregation window | Floor of 0.0 when all operational sources expire | Yes; re-evaluation requires new source events within aggregation window | All historical reputation records preserved permanently; current score separate | AOC-AMD-0009 | Active |
