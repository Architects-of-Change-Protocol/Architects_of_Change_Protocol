# Verification Lifecycle

**Constitution Version:** v12.0

## Constitutional rule

Every verification instance must follow the governed lifecycle. No verification may skip the `Pending Verification` state before becoming `Verified`. Terminal states are `Retired`. `Revoked` and `Retired` verifications authorize no new validation influence.

## Allowed lifecycle states

| State | Description |
|---|---|
| Proposed | Verification request submitted but not yet accepted for evaluation |
| Pending Verification | Evidence and method evaluation in progress |
| Verified | Evidence evaluated and threshold satisfied; verification active |
| Expired | Verification period elapsed per expiration policy |
| Revoked | Verification cancelled by authorized authority for a valid cause |
| Retired | Verification permanently decommissioned; historically preserved |

## Allowed lifecycle transitions

| From | To | Condition |
|---|---|---|
| Proposed | Pending Verification | Verification request accepted |
| Pending Verification | Verified | Evidence evaluated; method applied; threshold satisfied |
| Pending Verification | Revoked | Verification invalidated before completion |
| Verified | Expired | Expiration trigger satisfied per expiration policy |
| Verified | Revoked | Valid revocation cause; authorized revocation authority |
| Verified | Retired | Constitutional retirement decision |
| Expired | Verified | Re-verification; new evidence evaluation and method application |
| Expired | Revoked | Valid revocation cause applied to expired verification |
| Expired | Retired | Constitutional retirement decision |
| Revoked | Retired | Historical preservation; no reactivation |

## Verification lifecycle transition ledger

| Transition ID | Verification ID | From | To | Authorized By | Evidence Evaluation | Amendment | Effective Date |
|---|---|---|---|---|---|---|---|
| VLT-0001 | VER-0001 | Proposed | Pending Verification | Constitution | Review initiated | AOC-AMD-0008 | 2026-06-09 |
| VLT-0002 | VER-0001 | Pending Verification | Verified | Constitution | VEP-0001 satisfied | AOC-AMD-0008 | 2026-06-09 |
| VLT-0003 | VER-0002 | Proposed | Pending Verification | Constitution | Review initiated | AOC-AMD-0008 | 2026-06-09 |
| VLT-0004 | VER-0002 | Pending Verification | Verified | Constitution | VEP-0002 satisfied | AOC-AMD-0008 | 2026-06-09 |
| VLT-0005 | VER-0003 | Proposed | Pending Verification | Constitution | Review initiated | AOC-AMD-0008 | 2026-06-09 |
| VLT-0006 | VER-0003 | Pending Verification | Verified | Constitution | VEP-0003 satisfied | AOC-AMD-0008 | 2026-06-09 |
| VLT-0007 | VER-0004 | Proposed | Pending Verification | Constitution | Review initiated | AOC-AMD-0008 | 2026-06-09 |
| VLT-0008 | VER-0004 | Pending Verification | Verified | Constitution | VEP-0004 satisfied | AOC-AMD-0008 | 2026-06-09 |
| VLT-0009 | VER-0005 | Proposed | Pending Verification | Constitution | Review initiated | AOC-AMD-0008 | 2026-06-09 |
| VLT-0010 | VER-0005 | Pending Verification | Verified | Constitution | VEP-0005 satisfied | AOC-AMD-0008 | 2026-06-09 |
| VLT-0011 | VER-0006 | Proposed | Pending Verification | Constitution | Review initiated | AOC-AMD-0008 | 2026-06-09 |
| VLT-0012 | VER-0006 | Pending Verification | Verified | Constitution | VEP-0006 satisfied | AOC-AMD-0008 | 2026-06-09 |
| VLT-0013 | VER-0007 | Proposed | Pending Verification | Constitution | Review initiated | AOC-AMD-0008 | 2026-06-09 |
| VLT-0014 | VER-0007 | Pending Verification | Verified | Constitution | VEP-0007 satisfied | AOC-AMD-0008 | 2026-06-09 |
| VLT-0015 | VER-0008 | Proposed | Pending Verification | Protocol | Review initiated | AOC-AMD-0008 | 2026-06-09 |
| VLT-0016 | VER-0008 | Pending Verification | Verified | Protocol | VEP-0008 satisfied | AOC-AMD-0008 | 2026-06-09 |
| VLT-0017 | VER-0009 | Proposed | Pending Verification | Protocol | Review initiated | AOC-AMD-0008 | 2026-06-09 |
| VLT-0018 | VER-0009 | Pending Verification | Verified | Protocol | VEP-0009 satisfied | AOC-AMD-0008 | 2026-06-09 |
| VLT-0019 | VER-0010 | Proposed | Pending Verification | Protocol | Review initiated | AOC-AMD-0008 | 2026-06-09 |
| VLT-0020 | VER-0010 | Pending Verification | Verified | Protocol | VEP-0010 satisfied | AOC-AMD-0008 | 2026-06-09 |
| VLT-0021 | VER-0011 | Proposed | Pending Verification | Protocol | Review initiated | AOC-AMD-0008 | 2026-06-09 |
| VLT-0022 | VER-0011 | Pending Verification | Verified | Protocol | VEP-0011 satisfied | AOC-AMD-0008 | 2026-06-09 |
| VLT-0023 | VER-0012 | Proposed | Pending Verification | Protocol | Review initiated | AOC-AMD-0008 | 2026-06-09 |
| VLT-0024 | VER-0012 | Pending Verification | Verified | Protocol | VEP-0012 satisfied | AOC-AMD-0008 | 2026-06-09 |
| VLT-0025 | VER-0013 | Proposed | Pending Verification | Enterprise | Review initiated | AOC-AMD-0008 | 2026-06-09 |
| VLT-0026 | VER-0013 | Pending Verification | Verified | Enterprise | VEP-0013 satisfied | AOC-AMD-0008 | 2026-06-09 |
| VLT-0027 | VER-0014 | Proposed | Pending Verification | Enterprise | Review initiated | AOC-AMD-0008 | 2026-06-09 |
| VLT-0028 | VER-0014 | Pending Verification | Verified | Enterprise | VEP-0014 satisfied | AOC-AMD-0008 | 2026-06-09 |
| VLT-0029 | VER-0015 | Proposed | Pending Verification | Enterprise | Review initiated | AOC-AMD-0008 | 2026-06-09 |
| VLT-0030 | VER-0015 | Pending Verification | Verified | Enterprise | VEP-0015 satisfied | AOC-AMD-0008 | 2026-06-09 |
| VLT-0031 | VER-0016 | Proposed | Pending Verification | Enterprise | Review initiated | AOC-AMD-0008 | 2026-06-09 |
| VLT-0032 | VER-0016 | Pending Verification | Verified | Enterprise | VEP-0016 satisfied | AOC-AMD-0008 | 2026-06-09 |
