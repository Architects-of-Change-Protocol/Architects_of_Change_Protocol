# Voting Lifecycle

**Constitution Version:** v17.0

## Valid lifecycle states

A voting act may occupy one of the following states: Draft, Prepared, Open, Active, Closed, Resolved, Challenged, Expired, Revoked, Retired.

## Valid lifecycle transitions

| From | To |
|---|---|
| Draft | Prepared |
| Prepared | Open |
| Open | Active; Closed; Expired |
| Active | Closed; Challenged; Expired; Revoked |
| Closed | Resolved; Challenged |
| Resolved | Retired |
| Challenged | Resolved; Revoked; Retired |
| Expired | Retired |
| Revoked | Retired |
| Retired | (terminal) |

## Voting lifecycle transition ledger

| Transition ID | Voting ID | From | To | Authorized By | Evidence | Amendment | Effective Date |
|---|---|---|---|---|---|---|---|
