# Policy Conflict Resolution

**Constitution Version:** v7.0

## Resolution order

Policy conflicts are resolved deterministically in this order:

1. The Constitution controls over every policy.
2. The higher numeric policy priority controls.
3. If priorities are equal, the more restrictive policy controls.
4. If restriction is equivalent, the most recently ratified policy controls.
5. If no unique winner exists, evaluation fails closed.

Priority never permits a lower policy class to expand a higher rule. A recorded winner must be active, applicable to the conflict scope, and authorized by a ratified amendment.

## Conflict registry

| Conflict ID | Policy IDs | Capability IDs | Rule Domain | Winner | Resolution Basis | Amendment | Status |
|---|---|---|---|---|---|---|---|

No unresolved policy conflicts exist at v3.0.

## Ambiguity rules

Two active policies conflict when they apply to a common capability and rule domain but prescribe incompatible effects. Equal-priority incompatible policies require a unique more-restrictive winner or a conflict registry record. Multiple winners, unknown winners, duplicate priorities with indistinguishable restriction, and unresolved records are constitutional violations and fail closed.
