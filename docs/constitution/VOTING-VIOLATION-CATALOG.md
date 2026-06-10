# Voting Violation Catalog

**Constitution Version:** v14.0

## Violation catalog

| Violation ID | Violation Name | Severity | Description |
|---|---|---|---|
| VOTE-V-001 | Unauthorized Vote | Critical | A vote was cast by an actor without a valid cataloged voting authority |
| VOTE-V-002 | Vote Without Standing | Critical | A vote was cast by an actor without active applicable standing |
| VOTE-V-003 | Vote Without Eligibility | Critical | A vote was cast without eligibility validation under the governing eligibility policy |
| VOTE-V-004 | Invalid Weight Assignment | High | A vote was weighted outside the bounds of the governing weight policy |
| VOTE-V-005 | Invalid Delegation | High | A vote was delegated in violation of the governing delegation policy |
| VOTE-V-006 | Vote Outside Scope | High | A vote was cast outside the scope of the voting authority or motion |
| VOTE-V-007 | Invalid Lifecycle Transition | High | A voting lifecycle transitioned to a state not permitted from the current state |
| VOTE-V-008 | Invalid Revocation | High | A vote was revoked without valid cause, evidence, or decision reference |
| VOTE-V-009 | Invalid Challenge | High | A challenge was raised on grounds not permitted by the challenge policy |
| VOTE-V-010 | Voting Integrity Failure | Critical | A voting record cannot be verified as unaltered or traceable |
| VOTE-V-011 | Voting Traceability Failure | High | A voting act lacks a complete traceable record to its authority, eligibility, and weight |
| VOTE-V-012 | Voting Escalation | High | A voting act was used to claim authority beyond the scope of the voting authority |
| VOTE-V-013 | Governance Influence Failure | Critical | A voting act was used to override or bypass governance, consensus, or constitutional requirements |
