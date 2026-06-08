# Decision Revocation Policy

**Constitution Version:** v4.0

## Revocation authority

Revocation permanently removes a decision authority record authority to justify new action while preserving its historical record. Only decisions marked `Revocable: Yes` may be revoked through this policy. A non-revocable decision may be displaced only by a constitutionally authorized superseding decision or Type C amendment.

## Valid causes

- `Evidence Invalid`
- `Policy Invalid`
- `Authority Invalid`
- `Capability Revoked`
- `Fraud`
- `Constitutional Override`

Revocation requires a unique record, known decision, valid cause, traceable evidence, responsible authority, ratified Type B or Type C amendment, effective date, and `Revoked` status. It must append an `Approved → Revoked` or `Appealed → Revoked` lifecycle transition and update explainability without deleting history.

## Revocation registry

| Revocation ID | Decision ID | Cause | Evidence | Revoked By | Amendment | Effective Date | Status |
|---|---|---|---|---|---|---|---|

No decision revocations are recorded at v4.0.

## Effects

Revoked decisions authorize no new action, cannot be reactivated, and may transition only to `Retired`. Dependent actions and decisions must be identified for review; this policy does not itself implement rollback or an execution engine.
