# Capability Delegation Policy

**Constitution Version:** v7.0

## Class policy

| Capability Class | Delegable | Conditions |
|---|---|---|
| Constitutional | No | Constitutional capabilities remain with the Constitution and cannot be delegated. |
| Governance | Yes | The delegator must hold a ratified or delegated assignment and the delegation must be authorized by a ratified amendment. |
| Runtime | Yes | The delegator must hold an active assignment and preserve all parent restrictions. |
| Operational | Yes | The delegator must hold an active assignment and preserve all parent restrictions. |

## Delegation requirements

A delegation is valid only when:

1. the capability catalog marks the capability `Delegable: Yes`;
2. the capability class permits delegation;
3. the parent assignment exists and is `Ratified` or `Delegated`;
4. the delegator is the holder of the parent assignment;
5. the child assignment names the parent assignment and has lifecycle state `Delegated`;
6. all parent scope, duration, environment, tenant, resource, and delegation-depth restrictions are preserved or narrowed; and
7. the assignment cites a ratified Type B or Type C amendment.

Delegation never transfers ownership and never creates a new capability. Circular delegation, self-parenting, delegation from a suspended/revoked/retired assignment, and delegation of a non-delegable capability are prohibited and fail closed.
