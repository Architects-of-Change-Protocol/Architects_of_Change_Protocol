# Verification Authorities

**Constitution Version:** v13.0

## Constitutional rule

Only verification types in this catalog may provide governed validation to decisions. Verification IDs are permanent and unique. Catalog presence defines a legitimate verification type, not an active verification instance. Retirement preserves every historical record and never reassigns an ID.

## Verification authority catalog

| Verification ID | Verification Name | Verification Class | Owner | Verification Method | Evidence Policy | Expiration Policy | Revocable | Creation Amendment | Retirement Amendment | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| VER-0001 | Constitution Verification | Constitutional | Constitution | VMP-0001 | VEP-0001 | VXP-0001 | Yes | AOC-AMD-0008 | Not scheduled | Canonical |
| VER-0002 | Amendment Verification | Constitutional | Constitution | VMP-0001 | VEP-0002 | VXP-0001 | Yes | AOC-AMD-0008 | Not scheduled | Canonical |
| VER-0003 | Authority Verification | Constitutional | Constitution | VMP-0002 | VEP-0003 | VXP-0001 | Yes | AOC-AMD-0008 | Not scheduled | Canonical |
| VER-0004 | Capability Verification | Governance | Constitution | VMP-0002 | VEP-0004 | VXP-0002 | Yes | AOC-AMD-0008 | Not scheduled | Canonical |
| VER-0005 | Policy Verification | Governance | Constitution | VMP-0002 | VEP-0005 | VXP-0002 | Yes | AOC-AMD-0008 | Not scheduled | Canonical |
| VER-0006 | Standing Verification | Governance | Constitution | VMP-0003 | VEP-0006 | VXP-0002 | Yes | AOC-AMD-0008 | Not scheduled | Canonical |
| VER-0007 | Decision Verification | Governance | Constitution | VMP-0002 | VEP-0007 | VXP-0002 | Yes | AOC-AMD-0008 | Not scheduled | Canonical |
| VER-0008 | Identity Verification | Runtime | Protocol | VMP-0003 | VEP-0008 | VXP-0003 | Yes | AOC-AMD-0008 | Not scheduled | Canonical |
| VER-0009 | Claim Verification | Runtime | Protocol | VMP-0004 | VEP-0009 | VXP-0003 | Yes | AOC-AMD-0008 | Not scheduled | Canonical |
| VER-0010 | Trust Verification | Runtime | Protocol | VMP-0004 | VEP-0010 | VXP-0003 | Yes | AOC-AMD-0008 | Not scheduled | Canonical |
| VER-0011 | Consent Verification | Runtime | Protocol | VMP-0003 | VEP-0011 | VXP-0003 | Yes | AOC-AMD-0008 | Not scheduled | Canonical |
| VER-0012 | Authorization Verification | Runtime | Protocol | VMP-0004 | VEP-0012 | VXP-0003 | Yes | AOC-AMD-0008 | Not scheduled | Canonical |
| VER-0013 | Audit Verification | Operational | Enterprise | VMP-0005 | VEP-0013 | VXP-0004 | Yes | AOC-AMD-0008 | Not scheduled | Canonical |
| VER-0014 | Compliance Verification | Operational | Enterprise | VMP-0005 | VEP-0014 | VXP-0004 | Yes | AOC-AMD-0008 | Not scheduled | Canonical |
| VER-0015 | Execution Verification | Operational | Enterprise | VMP-0005 | VEP-0015 | VXP-0004 | Yes | AOC-AMD-0008 | Not scheduled | Canonical |
| VER-0016 | Assurance Verification | Operational | Enterprise | VMP-0006 | VEP-0016 | VXP-0004 | Yes | AOC-AMD-0008 | Not scheduled | Canonical |

## Catalog integrity

Owners must be constitutional authorities. Each evidence policy covers exactly one verification type. Each expiration policy covers exactly one verification class. Creation, semantic expansion, ownership transfer, method or expiration policy changes, and retirement require a ratified Type B or Type C amendment.
