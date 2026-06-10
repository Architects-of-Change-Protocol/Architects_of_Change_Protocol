# Governance Motion Policy

**Constitution Version:** v14.0

## Purpose

A governance motion is an admissible governance proposal prepared for collective evaluation. A motion must satisfy this policy before it may be opened for evaluation.

## Motion fields

| Field | Required | Description |
|---|---|---|
| Motion ID | Yes | Unique identifier in format GMT-NNNN |
| Proposal ID | Yes | Reference to an Admissible proposal |
| Governance ID | Yes | Reference to the canonical governance authority |
| Consensus Requirement | Yes | Consensus threshold required for this motion to pass |
| Decision Requirement | Yes | Decision reference required before motion execution |
| Evaluation Window | Yes | Time window for evaluation |
| Motion Type | Yes | Constitutional, Policy, Authority, Runtime, or Operational |
| Status | Yes | Current motion status |

## Valid motion types

- `Constitutional Motion`
- `Policy Motion`
- `Authority Motion`
- `Runtime Motion`
- `Operational Motion`

## Valid motion statuses

- `Prepared`
- `Open`
- `Passed`
- `Failed`
- `Expired`
- `Withdrawn`
- `Retired`

## Motion policy catalog

| Motion Policy ID | Governance Class | Motion Types Allowed | Consensus Threshold | Decision Required | Amendment | Status |
|---|---|---|---|---|---|---|
| GMP-0001 | Constitutional | Constitutional Motion | Unanimous | Yes | AOC-AMD-0013 | Active |
| GMP-0002 | Protocol | Authority Motion; Policy Motion | Supermajority | Yes | AOC-AMD-0013 | Active |
| GMP-0003 | Runtime | Runtime Motion | Simple Majority | Yes | AOC-AMD-0013 | Active |
| GMP-0004 | Operational | Operational Motion | Simple Majority | Yes | AOC-AMD-0013 | Active |

## Constitutional rule

No motion may pass without satisfying its consensus requirement. A motion that does not reference an Admissible proposal is constitutionally void.
