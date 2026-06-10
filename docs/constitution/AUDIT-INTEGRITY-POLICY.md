# Audit Integrity Policy

**Constitution Version:** v1.0

## Preamble

Audit integrity is the governed assurance that the constitutional system is internally consistent, version-coherent, amendment-traceable, authority-complete, lifecycle-valid, policy-compliant, cross-domain consistent, scanner-enforced, and test-verified. Integrity is a necessary condition for certification readiness.

## Integrity Dimensions

### Version Integrity

Every constitutional artifact must declare the same Constitution version as `CONSTITUTION.md`. No artifact may declare a version that has not been established by a ratified amendment. Version Integrity failures are Critical severity.

### Amendment Integrity

Every authority, artifact, and lifecycle record must be traceable to a ratified amendment. No constitutional claim may be made without an amendment establishing it. Amendment Integrity failures are Critical severity.

### Authority Integrity

Every constitutional authority must be cataloged, assigned to a valid owner, in a valid status, and traceable to a ratified amendment. No undocumented authority may exercise constitutional power. Authority Integrity failures are Critical severity.

### Lifecycle Integrity

Every constitutional lifecycle record must use valid states defined in the domain lifecycle policy. Every transition must be authorized by a cataloged authority. Every lifecycle record must be traceable to a ratified amendment. Lifecycle Integrity failures are High severity.

### Policy Integrity

Every policy document must be consistent with its domain constitution. No policy may contradict its parent constitution. Every policy must cover its declared scope completely. Policy Integrity failures are High severity.

### Cross-Domain Integrity

Constitutional domains must not contradict each other. Authority boundaries must not overlap without explicit amendment-ratified delegation. Cross-Domain Integrity failures are Critical severity.

### Scanner Integrity

Every scanner must enforce the obligations established by its governing amendment. Every scanner must fail closed on violations. Scanners must not emit undefined violation codes. Scanner Integrity failures are High severity.

### Test Integrity

Every test must verify both valid and invalid scenarios. Tests must not pass with invalid fixture data. Test Integrity failures are High severity.

## Creation Amendment

AOC-AMD-0018
