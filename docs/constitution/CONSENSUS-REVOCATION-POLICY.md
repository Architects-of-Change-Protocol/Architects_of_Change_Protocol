# Consensus Revocation Policy

**Constitution Version:** v17.0

## Constitutional rule

Consensus may be revoked when a valid revocation cause exists. Revocation permanently disables a consensus from providing agreement input. Revocation preserves all historical records.

## Revocation authority registry

| Consensus ID | Revocable | Valid Causes | Revocation Authority | Evidence Required | Decision Reference Required | Amendment | Status |
|---|---|---|---|---|---|---|---|
| CNS-0001 | Yes | Fraud; Threshold Failure; Invalid Attestations; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0011 | Active |
| CNS-0002 | Yes | Fraud; Threshold Failure; Invalid Attestations; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0011 | Active |
| CNS-0003 | Yes | Fraud; Threshold Failure; Invalid Attestations; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0011 | Active |
| CNS-0004 | Yes | Fraud; Threshold Failure; Invalid Attestations; Standing Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0011 | Active |
| CNS-0005 | Yes | Fraud; Threshold Failure; Invalid Attestations; Standing Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0011 | Active |
| CNS-0006 | Yes | Fraud; Threshold Failure; Invalid Attestations; Standing Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0011 | Active |
| CNS-0007 | Yes | Fraud; Threshold Failure; Invalid Attestations; Standing Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0011 | Active |
| CNS-0008 | Yes | Fraud; Threshold Failure; Invalid Attestations; Verification Failure; Trust Failure; Standing Failure; Constitutional Override; Governance Decision | Protocol | Required | Required | AOC-AMD-0011 | Active |
| CNS-0009 | Yes | Fraud; Threshold Failure; Invalid Attestations; Verification Failure; Trust Failure; Standing Failure; Constitutional Override; Governance Decision | Protocol | Required | Required | AOC-AMD-0011 | Active |
| CNS-0010 | Yes | Fraud; Threshold Failure; Invalid Attestations; Verification Failure; Trust Failure; Standing Failure; Constitutional Override; Governance Decision | Protocol | Required | Required | AOC-AMD-0011 | Active |
| CNS-0011 | Yes | Fraud; Threshold Failure; Invalid Attestations; Verification Failure; Trust Failure; Standing Failure; Constitutional Override; Governance Decision | Protocol | Required | Required | AOC-AMD-0011 | Active |
| CNS-0012 | Yes | Fraud; Threshold Failure; Invalid Attestations; Standing Failure; Constitutional Override; Governance Decision | Enterprise | Required | Required | AOC-AMD-0011 | Active |
| CNS-0013 | Yes | Fraud; Threshold Failure; Invalid Attestations; Standing Failure; Constitutional Override; Governance Decision | Enterprise | Required | Required | AOC-AMD-0011 | Active |
| CNS-0014 | Yes | Fraud; Threshold Failure; Invalid Attestations; Standing Failure; Constitutional Override; Governance Decision | Enterprise | Required | Required | AOC-AMD-0011 | Active |

## Revocation registry

| Revocation ID | Consensus ID | Subject | Cause | Evidence | Revoked By | Decision Reference | Amendment | Effective Date | Status |
|---|---|---|---|---|---|---|---|---|---|

## Valid revocation causes

- **Fraud**: Attestations or participant records were fraudulently created.
- **Threshold Failure**: Recomputation shows threshold was never satisfied.
- **Invalid Attestations**: Constituent attestations are constitutionally invalid.
- **Standing Failure**: One or more participating actors lacked valid standing.
- **Verification Failure**: Underlying verification requirements were not met.
- **Trust Failure**: Underlying trust requirements were not met.
- **Constitutional Override**: A constitutional amendment overrides an established consensus.
- **Governance Decision**: A governance decision revokes consensus.
