# Claim Constitution

**Constitution Version:** v18.0

## Constitutional purpose

A **Claim** is a governed assertion submitted by an actor with valid standing and supported by evidence. A claim answers **what is being asserted**. It is not a decision, authority, capability, policy, or grant of standing.

## Sovereign assertion rule

Only a claim type cataloged in `CLAIM-AUTHORITIES.md`, submitted by an actor whose standing permits the assertion, and supported by its complete evidence policy may influence a governed decision. Catalog presence alone does not prove an instance true or authorize action.

The constitutional chain is:

`Authority → Capability → Policy → Standing → Claim → Decision → Action`

## Claim legitimacy

A claim is legitimate only when all of the following are traceable:

1. a canonical claim authority and owner;
2. active applicable standing for the claimant or an authorized representative;
3. the asserted subject and proposition;
4. evidence satisfying the claim type's required minimum, allowed-source, integrity, and traceability rules;
5. a valid lifecycle path to `Accepted`; and
6. every dispute, withdrawal, supersession, retirement, and decision reference affecting the claim.

No claim may enter `Accepted` without satisfying its evidence requirements. Invalid, rejected, disputed, withdrawn, superseded, or retired claims may remain evidence in an audit, but may not silently exercise decision influence as accepted claims.

## Scope boundary

This framework governs claim legitimacy and constitutional records only. It does not implement a claims, identity, trust, verification, reputation, voting, federation, governance, authentication, or authorization runtime.
