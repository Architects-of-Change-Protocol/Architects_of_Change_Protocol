# Verification Violation Catalog

**Constitution Version:** v13.0

## Violations

| Violation ID | Name | Domain | Required Response |
|---|---|---|---|
| VER-V-001 | Unauthorized Verification Creation | Verification Governance | Deny validation influence; preserve evidence and history; escalate for constitutional review |
| VER-V-002 | Verification Without Evidence | Verification Governance | Deny validation influence; preserve evidence and history; escalate for constitutional review |
| VER-V-003 | Verification Without Method | Verification Governance | Deny validation influence; preserve evidence and history; escalate for constitutional review |
| VER-V-004 | Verification Without Threshold | Verification Governance | Deny validation influence; preserve evidence and history; escalate for constitutional review |
| VER-V-005 | Invalid Lifecycle Transition | Verification Governance | Deny validation influence; preserve evidence and history; escalate for constitutional review |
| VER-V-006 | Invalid Expiration | Verification Governance | Deny validation influence; preserve evidence and history; escalate for constitutional review |
| VER-V-007 | Unauthorized Revocation | Verification Governance | Deny validation influence; preserve evidence and history; escalate for constitutional review |
| VER-V-008 | Verification Integrity Failure | Verification Governance | Deny validation influence; preserve evidence and history; escalate for constitutional review |
| VER-V-009 | Verification Traceability Failure | Verification Governance | Deny validation influence; preserve evidence and history; escalate for constitutional review |
| VER-V-010 | Verification Escalation | Verification Governance | Deny validation influence; preserve evidence and history; escalate for constitutional review |

`VER-V-010` is the default fail-closed escalation for a verification-governance defect that does not map to a more specific violation. A violation never authorizes deletion of verification history or use of an invalid verification signal.
