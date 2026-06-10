# Attestation Eligibility Policy

**Constitution Version:** v13.0

## Constitutional rule

No attestation may become `Active` without eligibility validation. Eligibility is evaluated at the time of attestation issuance. Loss of eligibility after issuance is a valid revocation cause.

## Eligibility requirements

Requirements may include any combination of:

- **Standing**: Active, non-suspended standing of the required type
- **Trust Threshold**: Minimum active trust score for the attesting actor
- **Verification Status**: Required verified status for the attesting actor
- **Reputation Threshold**: Minimum active reputation score for the attesting actor
- **Authority Ownership**: Constitutional authority ownership of the required type
- **Constitutional Role**: Recognized constitutional role for the attestation class

## Eligibility policy registry

| Eligibility Policy ID | Attestation Class | Standing Requirement | Trust Threshold | Verification Required | Reputation Threshold | Authority Requirement | Constitutional Role | Amendment | Status |
|---|---|---|---|---|---|---|---|---|---|
| AEP-0001 | Constitutional | Constitutional standing required | None | Required | None | Constitutional authority required | Constitution steward | AOC-AMD-0010 | Active |
| AEP-0002 | Governance | Governance standing required | Advisory | Optional | None | Governance authority or delegation | Governance participant | AOC-AMD-0010 | Active |
| AEP-0003 | Runtime | Claimant standing required | Advisory | Optional | None | Protocol authority or eligible participant | Runtime participant | AOC-AMD-0010 | Active |
| AEP-0004 | Operational | Auditor standing required | Advisory | Optional | None | Enterprise authority or eligible participant | Operational participant | AOC-AMD-0010 | Active |

## Eligibility invariants

An actor that does not satisfy all eligibility requirements for an attestation type may not issue that attestation. Eligibility validation must be traceable. Self-attestation is prohibited unless explicitly permitted by the eligibility policy for that attestation type.
