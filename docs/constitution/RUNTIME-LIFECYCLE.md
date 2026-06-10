# Runtime Lifecycle

**Constitution Version:** v17.0

## Lifecycle states

- `Planned` — Execution is scheduled but not yet authorized
- `Authorized` — Execution has valid authority, capability, policy, and decision references
- `Queued` — Execution is authorized and awaiting execution window
- `Executing` — Execution is in progress
- `Completed` — Execution has completed successfully
- `Failed` — Execution has failed
- `Suspended` — Execution is temporarily halted pending resolution
- `Challenged` — Execution is under constitutional challenge
- `Revoked` — Execution authorization has been revoked
- `Retired` — Execution record is archived

## Allowed transitions

| From | To | Authority |
|---|---|---|
| Planned | Authorized | Runtime Execution Authority |
| Authorized | Queued | Runtime Execution Authority |
| Authorized | Revoked | Runtime Constitutional Authority |
| Queued | Executing | Runtime Execution Authority |
| Queued | Revoked | Runtime Constitutional Authority |
| Executing | Completed | Runtime Execution Authority |
| Executing | Failed | Runtime Execution Authority |
| Executing | Suspended | Runtime Integrity Authority |
| Failed | Executing | Runtime Execution Authority |
| Failed | Retired | Runtime Audit Authority |
| Suspended | Executing | Runtime Execution Authority |
| Suspended | Revoked | Runtime Constitutional Authority |
| Completed | Retired | Runtime Audit Authority |
| Challenged | Executing | Runtime Constitutional Authority |
| Challenged | Revoked | Runtime Constitutional Authority |
| Challenged | Retired | Runtime Audit Authority |
| Revoked | Retired | Runtime Audit Authority |

## Runtime lifecycle transition ledger

| Transition ID | Execution ID | From | To | Authorized By | Evidence | Amendment | Effective Date |
|---|---|---|---|---|---|---|---|
