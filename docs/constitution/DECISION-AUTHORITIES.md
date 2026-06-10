# Decision Authorities

**Constitution Version:** v13.0

## Catalog rules

Decision IDs are permanent and use `DEC-NNNN`. Names, classes, owners, evidence requirements, policy coverage, appealability, revocability, amendments, status, and lifecycle state are mandatory. `Canonical` decision authorities may be used; `Deprecated` authorities remain migration-only; `Retired` authorities are historical only.

## Decision catalog

| Decision ID | Decision Name | Decision Class | Owner | Required Evidence | Required Policy Coverage | Appealable | Revocable | Creation Amendment | Retirement Amendment | Status | Lifecycle State |
|---|---|---|---|---|---|---|---|---|---|---|---|
| DEC-0001 | Ratify Amendment | Constitutional | Constitution | EVID-0001 | POL-0001 | No | Yes | AOC-AMD-0004 | Not scheduled | Canonical | Approved |
| DEC-0002 | Create Authority | Constitutional | Constitution | EVID-0002 | POL-0001 | Yes | Yes | AOC-AMD-0004 | Not scheduled | Canonical | Approved |
| DEC-0003 | Retire Authority | Constitutional | Constitution | EVID-0003 | POL-0001 | Yes | Yes | AOC-AMD-0004 | Not scheduled | Canonical | Approved |
| DEC-0004 | Constitutional Interpretation | Constitutional | Constitution | EVID-0004 | POL-0001 | Yes | Yes | AOC-AMD-0004 | Not scheduled | Canonical | Approved |
| DEC-0005 | Assign Capability | Governance | Constitution | EVID-0005 | POL-0002 | Yes | Yes | AOC-AMD-0004 | Not scheduled | Canonical | Approved |
| DEC-0006 | Revoke Capability | Governance | Constitution | EVID-0006 | POL-0002 | Yes | Yes | AOC-AMD-0004 | Not scheduled | Canonical | Approved |
| DEC-0007 | Activate Policy | Governance | Constitution | EVID-0007 | POL-0002 | Yes | Yes | AOC-AMD-0004 | Not scheduled | Canonical | Approved |
| DEC-0008 | Retire Policy | Governance | Constitution | EVID-0008 | POL-0002 | Yes | Yes | AOC-AMD-0004 | Not scheduled | Canonical | Approved |
| DEC-0009 | Accept Claim | Runtime | Protocol | EVID-0009 | POL-0005 | Yes | Yes | AOC-AMD-0004 | Not scheduled | Canonical | Approved |
| DEC-0010 | Reject Claim | Runtime | Protocol | EVID-0010 | POL-0005 | Yes | Yes | AOC-AMD-0004 | Not scheduled | Canonical | Approved |
| DEC-0011 | Issue Trust Assertion | Runtime | Protocol | EVID-0011 | POL-0004 | Yes | Yes | AOC-AMD-0004 | Not scheduled | Canonical | Approved |
| DEC-0012 | Audit Passed | Operational | Enterprise | EVID-0012 | POL-0012 | Yes | Yes | AOC-AMD-0004 | Not scheduled | Canonical | Approved |
| DEC-0013 | Audit Failed | Operational | Enterprise | EVID-0013 | POL-0012 | Yes | Yes | AOC-AMD-0004 | Not scheduled | Canonical | Approved |
| DEC-0014 | Execution Approved | Operational | Enterprise | EVID-0014 | POL-0011 | Yes | Yes | AOC-AMD-0004 | Not scheduled | Canonical | Approved |

## Authority rule

Ownership names the constitutional steward of the decision definition. It does not bypass capability assignment, policy coverage, evidence, review, explanation, appeal, revocation, or lifecycle requirements.
