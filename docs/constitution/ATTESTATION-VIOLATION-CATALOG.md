# Attestation Violation Catalog

**Constitution Version:** v18.0

## Constitutional rule

Violations in this catalog represent constitutionally impermissible attestation behaviors. Every violation must be detectable by a governance scanner. Every violation blocks release.

## Violation catalog

| Violation ID | Violation Name | Description | Severity | Detection |
|---|---|---|---|---|
| ATT-V-001 | Unauthorized Attestation Creation | An attestation was issued for a type not in the authority catalog | Critical | check-attestation-authorities |
| ATT-V-002 | Attestation Without Standing | Attesting actor lacked required standing at issuance | Critical | check-attestation-eligibility |
| ATT-V-003 | Attestation Without Eligibility | Attesting actor did not satisfy all eligibility requirements | Critical | check-attestation-eligibility |
| ATT-V-004 | Attestation Outside Scope | Attestation subject or scope exceeds the cataloged scope policy | Critical | check-attestation-scope |
| ATT-V-005 | Invalid Lifecycle Transition | Attestation transitioned through a state not in the allowed transition set | Critical | check-attestation-lifecycle |
| ATT-V-006 | Unauthorized Revocation | Attestation was revoked by an actor without revocation authority | Critical | check-attestation-revocation |
| ATT-V-007 | Invalid Expiration | Attestation expired through a trigger not in the cataloged expiration policy | High | check-attestation-expiration |
| ATT-V-008 | Conflict Of Interest Violation | Attesting actor had an undisclosed conflict of interest at issuance | Critical | check-attestation-disputes |
| ATT-V-009 | Attestation Integrity Failure | Attestation record is missing required fields or contains invalid values | Critical | check-attestation-authorities |
| ATT-V-010 | Attestation Traceability Failure | Attestation lacks required amendment, evidence, or authority traceability | Critical | check-attestation-governance |
| ATT-V-011 | Attestation Weight Escalation | Attestation claims a weight level exceeding its cataloged maximum | Critical | check-attestation-weight |
| ATT-V-012 | Constitutional Endorsement Failure | A constitutional decision required attestation input that was absent or invalid | Critical | check-attestation-governance |
