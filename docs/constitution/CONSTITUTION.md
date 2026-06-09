# AOC Constitution

**Constitution Version:** v9.0

**Status:** Ratified

**Supreme authority:** This document is the canonical constitutional authority for the Architects of Change Protocol repository.

## 1. Constitutional authority

The AOC Constitution governs architectural laws, ownership domains, compatibility authorities, transitional authorities, enforcement scanners, CI gates, release gates, and amendment procedure. If another constitutional artifact conflicts with this document, this document controls until a ratified amendment updates it.

## 2. Referenced constitutional artifacts

The following documents are incorporated into the Constitution by reference:

- `docs/constitution/ARCHITECTURAL-LAWS.md`
- `docs/constitution/BOUNDARY-VIOLATION-CATALOG.md`
- `docs/constitution/BOUNDARY-ENFORCEMENT-MATRIX.md`
- `docs/constitution/CONSTITUTIONAL-BOUNDARY-POLICY.md`
- `docs/constitution/AMENDMENT-PROCEDURE.md`
- `docs/constitution/AMENDMENT-CATALOG.md`
- `docs/constitution/CONSTITUTIONAL-AUTHORITIES.md`
- `docs/constitution/CONSTITUTION-VERSION-HISTORY.md`
- `docs/constitution/CAPABILITY-CONSTITUTION.md`
- `docs/constitution/CAPABILITY-AUTHORITIES.md`
- `docs/constitution/CAPABILITY-LIFECYCLE.md`
- `docs/constitution/CAPABILITY-DELEGATION-POLICY.md`
- `docs/constitution/CAPABILITY-REVOCATION-POLICY.md`
- `docs/constitution/CAPABILITY-VIOLATION-CATALOG.md`
- `docs/constitution/POLICY-CONSTITUTION.md`
- `docs/constitution/POLICY-AUTHORITIES.md`
- `docs/constitution/POLICY-LIFECYCLE.md`
- `docs/constitution/POLICY-HIERARCHY.md`
- `docs/constitution/POLICY-EXCEPTION-POLICY.md`
- `docs/constitution/POLICY-CONFLICT-RESOLUTION.md`
- `docs/constitution/POLICY-VIOLATION-CATALOG.md`
- `docs/constitution/DECISION-CONSTITUTION.md`
- `docs/constitution/DECISION-AUTHORITIES.md`
- `docs/constitution/DECISION-LIFECYCLE.md`
- `docs/constitution/DECISION-EVIDENCE-POLICY.md`
- `docs/constitution/DECISION-EXPLAINABILITY-POLICY.md`
- `docs/constitution/DECISION-APPEALS-POLICY.md`
- `docs/constitution/DECISION-REVOCATION-POLICY.md`
- `docs/constitution/DECISION-VIOLATION-CATALOG.md`
- `docs/constitution/STANDING-CONSTITUTION.md`
- `docs/constitution/STANDING-AUTHORITIES.md`
- `docs/constitution/STANDING-LIFECYCLE.md`
- `docs/constitution/STANDING-ELIGIBILITY-POLICY.md`
- `docs/constitution/STANDING-DELEGATION-POLICY.md`
- `docs/constitution/STANDING-REPRESENTATION-POLICY.md`
- `docs/constitution/STANDING-REVOCATION-POLICY.md`
- `docs/constitution/STANDING-VIOLATION-CATALOG.md`
- `docs/constitution/CLAIM-CONSTITUTION.md`
- `docs/constitution/CLAIM-AUTHORITIES.md`
- `docs/constitution/CLAIM-LIFECYCLE.md`
- `docs/constitution/CLAIM-EVIDENCE-POLICY.md`
- `docs/constitution/CLAIM-DISPUTE-POLICY.md`
- `docs/constitution/CLAIM-SUPERSESSION-POLICY.md`
- `docs/constitution/CLAIM-WITHDRAWAL-POLICY.md`
- `docs/constitution/CLAIM-VIOLATION-CATALOG.md`

- `TRUST-CONSTITUTION.md`
- `TRUST-AUTHORITIES.md`
- `TRUST-EVIDENCE-POLICY.md`
- `TRUST-LIFECYCLE.md`
- `TRUST-ISSUANCE-POLICY.md`
- `TRUST-DECAY-POLICY.md`
- `TRUST-REVOCATION-POLICY.md`
- `TRUST-VIOLATION-CATALOG.md`

