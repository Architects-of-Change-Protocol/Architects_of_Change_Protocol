# Reputation Violations

**Constitution Version:** v14.0

## Constitutional rule

Violations in this catalog constitute breaches of the Reputation Governance Framework. Every violation must be detectable by a governed scanner and traceable to a constitutional rule. Violation IDs are permanent and never reassigned.

## Reputation violation catalog

| Violation ID | Violation Name | Description | Governing Rule | Severity | Detection |
|---|---|---|---|---|---|
| REP-V-001 | Unauthorized Reputation Creation | A reputation signal was created without a cataloged reputation authority, valid owner, and ratified amendment | REPUTATION-AUTHORITIES.md | Critical | check-reputation-authorities.mjs |
| REP-V-002 | Reputation Without Sources | A reputation signal was activated without source evaluation satisfying the governing sources policy | REPUTATION-SOURCES-POLICY.md | Critical | check-reputation-sources.mjs |
| REP-V-003 | Reputation Without Calculation Policy | A reputation signal was activated without a governing calculation policy | REPUTATION-CALCULATION-POLICY.md | Critical | check-reputation-calculation.mjs |
| REP-V-004 | Reputation Overrides Standing | A reputation signal was used to bypass or replace standing requirements | REPUTATION-CONSTITUTION.md | Critical | check-reputation-governance.mjs |
| REP-V-005 | Reputation Overrides Verification | A reputation signal was used to bypass or replace verification requirements | REPUTATION-CONSTITUTION.md | Critical | check-reputation-governance.mjs |
| REP-V-006 | Invalid Lifecycle Transition | A reputation signal underwent a lifecycle transition not permitted by the lifecycle policy | REPUTATION-LIFECYCLE.md | High | check-reputation-lifecycle.mjs |
| REP-V-007 | Invalid Decay | A reputation decay event occurred without a valid decay trigger or violated historical preservation | REPUTATION-DECAY-POLICY.md | High | check-reputation-decay.mjs |
| REP-V-008 | Invalid Dispute | A reputation dispute was initiated without valid grounds or evidence, or was resolved without proper authority | REPUTATION-DISPUTE-POLICY.md | High | check-reputation-disputes.mjs |
| REP-V-009 | Invalid Correction | A reputation correction was applied without a valid cause, prior value preservation, or decision reference | REPUTATION-CORRECTION-POLICY.md | High | check-reputation-corrections.mjs |
| REP-V-010 | Unauthorized Revocation | A reputation was revoked without a valid cause, authorized revocation authority, evidence, or decision reference | REPUTATION-REVOCATION-POLICY.md | Critical | check-reputation-revocation.mjs |
| REP-V-011 | Reputation Integrity Failure | Source records contributing to a reputation signal are found to be fraudulent or fundamentally unreliable | REPUTATION-SOURCES-POLICY.md | Critical | check-reputation-sources.mjs |
| REP-V-012 | Reputation Traceability Failure | A reputation signal cannot be traced to its source records, calculation policy, or governing amendment | REPUTATION-CONSTITUTION.md | High | check-reputation-governance.mjs |
| REP-V-013 | Reputation Escalation | A reputation signal was used to grant authority, capability, or standing beyond what the reputation framework permits | REPUTATION-CONSTITUTION.md | Critical | check-reputation-governance.mjs |
