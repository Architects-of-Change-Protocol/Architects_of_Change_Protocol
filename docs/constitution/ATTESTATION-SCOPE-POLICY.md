# Attestation Scope Policy

**Constitution Version:** v12.0

## Constitutional rule

Every attestation must declare a subject, scope, duration, and authority. Attestations issued outside their cataloged scope are constitutionally invalid and must be revoked.

## Valid attestation scopes

| Scope | Description |
|---|---|
| Claim Scope | Endorsement of a specific governed claim or claim type |
| Verification Scope | Endorsement of a specific verification result or verification type |
| Decision Scope | Endorsement of a specific decision or decision class |
| Policy Scope | Endorsement of a specific policy or policy authority |
| Standing Scope | Endorsement of a participant's standing status |
| Constitution Scope | Endorsement of a constitutional artifact, amendment, or version |

## Scope registry

| Scope Policy ID | Attestation Class | Valid Scopes | Subject Requirements | Duration Requirements | Authority Requirements | Amendment | Status |
|---|---|---|---|---|---|---|---|
| ASP-0001 | Constitutional | Constitution Scope | Constitutional artifact reference required | Amendment-bounded | Constitutional authority required | AOC-AMD-0010 | Active |
| ASP-0002 | Governance | Policy Scope; Standing Scope; Decision Scope | Governance artifact reference required | Amendment-bounded or time-bounded | Governance authority required | AOC-AMD-0010 | Active |
| ASP-0003 | Runtime | Claim Scope; Verification Scope | Runtime artifact reference required | Time-bounded | Protocol authority or eligible standing required | AOC-AMD-0010 | Active |
| ASP-0004 | Operational | Claim Scope; Verification Scope; Decision Scope | Operational artifact reference required | Time-bounded | Enterprise authority or eligible standing required | AOC-AMD-0010 | Active |

## Scope invariants

An attestation may not exceed the scope declared at issuance. Scope may not be expanded after `Active` without revocation and reissuance. Every attestation must reference a specific subject; general or open-ended attestations are constitutionally invalid.
