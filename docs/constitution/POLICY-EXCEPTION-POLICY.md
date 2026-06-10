# Policy Exception Policy

**Constitution Version:** v1.0

## Exception authority

Exceptions are constitutional records that temporarily replace one identified constraint with an explicit bounded constraint. They do not create capabilities, silently disable policies, broaden unrelated policy scope, or override the Constitution.

Valid exception types are `Temporary`, `Emergency`, `Migration`, and `Transitional`.

Every exception requires Exception ID, Type, Owner, Duration, Affected Policy, Replacement Constraint, Ratified Amendment, Effective Date, Expiration, and Status. The owner must own the affected policy or be the Constitution. The amendment must be Type C and ratified. Expiration must be a concrete ISO date after the effective date; indefinite, implicit, and automatically renewed exceptions are forbidden.

## Exception registry

| Exception ID | Type | Owner | Duration | Affected Policy | Replacement Constraint | Ratified Amendment | Effective Date | Expiration | Status |
|---|---|---|---|---|---|---|---|---|---|

No policy exceptions are active at v3.0.

## Expiration and emergency handling

Expired exceptions have no effect and must be retired. Emergency exceptions still require a ratified amendment; urgency does not create constitutional power. Capability evaluation encountering an unauthorized, malformed, or expired exception ignores the exception and enforces the underlying policy fail closed.
