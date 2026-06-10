# Consensus Violations

**Constitution Version:** v17.0

## Constitutional rule

The following violation codes identify constitutional violations of consensus governance. Every violation must be traceable to a consensus ID, a file, and a rationale.

## Violation catalog

| Violation ID | Violation Name | Description | Severity |
|---|---|---|---|
| CNS-V-001 | Unauthorized Consensus Creation | A consensus was created outside the amendment governance process | Critical |
| CNS-V-002 | Consensus Without Threshold | A consensus reached Established state without threshold satisfaction | Critical |
| CNS-V-003 | Consensus Without Attestations | A consensus was established without constituent attestations | Critical |
| CNS-V-004 | Consensus Without Standing | A participating actor lacked valid standing at consensus time | High |
| CNS-V-005 | Invalid Consensus Model | A consensus used a model not cataloged in CONSENSUS-MODELS-POLICY.md | High |
| CNS-V-006 | Invalid Lifecycle Transition | A consensus transitioned through an uncatalogued lifecycle path | Critical |
| CNS-V-007 | Invalid Recomputation | A consensus recomputation violated recomputation policy | High |
| CNS-V-008 | Invalid Expiration | A consensus expiration violated expiration policy | High |
| CNS-V-009 | Unauthorized Revocation | A consensus was revoked without a valid cause or authority | Critical |
| CNS-V-010 | Consensus Integrity Failure | Consensus records are internally inconsistent | Critical |
| CNS-V-011 | Consensus Traceability Failure | Consensus lacks required traceability to amendment, authority, or decision | High |
| CNS-V-012 | Consensus Weight Escalation | Consensus weight exceeded what the model and threshold policy permit | Critical |
| CNS-V-013 | Consensus Manipulation | Consensus was influenced by ineligible actors or fraudulent attestations | Critical |
| CNS-V-014 | Constitutional Agreement Failure | Consensus was used to bypass constitutional authority, policy, or decision requirements | Critical |
