# Attestation Constitution

**Constitution Version:** v16.0

## Constitutional purpose

**Attestation** is a governed declaration by an eligible actor accepting constitutional responsibility for endorsing a claim, verification, reputation record, decision, or constitutional artifact. Attestation answers **who is willing to publicly stand behind it**. Attestation is not authority, capability, policy, standing, claim, trust, verification, reputation, or decision.

## Sovereign attestation rule

A participant may have standing, claims, trust, verification, and reputation, but only an attestation type cataloged in `ATTESTATION-AUTHORITIES.md`, issued by an eligible actor under its eligibility policy, scoped under its scope policy, weighted under its weight policy, maintained through the constitutional lifecycle, and expiring per its expiration policy may constitute a governed endorsement.

The constitutional chain is:

`Authority → Capability → Policy → Standing → Claim → Trust → Verification → Reputation → Attestation → Decision → Action`

Attestation may influence a decision only as a traceable endorsement input. It never replaces required standing, evidence, policy coverage, trust evaluation, verification requirements, reputation signals, decision authority, or explainability, and it never directly authorizes action.

## Attestation legitimacy

An attestation is legitimate only when all of the following are traceable:

1. a canonical attestation authority and owner;
2. an eligible attesting actor satisfying the eligibility policy for that attestation type;
3. a declared scope satisfying the scope policy;
4. a weight level satisfying the weight policy;
5. a valid lifecycle path through `Pending Validation` before `Active`;
6. every expiration event, dispute, revocation, and retirement; and
7. the current attestation status separately from preserved historical records.

No attestation may become `Active` without eligibility validation. No attestation may override standing, capability, policy, claim evidence, verification requirements, or reputation signals.

## Constitutional properties

Attestation is actor-backed, eligibility-governed, scope-bound, purpose-bound, non-transferable, time-aware, expiring where cataloged, disputable where cataloged, revocable where cataloged, historically preserved, and constitutionally evolvable. An attestation never copies endorsement status from one subject, context, claim, or authority to another.

## Verified ≠ Attested and Reputable ≠ Attested

Trust, verification, reputation, and attestation are constitutionally independent:

| Verified | Reputable | Attested | Meaning |
|---|---|---|---|
| No | No | No | Unvalidated, unendorsed signal |
| Yes | No | No | Validated; no historical reliability; no endorsement |
| No | Yes | No | Strong history; unvalidated; no endorsement |
| Yes | Yes | No | Validated and reliable; no endorsement |
| No | No | Yes | Endorsed; unvalidated; no history |
| Yes | No | Yes | Validated and endorsed; no history |
| No | Yes | Yes | Reliable and endorsed; unvalidated |
| Yes | Yes | Yes | Fully consistent participant signal |

All eight states are constitutionally valid. Decision authorities may consume verification, reputation, and attestation as independent inputs.

## Attestation is an input, not a bypass

Attestation may influence decisions. Attestation may not override:

- Authority
- Capability
- Policy
- Standing
- Claim Evidence
- Verification Requirements
- Reputation Signals

Attestation is a governed input to decision-making. It is never a constitutional bypass.

## Scope boundary

This framework governs attestation legitimacy and constitutional records only. It does not implement an attestation, consensus, voting, federation, governance, trust, verification, reputation, policy, decision, claims, authentication, or authorization runtime.
