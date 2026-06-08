# Standing Violation Catalog

**Constitution Version:** v6.0

| Violation ID | Name | Trigger | Required Response |
|---|---|---|---|
| STD-V-001 | Unauthorized Standing Creation | A standing record lacks a valid identity, owner, amendment, class, policy, or catalog status. | Reject the record and fail governance validation. |
| STD-V-002 | Participation Without Standing | A participant acts without applicable active standing. | Deny participation and fail closed. |
| STD-V-003 | Invalid Eligibility | Requirements, disqualifiers, evidence, validation, or renewal rules are absent or unsatisfied. | Keep standing inactive or suspend/revoke it. |
| STD-V-004 | Unauthorized Delegation | Non-delegable standing is delegated or scope, eligibility, expiry, or lineage is invalid. | Reject the delegation and preserve the last valid state. |
| STD-V-005 | Unauthorized Representation | Representation is prohibited, expired, overbroad, unauditable, or transfers ownership/authority. | Reject representation and deny the represented act. |
| STD-V-006 | Standing Reactivation | Revoked or retired standing is returned to an active state. | Reject the transition and fail governance validation. |
| STD-V-007 | Revocation Without Cause | A revocation lacks valid cause, evidence, authority, amendment, or traceability. | Reject the revocation and preserve the prior valid state. |
| STD-V-008 | Standing Escalation | Delegation or representation expands standing, authority, class, or participation scope. | Deny the escalation and revoke invalid derivatives. |
| STD-V-009 | Standing Without Evidence | Eligibility, delegation, representation, suspension, or revocation lacks evidence. | Deny legitimacy until evidence is complete. |
| STD-V-010 | Standing Integrity Failure | A required artifact, schema, version, reference, scanner, CI gate, release gate, or authority chain is absent or inconsistent. | Quarantine affected records and fail standing governance validation. |
