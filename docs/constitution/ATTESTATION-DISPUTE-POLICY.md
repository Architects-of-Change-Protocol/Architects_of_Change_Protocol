# Attestation Dispute Policy

**Constitution Version:** v15.0

## Constitutional rule

Any actor with standing may file a dispute against an `Active` attestation on cataloged grounds. A disputed attestation transitions to `Disputed` and suspends endorsement influence until resolution.

## Valid dispute grounds

| Ground | Description |
|---|---|
| Improper Eligibility | Attesting actor did not satisfy eligibility requirements at issuance |
| False Endorsement | Attesting actor endorsed something that is demonstrably false |
| Scope Violation | Attestation was issued outside its cataloged scope |
| Conflict Of Interest | Attesting actor had an undisclosed conflict of interest at issuance |
| Evidence Failure | Required evidence for the attestation was absent or invalid |
| Constitutional Conflict | Attestation conflicts with a constitutional law or ratified amendment |
| Governance Conflict | Attestation conflicts with a governance decision or policy |

## Dispute registry

| Dispute ID | Attestation ID | Grounds | Evidence | Initiator | Resolution | Decision Reference | Amendment | Status |
|---|---|---|---|---|---|---|---|---|

## Dispute invariants

A dispute must identify the attestation, the grounds, and supporting evidence. A dispute filed without grounds or evidence is constitutionally invalid. Dispute resolution must produce one of: `Active` (dispute dismissed), `Revoked` (dispute sustained), or `Retired` (constitutional retirement during dispute). All dispute records are permanently preserved.