- `VERIFICATION-CONSTITUTION.md`
- `VERIFICATION-AUTHORITIES.md`
- `VERIFICATION-EVIDENCE-POLICY.md`
- `VERIFICATION-LIFECYCLE.md`
- `VERIFICATION-METHOD-POLICY.md`
- `VERIFICATION-EXPIRATION-POLICY.md`
- `VERIFICATION-REVOCATION-POLICY.md`
- `VERIFICATION-VIOLATION-CATALOG.md`

- `docs/constitution/REPUTATION-CONSTITUTION.md`
- `docs/constitution/REPUTATION-AUTHORITIES.md`
- `docs/constitution/REPUTATION-SOURCES-POLICY.md`
- `docs/constitution/REPUTATION-LIFECYCLE.md`
- `docs/constitution/REPUTATION-CALCULATION-POLICY.md`
- `docs/constitution/REPUTATION-DECAY-POLICY.md`
- `docs/constitution/REPUTATION-DISPUTE-POLICY.md`
- `docs/constitution/REPUTATION-CORRECTION-POLICY.md`
- `docs/constitution/REPUTATION-REVOCATION-POLICY.md`
- `docs/constitution/REPUTATION-VIOLATION-CATALOG.md`

## 3. Constitutional principles

1. The Constitution is enforceable through scanners, tests, CI gates, and release gates.
2. The Constitution is versioned with explicit major and minor version semantics.
3. The Constitution is auditable through an amendment catalog and version history.
4. The Constitution is amendable only through the amendment procedure.
5. The Constitution is traceable from law, authority, ownership, policy, capability, standing, claim, trust, verification, reputation, and decision changes to ratified amendment records.
6. Authority existence, capability possession, policy coverage, participant standing, claim legitimacy, trust confidence, verification status, reputation signal, and decision legitimacy are distinct; all participation and runtime power are deny-by-default unless constitutionally cataloged, assigned, constrained, validated, decided, and traceable.

## 4. Versioning model

Constitution versions use `vMAJOR.MINOR` format.

### Minor amendments

Minor amendments increment `v1.0` to `v1.1` and may cover clarifications, documentation corrections, additional examples, and scanner implementation details that do not alter laws, ownership models, dependency models, or constitutional authorities.

### Major amendments

Major amendments increment `v1.x` to `v2.0` and are required for new laws, removed laws, ownership model changes, dependency model changes, new constitutional authorities, or removed constitutional authorities.

## 5. Amendment authority

No law, authority, ownership domain, compatibility authority, composition authority, violation catalog entry, enforcement matrix entry, or constitutional policy may be changed unless:

1. an amendment record exists in `AMENDMENT-CATALOG.md`;
2. the Constitution version is updated when the amendment type requires it;
3. `CONSTITUTION-VERSION-HISTORY.md` records the version and amendment;
4. ratification status is recorded; and
5. amendments affecting `LAW-001+` are ratified before release.

## 6. Ratification statuses

Valid amendment statuses are:

- `Ratified`
- `Pending`
- `Rejected`
- `Superseded`

Only `Ratified` amendments may authorize release-impacting changes to `LAW-001+`, ownership domains, authorities, or boundary policy.

## 7. Authority lifecycle

Every constitutional authority must have an owner, purpose, creation amendment, retirement amendment, and status. Valid authority statuses are `Canonical`, `Transitional`, `Deprecated`, and `Retired`.

## 8. Transitional authority ceiling

Transitional authorities are temporary and closed. They may not be expanded by convention, code placement, scanner allowlists, package creation, or institutional memory. Creating or removing a transitional authority requires a ratified constitutional amendment.

## 9. Capability authority governance

Every capability authority must have a unique identifier, class, owner, delegation posture, revocation posture, creation amendment, retirement amendment, and status. Capability definitions and assignments may be created or changed only through Type B or Type C amendments as defined by the amendment procedure. Constitutional capabilities are non-delegable. Suspended, revoked, and retired assignments confer no active power.

## 10. Policy authority governance

Every policy authority must have a unique identifier, class, owner, applicable capability scope, priority, delegation posture, creation amendment, retirement amendment, catalog status, and lifecycle state. Policy creation and semantic change require Type B or Type C amendment governance; creation, weakening, retirement, exception authority, hierarchy semantics, and conflict semantics require Type C. Lower policies may narrow but may not expand higher constraints. Exceptions are bounded and amendment-ratified. Conflicts resolve by constitutional supremacy, priority, restrictiveness, and ratification recency, then fail closed. Every canonical capability requires active applicable policy coverage.

## 11. Decision authority governance

