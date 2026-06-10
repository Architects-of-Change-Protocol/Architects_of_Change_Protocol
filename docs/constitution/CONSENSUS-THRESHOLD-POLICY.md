# Consensus Threshold Policy

**Constitution Version:** v15.0

## Constitutional rule

No consensus may become `Established` without threshold satisfaction. Every consensus authority must declare a threshold policy. Threshold policies define the minimum participation and coverage requirements for establishing constitutional agreement.

## Threshold policy catalog

| Threshold Policy ID | Consensus Class | Minimum Threshold | Minimum Participants | Minimum Attestations | Minimum Standing Coverage | Minimum Verification Coverage | Minimum Trust Coverage | Minimum Reputation Coverage | Amendment | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| CTP-0001 | Constitutional | 100% | All eligible constitutional actors | One per eligible actor | Full constitutional standing | Full verification required | Full trust required | Full reputation required | AOC-AMD-0011 | Active |
| CTP-0002 | Governance | 66% | Minimum three eligible governance actors | One per participating actor | Governance-level standing | Verification encouraged | Trust required | Reputation required | AOC-AMD-0011 | Active |
| CTP-0003 | Runtime | 51% | Minimum two eligible runtime actors | One per participating actor | Active standing required | Verification optional | Trust required | Reputation recommended | AOC-AMD-0011 | Active |
| CTP-0004 | Operational | 75% | Minimum two eligible operational actors | One per participating actor | Active standing required | Verification recommended | Trust recommended | Reputation recommended | AOC-AMD-0011 | Active |

## Threshold invariants

No consensus threshold may be weakened without a Type C amendment. Threshold satisfaction is a prerequisite for every `Pending Evaluation` → `Established` transition. Threshold failure triggers recomputation or revocation.
