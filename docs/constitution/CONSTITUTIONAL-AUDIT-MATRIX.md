# Constitutional Audit Matrix

**Constitution Version:** v18.0

## Preamble

This matrix summarizes the audit coverage status of all constitutional domains. It is updated as part of each audit cycle and must be verified by the Domain Audit Authority (AUD-0002) before certification readiness is claimed.

## Domain Coverage Matrix

| Domain | Authorities | Policies | Lifecycle | Violations | Scanners | Tests | Coverage | Status |
|---|---|---|---|---|---|---|---|---|
| Authority | CONSTITUTIONAL-AUTHORITIES.md | CONSTITUTIONAL-BOUNDARY-POLICY.md | N/A | BOUNDARY-VIOLATION-CATALOG.md | check-authority-governance.mjs | authority-governance.test.ts | Complete | Canonical |
| Capability | CAPABILITY-AUTHORITIES.md | CAPABILITY-DELEGATION-POLICY.md; CAPABILITY-REVOCATION-POLICY.md | CAPABILITY-LIFECYCLE.md | CAPABILITY-VIOLATION-CATALOG.md | check-capability-governance.mjs | capability-authority-governance.test.ts | Complete | Canonical |
| Policy | POLICY-AUTHORITIES.md | POLICY-HIERARCHY.md; POLICY-EXCEPTION-POLICY.md; POLICY-CONFLICT-RESOLUTION.md | POLICY-LIFECYCLE.md | POLICY-VIOLATION-CATALOG.md | check-policy-governance.mjs | policy-authority-governance.test.ts | Complete | Canonical |
| Standing | STANDING-AUTHORITIES.md | STANDING-ELIGIBILITY-POLICY.md; STANDING-DELEGATION-POLICY.md | STANDING-LIFECYCLE.md | STANDING-VIOLATION-CATALOG.md | check-standing-governance.mjs | standing-authority-governance.test.ts | Complete | Canonical |
| Claim | CLAIM-AUTHORITIES.md | CLAIM-EVIDENCE-POLICY.md; CLAIM-DISPUTE-POLICY.md | CLAIM-LIFECYCLE.md | CLAIM-VIOLATION-CATALOG.md | check-claim-governance.mjs | claim-authority-governance.test.ts | Complete | Canonical |
| Trust | TRUST-AUTHORITIES.md | TRUST-EVIDENCE-POLICY.md; TRUST-ISSUANCE-POLICY.md; TRUST-DECAY-POLICY.md | TRUST-LIFECYCLE.md | TRUST-VIOLATION-CATALOG.md | check-trust-governance.mjs | trust-authority-governance.test.ts | Complete | Canonical |
| Verification | VERIFICATION-AUTHORITIES.md | VERIFICATION-EVIDENCE-POLICY.md; VERIFICATION-METHODS-POLICY.md | VERIFICATION-LIFECYCLE.md | VERIFICATION-VIOLATION-CATALOG.md | check-verification-governance.mjs | verification-authority-governance.test.ts | Complete | Canonical |
| Reputation | REPUTATION-AUTHORITIES.md | REPUTATION-SOURCES-POLICY.md; REPUTATION-CALCULATION-POLICY.md | REPUTATION-LIFECYCLE.md | REPUTATION-VIOLATION-CATALOG.md | check-reputation-governance.mjs | reputation-authority-governance.test.ts | Complete | Canonical |
| Attestation | ATTESTATION-AUTHORITIES.md | ATTESTATION-SCOPE-POLICY.md; ATTESTATION-ELIGIBILITY-POLICY.md | ATTESTATION-LIFECYCLE.md | ATTESTATION-VIOLATION-CATALOG.md | check-attestation-governance.mjs | attestation-authority-governance.test.ts | Complete | Canonical |
| Consensus | CONSENSUS-AUTHORITIES.md | CONSENSUS-MODELS-POLICY.md; CONSENSUS-THRESHOLDS-POLICY.md | CONSENSUS-LIFECYCLE.md | CONSENSUS-VIOLATION-CATALOG.md | check-consensus-governance.mjs | consensus-authority-governance.test.ts | Complete | Canonical |
| Governance | GOVERNANCE-AUTHORITIES.md | GOVERNANCE-PROPOSALS-POLICY.md; GOVERNANCE-MOTIONS-POLICY.md | GOVERNANCE-LIFECYCLE.md | GOVERNANCE-VIOLATION-CATALOG.md | check-governance-governance.mjs | governance-authority-governance.test.ts | Complete | Canonical |
| Voting | VOTING-AUTHORITIES.md | VOTING-ELIGIBILITY-POLICY.md; VOTING-WEIGHT-POLICY.md | VOTING-LIFECYCLE.md | VOTING-VIOLATION-CATALOG.md | check-voting-governance.mjs | voting-authority-governance.test.ts | Complete | Canonical |
| Federation | FEDERATION-AUTHORITIES.md | FEDERATION-RECOGNITION-POLICY.md; FEDERATION-TRUST-POLICY.md | FEDERATION-LIFECYCLE.md | FEDERATION-VIOLATION-CATALOG.md | check-federation-governance.mjs | federation-authority-governance.test.ts | Complete | Canonical |
| Economics | ECONOMICS-AUTHORITIES.md | ECONOMICS-RIGHTS-POLICY.md; ECONOMICS-OBLIGATIONS-POLICY.md | ECONOMICS-LIFECYCLE.md | ECONOMICS-VIOLATION-CATALOG.md | check-economics-governance.mjs | economics-authority-governance.test.ts | Complete | Canonical |
| Runtime | RUNTIME-AUTHORITIES.md | RUNTIME-EXECUTION-POLICY.md; RUNTIME-CAPABILITY-POLICY.md | RUNTIME-LIFECYCLE.md | RUNTIME-VIOLATION-CATALOG.md | check-runtime-governance.mjs | runtime-authority-governance.test.ts | Complete | Canonical |
| Audit | AUDIT-AUTHORITIES.md | AUDIT-COVERAGE-POLICY.md; AUDIT-INTEGRITY-POLICY.md | AUDIT-LIFECYCLE.md | AUDIT-VIOLATION-CATALOG.md | check-audit-governance.mjs | audit-authority-governance.test.ts | Complete | Canonical |

## Creation Amendment

AOC-AMD-0018
