# Standing Constitution

**Constitution Version:** v8.0

## Definition and purpose

Standing is the constitutional right to participate within a governed process. It answers **who may participate**. Standing is distinct from authority, capability, policy, and decision: authority defines jurisdiction, capability defines permitted power, policy constrains its exercise, standing legitimizes the participant, and a decision authorizes action.

## Constitutional chain

`Authority → Capability → Policy → Standing → Decision → Action`

A decision cannot be legitimate for execution when a required participant lacks active standing, even when the decision record is otherwise valid. Participation is deny-by-default.

## Standing classes

- **Constitutional:** Constitution, Constitutional Authority, and Constitutional Reviewer.
- **Governance:** Capability Holder, Policy Owner, Decision Reviewer, and Appeal Reviewer.
- **Runtime:** Claimant, Verifier, Witness, Trust Issuer, Trust Subject, and Consent Subject.
- **Operational:** Auditor, Operator, Administrator, and Assurance Reviewer.

## Governing invariants

1. Every standing authority has one unique catalog identity, class, owner, eligibility policy, delegation posture, representation posture, revocation posture, creation amendment, retirement amendment, and status.
2. No standing becomes active without eligibility validation and traceable evidence.
3. Only `Active` standing confers participation rights; `Proposed`, `Pending Validation`, `Suspended`, `Revoked`, and `Retired` confer none.
4. Delegation and representation are distinct, explicit, bounded, expiring, auditable, and never transfer ownership or constitutional authority.
5. Revoked or retired standing cannot be reactivated or used as the source of delegation or representation.
6. Standing creation, retirement, class changes, eligibility semantics, delegation or representation expansion, lifecycle semantics, revocation causes, and enforcement obligations require ratified constitutional evolution.
7. Scanners, tests, CI, and release gates fail closed when standing integrity cannot be established.

## Scope boundary

This Constitution governs standing authority records and their legitimacy requirements. It does not implement identity, voting, trust, claims, federation, governance, authentication, or authorization runtimes.
