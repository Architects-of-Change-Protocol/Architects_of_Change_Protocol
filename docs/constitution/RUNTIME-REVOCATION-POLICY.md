# Runtime Revocation Policy

**Constitution Version:** v17.0

## Valid revocation causes

- `Fraud` — The execution was initiated through fraudulent authority, capability, or evidence
- `Integrity Failure` — One or more integrity dimensions have been compromised
- `Evidence Failure` — Required evidence was not generated or has been invalidated
- `Authority Failure` — The authorizing authority has been revoked or invalidated
- `Capability Failure` — The invoked capability has been revoked or is invalid
- `Constitutional Override` — A constitutional authority has overridden the execution
- `Governance Decision` — A governance decision has revoked the execution

## Revocation authority registry

| Runtime Authority ID | Revocable | Valid Causes | Revocation Authority | Evidence Required | Decision Reference Required | Amendment | Status |
|---|---|---|---|---|---|---|---|
| RUN-0001 | Yes | Fraud; Integrity Failure; Evidence Failure; Authority Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0017 | Active |
| RUN-0002 | Yes | Fraud; Integrity Failure; Capability Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0017 | Active |
| RUN-0003 | Yes | Fraud; Integrity Failure; Evidence Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0017 | Active |
| RUN-0004 | Yes | Fraud; Integrity Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0017 | Active |
| RUN-0005 | Yes | Fraud; Integrity Failure; Evidence Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0017 | Active |
| RUN-0006 | Yes | Fraud; Integrity Failure; Evidence Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0017 | Active |
| RUN-0013 | Yes | Fraud; Authority Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0017 | Active |
| RUN-0014 | Yes | Fraud; Capability Failure; Integrity Failure; Constitutional Override; Governance Decision | Protocol | Required | Required | AOC-AMD-0017 | Active |
| RUN-0015 | Yes | Fraud; Integrity Failure; Constitutional Override | Constitution | Required | Required | AOC-AMD-0017 | Active |

## Revocation registry

| Revocation ID | Runtime Authority ID | Cause | Evidence | Revoked By | Decision Reference | Amendment | Effective Date | Status |
|---|---|---|---|---|---|---|---|---|
