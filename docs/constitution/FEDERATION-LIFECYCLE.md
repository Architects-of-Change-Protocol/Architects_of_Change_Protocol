# Federation Lifecycle

**Constitution Version:** v16.0

## Valid lifecycle states

A federation relationship may occupy one of the following states: Observed, Proposed, Recognized, Active, Restricted, Suspended, Revoked, Retired.

## Valid lifecycle transitions

| From | To |
|---|---|
| Observed | Proposed |
| Proposed | Recognized; Rejected |
| Recognized | Active; Restricted |
| Active | Restricted; Suspended; Revoked |
| Restricted | Active; Suspended |
| Suspended | Active; Revoked |
| Revoked | Retired |
| Retired | (terminal) |

## Federation lifecycle transition ledger

| Transition ID | Federation ID | From | To | Authorized By | Evidence | Amendment | Effective Date |
|---|---|---|---|---|---|---|---|
