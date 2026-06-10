# Reputation Lifecycle

**Constitution Version:** v17.0

## Constitutional rule

Every reputation instance must follow the governed lifecycle. No reputation may skip the `Pending Source Evaluation` state before becoming `Active`. Terminal states are `Retired`. `Revoked` and `Retired` reputations authorize no new reliability influence.

## Allowed lifecycle states

| State | Description |
|---|---|
| Proposed | Reputation signal proposed but not yet accepted for source evaluation |
| Pending Source Evaluation | Source gathering and calculation in progress |
| Active | Sources evaluated; calculation complete; reputation signal active |
| Suspended | Reputation temporarily disabled; influence suspended pending review |
| Disputed | Reputation under active constitutional dispute |
| Corrected | Reputation value corrected by authorized correction; correction record created |
| Revoked | Reputation cancelled by authorized authority for a valid cause |
| Retired | Reputation permanently decommissioned; historically preserved |

## Allowed lifecycle transitions

| From | To | Condition |
|---|---|---|
| Proposed | Pending Source Evaluation | Reputation request accepted |
| Pending Source Evaluation | Active | Sources evaluated; calculation complete |
| Pending Source Evaluation | Revoked | Integrity failure before activation |
| Active | Suspended | Valid suspension cause; authorized authority |
| Active | Disputed | Valid dispute grounds submitted |
| Active | Corrected | Valid correction cause; correction record created |
| Active | Revoked | Valid revocation cause; authorized revocation authority |
| Active | Retired | Constitutional retirement decision |
| Suspended | Active | Suspension resolved; sources reconfirmed |
| Suspended | Disputed | Valid dispute grounds submitted during suspension |
| Suspended | Revoked | Valid revocation cause while suspended |
| Suspended | Retired | Constitutional retirement decision |
| Disputed | Active | Dispute resolved in favor of current reputation |
| Disputed | Corrected | Dispute resolved; correction record created |
| Disputed | Revoked | Dispute resolved against reputation; revocation |
| Disputed | Retired | Constitutional retirement decision |
| Corrected | Active | Correction applied; reputation reactivated |
| Corrected | Retired | Constitutional retirement decision |
| Revoked | Retired | Historical preservation; no reactivation |

## Reputation lifecycle transition ledger

