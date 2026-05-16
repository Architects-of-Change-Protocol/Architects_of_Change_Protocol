# Policy Conflict Resolution
- allow + deny = deny.
- deny + abstain = deny.
- allow + abstain = allow only if all required categories pass.
- indeterminate + protected operation = deny.
- condition evaluation failure = indeterminate.

Example conflicting rules: capability allow plus runtime deny produces denied with conflict `allow_vs_deny`.
