# Attestation Lifecycle

**Constitution Version:** v18.0

## Constitutional rule

Every attestation instance must follow the constitutional lifecycle. Transitions outside the allowed set are constitutionally invalid. Every transition must be traceable to a ratified attestation amendment.

## Lifecycle states

| State | Description |
|---|---|
| Proposed | Attestation has been initiated but not yet submitted for validation |
| Pending Validation | Attestation has been submitted and is awaiting eligibility validation |
| Active | Attestation has passed eligibility validation and is a valid endorsement input |
| Expired | Attestation reached its expiration boundary and no longer provides endorsement input |
| Disputed | Attestation is under constitutional dispute; endorsement influence is suspended |
| Revoked | Attestation has been revoked and permanently ceases to provide endorsement input |
| Retired | Attestation has been retired; historical record is preserved |

## Allowed lifecycle transitions

| From | To | Trigger |
|---|---|---|
| Proposed | Pending Validation | Submission for eligibility validation |
| Pending Validation | Active | Eligibility validation passed |
| Pending Validation | Revoked | Eligibility validation failed |
| Active | Expired | Expiration boundary reached |
| Active | Disputed | Valid dispute filed |
| Active | Revoked | Valid revocation cause established |
| Active | Retired | Constitutional retirement decision |
| Disputed | Active | Dispute resolved in favor of attester |
| Disputed | Revoked | Dispute resolved against attester |
| Disputed | Retired | Constitutional retirement during dispute |
| Expired | Retired | Constitutional retirement of expired attestation |
| Revoked | Retired | Constitutional retirement of revoked attestation |
| Retired | (none) | Terminal state |

## Attestation lifecycle transition ledger

| Transition ID | Attestation ID | From | To | Authorized By | Evidence | Amendment | Effective Date |
|---|---|---|---|---|---|---|---|

## Lifecycle invariants

No attestation may skip `Pending Validation` before reaching `Active`. `Retired` is a terminal state. A `Revoked` attestation may not be restored to `Active` without revocation and reissuance as a new attestation instance. `Disputed` attestations may not be relied upon as endorsement inputs until resolved to `Active`.
