# Decision Lifecycle

**Constitution Version:** v5.0

## Lifecycle states

| State | Meaning | Authorizes Action |
|---|---|---|
| Proposed | A decision record has been declared but has not established evidence sufficiency. | No |
| Pending Evidence | Required evidence is being assembled and integrity checked. | No |
| Pending Review | Evidence minimums are satisfied and constitutional review is pending. | No |
| Approved | Review concluded that the outcome is legitimate and fully explained. | Yes |
| Rejected | Review concluded that the proposed outcome is not legitimate. | No |
| Appealed | A valid challenge is under resolution; prior effect is governed by the appeal disposition. | No new action |
| Revoked | A formerly valid decision has been constitutionally invalidated. | No |
| Retired | The record is permanently closed and retained only for audit. | No |

## Allowed transitions

| From | Allowed To |
|---|---|
| Proposed | Pending Evidence |
| Pending Evidence | Pending Review |
| Pending Review | Approved, Rejected |
| Approved | Appealed, Revoked, Retired |
| Rejected | Appealed, Retired |
| Appealed | Approved, Rejected, Revoked |
| Revoked | Retired |
| Retired | None |

Every other transition is invalid. `Revoked` and `Retired` records cannot be reactivated. Transition history is append-only, ordered, amendment-traceable, and must terminate at the catalog lifecycle state.

## Lifecycle transition ledger

| Transition ID | Decision ID | From | To | Amendment | Effective Date |
|---|---|---|---|---|---|
| DLT-0001 | DEC-0001 | Proposed | Pending Evidence | AOC-AMD-0004 | 2026-06-08 |
| DLT-0002 | DEC-0001 | Pending Evidence | Pending Review | AOC-AMD-0004 | 2026-06-08 |
| DLT-0003 | DEC-0001 | Pending Review | Approved | AOC-AMD-0004 | 2026-06-08 |
| DLT-0004 | DEC-0002 | Proposed | Pending Evidence | AOC-AMD-0004 | 2026-06-08 |
| DLT-0005 | DEC-0002 | Pending Evidence | Pending Review | AOC-AMD-0004 | 2026-06-08 |
| DLT-0006 | DEC-0002 | Pending Review | Approved | AOC-AMD-0004 | 2026-06-08 |
| DLT-0007 | DEC-0003 | Proposed | Pending Evidence | AOC-AMD-0004 | 2026-06-08 |
| DLT-0008 | DEC-0003 | Pending Evidence | Pending Review | AOC-AMD-0004 | 2026-06-08 |
| DLT-0009 | DEC-0003 | Pending Review | Approved | AOC-AMD-0004 | 2026-06-08 |
| DLT-0010 | DEC-0004 | Proposed | Pending Evidence | AOC-AMD-0004 | 2026-06-08 |
| DLT-0011 | DEC-0004 | Pending Evidence | Pending Review | AOC-AMD-0004 | 2026-06-08 |
| DLT-0012 | DEC-0004 | Pending Review | Approved | AOC-AMD-0004 | 2026-06-08 |
| DLT-0013 | DEC-0005 | Proposed | Pending Evidence | AOC-AMD-0004 | 2026-06-08 |
| DLT-0014 | DEC-0005 | Pending Evidence | Pending Review | AOC-AMD-0004 | 2026-06-08 |
| DLT-0015 | DEC-0005 | Pending Review | Approved | AOC-AMD-0004 | 2026-06-08 |
| DLT-0016 | DEC-0006 | Proposed | Pending Evidence | AOC-AMD-0004 | 2026-06-08 |
| DLT-0017 | DEC-0006 | Pending Evidence | Pending Review | AOC-AMD-0004 | 2026-06-08 |
| DLT-0018 | DEC-0006 | Pending Review | Approved | AOC-AMD-0004 | 2026-06-08 |
| DLT-0019 | DEC-0007 | Proposed | Pending Evidence | AOC-AMD-0004 | 2026-06-08 |
| DLT-0020 | DEC-0007 | Pending Evidence | Pending Review | AOC-AMD-0004 | 2026-06-08 |
| DLT-0021 | DEC-0007 | Pending Review | Approved | AOC-AMD-0004 | 2026-06-08 |
| DLT-0022 | DEC-0008 | Proposed | Pending Evidence | AOC-AMD-0004 | 2026-06-08 |
| DLT-0023 | DEC-0008 | Pending Evidence | Pending Review | AOC-AMD-0004 | 2026-06-08 |
| DLT-0024 | DEC-0008 | Pending Review | Approved | AOC-AMD-0004 | 2026-06-08 |
| DLT-0025 | DEC-0009 | Proposed | Pending Evidence | AOC-AMD-0004 | 2026-06-08 |
| DLT-0026 | DEC-0009 | Pending Evidence | Pending Review | AOC-AMD-0004 | 2026-06-08 |
| DLT-0027 | DEC-0009 | Pending Review | Approved | AOC-AMD-0004 | 2026-06-08 |
| DLT-0028 | DEC-0010 | Proposed | Pending Evidence | AOC-AMD-0004 | 2026-06-08 |
| DLT-0029 | DEC-0010 | Pending Evidence | Pending Review | AOC-AMD-0004 | 2026-06-08 |
| DLT-0030 | DEC-0010 | Pending Review | Approved | AOC-AMD-0004 | 2026-06-08 |
| DLT-0031 | DEC-0011 | Proposed | Pending Evidence | AOC-AMD-0004 | 2026-06-08 |
| DLT-0032 | DEC-0011 | Pending Evidence | Pending Review | AOC-AMD-0004 | 2026-06-08 |
| DLT-0033 | DEC-0011 | Pending Review | Approved | AOC-AMD-0004 | 2026-06-08 |
| DLT-0034 | DEC-0012 | Proposed | Pending Evidence | AOC-AMD-0004 | 2026-06-08 |
| DLT-0035 | DEC-0012 | Pending Evidence | Pending Review | AOC-AMD-0004 | 2026-06-08 |
| DLT-0036 | DEC-0012 | Pending Review | Approved | AOC-AMD-0004 | 2026-06-08 |
| DLT-0037 | DEC-0013 | Proposed | Pending Evidence | AOC-AMD-0004 | 2026-06-08 |
| DLT-0038 | DEC-0013 | Pending Evidence | Pending Review | AOC-AMD-0004 | 2026-06-08 |
| DLT-0039 | DEC-0013 | Pending Review | Approved | AOC-AMD-0004 | 2026-06-08 |
| DLT-0040 | DEC-0014 | Proposed | Pending Evidence | AOC-AMD-0004 | 2026-06-08 |
| DLT-0041 | DEC-0014 | Pending Evidence | Pending Review | AOC-AMD-0004 | 2026-06-08 |
| DLT-0042 | DEC-0014 | Pending Review | Approved | AOC-AMD-0004 | 2026-06-08 |

## Evolution rule

Lifecycle semantics may change only through a Type C amendment. Individual constitutionally governed transitions require a ratified Type B or Type C amendment; runtime instances may later use an implementation-specific immutable authorization record, but no such runtime is introduced here.
