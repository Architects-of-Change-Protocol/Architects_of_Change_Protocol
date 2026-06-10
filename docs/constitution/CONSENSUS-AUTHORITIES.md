# Consensus Authorities

**Constitution Version:** v12.0

## Constitutional rule

Only consensus types in this catalog may provide governed agreement signals to decisions. Consensus IDs are permanent and unique. Catalog presence defines a legitimate consensus type, not an active consensus instance. Retirement preserves every historical record and never reassigns an ID.

## Consensus authority catalog

| Consensus ID | Consensus Name | Consensus Class | Owner | Consensus Model | Threshold Policy | Expiration Policy | Revocable | Disputable | Creation Amendment | Retirement Amendment | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| CNS-0001 | Constitution Consensus | Constitutional | Constitution | CMP-0001 | CTP-0001 | CXP-0001 | Yes | Yes | AOC-AMD-0011 | Not scheduled | Canonical |
| CNS-0002 | Amendment Consensus | Constitutional | Constitution | CMP-0001 | CTP-0001 | CXP-0001 | Yes | Yes | AOC-AMD-0011 | Not scheduled | Canonical |
| CNS-0003 | Authority Consensus | Constitutional | Constitution | CMP-0001 | CTP-0001 | CXP-0001 | Yes | Yes | AOC-AMD-0011 | Not scheduled | Canonical |
| CNS-0004 | Capability Consensus | Governance | Constitution | CMP-0002 | CTP-0002 | CXP-0002 | Yes | Yes | AOC-AMD-0011 | Not scheduled | Canonical |
| CNS-0005 | Policy Consensus | Governance | Constitution | CMP-0002 | CTP-0002 | CXP-0002 | Yes | Yes | AOC-AMD-0011 | Not scheduled | Canonical |
| CNS-0006 | Governance Proposal Consensus | Governance | Constitution | CMP-0002 | CTP-0002 | CXP-0002 | Yes | Yes | AOC-AMD-0011 | Not scheduled | Canonical |
| CNS-0007 | Decision Consensus | Governance | Constitution | CMP-0002 | CTP-0002 | CXP-0002 | Yes | Yes | AOC-AMD-0011 | Not scheduled | Canonical |
| CNS-0008 | Claim Consensus | Runtime | Protocol | CMP-0003 | CTP-0003 | CXP-0003 | Yes | Yes | AOC-AMD-0011 | Not scheduled | Canonical |
| CNS-0009 | Verification Consensus | Runtime | Protocol | CMP-0003 | CTP-0003 | CXP-0003 | Yes | Yes | AOC-AMD-0011 | Not scheduled | Canonical |
| CNS-0010 | Trust Consensus | Runtime | Protocol | CMP-0003 | CTP-0003 | CXP-0003 | Yes | Yes | AOC-AMD-0011 | Not scheduled | Canonical |
| CNS-0011 | Attestation Consensus | Runtime | Protocol | CMP-0003 | CTP-0003 | CXP-0003 | Yes | Yes | AOC-AMD-0011 | Not scheduled | Canonical |
| CNS-0012 | Audit Consensus | Operational | Enterprise | CMP-0004 | CTP-0004 | CXP-0004 | Yes | Yes | AOC-AMD-0011 | Not scheduled | Canonical |
| CNS-0013 | Compliance Consensus | Operational | Enterprise | CMP-0004 | CTP-0004 | CXP-0004 | Yes | Yes | AOC-AMD-0011 | Not scheduled | Canonical |
| CNS-0014 | Assurance Consensus | Operational | Enterprise | CMP-0004 | CTP-0004 | CXP-0004 | Yes | Yes | AOC-AMD-0011 | Not scheduled | Canonical |

## Catalog integrity

Owners must be constitutional authorities. Each consensus model and threshold policy must be cataloged. Creation, semantic expansion, ownership transfer, policy changes, and retirement require a ratified Type B or Type C amendment.
