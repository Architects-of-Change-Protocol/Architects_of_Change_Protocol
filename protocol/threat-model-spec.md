# AOC Protocol — Threat Model & Abuse Prevention Specification

**Version:** 0.1  
**Status:** Normative  
**Layer:** Protocol-wide Security & Economics  
**Applies to:** AOC v0.1 and all market makers built on top

---

## 1. Purpose

This document defines the **explicit threat model** for the AOC Protocol and
the **abuse-resistance boundaries** enforced by design.

Its goal is not to eliminate all possible abuse, but to:
- Prevent protocol-fatal attacks
- Make abusive behavior **economically unprofitable**
- Preserve user sovereignty, consent integrity, and auditability
- Clearly state what AOC **does and does NOT attempt to prevent**

This specification is **normative**.

---

## 2. Threat Classification

Threats are classified across four layers:

1. **Economic Abuse**
2. **Governance Abuse**
3. **Protocol Abuse**
4. **UX / Social Engineering Abuse**

Each threat is mapped to:
- Affected layer
- Enforced invariant
- Severity level

---

## 3. Economic Abuse Threats

### 3.1 Free-Riding on User Data

**Description:**  
A consumer attempts to extract value from user data without consent,
payment, or durable authorization.

**Mitigation:**
- All access requires a valid consent object
- All access requires a valid capability token
- Capabilities are scope-bound, time-bound, and audience-bound

**Invariant:**  
> No data is accessible without an active capability derived from explicit consent.

**Severity:** Protocol-fatal if violated

---

### 3.2 Consent Spam / Harassment

**Description:**  
A market maker or buyer repeatedly sends requests to coerce or fatigue a user.

**Mitigation:**
- Consent requests are non-executing until approved
- Wallet UX may throttle, filter, or auto-deny repeated requests
- No economic extraction occurs without approval

**Invariant:**  
> Rejected or ignored requests have zero protocol effect.

**Severity:** Application-level

---

### 3.3 Value Extraction via Over-Broad Scope

**Description:**  
A buyer attempts to request more data than is justified by purpose.

**Mitigation:**
- Scope is explicit and enumerable
- Capability minting enforces scope attenuation
- Any scope expansion requires a new consent + capability

**Invariant:**  
> Scope at mint time is the maximum scope forever usable.

**Severity:** Protocol-fatal if violated

---

## 4. Governance Abuse Threats

### 4.1 Market Maker Capture

**Description:**  
A dominant market maker attempts to define schemas or flows that undermine user sovereignty.

**Mitigation:**
- AOC defines primitives, not products
- Market makers operate externally
- Wallets remain user-controlled

**Invariant:**  
> No market maker has privileged protocol authority.

**Severity:** Protocol-fatal if violated

---

### 4.2 Soft-Fork Coercion

**Description:**  
An actor pressures users to adopt a modified client that weakens consent or scope checks.

**Mitigation:**
- Consent, capability, and pack objects are portable
- Multiple wallet implementations can coexist
- Auditability exposes divergence

**Invariant:**  
> Authorization artifacts must be verifiable independently of client UX.

**Severity:** Governance-level

---

### 4.3 Policy Laundering

**Description:**  
A market maker claims compliance or safety properties not enforced by protocol.

**Mitigation:**
- Protocol only guarantees what is cryptographically enforced
- All other claims are explicitly out of scope

**Invariant:**  
> Protocol guarantees are limited to verifiable invariants only.

**Severity:** Market-level

---

## 5. Protocol Abuse Threats

### 5.1 Replay Amplification

**Description:**  
Reuse of an old authorization to extract additional value.

**Mitigation:**
- Capabilities include expiry
- Optional nonce / request IDs
- Revocation supported

**Invariant:**  
> A capability is valid only within its explicit temporal and audience bounds.

**Severity:** Protocol-fatal if violated

---

### 5.2 Scope Laundering

**Description:**  
Combining multiple narrow consents to simulate broad access.

**Mitigation:**
- Each access request evaluated independently
- No implicit scope aggregation

**Invariant:**  
> Authorization is evaluated per-request, not cumulatively.

**Severity:** Protocol-fatal if violated

---

### 5.3 Consent Graph Manipulation

**Description:**  
Attempt to infer relationships or data through metadata side channels.

**Mitigation:**
- Minimal disclosure by default
- Wallet-controlled presentation
- No global consent graph exposure

**Invariant:**  
> Consent artifacts do not imply global relationships.

**Severity:** Market-level

---

## 6. UX & Social Engineering Abuse

### 6.1 Dark Patterns in Consent UX

**Description:**  
Manipulative UI designed to coerce user approval.

**Mitigation:**
- Wallet implementations are independent
- Protocol does not mandate UX patterns
- Competing wallets reduce lock-in

**Invariant:**  
> Protocol correctness does not depend on any single UX.

**Severity:** Application-level

---

### 6.2 Consent Fatigue

**Description:**  
Overloading users with frequent approval prompts.

**Mitigation:**
- Long-lived capabilities are supported
- Reusable consent patterns encouraged
- Wallets may batch or pre-approve safely

**Invariant:**  
> User control may be delegated but never bypassed.

**Severity:** Application-level

---

## 7. Explicit Non-Goals

The AOC Protocol does NOT attempt to:

- Prevent off-platform collusion
- Judge data truthfulness beyond provenance
- Enforce legal compliance of consumers
- Prevent screenshots or downstream misuse
- Eliminate all social engineering risk
- Act as an identity arbiter or reputation oracle

These risks are acknowledged and accepted.

---

## 8. Attacks Allowed but Non-Profitable

The protocol explicitly allows:
- High-frequency access **if paid**
- Repeated requests **if consented**
- Market competition **without exclusivity**

As long as:
- Consent is explicit
- Scope is respected
- Payment precedes access

---

## 9. Severity Summary

| Severity | Meaning |
|--------|--------|
| Protocol-fatal | Breaks sovereignty or authorization invariants |
| Governance-level | Undermines neutrality or long-term trust |
| Market-level | Economic or reputational risk |
| Application-level | Wallet or UX responsibility |

---

## 10. Final Invariant

> At no point may data access occur without a user-held key authorizing
> a scoped, time-bound, purpose-bound capability.

This invariant MUST hold even under adversarial conditions.

---

**End of specification.**
