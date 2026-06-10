# Audit Coverage Policy

**Constitution Version:** v18.0

## Preamble

Audit coverage is the governed enumeration of all constitutional artifacts, scanners, tests, lifecycle records, authorities, violations, and amendments that must be present and verified for a constitutional audit to be considered complete. Coverage is a necessary but not sufficient condition for certification.

## Coverage Categories

### Artifact Coverage

Every constitutional domain must have a complete set of constitutional artifacts. Artifact coverage verifies that no required document is absent, that every document declares the current Constitution version, and that every document is traceable to a ratified amendment.

### Scanner Coverage

Every constitutional domain must have at least one scanner that enforces its governance obligations. Scanner coverage verifies that all required scanners exist, are executable, and pass against the current repository state without errors.

### Test Coverage

Every scanner must have a corresponding test. Test coverage verifies that all required tests exist, that each test validates both passing and failing behavior, and that tests are traceable to the scanners they cover.

### Lifecycle Coverage

Every constitutional domain that defines lifecycle states must have a lifecycle document. Lifecycle coverage verifies that all lifecycle records use valid states, that all transitions are authorized, and that no orphaned lifecycle records exist.

### Authority Coverage

Every constitutional authority must be cataloged, assigned to an owner, traceable to a ratified amendment, and in a valid status. Authority coverage verifies that no undocumented authorities exist and that no authorities claim powers beyond their amendment scope.

### Violation Coverage

Every scanner must reference violation codes that are defined in the domain's violation catalog. Violation coverage verifies that all violation codes used by scanners are cataloged, that no undefined violation codes are referenced, and that all violation severities are valid.

### Amendment Coverage

Every constitutional document must be traceable to a ratified amendment. Amendment coverage verifies that all creation amendments are ratified, that all version increments correspond to recorded amendments, and that the amendment chain is unbroken from v1.0 to the current version.

## Creation Amendment

AOC-AMD-0018
