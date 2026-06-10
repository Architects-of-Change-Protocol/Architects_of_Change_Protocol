# Capability Lifecycle

**Constitution Version:** v18.0

## Lifecycle states

| State | Meaning | Active | May delegate |
|---|---|---|---|
| Proposed | Requested but not constitutionally effective. | No | No |
| Ratified | Approved authority assignment held directly. | Yes | If the capability is delegable |
| Delegated | Authority received through a valid parent assignment. | Yes | If the capability and delegation depth permit |
| Suspended | Temporarily inactive pending reinstatement or revocation. | No | No |
| Revoked | Permanently invalidated assignment. | No | No |
| Retired | Closed historical assignment or retired capability. | No | No |

## Allowed transitions

| From | Allowed To | Required authority |
|---|---|---|
| Proposed | Ratified, Retired | `CAP-0011` or constitutional ratification |
| Ratified | Delegated, Suspended, Revoked, Retired | Delegation or revocation authority applicable to the action |
| Delegated | Delegated, Suspended, Revoked, Retired | Valid parent delegation or revocation authority |
| Suspended | Ratified, Delegated, Revoked, Retired | Reinstating or revoking authority; reinstatement returns to the prior active state |
| Revoked | Retired | Retirement authority |
| Retired | None | Terminal state |

All transitions not listed above are invalid. Revoked assignments cannot be reactivated. Retired assignments are terminal. A cataloged capability whose status is `Retired` may have no active assignment.

## Transition record requirements

Every transition records a unique transition ID, assignment ID, prior state, next state, authorizing holder, and amendment. The recorded `From` state must equal the assignment's preceding state. A transition affecting a range is permitted only for a founding constitutional amendment and must be explicitly bounded.
