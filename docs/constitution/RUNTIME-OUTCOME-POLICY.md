# Runtime Outcome Policy

**Constitution Version:** v18.0

## Outcome record schema

Every outcome record must contain:

| Field | Required | Description |
|---|---|---|
| Outcome ID | Yes | Unique outcome identifier |
| Execution ID | Yes | Reference to producing execution |
| Decision ID | Yes | Reference to authorizing decision |
| Result | Yes | Governed result type |
| Evidence | Yes | Evidence reference supporting the outcome |
| Status | Yes | Current outcome status |

## Valid result types

- `Succeeded` — Execution completed and produced its authorized result
- `Partially Succeeded` — Execution completed but produced only a partial result
- `Failed` — Execution did not produce its authorized result
- `Rejected` — Execution was rejected before completion
- `Superseded` — Outcome has been superseded by a subsequent authorized execution
- `Revoked` — Outcome has been constitutionally revoked

## Outcome policy catalog

| Outcome Policy ID | Authority Class | Evidence Required | Decision Reference Required | Audit Required | Revocation Allowed | Amendment | Status |
|---|---|---|---|---|---|---|---|
| ROUT-0001 | Constitutional | Yes | Yes | Yes | Yes | AOC-AMD-0017 | Canonical |
| ROUT-0002 | Governance | Yes | Yes | Yes | Yes | AOC-AMD-0017 | Canonical |
| ROUT-0003 | Runtime | Yes | No | Yes | Yes | AOC-AMD-0017 | Canonical |
| ROUT-0004 | Operational | Yes | No | Yes | Yes | AOC-AMD-0017 | Canonical |

## Outcome registry

| Outcome ID | Execution ID | Decision ID | Result | Evidence | Status |
|---|---|---|---|---|---|
