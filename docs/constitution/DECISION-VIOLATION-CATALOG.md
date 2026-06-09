# Decision Violation Catalog

**Constitution Version:** v8.0

| Violation ID | Name | Trigger | Required Response |
|---|---|---|---|
| DEC-V-001 | Decision Without Evidence | Approval lacks a complete, sufficient, traceable, integrity-valid evidence requirement. | Reject approval or revoke the affected decision; fail governance validation. |
| DEC-V-002 | Decision Without Policy | A decision lacks active applicable policy coverage. | Deny decision legitimacy and fail closed. |
| DEC-V-003 | Decision Without Explainability | An approved decision lacks a complete constitutional explanation. | Deny action authorization until explanation is complete. |
| DEC-V-004 | Unauthorized Decision | The ID, class, owner, capability, status, or creation amendment is invalid. | Reject the decision authority and fail governance validation. |
| DEC-V-005 | Appeal Without Grounds | An appeal is malformed, unsupported, unresolved, or targets a non-appealable decision. | Reject the appeal and preserve the last valid state. |
| DEC-V-006 | Invalid Lifecycle Transition | A state or transition is unknown, discontinuous, prohibited, or reactivates a revoked/retired decision. | Reject the transition and retain the last valid state. |
| DEC-V-007 | Decision Integrity Failure | Evidence, explanation, appeal, revocation, lifecycle, or registry integrity cannot be verified. | Quarantine the record and fail closed. |
| DEC-V-008 | Untraceable Decision | Policy, capability, authority, evidence, amendment, or outcome traceability is incomplete. | Deny legitimacy and require complete lineage. |
| DEC-V-009 | Invalid Revocation | A revocation lacks a valid cause, evidence, authority, amendment, or revocable target. | Reject revocation and fail governance validation. |
| DEC-V-010 | Decision Governance Integrity | A required artifact, schema, version, reference, scanner, CI gate, or release gate is absent or inconsistent. | Fail decision governance validation and release. |
