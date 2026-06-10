# Consensus Models Policy

**Constitution Version:** v17.0

## Constitutional rule

Every consensus authority must declare a consensus model. The model governs how individual attestations are aggregated to determine whether constitutional agreement exists. No consensus may become `Established` without a valid model computation.

## Consensus models registry

| Model Policy ID | Consensus Class | Model Name | Aggregation Method | Weighting | Minimum Participants | Amendment | Status |
|---|---|---|---|---|---|---|---|
| CMP-0001 | Constitutional | Constitutional Consensus | Unanimous agreement required | Equal weight per eligible actor | All eligible constitutional actors | AOC-AMD-0011 | Active |
| CMP-0002 | Governance | Supermajority Consensus | Two-thirds or greater agreement | Equal weight per eligible actor | Minimum three eligible governance actors | AOC-AMD-0011 | Active |
| CMP-0003 | Runtime | Simple Majority Consensus | Greater than fifty percent agreement | Reputation-weighted per actor | Minimum two eligible runtime actors | AOC-AMD-0011 | Active |
| CMP-0004 | Operational | Weighted Consensus | Weighted aggregate meeting threshold | Trust-weighted per actor | Minimum two eligible operational actors | AOC-AMD-0011 | Active |

## Supported consensus models

- **Simple Majority**: More than 50% of eligible participants agree.
- **Supermajority**: 66% or greater of eligible participants agree.
- **Unanimous**: All eligible participants agree.
- **Weighted Consensus**: Weighted aggregate of participant signals meets threshold.
- **Reputation Weighted Consensus**: Weight derived from reputation signals.
- **Trust Weighted Consensus**: Weight derived from trust signals.
- **Constitutional Consensus**: Unanimous agreement among constitutionally eligible actors.
