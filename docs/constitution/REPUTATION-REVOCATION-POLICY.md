# Reputation Revocation Policy

**Constitution Version:** v13.0

## Constitutional rule

Every reputation type marked `Revocable: Yes` must define its revocation authority, valid causes, evidence requirements, and decision reference requirements. Revocation does not delete historical reputation records. Revocation prevents future reliance on the signal unless restored through a valid constitutional process.

## Valid revocation causes

| Cause | Description |
|---|---|
| Fraud | Deliberate falsification of source records contributing to reputation |
| Source Integrity Failure | Sources used in calculation are found to be fundamentally unreliable |
| Standing Failure | The subject's standing has been permanently revoked |
| Claim Failure | Material claims underlying the reputation have been revoked or invalidated |
| Trust Failure | Material trust signals underlying the reputation have been revoked |
| Verification Failure | Material verifications underlying the reputation have been revoked |
| Decision Failure | Material decisions underlying the reputation have been revoked |
| Constitutional Override | A constitutional amendment requires revocation |
| Governance Decision | An authorized governance decision requires revocation |

## Reputation revocation authority registry

| Reputation ID | Revocable | Valid Causes | Revocation Authority | Evidence Required | Decision Reference Required | Amendment | Status |
|---|---|---|---|---|---|---|---|
| REP-0001 | Yes | Fraud; Source Integrity Failure; Standing Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0009 | Active |
| REP-0002 | Yes | Fraud; Source Integrity Failure; Standing Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0009 | Active |
| REP-0003 | Yes | Fraud; Source Integrity Failure; Standing Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0009 | Active |
| REP-0004 | Yes | Fraud; Source Integrity Failure; Standing Failure; Decision Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0009 | Active |
| REP-0005 | Yes | Fraud; Source Integrity Failure; Standing Failure; Decision Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0009 | Active |
| REP-0006 | Yes | Fraud; Source Integrity Failure; Standing Failure; Decision Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0009 | Active |
| REP-0007 | Yes | Fraud; Source Integrity Failure; Standing Failure; Decision Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0009 | Active |
| REP-0008 | Yes | Fraud; Source Integrity Failure; Standing Failure; Claim Failure; Trust Failure; Constitutional Override; Governance Decision | Protocol | Required | Required | AOC-AMD-0009 | Active |
| REP-0009 | Yes | Fraud; Source Integrity Failure; Standing Failure; Claim Failure; Trust Failure; Verification Failure; Constitutional Override; Governance Decision | Protocol | Required | Required | AOC-AMD-0009 | Active |
| REP-0010 | Yes | Fraud; Source Integrity Failure; Standing Failure; Verification Failure; Constitutional Override; Governance Decision | Protocol | Required | Required | AOC-AMD-0009 | Active |
| REP-0011 | Yes | Fraud; Source Integrity Failure; Standing Failure; Trust Failure; Constitutional Override; Governance Decision | Protocol | Required | Required | AOC-AMD-0009 | Active |
| REP-0012 | Yes | Fraud; Source Integrity Failure; Standing Failure; Claim Failure; Constitutional Override; Governance Decision | Protocol | Required | Required | AOC-AMD-0009 | Active |
| REP-0013 | Yes | Fraud; Source Integrity Failure; Standing Failure; Decision Failure; Constitutional Override; Governance Decision | Protocol | Required | Required | AOC-AMD-0009 | Active |
| REP-0014 | Yes | Fraud; Source Integrity Failure; Standing Failure; Decision Failure; Constitutional Override; Governance Decision | Enterprise | Required | Required | AOC-AMD-0009 | Active |
| REP-0015 | Yes | Fraud; Source Integrity Failure; Standing Failure; Decision Failure; Constitutional Override; Governance Decision | Enterprise | Required | Required | AOC-AMD-0009 | Active |
| REP-0016 | Yes | Fraud; Source Integrity Failure; Standing Failure; Decision Failure; Constitutional Override; Governance Decision | Enterprise | Required | Required | AOC-AMD-0009 | Active |
| REP-0017 | Yes | Fraud; Source Integrity Failure; Standing Failure; Decision Failure; Constitutional Override; Governance Decision | Enterprise | Required | Required | AOC-AMD-0009 | Active |

## Reputation revocation registry

| Revocation ID | Reputation ID | Subject | Cause | Evidence | Revoked By | Decision Reference | Amendment | Effective Date | Status |
|---|---|---|---|---|---|---|---|---|---|

## Catalog integrity

Revocations must reference a valid reputation ID, a valid revocation cause, evidence, and a decision reference. Historical reputation records are never deleted on revocation. Revoked reputations may not be re-activated without a valid constitutional restoration process.
