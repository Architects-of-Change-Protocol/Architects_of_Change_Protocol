# Attestation Authorities

**Constitution Version:** v15.0

## Constitutional rule

Only attestation types in this catalog may provide governed endorsement signals to decisions. Attestation IDs are permanent and unique. Catalog presence defines a legitimate attestation type, not an active attestation instance. Retirement preserves every historical record and never reassigns an ID.

## Attestation authority catalog

| Attestation ID | Attestation Name | Attestation Class | Owner | Eligibility Policy | Weight Policy | Expiration Policy | Revocable | Disputable | Creation Amendment | Retirement Amendment | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ATT-0001 | Constitution Validity Attestation | Constitutional | Constitution | AEP-0001 | AWP-0001 | AXP-0001 | Yes | Yes | AOC-AMD-0010 | Not scheduled | Canonical |
| ATT-0002 | Amendment Attestation | Constitutional | Constitution | AEP-0001 | AWP-0001 | AXP-0001 | Yes | Yes | AOC-AMD-0010 | Not scheduled | Canonical |
| ATT-0003 | Authority Attestation | Constitutional | Constitution | AEP-0001 | AWP-0001 | AXP-0001 | Yes | Yes | AOC-AMD-0010 | Not scheduled | Canonical |
| ATT-0004 | Capability Attestation | Governance | Constitution | AEP-0002 | AWP-0002 | AXP-0002 | Yes | Yes | AOC-AMD-0010 | Not scheduled | Canonical |
| ATT-0005 | Policy Attestation | Governance | Constitution | AEP-0002 | AWP-0002 | AXP-0002 | Yes | Yes | AOC-AMD-0010 | Not scheduled | Canonical |
| ATT-0006 | Standing Attestation | Governance | Constitution | AEP-0002 | AWP-0002 | AXP-0002 | Yes | Yes | AOC-AMD-0010 | Not scheduled | Canonical |
| ATT-0007 | Decision Attestation | Governance | Constitution | AEP-0002 | AWP-0002 | AXP-0002 | Yes | Yes | AOC-AMD-0010 | Not scheduled | Canonical |
| ATT-0008 | Identity Attestation | Runtime | Protocol | AEP-0003 | AWP-0003 | AXP-0003 | Yes | Yes | AOC-AMD-0010 | Not scheduled | Canonical |
| ATT-0009 | Claim Attestation | Runtime | Protocol | AEP-0003 | AWP-0003 | AXP-0003 | Yes | Yes | AOC-AMD-0010 | Not scheduled | Canonical |
| ATT-0010 | Verification Attestation | Runtime | Protocol | AEP-0003 | AWP-0003 | AXP-0003 | Yes | Yes | AOC-AMD-0010 | Not scheduled | Canonical |
| ATT-0011 | Trust Attestation | Runtime | Protocol | AEP-0003 | AWP-0003 | AXP-0003 | Yes | Yes | AOC-AMD-0010 | Not scheduled | Canonical |
| ATT-0012 | Reputation Attestation | Runtime | Protocol | AEP-0003 | AWP-0003 | AXP-0003 | Yes | Yes | AOC-AMD-0010 | Not scheduled | Canonical |
| ATT-0013 | Audit Attestation | Operational | Enterprise | AEP-0004 | AWP-0004 | AXP-0004 | Yes | Yes | AOC-AMD-0010 | Not scheduled | Canonical |
| ATT-0014 | Compliance Attestation | Operational | Enterprise | AEP-0004 | AWP-0004 | AXP-0004 | Yes | Yes | AOC-AMD-0010 | Not scheduled | Canonical |
| ATT-0015 | Assurance Attestation | Operational | Enterprise | AEP-0004 | AWP-0004 | AXP-0004 | Yes | Yes | AOC-AMD-0010 | Not scheduled | Canonical |
| ATT-0016 | Execution Attestation | Operational | Enterprise | AEP-0004 | AWP-0004 | AXP-0004 | Yes | Yes | AOC-AMD-0010 | Not scheduled | Canonical |

## Catalog integrity

Owners must be constitutional authorities. Each eligibility policy, weight policy, and expiration policy must be cataloged. Creation, semantic expansion, ownership transfer, policy changes, and retirement require a ratified Type B or Type C amendment.
