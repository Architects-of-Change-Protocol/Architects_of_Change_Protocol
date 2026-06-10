# Decision Evidence Policy

**Constitution Version:** v18.0

## Constitutional rule

No decision may transition to `Approved` unless its declared evidence requirement exists, meets or exceeds the minimum, comes from an allowed source, is traceable to immutable source identifiers and the decision ID, and passes its integrity requirement. Assertions, convenience, authority rank, or policy existence are not substitutes for evidence.

## Required dimensions

Every decision must define:

- **Evidence Requirements:** a stable evidence requirement ID.
- **Evidence Minimums:** the least sufficient quantity or threshold.
- **Evidence Sources:** constitutionally allowed provenance.
- **Evidence Traceability:** the binding among evidence, decision, policy, capability, and authority.
- **Evidence Integrity:** the validation needed to detect tampering or provenance failure.

## Evidence requirements registry

| Evidence ID | Decision ID | Evidence Minimums | Evidence Sources | Evidence Traceability | Evidence Integrity | Amendment | Status |
|---|---|---|---|---|---|---|---|
| EVID-0001 | DEC-0001 | 2 independent records | Ratified amendment record and constitutional diff | Immutable source identifiers and decision ID | Hash verified and provenance authenticated | AOC-AMD-0004 | Active |
| EVID-0002 | DEC-0002 | 2 independent records | Ratified amendment record and constitutional diff | Immutable source identifiers and decision ID | Hash verified and provenance authenticated | AOC-AMD-0004 | Active |
| EVID-0003 | DEC-0003 | 2 independent records | Ratified amendment record and constitutional diff | Immutable source identifiers and decision ID | Hash verified and provenance authenticated | AOC-AMD-0004 | Active |
| EVID-0004 | DEC-0004 | 2 independent records | Ratified amendment record and constitutional diff | Immutable source identifiers and decision ID | Hash verified and provenance authenticated | AOC-AMD-0004 | Active |
| EVID-0005 | DEC-0005 | 2 independent records | Authority, capability, and policy governance records | Immutable source identifiers and decision ID | Hash verified and provenance authenticated | AOC-AMD-0004 | Active |
| EVID-0006 | DEC-0006 | 2 independent records | Authority, capability, and policy governance records | Immutable source identifiers and decision ID | Hash verified and provenance authenticated | AOC-AMD-0004 | Active |
| EVID-0007 | DEC-0007 | 2 independent records | Authority, capability, and policy governance records | Immutable source identifiers and decision ID | Hash verified and provenance authenticated | AOC-AMD-0004 | Active |
| EVID-0008 | DEC-0008 | 2 independent records | Authority, capability, and policy governance records | Immutable source identifiers and decision ID | Hash verified and provenance authenticated | AOC-AMD-0004 | Active |
| EVID-0009 | DEC-0009 | 1 verified record | Protocol input, verification result, and provenance record | Immutable source identifiers and decision ID | Hash verified and provenance authenticated | AOC-AMD-0004 | Active |
| EVID-0010 | DEC-0010 | 1 verified record | Protocol input, verification result, and provenance record | Immutable source identifiers and decision ID | Hash verified and provenance authenticated | AOC-AMD-0004 | Active |
| EVID-0011 | DEC-0011 | 1 verified record | Protocol input, verification result, and provenance record | Immutable source identifiers and decision ID | Hash verified and provenance authenticated | AOC-AMD-0004 | Active |
| EVID-0012 | DEC-0012 | 1 verified record | Signed audit or assurance record | Immutable source identifiers and decision ID | Hash verified and provenance authenticated | AOC-AMD-0004 | Active |
| EVID-0013 | DEC-0013 | 1 verified record | Signed audit or assurance record | Immutable source identifiers and decision ID | Hash verified and provenance authenticated | AOC-AMD-0004 | Active |
| EVID-0014 | DEC-0014 | 1 verified record | Signed audit or assurance record | Immutable source identifiers and decision ID | Hash verified and provenance authenticated | AOC-AMD-0004 | Active |

## Failure semantics

Missing, insufficient, untraceable, expired, contradictory, or integrity-invalid evidence returns the decision to `Pending Evidence` or causes rejection/revocation. Evidence may not be silently replaced after approval; replacement creates an auditable review, appeal, or revocation path.
