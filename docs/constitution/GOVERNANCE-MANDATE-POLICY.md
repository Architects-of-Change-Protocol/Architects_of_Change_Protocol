# Governance Mandate Policy

**Constitution Version:** v18.0

## Purpose

A governance mandate is a passed motion that creates authorized collective direction. A mandate records the scope and boundaries of governance authority granted by a passed motion.

## Mandate fields

| Field | Required | Description |
|---|---|---|
| Mandate ID | Yes | Unique identifier in format GMD-NNNN |
| Motion ID | Yes | Reference to a Passed motion |
| Governance ID | Yes | Reference to the canonical governance authority |
| Authority Granted | Yes | Explicit statement of authority granted |
| Scope | Yes | Explicit boundaries of mandate |
| Effective Date | Yes | Date mandate becomes effective |
| Expiration | Yes | Expiration date or trigger |
| Execution Boundary | Yes | Explicit boundary between mandate and execution |
| Decision Reference | Yes | Reference to authorizing decision |
| Status | Yes | Current mandate status |

## Valid mandate statuses

- `Pending`
- `Active`
- `Suspended`
- `Expired`
- `Revoked`
- `Retired`

## Mandate policy catalog

| Mandate Policy ID | Governance Class | Authority Scope | Expiration Required | Decision Required | Amendment | Status |
|---|---|---|---|---|---|---|
| GMD-0001 | Constitutional | Constitutional authority only | Yes | Yes | AOC-AMD-0013 | Active |
| GMD-0002 | Protocol | Protocol authority only | Yes | Yes | AOC-AMD-0013 | Active |
| GMD-0003 | Runtime | Runtime authority only | Yes | Yes | AOC-AMD-0013 | Active |
| GMD-0004 | Operational | Operational authority only | Yes | Yes | AOC-AMD-0013 | Active |

## Constitutional rules

A mandate grants only the authority explicitly recorded in its scope. Mandate does not equal execution. A mandate without an explicit execution boundary is constitutionally incomplete. A mandate may not grant authority exceeding the scope of the governance authority that created it.
