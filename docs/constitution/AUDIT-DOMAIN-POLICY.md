# Audit Domain Policy

**Constitution Version:** v18.0

## Preamble

Every constitutional domain must be covered by at least one audit authority. Audit domain coverage is the minimum requirement for constitutional audit completeness. Domain coverage does not establish certification; all coverage dimensions must be verified for certification.

## Auditable Domains

The following constitutional domains are subject to audit governance:

| Domain | Authority | Scanner | Test | Violation Catalog | Status |
|---|---|---|---|---|---|
| Authority | AUD-0014 | check-authority-governance.mjs | authority-governance.test.ts | BOUNDARY-VIOLATION-CATALOG.md | Canonical |
| Capability | AUD-0002 | check-capability-governance.mjs | capability-authority-governance.test.ts | CAPABILITY-VIOLATION-CATALOG.md | Canonical |
| Policy | AUD-0002 | check-policy-governance.mjs | policy-authority-governance.test.ts | POLICY-VIOLATION-CATALOG.md | Canonical |
| Standing | AUD-0002 | check-standing-governance.mjs | standing-authority-governance.test.ts | STANDING-VIOLATION-CATALOG.md | Canonical |
| Claim | AUD-0002 | check-claim-governance.mjs | claim-authority-governance.test.ts | CLAIM-VIOLATION-CATALOG.md | Canonical |
| Trust | AUD-0002 | check-trust-governance.mjs | trust-authority-governance.test.ts | TRUST-VIOLATION-CATALOG.md | Canonical |
| Verification | AUD-0002 | check-verification-governance.mjs | verification-authority-governance.test.ts | VERIFICATION-VIOLATION-CATALOG.md | Canonical |
| Reputation | AUD-0002 | check-reputation-governance.mjs | reputation-authority-governance.test.ts | REPUTATION-VIOLATION-CATALOG.md | Canonical |
| Attestation | AUD-0002 | check-attestation-governance.mjs | attestation-authority-governance.test.ts | ATTESTATION-VIOLATION-CATALOG.md | Canonical |
| Consensus | AUD-0002 | check-consensus-governance.mjs | consensus-authority-governance.test.ts | CONSENSUS-VIOLATION-CATALOG.md | Canonical |
| Governance | AUD-0013 | check-governance-governance.mjs | governance-authority-governance.test.ts | GOVERNANCE-VIOLATION-CATALOG.md | Canonical |
| Voting | AUD-0002 | check-voting-governance.mjs | voting-authority-governance.test.ts | VOTING-VIOLATION-CATALOG.md | Canonical |
| Federation | AUD-0012 | check-federation-governance.mjs | federation-authority-governance.test.ts | FEDERATION-VIOLATION-CATALOG.md | Canonical |
| Economics | AUD-0011 | check-economics-governance.mjs | economics-authority-governance.test.ts | ECONOMICS-VIOLATION-CATALOG.md | Canonical |
| Runtime | AUD-0010 | check-runtime-governance.mjs | runtime-authority-governance.test.ts | RUNTIME-VIOLATION-CATALOG.md | Canonical |
| Audit | AUD-0001 | check-audit-governance.mjs | audit-authority-governance.test.ts | AUDIT-VIOLATION-CATALOG.md | Canonical |

## Domain Audit Requirements

Every domain audit must verify:

1. All constitutional artifacts for the domain exist and declare the current Constitution version.
2. All authorities reference valid, ratified amendments.
3. All lifecycle records use valid states and authorized transitions.
4. All violation codes are defined in the domain's violation catalog.
5. All scanners and tests exist and pass against the current repository state.

## Creation Amendment

AOC-AMD-0018
