# Policy Authority Catalog

**Constitution Version:** v7.0

## Catalog schema

Every policy row records Policy ID, Policy Name, Policy Class, Owner, Applies To Capability IDs, Rule Domain, Effect, Constraint Strength, Priority, Delegable, Creation Amendment, Retirement Amendment, Status, and Lifecycle State. Constraint strength is an ordinal comparison used only for constitutional inheritance validation; larger values are more restrictive. Valid catalog statuses are `Canonical`, `Deprecated`, and `Retired`.

## Policy catalog

| Policy ID | Policy Name | Policy Class | Owner | Applies To Capability IDs | Rule Domain | Effect | Constraint Strength | Priority | Delegable | Creation Amendment | Retirement Amendment | Status | Lifecycle State |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| POL-0001 | Constitutional Constraint Baseline | Constitutional | Constitution | CAP-0001–CAP-0028 | Constitutional Integrity | Require | 10 | 100 | No | AOC-AMD-0003 | Not scheduled | Canonical | Active |
| POL-0002 | Policy Amendment Governance | Governance | Constitution | CAP-0007, CAP-0008 | Policy Change | Require | 30 | 90 | No | AOC-AMD-0003 | Not scheduled | Canonical | Active |
| POL-0003 | Governance Decision Accountability | Governance | Constitution | CAP-0009–CAP-0014 | Governance Accountability | Require | 30 | 85 | No | AOC-AMD-0003 | Not scheduled | Canonical | Active |
| POL-0004 | Runtime Verifiability Baseline | Runtime | Protocol | CAP-0015–CAP-0022 | Runtime Verifiability | Require | 30 | 70 | Yes | AOC-AMD-0003 | Not scheduled | Canonical | Active |
| POL-0005 | Evidence Required | Runtime | Protocol | CAP-0015 | Claim Evidence | Require | 50 | 75 | No | AOC-AMD-0003 | Not scheduled | Canonical | Active |
| POL-0006 | Decision Traceability | Runtime | Protocol | CAP-0016 | Decision Trace | Require | 50 | 74 | No | AOC-AMD-0003 | Not scheduled | Canonical | Active |
| POL-0007 | Trust Assertion Evidence | Runtime | Protocol | CAP-0017 | Trust Evidence | Require | 50 | 73 | No | AOC-AMD-0003 | Not scheduled | Canonical | Active |
| POL-0008 | Verification Integrity | Runtime | Protocol | CAP-0018, CAP-0019 | Verification Integrity | Require | 50 | 72 | No | AOC-AMD-0003 | Not scheduled | Canonical | Active |
| POL-0009 | Explicit Consent | Runtime | Protocol | CAP-0020 | Consent | Require | 50 | 71 | No | AOC-AMD-0003 | Not scheduled | Canonical | Active |
| POL-0010 | Authorization Attestation | Runtime | Protocol | CAP-0021 | Authorization | Require | 50 | 69 | No | AOC-AMD-0003 | Not scheduled | Canonical | Active |
| POL-0011 | Federation Trust Evidence | Runtime | Protocol | CAP-0022 | Federation Trust | Require | 50 | 68 | No | AOC-AMD-0003 | Not scheduled | Canonical | Active |
| POL-0012 | Operational Auditability | Operational | Enterprise | CAP-0023–CAP-0028 | Operational Audit | Require | 40 | 50 | Yes | AOC-AMD-0003 | Not scheduled | Canonical | Active |

## Policy delegation records

Delegation records govern stewardship of delegable policies. Delegates may administer application and evidence but may not change rule meaning, priority, hierarchy, lifecycle, or exceptions.

| Delegation ID | Policy ID | Grantor | Delegate | Scope | Expiration | Amendment | Status |
|---|---|---|---|---|---|---|---|

No policy delegations are ratified at v3.0.
