# Economic Violation Catalog

**Constitution Version:** v17.0

## Violation catalog

| Violation ID | Violation Name | Description | Severity | Detection |
|---|---|---|---|---|
| ECO-V-001 | Unauthorized Economic Right | An economic right is exercised without a valid cataloged rights assignment. | Critical | check-economics-authorities.mjs |
| ECO-V-002 | Invalid Economic Obligation | An economic obligation is asserted without a valid cataloged obligations record. | Critical | check-economic-obligations.mjs |
| ECO-V-003 | Invalid Asset | An asset class or asset record is referenced that is not cataloged or has been revoked. | High | check-economic-assets.mjs |
| ECO-V-004 | Invalid Consumption | A consumption record does not satisfy the governing consumption policy. | High | check-economic-consumption.mjs |
| ECO-V-005 | Invalid Settlement | A settlement record does not satisfy the governing settlement policy. | High | check-economic-settlement.mjs |
| ECO-V-006 | Invalid Treasury Allocation | A treasury action does not satisfy the governing treasury policy. | Critical | check-economic-treasury.mjs |
| ECO-V-007 | Invalid Valuation | A valuation record does not satisfy the governing valuation model. | High | check-economic-valuation.mjs |
| ECO-V-008 | Economic Integrity Failure | An economics act lacks required evidence, traceability, or lifecycle transitions. | Critical | check-economic-lifecycle.mjs |
| ECO-V-009 | Economic Traceability Failure | An economics act cannot be traced to a valid economics authority and policy chain. | Critical | check-economic-lifecycle.mjs |
| ECO-V-010 | Economic Escalation | An economics act attempts to escalate authority beyond its constitutional scope. | Critical | check-economics-authorities.mjs |
| ECO-V-011 | Unauthorized GCU Issuance | GCU is issued without authorization from ECO-0009 (GCU Authority). | Critical | check-economics-authorities.mjs |
| ECO-V-012 | Unauthorized SCU Issuance | SCU is issued without authorization from ECO-0010 (SCU Authority). | Critical | check-economics-authorities.mjs |
| ECO-V-013 | Settlement Manipulation | A settlement record is altered after confirmation without authorized revocation. | Critical | check-economic-settlement.mjs |
| ECO-V-014 | Treasury Abuse | Treasury reserves are allocated or distributed outside the governing treasury policy. | Critical | check-economic-treasury.mjs |
| ECO-V-015 | Economic Sovereignty Failure | An economics act attempts to transfer or override sovereignty through economic means. | Critical | check-economics-authorities.mjs |
