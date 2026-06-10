# Policy Lifecycle

**Constitution Version:** v16.0

## Lifecycle states

| State | Meaning | Effective |
|---|---|---|
| Proposed | Draft policy awaiting amendment ratification. | No |
| Ratified | Amendment approved; activation may be pending. | No |
| Active | Policy constrains all applicable capability exercise. | Yes |
| Suspended | Temporarily ineffective under a ratified Type C amendment or valid exception. | No |
| Revoked | Permanently invalidated and unavailable for new evaluation. | No |
| Retired | Closed historical record retained for audit. | No |

## Allowed transitions

| From | Allowed To |
|---|---|
| Proposed | Ratified, Retired |
| Ratified | Active, Revoked, Retired |
| Active | Suspended, Revoked, Retired |
| Suspended | Active, Revoked, Retired |
| Revoked | Retired |
| Retired | None |

Unlisted transitions are prohibited. Revoked policies cannot reactivate. Retired policies are terminal. Suspension never authorizes unconstrained capability exercise; evaluation fails closed unless a valid ratified exception identifies the replacement constraint.

## Lifecycle transition ledger

| Transition ID | Policy ID | From | To | Amendment | Effective Date |
|---|---|---|---|---|---|
| PLT-0001 | POL-0001 | Proposed | Ratified | AOC-AMD-0003 | 2026-06-08 |
| PLT-0002 | POL-0001 | Ratified | Active | AOC-AMD-0003 | 2026-06-08 |
| PLT-0003 | POL-0002 | Proposed | Ratified | AOC-AMD-0003 | 2026-06-08 |
| PLT-0004 | POL-0002 | Ratified | Active | AOC-AMD-0003 | 2026-06-08 |
| PLT-0005 | POL-0003 | Proposed | Ratified | AOC-AMD-0003 | 2026-06-08 |
| PLT-0006 | POL-0003 | Ratified | Active | AOC-AMD-0003 | 2026-06-08 |
| PLT-0007 | POL-0004 | Proposed | Ratified | AOC-AMD-0003 | 2026-06-08 |
| PLT-0008 | POL-0004 | Ratified | Active | AOC-AMD-0003 | 2026-06-08 |
| PLT-0009 | POL-0005 | Proposed | Ratified | AOC-AMD-0003 | 2026-06-08 |
| PLT-0010 | POL-0005 | Ratified | Active | AOC-AMD-0003 | 2026-06-08 |
| PLT-0011 | POL-0006 | Proposed | Ratified | AOC-AMD-0003 | 2026-06-08 |
| PLT-0012 | POL-0006 | Ratified | Active | AOC-AMD-0003 | 2026-06-08 |
| PLT-0013 | POL-0007 | Proposed | Ratified | AOC-AMD-0003 | 2026-06-08 |
| PLT-0014 | POL-0007 | Ratified | Active | AOC-AMD-0003 | 2026-06-08 |
| PLT-0015 | POL-0008 | Proposed | Ratified | AOC-AMD-0003 | 2026-06-08 |
| PLT-0016 | POL-0008 | Ratified | Active | AOC-AMD-0003 | 2026-06-08 |
| PLT-0017 | POL-0009 | Proposed | Ratified | AOC-AMD-0003 | 2026-06-08 |
| PLT-0018 | POL-0009 | Ratified | Active | AOC-AMD-0003 | 2026-06-08 |
| PLT-0019 | POL-0010 | Proposed | Ratified | AOC-AMD-0003 | 2026-06-08 |
| PLT-0020 | POL-0010 | Ratified | Active | AOC-AMD-0003 | 2026-06-08 |
| PLT-0021 | POL-0011 | Proposed | Ratified | AOC-AMD-0003 | 2026-06-08 |
| PLT-0022 | POL-0011 | Ratified | Active | AOC-AMD-0003 | 2026-06-08 |
| PLT-0023 | POL-0012 | Proposed | Ratified | AOC-AMD-0003 | 2026-06-08 |
| PLT-0024 | POL-0012 | Ratified | Active | AOC-AMD-0003 | 2026-06-08 |

## Evolution rules

Every transition requires a ratified amendment. Type B may activate an already-ratified policy or change stewardship without changing semantics. Creation, weakening, suspension, revocation, retirement, or semantic replacement is Type C. Historical rows and identifiers must not be rewritten or reused.
