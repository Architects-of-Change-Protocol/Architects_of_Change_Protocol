# Capability Violation Catalog

**Constitution Version:** v7.0

| Violation ID | Name | Severity | Constitutional rule |
|---|---|---|---|
| CAP-V-001 | Unauthorized Capability Creation | Critical | A capability definition lacks a ratified creation amendment, catalog record, or required version update. |
| CAP-V-002 | Unauthorized Delegation | Critical | A non-delegable capability is delegated or delegation lacks an active parent and ratified authority. |
| CAP-V-003 | Revocation Without Authority | Critical | A suspension or revocation is performed without applicable parent, governance, or constitutional authority. |
| CAP-V-004 | Retired Capability Usage | Critical | A retired capability or assignment remains active, assigned, or delegated. |
| CAP-V-005 | Invalid Capability Owner | Critical | A capability owner is not a cataloged constitutional authority. |
| CAP-V-006 | Duplicate Capability Identity | Critical | A capability, assignment, or transition identifier is duplicated. |
| CAP-V-007 | Invalid Lifecycle Transition | High | A transition is not permitted by the lifecycle transition table or does not follow prior state. |
| CAP-V-008 | Suspended Delegation | Critical | A suspended assignment creates or retains an active descendant delegation. |
| CAP-V-009 | Capability Escalation | Critical | A child assignment broadens its parent's capability or restrictions. |
| CAP-V-010 | Unauthorized Capability Evolution | Critical | A capability class, ownership, lifecycle, delegation, revocation, or enforcement rule changes without a Type B or Type C amendment. |
