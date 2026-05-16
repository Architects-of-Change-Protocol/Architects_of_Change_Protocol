# Policy Semantics Model
Canonical primitives: PolicyId, PolicyVersion, PolicyScope, PolicySubject, PolicyRequester, PolicyResource, PolicyAction, PolicyEffect (allow|deny|abstain), PolicyCondition, PolicyRule, PolicySet, PolicyDecision, PolicyEvaluationContext, PolicyEvaluationTrace, PolicyObligation, PolicyConflict.

Decision outcomes: allowed, denied, conditional, indeterminate.

Policy categories: consent, capability, trust, identity, tenant, runtime, metering, payout, data-access, agent, governance.

Example allow rule: capability rule with effect=allow and reasonCode=CAPABILITY_VALID.
Example deny rule: trust rule with effect=deny and reasonCode=TRUST_INVALID.
Example abstain rule: consent rule with effect=abstain when no condition match.
