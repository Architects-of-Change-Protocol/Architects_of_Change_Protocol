# Reason Code Lifecycle

Lifecycle states:
- experimental
- stable
- deprecated
- internal-only
- compatibility-only
- removed

Policy:
- stable identifiers are immutable.
- deprecated identifiers must map through `legacyReasonCodeAliases`.
- internal-only identifiers must never be public SDK outputs.