Every decision authority must have a unique identifier, class, owner, required evidence, required policy coverage, appealability posture, revocability posture, creation amendment, retirement amendment, catalog status, and lifecycle state. Policy constrains capability; valid decisions authorize action. Decision creation and semantic change require Type B or Type C amendment governance; lifecycle semantics, evidence minimums, explainability obligations, appeal rights, revocation causes, and enforcement obligations require Type C. Approved decisions require evidence and explainability. Appeals and revocations are bounded, auditable, amendment-traceable, and fail closed. Revoked and retired decisions authorize no new action and may not be reactivated.

## 12. Standing authority governance

Every standing authority must have a unique identifier, class, owner, eligibility policy, delegation posture, representation posture, revocation posture, creation amendment, retirement amendment, catalog status, and lifecycle lineage. Standing is the constitutional right to participate and is distinct from authority, capability, policy, and decision. The governing chain is `Authority → Capability → Policy → Standing → Decision → Action`. No standing becomes active without eligibility validation. Delegation and representation are bounded, expiring, auditable, and do not transfer ownership or authority. Suspended, revoked, and retired standing confers no participation right; revoked and retired standing cannot be reactivated. Standing creation and semantic change require Type B or Type C amendment governance; lifecycle semantics, eligibility requirements, delegation or representation expansion, revocation causes, and enforcement obligations require Type C.

## 13. Claim authority governance

Every governed assertion must use a unique cataloged claim type with a constitutional owner, evidence policy, dispute posture, withdrawal posture, supersession posture, creation amendment, retirement amendment, and status. Claim legitimacy is distinct from standing and decision legitimacy. A claim may influence a decision only after a valid standing-backed submission, complete evidence validation, and a valid lifecycle transition to `Accepted`. Disputes, supersessions, withdrawals, and retirements preserve permanent traceability.

## 14. Trust authority governance

Trust is a governed confidence signal derived from evidence, behavior, history, and constitutional evaluation. Trust legitimacy is distinct from authority, capability, policy, standing, claim, and decision legitimacy. A trust signal may influence a decision only after valid standing, a valid claim, successful evidence evaluation, authorized issuance, and a valid lifecycle transition to `Active`. Decay affects current confidence without deleting history; suspension disables influence temporarily; revocation disables influence permanently.

The constitutional chain is `Authority → Capability → Policy → Standing → Claim → Trust → Decision → Action`. Trust influences confidence but never directly authorizes action.

## 15. Verification authority governance

Verification is a governed determination that evidence has been evaluated using an authorized method and satisfies the requirements of a verification authority. Verification legitimacy is distinct from authority, capability, policy, standing, claim, trust, and decision legitimacy. A verification may influence a decision only after valid standing, a valid claim, successful evidence evaluation, an authorized method, and a valid lifecycle transition to `Verified`. Trust and verification are constitutionally independent signals; all four combinations of trust and verification state are constitutionally valid.

The constitutional chain is `Authority → Capability → Policy → Standing → Claim → Trust → Verification → Reputation → Decision → Action`. Verification provides validation input but never directly authorizes action.

## 17. Reputation authority governance

Reputation is a governed historical reliability signal derived from constitutional records, verified behavior, claim outcomes, trust history, decision history, standing history, and dispute history. Reputation legitimacy is distinct from authority, capability, policy, standing, claim, trust, verification, and decision legitimacy. A reputation signal may influence a decision only after valid standing, a valid claim, source evaluation under the governing sources policy, an authorized calculation, and a valid lifecycle transition to `Active`. Trust, verification, and reputation are constitutionally independent signals; all combinations of trust, verification, and reputation state are constitutionally valid.

The constitutional chain is `Authority → Capability → Policy → Standing → Claim → Trust → Verification → Reputation → Decision → Action`. Reputation signals historical reliability but never directly authorizes action, and never overrides authority, capability, policy, standing, claim evidence, or verification requirements. Decay affects current reputation score without deleting history; suspension disables influence temporarily; revocation disables influence permanently unless restored through a valid constitutional process.

## 18. Release governance

`validate:release` must run constitutional amendment and claim governance validation before publishability validation. The aggregate AOC boundary gate must include amendment, version, authority, capability, policy, decision, standing, and all claim authority, evidence, lifecycle, dispute, supersession, withdrawal, and aggregate governance scanners, and all trust authority, evidence, lifecycle, issuance, decay, revocation, and aggregate governance scanners, and all verification authority, evidence, lifecycle, methods, expiration, revocation, and aggregate governance scanners, and all reputation authority, sources, lifecycle, calculation, decay, disputes, corrections, revocation, and aggregate governance scanners. Capability, policy, standing, claim, trust, verification, reputation, and decision governance validation must complete before publishability validation.
