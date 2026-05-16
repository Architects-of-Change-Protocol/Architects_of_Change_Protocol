# Policy Adapter Guidance
Adapters (future OPA/Cedar/custom engines) must map into canonical primitives and produce canonical decisions/traces. They must preserve deny precedence, fail-closed semantics for protected operations, and trace visibility redaction tiers.

Example future enterprise adapter: external PDP returns permit/deny -> mapped to allow/deny + canonical reason code taxonomy and trace summary.
