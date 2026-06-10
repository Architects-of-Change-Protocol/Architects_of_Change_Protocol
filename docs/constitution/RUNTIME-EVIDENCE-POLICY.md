# Runtime Evidence Policy

**Constitution Version:** v17.0

## Constitutional Link

This policy formally links RFC-004 Evidence Layer to constitutional runtime execution.

## Evidence generation obligation

Every execution must generate evidence. Evidence must be generated before execution status may transition to `Completed`.

## Evidence policy catalog

| Evidence Policy ID | Evidence Type | Authority Class | Timestamp Required | Integrity Hash Required | Authority Required | Amendment | Status |
|---|---|---|---|---|---|---|---|
| REVI-0001 | Execution Evidence | Constitutional | Yes | Yes | Yes | AOC-AMD-0017 | Canonical |
| REVI-0002 | Decision Evidence | Constitutional | Yes | Yes | Yes | AOC-AMD-0017 | Canonical |
| REVI-0003 | Consumption Evidence | Runtime | Yes | Yes | Yes | AOC-AMD-0017 | Canonical |
| REVI-0004 | Outcome Evidence | Constitutional | Yes | Yes | Yes | AOC-AMD-0017 | Canonical |
| REVI-0005 | Audit Evidence | Operational | Yes | Yes | Yes | AOC-AMD-0017 | Canonical |

## Evidence record schema

Every evidence record must contain:

| Field | Required | Description |
|---|---|---|
| Evidence ID | Yes | Unique evidence identifier |
| Execution ID | Yes | Reference to generating execution |
| Timestamp | Yes | Immutable generation timestamp |
| Authority | Yes | Issuing runtime authority |
| Event | Yes | Governed event that produced evidence |
| Integrity Hash | Yes | Cryptographic integrity binding |
| Status | Yes | Current evidence status |

## Valid evidence statuses

- `Generated` — Evidence has been produced
- `Verified` — Evidence integrity has been confirmed
- `Challenged` — Evidence is under constitutional challenge
- `Revoked` — Evidence has been revoked
- `Retired` — Evidence record is archived

## Evidence registry

| Evidence ID | Execution ID | Timestamp | Authority | Event | Integrity Hash | Status |
|---|---|---|---|---|---|---|
