# RFC-005 Source Audit — Claims, Trust, Authority, and Governance

| Field | Value |
|---|---|
| Audit | RFC-005 Claims Framework Source Audit |
| Date | 2026-06-02 |
| Scope | Repository review of claims, evidence, attestations, verification, standing, capabilities, authority, decisions, identity, and governance concepts |
| Output RFC | `docs/rfcs/RFC-005-Claims-Framework.md` |

---

## Executive Summary

The repository already contains substantial trust and authority primitives, but they are distributed across protocol packages, runtime modules, governance documents, and identity/trust services. The audit confirms that AOC has approximately 70–80% of the implementation building blocks needed for a trust framework, while lacking a single constitutional model that explains how those blocks relate.

RFC-005 should therefore be concept-first and normative: it should not replace existing implementation files, but should define the canonical chain that future implementations must satisfy:

```text
Evidence → Assertion → Claim → Attestation → Verification → Standing → Capability → Authority → Decision
```

The most important gap is the absence of **Assertion** and **Standing** as first-class protocol concepts. Existing systems imply both concepts, but neither is defined as the constitutional bridge between evidence, claims, verification, capabilities, and decisions.

---

## Audit Method

The audit reviewed repository locations containing trust-adjacent concepts, including:

- `packages/protocol/src/claims/`
- `packages/identity/src/`
- `runtime/trust/`
- `runtime/attestations/`
- `runtime/governance/`
- `protocol/identity/`
- `protocol/capability/`
- `protocol/capabilities/`
- `protocol/enforcement/`
- `protocol/policy/`
- `protocol/governance/`
- `docs/rfcs/RFC-004-evidence-layer-v1.md`
- `protocol/charter/README.md`
- `protocol/protocol-invariants-spec.md`

This audit intentionally did not modify code, runtime behavior, package exports, or implementation contracts.

---

## 1. Existing Claim Concepts

### Locations Reviewed

- `packages/protocol/src/claims/index.ts`
- `packages/identity/src/contracts.ts`
- `runtime/trust/types.ts`
- `protocol/identity/types.ts`
- `protocol/identity/trust-chain.ts`

### Findings

1. A minimal protocol-level claim interface exists with a `type` and primitive `value` shape.
2. The identity package defines richer claims with name, value, issuer, issued timestamp, optional expiration, and confidence.
3. Identity contracts already embed claims as part of principal identity state.
4. Trust metadata in identity contracts references assurance level, verification methods, trust frameworks, attestation time, attester identity, and risk flags.
5. Credential records in the trust runtime imply claims about KYC level, issuer, subject, credential hash, issuance, expiration, and revocation.

### Gap

The repository lacks a canonical definition that distinguishes:

- raw assertion of facts,
- formal claims,
- attested claims,
- verified claims,
- currently active claims.

Claims exist structurally, but the repository does not yet define their constitutional meaning.

---

## 2. Existing Evidence Concepts

### Locations Reviewed

- `docs/rfcs/RFC-004-evidence-layer-v1.md`
- `protocol/audit/`
- `runtime/attestations/integrity-proof.ts`
- `protocol/policy/decision-trace.ts`

### Findings

1. RFC-004 defines the Evidence Layer as a protocol-neutral model for artifacts with evidentiary value.
2. RFC-004 already emphasizes intrinsic verifiability, infrastructure independence, portability, public verification rules, integrity by structure, and persistence beyond producers.
3. Audit-plane and decision trace modules provide operational records that can become evidence for governance or runtime decisions.
4. Integrity proof types in attestation runtime provide hash and chain semantics that can support evidentiary integrity.

### Gap

Evidence is well specified as a layer, but its relationship to claims is not canonically defined. RFC-005 should state that evidence does not directly become authority; evidence first supports assertions, which are then formalized into claims.

---

## 3. Existing Attestation Concepts

### Locations Reviewed

- `runtime/attestations/types.ts`
- `runtime/attestations/attestation-chain.ts`
- `runtime/attestations/governance-attestation.ts`
- `runtime/attestations/capability-attestation.ts`
- `runtime/attestations/ai-attestation.ts`
- `runtime/attestations/remote-attestation.ts`

### Findings

