# Capability Revocation Policy

**Constitution Version:** v18.0

## Revocation forms

| Form | Effect | Authorized actor |
|---|---|---|
| Voluntary revocation | A holder permanently relinquishes its assignment. | The current holder or its valid parent holder |
| Forced revocation | A holder's assignment is permanently invalidated for violation, risk, or loss of authority. | A holder of `CAP-0014` with jurisdiction or the valid parent holder |
| Constitutional revocation | The Constitution invalidates an assignment or capability definition. | Constitution through a ratified Type C amendment |
| Temporary suspension | An assignment becomes inactive without permanent termination. | A valid parent holder, authorized governance holder, or Constitution |

## Rules

1. Only capabilities marked `Revocable: Yes` may be voluntarily or forcibly revoked. Non-revocable Constitutional capabilities may change only through constitutional amendment or retirement.
2. Suspension is temporary, immediately removes active power, and prohibits further delegation.
3. Revocation is permanent. A revoked assignment may transition only to `Retired`.
4. Retirement closes the historical record and is terminal.
5. Revoking or suspending a parent assignment makes every descendant delegation inactive; descendants must be suspended, revoked, or retired in the same governed change.
6. Revoked or retired capabilities may not remain actively assigned, and suspended assignments may not delegate.
7. Every forced or constitutional revocation must identify its authorizing capability and ratified amendment.
