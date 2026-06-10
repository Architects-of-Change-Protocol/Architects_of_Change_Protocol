# Runtime Execution Policy

**Constitution Version:** v18.0

## Execution policy catalog

| Execution Policy ID | Authority Class | Authority Required | Capability Required | Policy Required | Decision Required | Evidence Required | Audit Required | Amendment | Status |
|---|---|---|---|---|---|---|---|---|---|
| REP-0001 | Constitutional | Yes | Yes | Yes | Yes | Yes | Yes | AOC-AMD-0017 | Canonical |
| REP-0002 | Governance | Yes | Yes | Yes | Yes | Yes | Yes | AOC-AMD-0017 | Canonical |
| REP-0003 | Runtime | Yes | Yes | Yes | No | Yes | Yes | AOC-AMD-0017 | Canonical |
| REP-0004 | Operational | Yes | Yes | No | No | Yes | Yes | AOC-AMD-0017 | Canonical |

## Execution record schema

Every execution record must contain:

| Field | Required | Description |
|---|---|---|
| Execution ID | Yes | Unique execution identifier |
| Authority Reference | Yes | Reference to authorizing runtime authority |
| Capability Reference | Yes | Reference to invoked capability |
| Policy Reference | Yes | Reference to governing policy |
| Decision Reference | Conditional | Required for Constitutional and Governance class |
| Runtime Scope | Yes | Bounded scope of execution |
| Execution Window | Yes | Authorized time window |
| Evidence Requirement | Yes | Evidence generation obligation |
| Status | Yes | Current execution status |

## Valid execution statuses

- `Planned` — Execution is scheduled but not yet authorized
- `Authorized` — Execution has valid authority, capability, policy, and decision references
- `Executing` — Execution is in progress
- `Completed` — Execution has completed successfully
- `Failed` — Execution has failed
- `Suspended` — Execution is temporarily halted
- `Revoked` — Execution authorization has been revoked
- `Retired` — Execution record is archived

## Constitutional Rule

No execution may begin without valid authority, capability, policy, and decision references.

## Execution registry

| Execution ID | Authority Reference | Capability Reference | Policy Reference | Decision Reference | Runtime Scope | Execution Window | Evidence Requirement | Status |
|---|---|---|---|---|---|---|---|---|
