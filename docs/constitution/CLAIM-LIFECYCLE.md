# Claim Lifecycle

**Constitution Version:** v13.0

## States

`Draft`, `Submitted`, `Pending Review`, `Accepted`, `Rejected`, `Disputed`, `Withdrawn`, `Superseded`, and `Retired` are the only valid claim states.

## Allowed transitions

| From | Allowed To |
|---|---|
| Draft | Submitted |
| Submitted | Pending Review |
| Pending Review | Accepted; Rejected |
| Accepted | Disputed; Withdrawn; Superseded; Retired |
| Rejected | Retired |
| Disputed | Accepted; Rejected; Superseded |
| Withdrawn | Retired |
| Superseded | Retired |
| Retired | None |

All other transitions are invalid. `Withdrawn`, `Superseded`, and `Retired` claims may not be reactivated. A disputed claim may return to `Accepted` only through a recorded dispute resolution. Acceptance requires evidence-policy satisfaction before the transition occurs.

## Claim lifecycle transition ledger

| Transition ID | Claim ID | From | To | Authorized By | Amendment | Effective Date |
|---|---|---|---|---|---|---|
| CLT-0001 | CLM-0001 | Draft | Submitted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0002 | CLM-0001 | Submitted | Pending Review | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0003 | CLM-0001 | Pending Review | Accepted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0004 | CLM-0002 | Draft | Submitted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0005 | CLM-0002 | Submitted | Pending Review | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0006 | CLM-0002 | Pending Review | Accepted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0007 | CLM-0003 | Draft | Submitted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0008 | CLM-0003 | Submitted | Pending Review | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0009 | CLM-0003 | Pending Review | Accepted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0010 | CLM-0004 | Draft | Submitted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0011 | CLM-0004 | Submitted | Pending Review | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0012 | CLM-0004 | Pending Review | Accepted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0013 | CLM-0005 | Draft | Submitted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0014 | CLM-0005 | Submitted | Pending Review | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0015 | CLM-0005 | Pending Review | Accepted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0016 | CLM-0006 | Draft | Submitted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0017 | CLM-0006 | Submitted | Pending Review | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0018 | CLM-0006 | Pending Review | Accepted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0019 | CLM-0007 | Draft | Submitted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0020 | CLM-0007 | Submitted | Pending Review | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0021 | CLM-0007 | Pending Review | Accepted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0022 | CLM-0008 | Draft | Submitted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0023 | CLM-0008 | Submitted | Pending Review | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0024 | CLM-0008 | Pending Review | Accepted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0025 | CLM-0009 | Draft | Submitted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0026 | CLM-0009 | Submitted | Pending Review | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0027 | CLM-0009 | Pending Review | Accepted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0028 | CLM-0010 | Draft | Submitted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0029 | CLM-0010 | Submitted | Pending Review | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0030 | CLM-0010 | Pending Review | Accepted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0031 | CLM-0011 | Draft | Submitted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0032 | CLM-0011 | Submitted | Pending Review | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0033 | CLM-0011 | Pending Review | Accepted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0034 | CLM-0012 | Draft | Submitted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0035 | CLM-0012 | Submitted | Pending Review | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0036 | CLM-0012 | Pending Review | Accepted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0037 | CLM-0013 | Draft | Submitted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0038 | CLM-0013 | Submitted | Pending Review | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0039 | CLM-0013 | Pending Review | Accepted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0040 | CLM-0014 | Draft | Submitted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0041 | CLM-0014 | Submitted | Pending Review | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0042 | CLM-0014 | Pending Review | Accepted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0043 | CLM-0015 | Draft | Submitted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0044 | CLM-0015 | Submitted | Pending Review | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0045 | CLM-0015 | Pending Review | Accepted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0046 | CLM-0016 | Draft | Submitted | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0047 | CLM-0016 | Submitted | Pending Review | Constitution | AOC-AMD-0006 | 2026-06-08 |
| CLT-0048 | CLM-0016 | Pending Review | Accepted | Constitution | AOC-AMD-0006 | 2026-06-08 |
