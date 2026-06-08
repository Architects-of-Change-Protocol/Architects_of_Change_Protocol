# Policy Violation Catalog

**Constitution Version:** v3.0

| Violation ID | Name | Trigger | Required response |
|---|---|---|---|
| POL-V-001 | Unauthorized Policy Creation | A policy lacks a unique ID, valid owner, or ratified Type B/Type C creation amendment. | Reject policy and fail governance validation. |
| POL-V-002 | Policy Escalation | A child, delegation, change, or exception broadens authority or weakens an inherited constraint. | Reject change and preserve the stricter rule. |
| POL-V-003 | Policy Conflict | Applicable policies have incompatible rules, priorities, multiple winners, or ambiguous evaluation. | Apply constitutional resolution order; fail closed if no unique winner exists. |
| POL-V-004 | Unauthorized Exception | An exception is expired, unratified, ownerless, indefinite, malformed, or outside allowed types. | Ignore exception and enforce the underlying policy. |
| POL-V-005 | Retired Policy Usage | A revoked, retired, suspended, or otherwise inactive policy is used as effective authority. | Reject evaluation and require active policy coverage. |
| POL-V-006 | Hierarchy Violation | Inheritance is cyclic, invalid, widening, out of scope, or class-inverted. | Reject inheritance and preserve the parent constraint. |
| POL-V-007 | Capability Without Policy | A canonical capability has no active applicable policy. | Deny capability exercise by default. |
| POL-V-008 | Invalid Policy Lifecycle | A policy uses an unknown state or prohibited lifecycle transition. | Reject transition and retain the last valid state. |
| POL-V-009 | Unauthorized Policy Delegation | A non-delegable policy is delegated or delegated stewardship changes policy meaning. | Reject delegation. |
| POL-V-010 | Policy Governance Integrity | A required artifact, schema, version, reference, or integration gate is absent or inconsistent. | Fail policy governance validation and release. |
