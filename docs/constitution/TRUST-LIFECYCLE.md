# Trust Lifecycle

**Constitution Version:** v14.0

## States

- `Proposed`: a trust record has been requested but has no confidence effect.
- `Pending Evaluation`: evidence is being evaluated; the signal is not active.
- `Active`: evidence evaluation succeeded and current confidence may influence decisions.
- `Suspended`: confidence influence is temporarily disabled pending review.
- `Revoked`: confidence influence is permanently disabled for cause.
- `Retired`: the record is terminal and retained only for history.

## Allowed transitions

| From | Allowed To |
|---|---|
| Proposed | Pending Evaluation |
| Pending Evaluation | Active; Revoked |
| Active | Suspended; Revoked; Retired |
| Suspended | Active; Revoked; Retired |
| Revoked | Retired |
| Retired | None |

Reactivation from `Suspended` requires a new successful evidence evaluation and authorized transition. `Revoked` and `Retired` can never return to `Active`. Every state change is append-only.

## Trust lifecycle transition ledger

| Transition ID | Trust ID | From | To | Authorized By | Evidence Evaluation | Amendment | Effective Date |
|---|---|---|---|---|---|---|---|
| TRT-0001 | TRS-0001 | Proposed | Pending Evaluation | Constitution | Evaluation opened; evidence pending | AOC-AMD-0007 | 2026-06-08 |
| TRT-0002 | TRS-0001 | Pending Evaluation | Active | Constitution | TEP-0001 founding evaluation satisfied | AOC-AMD-0007 | 2026-06-08 |
| TRT-0003 | TRS-0002 | Proposed | Pending Evaluation | Constitution | Evaluation opened; evidence pending | AOC-AMD-0007 | 2026-06-08 |
| TRT-0004 | TRS-0002 | Pending Evaluation | Active | Constitution | TEP-0002 founding evaluation satisfied | AOC-AMD-0007 | 2026-06-08 |
| TRT-0005 | TRS-0003 | Proposed | Pending Evaluation | Constitution | Evaluation opened; evidence pending | AOC-AMD-0007 | 2026-06-08 |
| TRT-0006 | TRS-0003 | Pending Evaluation | Active | Constitution | TEP-0003 founding evaluation satisfied | AOC-AMD-0007 | 2026-06-08 |
| TRT-0007 | TRS-0004 | Proposed | Pending Evaluation | Constitution | Evaluation opened; evidence pending | AOC-AMD-0007 | 2026-06-08 |
| TRT-0008 | TRS-0004 | Pending Evaluation | Active | Constitution | TEP-0004 founding evaluation satisfied | AOC-AMD-0007 | 2026-06-08 |
| TRT-0009 | TRS-0005 | Proposed | Pending Evaluation | Constitution | Evaluation opened; evidence pending | AOC-AMD-0007 | 2026-06-08 |
| TRT-0010 | TRS-0005 | Pending Evaluation | Active | Constitution | TEP-0005 founding evaluation satisfied | AOC-AMD-0007 | 2026-06-08 |
| TRT-0011 | TRS-0006 | Proposed | Pending Evaluation | Constitution | Evaluation opened; evidence pending | AOC-AMD-0007 | 2026-06-08 |
| TRT-0012 | TRS-0006 | Pending Evaluation | Active | Constitution | TEP-0006 founding evaluation satisfied | AOC-AMD-0007 | 2026-06-08 |
| TRT-0013 | TRS-0007 | Proposed | Pending Evaluation | Constitution | Evaluation opened; evidence pending | AOC-AMD-0007 | 2026-06-08 |
| TRT-0014 | TRS-0007 | Pending Evaluation | Active | Constitution | TEP-0007 founding evaluation satisfied | AOC-AMD-0007 | 2026-06-08 |
| TRT-0015 | TRS-0008 | Proposed | Pending Evaluation | Protocol | Evaluation opened; evidence pending | AOC-AMD-0007 | 2026-06-08 |
| TRT-0016 | TRS-0008 | Pending Evaluation | Active | Protocol | TEP-0008 founding evaluation satisfied | AOC-AMD-0007 | 2026-06-08 |
| TRT-0017 | TRS-0009 | Proposed | Pending Evaluation | Protocol | Evaluation opened; evidence pending | AOC-AMD-0007 | 2026-06-08 |
| TRT-0018 | TRS-0009 | Pending Evaluation | Active | Protocol | TEP-0009 founding evaluation satisfied | AOC-AMD-0007 | 2026-06-08 |
| TRT-0019 | TRS-0010 | Proposed | Pending Evaluation | Protocol | Evaluation opened; evidence pending | AOC-AMD-0007 | 2026-06-08 |
| TRT-0020 | TRS-0010 | Pending Evaluation | Active | Protocol | TEP-0010 founding evaluation satisfied | AOC-AMD-0007 | 2026-06-08 |
| TRT-0021 | TRS-0011 | Proposed | Pending Evaluation | Protocol | Evaluation opened; evidence pending | AOC-AMD-0007 | 2026-06-08 |
| TRT-0022 | TRS-0011 | Pending Evaluation | Active | Protocol | TEP-0011 founding evaluation satisfied | AOC-AMD-0007 | 2026-06-08 |
| TRT-0023 | TRS-0012 | Proposed | Pending Evaluation | Protocol | Evaluation opened; evidence pending | AOC-AMD-0007 | 2026-06-08 |
| TRT-0024 | TRS-0012 | Pending Evaluation | Active | Protocol | TEP-0012 founding evaluation satisfied | AOC-AMD-0007 | 2026-06-08 |
| TRT-0025 | TRS-0013 | Proposed | Pending Evaluation | Enterprise | Evaluation opened; evidence pending | AOC-AMD-0007 | 2026-06-08 |
| TRT-0026 | TRS-0013 | Pending Evaluation | Active | Enterprise | TEP-0013 founding evaluation satisfied | AOC-AMD-0007 | 2026-06-08 |
| TRT-0027 | TRS-0014 | Proposed | Pending Evaluation | Enterprise | Evaluation opened; evidence pending | AOC-AMD-0007 | 2026-06-08 |
| TRT-0028 | TRS-0014 | Pending Evaluation | Active | Enterprise | TEP-0014 founding evaluation satisfied | AOC-AMD-0007 | 2026-06-08 |
| TRT-0029 | TRS-0015 | Proposed | Pending Evaluation | Enterprise | Evaluation opened; evidence pending | AOC-AMD-0007 | 2026-06-08 |
| TRT-0030 | TRS-0015 | Pending Evaluation | Active | Enterprise | TEP-0015 founding evaluation satisfied | AOC-AMD-0007 | 2026-06-08 |
| TRT-0031 | TRS-0016 | Proposed | Pending Evaluation | Enterprise | Evaluation opened; evidence pending | AOC-AMD-0007 | 2026-06-08 |
| TRT-0032 | TRS-0016 | Pending Evaluation | Active | Enterprise | TEP-0016 founding evaluation satisfied | AOC-AMD-0007 | 2026-06-08 |
