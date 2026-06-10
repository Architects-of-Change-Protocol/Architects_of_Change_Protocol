# Audit Certification Policy

**Constitution Version:** v1.0

## Preamble

Audit certification is the governed determination that a constitutional audit has reached a defined level of completeness, integrity, and readiness. Certification levels are ordered and cumulative: each level requires all lower levels to be satisfied. Certification is a necessary but not sufficient condition for ratification readiness.

## Certification level catalog

| Certification Level | Level Name | Definition | Certified | Amendment |
|---|---|---|---|---|
| Level 0 | Unverified | No audit has been performed. Constitutional state is unknown. | Not certified | AOC-AMD-0018 |
| Level 1 | Domain Verified | At least one constitutional domain has been audited and verified without violations. | Not certified | AOC-AMD-0018 |
| Level 2 | Domain Certified | At least one constitutional domain has been audited, all findings remediated, and the domain certified by the Certification Authority. | Not certified | AOC-AMD-0018 |
| Level 3 | Constitution Verified | All constitutional domains have been audited and verified without open Critical or High violations. | Not certified | AOC-AMD-0018 |
| Level 4 | Constitution Certified | All constitutional domains have been audited, all findings remediated, and all domains certified by the Certification Authority. | Certified | AOC-AMD-0018 |
| Level 5 | Ratification Ready | The Constitution has been certified at Level 4, the Constitutional Integrity Report is complete, the Constitutional Gap Analysis shows no open gaps, and the Ratification Readiness Authority has approved ratification readiness. | Ratification Ready | AOC-AMD-0018 |

## Certification Authority

The Certification Authority (AUD-0006) is the sole constitutional authority authorized to advance a domain or the full Constitution to a certified status. Certification requires:

1. Complete coverage of all artifacts, scanners, tests, lifecycle records, authorities, violations, and amendments for the target scope.
2. No open Critical violations.
3. All High violations remediated or formally accepted with documented rationale.
4. Traceability verified for all artifacts in scope.
5. Integrity verified across all applicable integrity dimensions.
6. A signed Certification Record in `AUDIT-LIFECYCLE.md` with the certifying authority, evidence, and amendment reference.

## Certification Fraud

Claiming a certification level without satisfying all requirements constitutes a Certification Fraud violation (AUD-V-010), which is a Critical severity finding that immediately revokes all claimed certification levels and blocks ratification readiness.

## Creation Amendment

AOC-AMD-0018
