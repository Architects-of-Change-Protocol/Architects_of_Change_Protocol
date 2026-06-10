# Governance Proposal Policy

**Constitution Version:** v16.0

## Purpose

A governance proposal is a governed request to exercise collective constitutional authority. Every proposal must satisfy this policy before becoming admissible.

## Proposal fields

| Field | Required | Description |
|---|---|---|
| Proposal ID | Yes | Unique identifier in format GPR-NNNN |
| Governance ID | Yes | Reference to a canonical governance authority in GOVERNANCE-AUTHORITIES.md |
| Proposer | Yes | Standing-backed proposer identity |
| Standing Reference | Yes | Reference to valid proposer standing |
| Claim Reference | Yes | Reference to supporting claim |
| Consensus Reference | Yes | Reference to consensus where required by governance authority |
| Rationale | Yes | Constitutional justification for the proposal |
| Scope | Yes | Explicit boundaries of proposed direction |
| Impact Assessment | Yes | Assessment of governance impact |
| Amendment Reference | Yes | Ratified amendment authorizing this proposal class |
| Status | Yes | Current proposal status |

## Valid proposal statuses

- `Draft`
- `Submitted`
- `Admissible`
- `Rejected`
- `Withdrawn`
- `Superseded`
- `Retired`

## Proposal policy catalog

| Proposal Policy ID | Governance Class | Minimum Standing | Consensus Required | Evidence Required | Amendment | Status |
|---|---|---|---|---|---|---|
| GPP-0001 | Constitutional | Constitutional standing | Yes | Constitutional evidence | AOC-AMD-0013 | Active |
| GPP-0002 | Protocol | Protocol standing | Yes | Protocol evidence | AOC-AMD-0013 | Active |
| GPP-0003 | Runtime | Runtime standing | Yes | Runtime evidence | AOC-AMD-0013 | Active |
| GPP-0004 | Operational | Operational standing | Yes | Operational evidence | AOC-AMD-0013 | Active |

## Constitutional rule

No proposal may become Admissible without valid standing, scope, rationale, and impact assessment. A proposal without a valid governance ID reference is constitutionally void.
