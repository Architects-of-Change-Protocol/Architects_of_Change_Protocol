# Identity-to-PDP Binding (AOC Core)

This module adds a **pre-PDP identity authority gate** that runs before `protocol/policy/evaluateAccess()`.

## Why identity authority runs first

The baseline PDP evaluates whether a permission object permits an `(actor, action, resource)` tuple. It does not verify whether the actor is currently active, whether delegated authority is still valid, or whether AI governance boundaries are being respected.

`evaluateIdentityPolicy(...)` closes that gap by validating:
- actor activity and authority boundaries
- delegation grant validity (action/scope/time/revocation)
- trust chain integrity and delegation depth
- AI governance restrictions and obligations

Only if identity policy allows does the adapter call baseline PDP permission checks.

## Relationship between identity, delegation, trust chains, PDP, and audit

1. **Identity kernel** defines actors and authority boundaries.
2. **Delegation layer** defines bounded grants.
3. **Trust-chain evaluation** verifies lineage from root authority to delegate.
4. **Identity policy precheck** enforces authority semantics and emits reason codes/obligations.
5. **PDP** performs existing scoped-permission evaluation without modification.
6. **Audit trail** can combine identity reasons, obligations, trust summary, and PDP trace id.

## Not authentication

This is **not** login/session/authN.
It does not add OAuth, wallets, providers, persistence, or proof-of-personhood. It binds existing typed identity semantics into authorization decisions.

## AI actor constraints

For `ai_agent` actors, the binding enforces:
- blocked scopes
- optional autonomous delegation restrictions
- sensitive action escalation obligations
- human review obligations where configured

## Current limitations

- Delegation matching currently assumes the relevant active grant is resolvable from in-memory grant arrays.
- Trust-chain summary is only emitted when supplied on context (or inferred during delegated flow).
- Identity deny decisions return an identity-generated trace id; baseline PDP trace id is preserved only when PDP is executed.
- This layer is deterministic and stateless; no revocation source-of-truth is queried beyond input grants.
