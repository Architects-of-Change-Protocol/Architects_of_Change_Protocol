# Trust Violation Catalog

**Constitution Version:** v7.0

## Violations

| Violation ID | Name | Domain | Required Response |
|---|---|---|---|
| TRS-V-001 | Unauthorized Trust Creation | Trust Governance | Deny confidence influence; preserve evidence and history; escalate for constitutional review |
| TRS-V-002 | Trust Without Evidence | Trust Governance | Deny confidence influence; preserve evidence and history; escalate for constitutional review |
| TRS-V-003 | Trust Without Claim | Trust Governance | Deny confidence influence; preserve evidence and history; escalate for constitutional review |
| TRS-V-004 | Trust Without Standing | Trust Governance | Deny confidence influence; preserve evidence and history; escalate for constitutional review |
| TRS-V-005 | Invalid Lifecycle Transition | Trust Governance | Deny confidence influence; preserve evidence and history; escalate for constitutional review |
| TRS-V-006 | Invalid Trust Decay | Trust Governance | Deny confidence influence; preserve evidence and history; escalate for constitutional review |
| TRS-V-007 | Unauthorized Revocation | Trust Governance | Deny confidence influence; preserve evidence and history; escalate for constitutional review |
| TRS-V-008 | Trust Integrity Failure | Trust Governance | Deny confidence influence; preserve evidence and history; escalate for constitutional review |
| TRS-V-009 | Trust Traceability Failure | Trust Governance | Deny confidence influence; preserve evidence and history; escalate for constitutional review |
| TRS-V-010 | Trust Escalation | Trust Governance | Deny confidence influence; preserve evidence and history; escalate for constitutional review |

`TRS-V-010` is the default fail-closed escalation for a trust-governance defect that does not map to a more specific violation. A violation never authorizes deletion of trust history or use of an invalid confidence signal.
