# Claim Dispute Policy

**Constitution Version:** v15.0

## Constitutional rule

A disputable accepted claim may be challenged on exactly one or more valid grounds: `Evidence Failure`, `Fraud`, `Identity Conflict`, `Policy Conflict`, `Standing Conflict`, or `Decision Conflict`. A dispute suspends unqualified reliance on the claim until resolution.

Every dispute records its identity, claim, grounds, evidence, initiator, resolution, and decision reference. Resolution must produce the corresponding lifecycle transition and may not delete the original claim or evidence.

## Dispute registry

| Dispute ID | Claim ID | Grounds | Evidence | Initiator | Resolution | Decision Reference | Amendment | Status |
|---|---|---|---|---|---|---|---|---|

## Valid resolutions

`Accepted`, `Rejected`, and `Superseded` are the only final dispute resolutions. An unresolved dispute uses status `Open`; a resolved dispute uses status `Resolved` and carries a decision reference.
