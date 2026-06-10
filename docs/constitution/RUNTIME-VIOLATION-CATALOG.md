# Runtime Violation Catalog

**Constitution Version:** v17.0

## Violation catalog

| Violation ID | Violation Name | Severity | Description |
|---|---|---|---|
| RUN-V-001 | Unauthorized Execution | Critical | Execution began without valid authority reference |
| RUN-V-002 | Invalid Capability Invocation | Critical | Execution invoked a capability outside its authorized scope |
| RUN-V-003 | Invalid Policy Execution | High | Execution violated applicable policy constraints |
| RUN-V-004 | Missing Evidence | High | Required evidence was not generated for execution |
| RUN-V-005 | Integrity Failure | Critical | One or more runtime integrity dimensions failed |
| RUN-V-006 | Unauthorized Runtime Escalation | Critical | Execution exceeded its authorized runtime scope |
| RUN-V-007 | Invalid Obligation Fulfillment | High | One or more execution obligations were not fulfilled |
| RUN-V-008 | Invalid Outcome | High | Execution produced an outcome that does not match its authorized result type |
| RUN-V-009 | Invalid Audit | High | Execution cannot be audited or audit was incomplete |
| RUN-V-010 | Runtime Traceability Failure | Critical | Execution cannot be traced to constitutional authority |
| RUN-V-011 | Runtime Authenticity Failure | Critical | Execution cannot be attributed to a valid constitutional authority |
| RUN-V-012 | Runtime Immutability Failure | Critical | Runtime evidence has been altered after generation |
| RUN-V-013 | Runtime Compliance Failure | High | Execution did not satisfy applicable compliance obligations |
| RUN-V-014 | Constitutional Execution Failure | Critical | Execution violated constitutional doctrine |
| RUN-V-015 | Runtime Sovereignty Failure | Critical | Execution violated sovereignty boundaries |
