# Reputation Sources Policy

**Constitution Version:** v1.0

## Constitutional rule

Every reputation type must define allowed sources, source weight, source freshness, source integrity, source traceability, and minimum source coverage. No reputation signal may become `Active` without source evaluation satisfying these rules.

## Allowed source categories

| Category | Description |
|---|---|
| Standing History | Historical record of standing grants, suspensions, revocations, and eligibility outcomes |
| Claim Outcomes | Outcomes of submitted claims including accepted, disputed, withdrawn, and superseded |
| Trust History | Trust issuance, decay events, suspension, and revocation history |
| Verification History | Verification outcomes including verified, expired, and revoked records |
| Decision History | Decision outcomes including approved, appealed, revoked, and retired decisions |
| Appeal History | Outcomes of constitutional appeals including granted and denied |
| Dispute History | Dispute initiation, resolution, and outcome history |
| Revocation History | Revocation records across standing, claim, trust, verification, and decision domains |
| Audit History | Operational audit records and findings |
| Correction History | Correction records across all governed domains |

## Reputation sources registry

| Source Policy ID | Reputation Class | Allowed Sources | Source Weight | Source Freshness | Source Integrity | Source Traceability | Minimum Source Coverage | Amendment | Status |
|---|---|---|---|---|---|---|---|---|---|
| RSP-0001 | Constitutional | Standing History; Claim Outcomes; Decision History; Appeal History; Dispute History; Correction History | Constitutional: 0.4; Decision: 0.3; Appeal: 0.2; Dispute: 0.1 | Within 365 days for full weight; older records decay | Traceable to ratified amendment | Amendment-traceable; claim-traceable; decision-traceable | At least three source categories required | AOC-AMD-0009 | Active |
| RSP-0002 | Governance | Standing History; Claim Outcomes; Trust History; Decision History; Appeal History; Dispute History; Revocation History | Decision: 0.35; Trust: 0.25; Claim: 0.25; Appeal: 0.15 | Within 180 days for full weight; older records decay | Traceable to governed authority | Authority-traceable; decision-traceable | At least three source categories required | AOC-AMD-0009 | Active |
| RSP-0003 | Runtime | Claim Outcomes; Trust History; Verification History; Decision History; Dispute History; Revocation History; Correction History | Verification: 0.3; Trust: 0.3; Claim: 0.25; Decision: 0.15 | Within 90 days for full weight; older records decay | Traceable to protocol authority | Claim-traceable; trust-traceable; verification-traceable | At least two source categories required | AOC-AMD-0009 | Active |
| RSP-0004 | Operational | Audit History; Claim Outcomes; Decision History; Revocation History; Correction History | Audit: 0.4; Decision: 0.3; Claim: 0.2; Correction: 0.1 | Within 90 days for full weight; older records decay | Traceable to enterprise authority | Audit-traceable; decision-traceable | At least two source categories required | AOC-AMD-0009 | Active |