1. Runtime attestations cover governance decisions, capability issuance/use, delegation validation, AI execution, remote governance, and audit snapshots.
2. Governance attestations bind actor, governance session, policy trace, relationship, capabilities, decision, issue time, integrity proof, and optional previous attestation.
3. Capability attestations bind capability identity to an issuing runtime, governance attestation, validity window, and revocation references.
4. AI and remote governance attestations already recognize non-human and federated attesters.
5. Integrity proof support exists for local hashes, chained hashes, and replay guards.

### Gap

Attestations currently support runtime events and governance state, but no canonical document defines attestation as a signed declaration supporting a claim. RFC-005 should make attestation distinct from the claim itself.

---

## 4. Existing Verification Concepts

### Locations Reviewed

- `runtime/trust/service.ts`
- `protocol/capability/capability-verify.ts`
- `protocol/capability/capability-state.ts`
- `protocol/enforcement/enforcement-engine.ts`
- `protocol/enforcement/enforcement-types.ts`
- `runtime/attestations/*validation*` and validation helpers

### Findings

1. Identity verification evaluates credential existence, issuer activity, credential revocation, expiration, and consent requirements.
2. Capability verification and enforcement evaluate capability validity, revocation, activation window, expiration, scope, permission, subject, grantee, and market-maker constraints.
3. Attestation validators produce validation results and reason lists.
4. Enforcement decisions are deterministic and expose allow/deny decision states with reason codes and evaluated context.

### Gap

Verification exists in multiple runtime-specific forms. RFC-005 should define verification as a protocol concept: evidence evaluation, attestation validation, policy validation, and chain validation.

---

## 5. Existing Standing Concepts

### Locations Reviewed

- `protocol/capability/capability-types.ts`
- `protocol/capability/capability-state.ts`
- `runtime/trust/types.ts`
- `runtime/trust/service.ts`
- `packages/identity/src/contracts.ts`

### Findings

1. Capability state already includes active, expired, not-yet-active, revoked, and invalid.
2. Identity contracts include status values active, suspended, and revoked.
3. Credential records include expiration and revocation timestamps.
4. Verification outputs distinguish verified, not found, issuer inactive, expired, revoked, and consent required.

### Gap

The concept of **Standing** is strongly implied but not named as a first-class constitutional concept. RFC-005 should define standing as the current validity state of a claim and explain that a historically true claim may not be active authority.

---

## 6. Existing Capability Concepts

### Locations Reviewed

- `protocol/capability/`
- `protocol/capabilities/`
- `capability/`
- `aoc/capabilities/`
- `packages/capability-runtime/`
- `packages/capability-tokens/`
- `CAPABILITY_ATTENUATION_MODEL.md`

### Findings

1. AOC has extensive capability token, lifecycle, attenuation, delegation, enforcement, and consumption semantics.
2. Capabilities include subject, grantee, scope, permissions, issue and expiration windows, parent consent reference, and hash identity.
3. The capability attenuation model already states that child authority is subset-only and removed authority cannot be reintroduced.
4. Capability evaluation produces reason codes and explainable allow/deny outcomes.

### Gap

Capabilities are currently implemented primarily as authorization/runtime artifacts, but their constitutional derivation from standing claims is not explicit. RFC-005 should define a capability as permission derived from standing claims and policy.

---

## 7. Existing Authority Concepts

### Locations Reviewed

- `runtime/governance/types.ts`
- `runtime/governance/autonomous-governance-runtime.ts`
- `protocol/identity/delegation.ts`
- `protocol/capability-delegation/`
- `CAPABILITY_ATTENUATION_MODEL.md`

### Findings

1. Machine authority profiles include authority ID, machine actor, issuer, capability allow list, namespace allow list, trust path, delegation chain, issue time, expiration, and revocation.
2. Autonomous execution grants bind authority to machine actors, scopes, issue time, expiration, and revocation.
3. Delegation and attenuation concepts ensure derived authority cannot exceed parent authority.
4. Governance decision outputs contain lineage, trust path, capability provenance, and authority source.

### Gap

Authority is implemented in specific runtime contexts, especially autonomous and machine governance, but there is no universal definition stating that authority is derived, explainable, policy-bound, and never assumed solely from identity or claim presence.

