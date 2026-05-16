# Policy Explainability Trace
Trace fields: traceId, evaluatedRules, matchedRules, skippedRules, conditionsEvaluated, obligations, conflicts, finalDecision, decisionReason, evaluatedAt.

Visibility levels:
- internal: full rule ids and conflict details.
- audit-safe: remove sensitive condition payloads.
- sdk-safe: summary only (finalDecision/decisionReason/high-level obligations).
- user-facing: minimal plain-language reason.

Redaction guidance: never include secrets, bearer tokens, raw credential artifacts, or internal evaluator source expressions.

Example trace output: `{ traceId, finalDecision: "denied", decisionReason: "POLICY_DENY_OVERRIDES" }`.
