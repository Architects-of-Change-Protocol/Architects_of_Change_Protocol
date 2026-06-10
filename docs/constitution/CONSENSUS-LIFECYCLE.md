# Consensus Lifecycle

**Constitution Version:** v17.0

## Constitutional rule

Every consensus instance must follow the constitutional lifecycle. Transitions outside the allowed set are constitutionally invalid. Every transition must be traceable to a ratified consensus amendment.

## Lifecycle states

| State | Description |
|---|---|
| Proposed | Consensus determination has been initiated but attestation collection has not begun |
| Collecting | Consensus is actively collecting attestations from eligible actors |
| Pending Evaluation | Attestation collection is complete and consensus threshold is being evaluated |
| Established | Consensus threshold has been satisfied and governed agreement exists |
| Disputed | Consensus is under constitutional dispute; agreement influence is suspended |
| Expired | Consensus reached its expiration boundary and no longer provides agreement input |
| Revoked | Consensus has been revoked and permanently ceases to provide agreement input |
| Retired | Consensus has been retired; historical record is preserved |

## Allowed lifecycle transitions

| From | To | Trigger |
|---|---|---|
| Proposed | Collecting | Attestation collection initiated |
| Collecting | Pending Evaluation | Attestation collection complete |
| Pending Evaluation | Established | Threshold satisfaction confirmed |
| Pending Evaluation | Revoked | Threshold failure confirmed |
| Established | Disputed | Valid dispute filed |
| Established | Expired | Expiration boundary reached |
| Established | Revoked | Valid revocation cause established |
| Established | Retired | Constitutional retirement decision |
| Disputed | Established | Dispute resolved in favor of consensus |
| Disputed | Revoked | Dispute resolved against consensus |
| Disputed | Retired | Constitutional retirement during dispute |
| Expired | Established | Recomputation satisfies threshold |
| Expired | Retired | Constitutional retirement of expired consensus |
| Revoked | Retired | Constitutional retirement of revoked consensus |
| Retired | (none) | Terminal state |

## Consensus lifecycle transition ledger

| Transition ID | Consensus ID | From | To | Authorized By | Evidence | Amendment | Effective Date |
|---|---|---|---|---|---|---|---|

## Lifecycle invariants

No consensus may skip `Collecting` and `Pending Evaluation` before reaching `Established`. `Retired` is a terminal state. A `Revoked` consensus may not be restored to `Established` without recomputation as a new consensus instance. `Disputed` consensus may not be relied upon as agreement inputs until resolved to `Established`.
