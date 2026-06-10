# Attestation Revocation Policy

**Constitution Version:** v12.0

## Constitutional rule

An attestation may be revoked only for a cataloged valid cause by a designated revocation authority. Revocation is permanent. A revoked attestation may not be restored to `Active`. Historical records of revoked attestations are permanently preserved.

## Valid revocation causes

| Cause | Description |
|---|---|
| Fraud | Attesting actor provided false or fabricated endorsement |
| Standing Failure | Attesting actor lost the required standing after issuance |
| Trust Failure | Attesting actor's trust score fell below the eligibility threshold |
| Verification Failure | Attesting actor's required verification was revoked |
| Reputation Failure | Attesting actor's reputation was revoked |
| Conflict Of Interest | Attesting actor had an undisclosed conflict of interest at issuance |
| Constitutional Override | A ratified amendment requires revocation |
| Governance Decision | A constitutional governance decision requires revocation |

## Revocation authority registry

| Attestation ID | Revocable | Valid Causes | Revocation Authority | Evidence Required | Decision Reference Required | Amendment | Status |
|---|---|---|---|---|---|---|---|
| ATT-0001 | Yes | Fraud; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0010 | Active |
| ATT-0002 | Yes | Fraud; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0010 | Active |
| ATT-0003 | Yes | Fraud; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0010 | Active |
| ATT-0004 | Yes | Fraud; Standing Failure; Conflict Of Interest; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0010 | Active |
| ATT-0005 | Yes | Fraud; Standing Failure; Conflict Of Interest; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0010 | Active |
| ATT-0006 | Yes | Fraud; Standing Failure; Conflict Of Interest; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0010 | Active |
| ATT-0007 | Yes | Fraud; Standing Failure; Conflict Of Interest; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0010 | Active |
| ATT-0008 | Yes | Fraud; Standing Failure; Trust Failure; Verification Failure; Conflict Of Interest; Constitutional Override; Governance Decision | Protocol | Required | Required | AOC-AMD-0010 | Active |
| ATT-0009 | Yes | Fraud; Standing Failure; Trust Failure; Verification Failure; Conflict Of Interest; Constitutional Override; Governance Decision | Protocol | Required | Required | AOC-AMD-0010 | Active |
| ATT-0010 | Yes | Fraud; Standing Failure; Trust Failure; Verification Failure; Conflict Of Interest; Constitutional Override; Governance Decision | Protocol | Required | Required | AOC-AMD-0010 | Active |
| ATT-0011 | Yes | Fraud; Standing Failure; Trust Failure; Conflict Of Interest; Constitutional Override; Governance Decision | Protocol | Required | Required | AOC-AMD-0010 | Active |
| ATT-0012 | Yes | Fraud; Standing Failure; Reputation Failure; Conflict Of Interest; Constitutional Override; Governance Decision | Protocol | Required | Required | AOC-AMD-0010 | Active |
| ATT-0013 | Yes | Fraud; Standing Failure; Reputation Failure; Conflict Of Interest; Constitutional Override; Governance Decision | Enterprise | Required | Required | AOC-AMD-0010 | Active |
| ATT-0014 | Yes | Fraud; Standing Failure; Reputation Failure; Conflict Of Interest; Constitutional Override; Governance Decision | Enterprise | Required | Required | AOC-AMD-0010 | Active |
| ATT-0015 | Yes | Fraud; Standing Failure; Reputation Failure; Conflict Of Interest; Constitutional Override; Governance Decision | Enterprise | Required | Required | AOC-AMD-0010 | Active |
| ATT-0016 | Yes | Fraud; Standing Failure; Reputation Failure; Conflict Of Interest; Constitutional Override; Governance Decision | Enterprise | Required | Required | AOC-AMD-0010 | Active |

## Revocation registry

| Revocation ID | Attestation ID | Subject | Cause | Evidence | Revoked By | Decision Reference | Amendment | Effective Date | Status |
|---|---|---|---|---|---|---|---|---|---|

## Revocation invariants

Unauthorized revocation is a constitutional violation (ATT-V-006). Evidence and decision reference are required for every revocation. A revocation authority may not revoke an attestation it does not own without a constitutional override or governance decision.
