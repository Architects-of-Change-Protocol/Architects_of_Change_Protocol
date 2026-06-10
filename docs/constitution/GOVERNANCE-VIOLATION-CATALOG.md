# Governance Violation Catalog

**Constitution Version:** v17.0

## Governance violation index

| Violation ID | Name | Severity | Description |
|---|---|---|---|
| GOV-V-001 | Unauthorized Governance Creation | Critical | A governance authority was created without a ratified amendment |
| GOV-V-002 | Proposal Without Standing | Critical | A governance proposal was submitted without valid proposer standing |
| GOV-V-003 | Proposal Without Scope | High | A governance proposal lacks an explicit scope definition |
| GOV-V-004 | Motion Without Consensus Requirement | Critical | A governance motion was created without a consensus requirement |
| GOV-V-005 | Motion Passed Without Consensus | Critical | A governance motion was recorded as Passed without satisfying its consensus requirement |
| GOV-V-006 | Mandate Without Scope | Critical | A governance mandate lacks an explicit scope definition |
| GOV-V-007 | Mandate Exceeds Scope | Critical | A governance mandate grants authority exceeding the governance authority scope |
| GOV-V-008 | Outcome Without Decision | Critical | A governance outcome lacks a valid decision reference |
| GOV-V-009 | Invalid Lifecycle Transition | High | A governance artifact transitioned to a state not allowed by the lifecycle policy |
| GOV-V-010 | Invalid Challenge | High | A governance challenge was initiated without valid grounds or standing |
| GOV-V-011 | Invalid Expiration | High | A governance artifact was expired without a valid expiration trigger |
| GOV-V-012 | Unauthorized Revocation | Critical | A governance act was revoked without valid cause, evidence, or decision reference |
| GOV-V-013 | Governance Integrity Failure | Critical | A governance artifact lacks required traceability fields |
| GOV-V-014 | Governance Traceability Failure | High | A governance artifact cannot be traced to a ratified amendment |
| GOV-V-015 | Governance Escalation | Critical | A governance act attempts to exercise authority beyond its cataloged scope |
| GOV-V-016 | Governance Without Authority | Critical | A governance act was performed without a canonical governance authority |
