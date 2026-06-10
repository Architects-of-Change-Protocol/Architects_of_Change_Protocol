# Trust Revocation Policy

**Constitution Version:** v13.0

## Revocation rule

Revocation permanently removes a trust signal's ability to influence new decisions while preserving all history. Valid causes are `Fraud`, `Evidence Failure`, `Identity Failure`, `Standing Failure`, `Constitutional Override`, and `Governance Decision`.

Revocation requires an authorized revoker, cause evidence, a governed decision reference, an append-only revocation record, and a lifecycle transition to `Revoked`. Emergency suspension may precede review but may not be mislabeled as revocation. Revoked trust can transition only to `Retired`.

## Trust revocation authority registry

| Trust ID | Revocable | Valid Causes | Revocation Authority | Evidence Required | Decision Reference Required | Amendment | Status |
|---|---|---|---|---|---|---|---|
| TRS-0001 | Yes | Fraud; Evidence Failure; Identity Failure; Standing Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0007 | Active |
| TRS-0002 | Yes | Fraud; Evidence Failure; Identity Failure; Standing Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0007 | Active |
| TRS-0003 | Yes | Fraud; Evidence Failure; Identity Failure; Standing Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0007 | Active |
| TRS-0004 | Yes | Fraud; Evidence Failure; Identity Failure; Standing Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0007 | Active |
| TRS-0005 | Yes | Fraud; Evidence Failure; Identity Failure; Standing Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0007 | Active |
| TRS-0006 | Yes | Fraud; Evidence Failure; Identity Failure; Standing Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0007 | Active |
| TRS-0007 | Yes | Fraud; Evidence Failure; Identity Failure; Standing Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | AOC-AMD-0007 | Active |
| TRS-0008 | Yes | Fraud; Evidence Failure; Identity Failure; Standing Failure; Constitutional Override; Governance Decision | Protocol | Required | Required | AOC-AMD-0007 | Active |
| TRS-0009 | Yes | Fraud; Evidence Failure; Identity Failure; Standing Failure; Constitutional Override; Governance Decision | Protocol | Required | Required | AOC-AMD-0007 | Active |
| TRS-0010 | Yes | Fraud; Evidence Failure; Identity Failure; Standing Failure; Constitutional Override; Governance Decision | Protocol | Required | Required | AOC-AMD-0007 | Active |
| TRS-0011 | Yes | Fraud; Evidence Failure; Identity Failure; Standing Failure; Constitutional Override; Governance Decision | Protocol | Required | Required | AOC-AMD-0007 | Active |
| TRS-0012 | Yes | Fraud; Evidence Failure; Identity Failure; Standing Failure; Constitutional Override; Governance Decision | Protocol | Required | Required | AOC-AMD-0007 | Active |
| TRS-0013 | Yes | Fraud; Evidence Failure; Identity Failure; Standing Failure; Constitutional Override; Governance Decision | Enterprise | Required | Required | AOC-AMD-0007 | Active |
| TRS-0014 | Yes | Fraud; Evidence Failure; Identity Failure; Standing Failure; Constitutional Override; Governance Decision | Enterprise | Required | Required | AOC-AMD-0007 | Active |
| TRS-0015 | Yes | Fraud; Evidence Failure; Identity Failure; Standing Failure; Constitutional Override; Governance Decision | Enterprise | Required | Required | AOC-AMD-0007 | Active |
| TRS-0016 | Yes | Fraud; Evidence Failure; Identity Failure; Standing Failure; Constitutional Override; Governance Decision | Enterprise | Required | Required | AOC-AMD-0007 | Active |

## Trust revocation registry

| Revocation ID | Trust ID | Subject | Cause | Evidence | Revoked By | Decision Reference | Amendment | Effective Date | Status |
|---|---|---|---|---|---|---|---|---|---|

No trust revocations are recorded at v7.0.
