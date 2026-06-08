# Capability Authority Catalog

**Constitution Version:** v5.0

## Catalog schema

Every capability row defines Capability ID, Name, Capability Class, Owner, Delegable, Revocable, Creation Amendment, Retirement Amendment, and Status. Valid catalog statuses are `Canonical`, `Deprecated`, and `Retired`. `Not scheduled` is permitted only while a capability is not retired.

## Capability catalog

| Capability ID | Name | Capability Class | Owner | Delegable | Revocable | Creation Amendment | Retirement Amendment | Status |
|---|---|---|---|---|---|---|---|---|
| CAP-0001 | Amend Constitution | Constitutional | Constitution | No | No | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0002 | Create Constitutional Authority | Constitutional | Constitution | No | No | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0003 | Retire Constitutional Authority | Constitutional | Constitution | No | No | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0004 | Modify Laws | Constitutional | Constitution | No | No | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0005 | Modify Enforcement | Constitutional | Constitution | No | No | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0006 | Approve Amendments | Constitutional | Constitution | No | No | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0007 | Create Policy | Governance | Constitution | Yes | Yes | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0008 | Retire Policy | Governance | Constitution | Yes | Yes | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0009 | Issue Governance Decision | Governance | Constitution | Yes | Yes | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0010 | Issue Standing Decision | Governance | Constitution | Yes | Yes | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0011 | Issue Authority Assignment | Governance | Constitution | Yes | Yes | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0012 | Create Authorities | Governance | Constitution | Yes | Yes | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0013 | Delegate Authorities | Governance | Constitution | Yes | Yes | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0014 | Revoke Authorities | Governance | Constitution | Yes | Yes | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0015 | Issue Claims | Runtime | Protocol | Yes | Yes | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0016 | Issue Decisions | Runtime | Protocol | Yes | Yes | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0017 | Issue Trust Assertions | Runtime | Protocol | Yes | Yes | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0018 | Register Capabilities | Runtime | Protocol | Yes | Yes | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0019 | Create Verification | Runtime | Protocol | Yes | Yes | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0020 | Issue Consent | Runtime | Protocol | Yes | Yes | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0021 | Issue Authorization | Runtime | Protocol | Yes | Yes | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0022 | Issue Federation Record | Runtime | Protocol | Yes | Yes | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0023 | Read | Operational | Enterprise | Yes | Yes | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0024 | Write | Operational | Enterprise | Yes | Yes | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0025 | Execute | Operational | Enterprise | Yes | Yes | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0026 | Observe | Operational | Enterprise | Yes | Yes | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0027 | Audit | Operational | Enterprise | Yes | Yes | AOC-AMD-0002 | Not scheduled | Canonical |
| CAP-0028 | Persist | Operational | Enterprise | Yes | Yes | AOC-AMD-0002 | Not scheduled | Canonical |

## Capability authority assignments

Assignments identify constitutional holders; they are governance records, not runtime permission objects. `Parent Assignment` is `Root` for ratified owner assignments. Valid lifecycle states are defined in `CAPABILITY-LIFECYCLE.md`.

| Assignment ID | Capability ID | Holder | Granted By | Parent Assignment | Lifecycle State | Amendment |
|---|---|---|---|---|---|---|
| CAA-0001 | CAP-0001 | Constitution | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0002 | CAP-0002 | Constitution | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0003 | CAP-0003 | Constitution | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0004 | CAP-0004 | Constitution | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0005 | CAP-0005 | Constitution | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0006 | CAP-0006 | Constitution | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0007 | CAP-0007 | Constitution | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0008 | CAP-0008 | Constitution | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0009 | CAP-0009 | Constitution | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0010 | CAP-0010 | Constitution | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0011 | CAP-0011 | Constitution | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0012 | CAP-0012 | Constitution | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0013 | CAP-0013 | Constitution | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0014 | CAP-0014 | Constitution | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0015 | CAP-0015 | Protocol | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0016 | CAP-0016 | Protocol | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0017 | CAP-0017 | Protocol | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0018 | CAP-0018 | Protocol | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0019 | CAP-0019 | Protocol | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0020 | CAP-0020 | Protocol | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0021 | CAP-0021 | Protocol | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0022 | CAP-0022 | Protocol | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0023 | CAP-0023 | Enterprise | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0024 | CAP-0024 | Enterprise | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0025 | CAP-0025 | Enterprise | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0026 | CAP-0026 | Enterprise | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0027 | CAP-0027 | Enterprise | Constitution | Root | Ratified | AOC-AMD-0002 |
| CAA-0028 | CAP-0028 | Enterprise | Constitution | Root | Ratified | AOC-AMD-0002 |

## Capability lifecycle transition ledger

The ledger records ordered state changes. A newly ratified root assignment starts at `Proposed` and moves to `Ratified`; these founding transitions are recorded as a compact constitutional baseline.

| Transition ID | Assignment ID | From | To | Authorized By | Amendment |
|---|---|---|---|---|---|
| CAT-0001 | CAA-0001..CAA-0028 | Proposed | Ratified | Constitution | AOC-AMD-0002 |