---

## 8. Existing Governance and Decision Concepts

### Locations Reviewed

- `runtime/governance/`
- `protocol/governance/governance-compliance-spec.md`
- `docs/governance/`
- `protocol/policy/decision-trace.ts`
- `protocol/enforcement/enforcement-types.ts`
- `protocol/execution/`

### Findings

1. Governance runtime tracks session states such as pending, evaluating, approved, denied, escalated, awaiting human review, completed, and failed.
2. Governance obligations include purpose assertions, frequency enforcement, AI escalation, human review, relationship validation, consent reaffirmation, machine audit, machine escalation, machine approval, machine reconciliation, and machine expiration.
3. Policy traces record evaluated policies, decision reason, actor, resource, and evaluation time.
4. Enforcement decisions expose allow/deny state, reason code, reasons, evaluated time, normalized request, normalized capability, matched scope, and matched permissions.
5. Governance compliance emphasizes invariant preservation, auditability, and respect for Vault decisions.

### Gap

Decision traceability exists operationally, but there is no single constitutional requirement that every decision be explainable backward through authority, capability, standing, verification, attestation, claim, assertion, and evidence.

---

## 9. Constitutional Alignment Findings

### Charter Alignment

The AOC Charter emphasizes self-sovereignty, consent-first architecture, local-first/global-compatible infrastructure, minimal trust surfaces, market neutrality, open-source auditable specifications, and transparent governance. RFC-005 should align trust and authority with these principles by requiring explicit, portable, verifiable, and explainable chains.

### Protocol Invariant Alignment

The protocol invariants specification provides a cross-object registry and enforcement posture for authorization, integrity, security, lifecycle, and audit requirements. RFC-005 should define conceptual invariants for trust and authority chains without replacing object-level invariants.

### Governance Compliance Alignment

Governance compliance requires implementers not to weaken protocol invariants, to respect access decisions, and to provide auditability. RFC-005 should supply the conceptual foundation that explains why those requirements exist.

---

## 10. Gaps Discovered

1. **Assertion is missing as a first-class concept.** Evidence is interpreted in practice, but interpretation is not named or governed.
2. **Standing is missing as a first-class concept.** Expiration, revocation, suspension, and active state exist, but are not unified across claim types.
3. **Claim truth is not separated from claim form.** Existing claim structures may imply that formatted claims are accepted facts.
4. **Attestation is not canonically linked to claims.** Runtime attestations exist, but claim support semantics are not formalized.
5. **Authority is not universally derived.** Runtime authority exists in specific contexts, but not yet as a general protocol rule.
6. **Explainability chain is incomplete.** Decisions have traces and reason codes, but no constitutional backward chain exists across all layers.
7. **Credentials are not canonically defined as claim collections.** Credential records exist, but credential semantics should be defined at the concept layer.
8. **No single trust graph model exists.** Trust relationships are spread across identity, credential, capability, policy, runtime governance, and evidence concepts.

---

## 11. Future RFC Recommendations

Future RFCs should build from RFC-005 and define:

1. **Claim Schema RFC** — canonical claim object fields, subject/issuer models, claim type registry, temporal fields, and evidence references.
2. **Verification Engine RFC** — deterministic verification inputs, outputs, reason codes, assurance levels, and policy hooks.
3. **Standing Engine RFC** — canonical standing states, transitions, revocation/suspension/supersession semantics, and historical validity rules.
4. **Authority Engine RFC** — derivation of authority from standing claims, capability grants, delegation constraints, and policy.
5. **Credential Framework RFC** — credential as a portable bundle of claims, attestations, evidence references, and standing metadata.
6. **Trust Graph RFC** — graph model linking principals, identities, claims, attestations, evidence, policies, capabilities, and decisions.
7. **Runtime Authorization RFC** — mapping constitutional authority concepts to enforcement engines and runtime decision points.

---

## Conclusion

The repository contains mature partial implementations for claims, identity, evidence, attestations, verification, capability enforcement, governance sessions, policy traces, trust services, and authority profiles. These pieces are consistent with a larger trust model, but they require constitutional unification.

RFC-005 should become the canonical document that defines the trust and authority chain for all future AOC ecosystem implementations.
