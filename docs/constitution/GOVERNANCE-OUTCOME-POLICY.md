# Governance Outcome Policy

**Constitution Version:** v1.0

## Purpose

A governance outcome records what the governance process produced. Every completed governance act must produce a traceable outcome.

## Outcome fields

| Field | Required | Description |
|---|---|---|
| Outcome ID | Yes | Unique identifier in format GOP-NNNN |
| Mandate ID | Yes | Reference to the authorizing mandate |
| Governance ID | Yes | Reference to the canonical governance authority |
| Outcome Type | Yes | Approved, Rejected, Modified, Deferred, Superseded, or Invalidated |
| Decision Reference | Yes | Reference to the authorizing decision |
| Evidence | Yes | Evidence supporting the outcome |
| Result | Yes | Description of the governance result |
| Status | Yes | Current outcome status |

## Valid outcome types

- `Approved`
- `Rejected`
- `Modified`
- `Deferred`
- `Superseded`
- `Invalidated`

## Outcome policy catalog

| Outcome Policy ID | Governance Class | Outcome Types Allowed | Decision Required | Evidence Required | Amendment | Status |
|---|---|---|---|---|---|---|
| GOP-0001 | Constitutional | Approved; Rejected; Modified; Invalidated | Yes | Constitutional evidence | AOC-AMD-0013 | Active |
| GOP-0002 | Protocol | Approved; Rejected; Modified; Deferred | Yes | Protocol evidence | AOC-AMD-0013 | Active |
| GOP-0003 | Runtime | Approved; Rejected; Modified; Deferred; Superseded | Yes | Runtime evidence | AOC-AMD-0013 | Active |
| GOP-0004 | Operational | Approved; Rejected; Modified; Deferred; Superseded | Yes | Operational evidence | AOC-AMD-0013 | Active |

## Constitutional rule

Every governance outcome must be traceable to a decision. An outcome without a valid decision reference is constitutionally void.
