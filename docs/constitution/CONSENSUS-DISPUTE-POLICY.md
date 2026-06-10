# Consensus Dispute Policy

**Constitution Version:** v12.0

## Constitutional rule

Consensus may be disputed when a valid dispute ground exists. A dispute transitions a consensus from `Established` to `Disputed`, suspending its agreement influence until resolved. Every dispute must contain a dispute ID, consensus ID, grounds, evidence, and decision reference.

## Dispute registry

| Dispute ID | Consensus ID | Grounds | Evidence | Initiator | Resolution | Decision Reference | Amendment | Status |
|---|---|---|---|---|---|---|---|---|

## Valid dispute grounds

- **Threshold Miscalculation**: The threshold computation was incorrect.
- **Invalid Weighting**: Participant weights were improperly assigned.
- **Invalid Participants**: Ineligible actors participated in the consensus.
- **Improper Attestations**: Constituent attestations are invalid or ineligible.
- **Evidence Failure**: Underlying evidence does not support the consensus determination.
- **Constitutional Conflict**: The consensus conflicts with a constitutional authority.
- **Governance Conflict**: The consensus conflicts with a governance decision.

## Dispute invariants

Every dispute must reference a valid consensus ID. Disputed consensus may not be relied upon as agreement inputs until resolved to `Established`. Dispute resolution must reference a governance decision.