| Transition ID | Reputation ID | From | To | Authorized By | Source Evaluation | Amendment | Effective Date |
|---|---|---|---|---|---|---|---|
| RLT-0001 | REP-0001 | Proposed | Pending Source Evaluation | Constitution | Review initiated | AOC-AMD-0009 | 2026-06-09 |
| RLT-0002 | REP-0001 | Pending Source Evaluation | Active | Constitution | RSP-0001 satisfied | AOC-AMD-0009 | 2026-06-09 |
| RLT-0003 | REP-0002 | Proposed | Pending Source Evaluation | Constitution | Review initiated | AOC-AMD-0009 | 2026-06-09 |
| RLT-0004 | REP-0002 | Pending Source Evaluation | Active | Constitution | RSP-0001 satisfied | AOC-AMD-0009 | 2026-06-09 |
| RLT-0005 | REP-0003 | Proposed | Pending Source Evaluation | Constitution | Review initiated | AOC-AMD-0009 | 2026-06-09 |
| RLT-0006 | REP-0003 | Pending Source Evaluation | Active | Constitution | RSP-0001 satisfied | AOC-AMD-0009 | 2026-06-09 |
| RLT-0007 | REP-0004 | Proposed | Pending Source Evaluation | Constitution | Review initiated | AOC-AMD-0009 | 2026-06-09 |
| RLT-0008 | REP-0004 | Pending Source Evaluation | Active | Constitution | RSP-0002 satisfied | AOC-AMD-0009 | 2026-06-09 |
| RLT-0009 | REP-0005 | Proposed | Pending Source Evaluation | Constitution | Review initiated | AOC-AMD-0009 | 2026-06-09 |
| RLT-0010 | REP-0005 | Pending Source Evaluation | Active | Constitution | RSP-0002 satisfied | AOC-AMD-0009 | 2026-06-09 |
| RLT-0011 | REP-0006 | Proposed | Pending Source Evaluation | Constitution | Review initiated | AOC-AMD-0009 | 2026-06-09 |
| RLT-0012 | REP-0006 | Pending Source Evaluation | Active | Constitution | RSP-0002 satisfied | AOC-AMD-0009 | 2026-06-09 |
| RLT-0013 | REP-0007 | Proposed | Pending Source Evaluation | Constitution | Review initiated | AOC-AMD-0009 | 2026-06-09 |
| RLT-0014 | REP-0007 | Pending Source Evaluation | Active | Constitution | RSP-0002 satisfied | AOC-AMD-0009 | 2026-06-09 |
| RLT-0015 | REP-0008 | Proposed | Pending Source Evaluation | Protocol | Review initiated | AOC-AMD-0009 | 2026-06-09 |
| RLT-0016 | REP-0008 | Pending Source Evaluation | Active | Protocol | RSP-0003 satisfied | AOC-AMD-0009 | 2026-06-09 |
| RLT-0017 | REP-0009 | Proposed | Pending Source Evaluation | Protocol | Review initiated | AOC-AMD-0009 | 2026-06-09 |
| RLT-0018 | REP-0009 | Pending Source Evaluation | Active | Protocol | RSP-0003 satisfied | AOC-AMD-0009 | 2026-06-09 |
| RLT-0019 | REP-0010 | Proposed | Pending Source Evaluation | Protocol | Review initiated | AOC-AMD-0009 | 2026-06-09 |
| RLT-0020 | REP-0010 | Pending Source Evaluation | Active | Protocol | RSP-0003 satisfied | AOC-AMD-0009 | 2026-06-09 |
| RLT-0021 | REP-0011 | Proposed | Pending Source Evaluation | Protocol | Review initiated | AOC-AMD-0009 | 2026-06-09 |
| RLT-0022 | REP-0011 | Pending Source Evaluation | Active | Protocol | RSP-0003 satisfied | AOC-AMD-0009 | 2026-06-09 |
| RLT-0023 | REP-0012 | Proposed | Pending Source Evaluation | Protocol | Review initiated | AOC-AMD-0009 | 2026-06-09 |
| RLT-0024 | REP-0012 | Pending Source Evaluation | Active | Protocol | RSP-0003 satisfied | AOC-AMD-0009 | 2026-06-09 |
| RLT-0025 | REP-0013 | Proposed | Pending Source Evaluation | Protocol | Review initiated | AOC-AMD-0009 | 2026-06-09 |
| RLT-0026 | REP-0013 | Pending Source Evaluation | Active | Protocol | RSP-0003 satisfied | AOC-AMD-0009 | 2026-06-09 |
| RLT-0027 | REP-0014 | Proposed | Pending Source Evaluation | Enterprise | Review initiated | AOC-AMD-0009 | 2026-06-09 |
| RLT-0028 | REP-0014 | Pending Source Evaluation | Active | Enterprise | RSP-0004 satisfied | AOC-AMD-0009 | 2026-06-09 |
| RLT-0029 | REP-0015 | Proposed | Pending Source Evaluation | Enterprise | Review initiated | AOC-AMD-0009 | 2026-06-09 |
| RLT-0030 | REP-0015 | Pending Source Evaluation | Active | Enterprise | RSP-0004 satisfied | AOC-AMD-0009 | 2026-06-09 |
| RLT-0031 | REP-0016 | Proposed | Pending Source Evaluation | Enterprise | Review initiated | AOC-AMD-0009 | 2026-06-09 |
| RLT-0032 | REP-0016 | Pending Source Evaluation | Active | Enterprise | RSP-0004 satisfied | AOC-AMD-0009 | 2026-06-09 |
| RLT-0033 | REP-0017 | Proposed | Pending Source Evaluation | Enterprise | Review initiated | AOC-AMD-0009 | 2026-06-09 |
| RLT-0034 | REP-0017 | Pending Source Evaluation | Active | Enterprise | RSP-0004 satisfied | AOC-AMD-0009 | 2026-06-09 |
