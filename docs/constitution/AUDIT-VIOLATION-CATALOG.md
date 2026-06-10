# Audit Violation Catalog

**Constitution Version:** v1.0

## Preamble

This catalog defines all violation codes emitted by audit governance scanners. Every violation code must be defined here before it may be used in a scanner. Scanners must not emit violation codes that are not defined in this catalog.

## Violation Registry

| Violation ID | Name | Severity | Description | Amendment |
|---|---|---|---|---|
| AUD-V-001 | Missing Constitutional Artifact | Critical | A required constitutional artifact is absent from the repository. | AOC-AMD-0018 |
| AUD-V-002 | Missing Scanner | High | A required governance scanner is absent from the repository. | AOC-AMD-0018 |
| AUD-V-003 | Missing Test | High | A required governance test is absent from the repository. | AOC-AMD-0018 |
| AUD-V-004 | Version Integrity Failure | Critical | A constitutional artifact declares a version other than the current Constitution version. | AOC-AMD-0018 |
| AUD-V-005 | Amendment Integrity Failure | Critical | A constitutional authority or artifact references an amendment that is not ratified or does not exist. | AOC-AMD-0018 |
| AUD-V-006 | Traceability Failure | High | A constitutional artifact cannot be traced to one or more required traceability dimensions. | AOC-AMD-0018 |
| AUD-V-007 | Coverage Failure | High | A required coverage category is incomplete or absent from the coverage policy. | AOC-AMD-0018 |
| AUD-V-008 | Domain Integrity Failure | Critical | A constitutional domain is missing a required audit dimension or the domain policy is absent. | AOC-AMD-0018 |
| AUD-V-009 | Cross-Domain Conflict | Critical | A constitutional inconsistency or contradiction between two or more domains has been detected. | AOC-AMD-0018 |
| AUD-V-010 | Certification Fraud | Critical | A certification level is claimed without satisfying all required certification conditions. | AOC-AMD-0018 |
| AUD-V-011 | Audit Escalation | High | An audit finding has been escalated due to unresolved blocking conditions or authority failure. | AOC-AMD-0018 |
| AUD-V-012 | Ratification Readiness Failure | Critical | The Constitution does not satisfy the conditions required for ratification readiness. | AOC-AMD-0018 |

## Creation Amendment

AOC-AMD-0018
