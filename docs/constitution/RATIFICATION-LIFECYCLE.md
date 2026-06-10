# Ratification Lifecycle

**Constitution Version:** v1.0

## Ratification lifecycle states

| State | Description |
|---|---|
| Draft | Constitution under construction |
| Readiness Review | Constitution undergoing ratification readiness assessment |
| Pending Decision | Readiness confirmed; awaiting ratification decision |
| Ratified | Constitution formally adopted as sovereign authority |
| Released | Ratified constitution published as versioned baseline |
| Superseded | Constitution superseded by a newer ratified version |
| Rejected | Constitution rejected; ratification not granted |
| Retired | Constitution withdrawn from all active use |

## Allowed transitions

| From | To | Authority |
|---|---|---|
| Draft | Readiness Review | RAT-0002 |
| Readiness Review | Pending Decision | RAT-0002 |
| Readiness Review | Rejected | RAT-0003 |
| Pending Decision | Ratified | RAT-0003 |
| Pending Decision | Rejected | RAT-0003 |
| Pending Decision | Deferred | RAT-0003 |
| Ratified | Released | RAT-0005 |
| Ratified | Superseded | RAT-0010 |
| Released | Superseded | RAT-0010 |
| Released | Retired | RAT-0010 |
| Superseded | Retired | RAT-0010 |
| Rejected | Retired | RAT-0010 |

## Ratification lifecycle transition ledger

| Transition ID | Constitution Version | From | To | Authorized By | Evidence | Amendment | Effective Date |
|---|---|---|---|---|---|---|---|
| RAT-TRANS-0001 | v1.0 | Draft | Readiness Review | RAT-0002 | AOC-AMD-0018 | AOC-AMD-0019 | 2026-06-10 |
| RAT-TRANS-0002 | v1.0 | Readiness Review | Pending Decision | RAT-0002 | RAT-READY-0001 | AOC-AMD-0019 | 2026-06-10 |
| RAT-TRANS-0003 | v1.0 | Pending Decision | Ratified | RAT-0003 | RAT-DEC-0001 | AOC-AMD-0019 | 2026-06-10 |
| RAT-TRANS-0004 | v1.0 | Ratified | Released | RAT-0005 | RAT-REL-0001 | AOC-AMD-0019 | 2026-06-10 |
