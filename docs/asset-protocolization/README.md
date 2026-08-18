# Asset Protocolization Vertical (Workstream A)

A vertical built **on** AOC Protocol that turns an asset — a file, a recording, a physical
work, a plot of land — into a verifiable AOC record backed by declarations, evidence,
automated checks and, where the asset class requires it, a professional or notarial
attestation.

> **Asset Protocolization is a vertical built on AOC Protocol. It is not AOC Protocol
> itself, it is not AOC Enterprise, and it does not tokenize.**

## Layer map

```text
AOC PROTOCOL            subject identity, integrity, canonical signed record,
                        evidence/claim/attestation/verification/standing vocabulary,
                        registry & credential references, canonicalization,
                        capability invocation + evidence, portability, adapter ports
                        —— knows nothing about asset classes

ASSET PROTOCOLIZATION   profiles, intake, case + lifecycle, requirement definitions,
VERTICAL                declaration capture, verification pipeline, professional review,
                        attestation workflow, protocolization, fee assessment
                        —— knows what a house and a WAV file are; governs nothing

AOC ENTERPRISE          authority, policy, approvals, decisions, obligations,
                        grants, enforcement, revocation, usage evidence
                        —— governs actions; registers nothing legally

TOKENIZER               issuance, contracts, custody, marketplace, settlement
                        —— executes; decides nothing
```

## Documents

| Step | Document | Status |
|---|---|---|
| APV-00 | [`APV_00_RECONNAISSANCE.md`](./APV_00_RECONNAISSANCE.md) | `VERIFIED` |
| APV-01 | [`../architecture/adr-asset-protocolization-vertical-boundary.md`](../architecture/adr-asset-protocolization-vertical-boundary.md) | Accepted — frozen |
| APV-02 | [`APV_02_VERTICAL_PROTOCOL_CONTRACT.md`](./APV_02_VERTICAL_PROTOCOL_CONTRACT.md) | Frozen (specification; no code) |
| **GATE A0** | **Vertical boundary frozen** | **`RATIFIED`** — see below |
| APV-03 | [`APV_03_ASSET_PROFILE_FRAMEWORK.md`](./APV_03_ASSET_PROFILE_FRAMEWORK.md) | Implemented — `@aoc/asset-protocolization` |
| APV-04 | [`APV_04_PROTOCOLIZATION_CASE.md`](./APV_04_PROTOCOLIZATION_CASE.md) | `VERIFIED` — `ProtocolizationCase` in `@aoc/asset-protocolization` |
| APV-05 | [`APV_05_EVIDENCE_INTAKE.md`](./APV_05_EVIDENCE_INTAKE.md) | `VERIFIED` — evidence intake layer in `@aoc/asset-protocolization` |
| APV-06…APV-20 | not started | — |

The ADR lives under `docs/architecture/` to follow this repository's existing ADR naming
convention (`docs/architecture/adr-*.md`).

## Gate A0 — `RATIFIED`

```text
GATE A0 = RATIFIED
```

Ratified by the Founder / AOC Architecture Authority as the precondition for APV-03. The
boundary frozen by APV-01 and APV-02 is unchanged:

```text
Protocol                 != Asset Protocolization      frozen  (ADR §1, §2)
Asset Protocolization    != Enterprise Governance      frozen  (ADR §1, §2)
Enterprise Governance    != Tokenizer                  frozen  (ADR §1, §2)
Vertical → substrate contract                          frozen  (APV-02 §2)
```

Six decisions were carried from APV-00 §8 (`U-1`…`U-6`). `U-5` was closed by ADR §3
(`packages/asset-protocolization`, published as `@aoc/asset-protocolization`, role
`facade`). The remaining five are resolved as follows. This section is the ratification
record; APV-00 and the ADR are historical and are not rewritten by it.

### `U-1` — Verifiability

**Decision.** The vertical does **not** wait for an `AOC.VERIFIABILITY` capsule. It
composes the existing lower-level Protocol primitives it needs (`verifySovereignManifest`,
`VerificationKeyResolver`, `CredentialStatusLookup`, `computeContentIdentity` /
`verifyContentIdentity`).

If implementation surfaces a genuinely generic missing capability — one that at least
three unrelated verticals would need — it is documented as a *possible future Protocol
proposal* with its own gate (ADR §7). It is not added to Protocol inside this workstream.

### `U-2` — External registries

**Decision.** Use the existing generic model:

```text
RegistryType.Custom  +  RegistryAuthorityLevel.External
```

This is sufficient for any future external registry source. No jurisdiction- or
domain-specific enum member (`RegistryType.CostaRica`, `.RealEstate`, `.Property`, or any
equivalent) is added to Protocol. Revisited only if multiple unrelated verticals
independently demonstrate a genuinely generic abstraction need.

### `U-3` — `CanonicalAssertionId` ownership

**Decision.** The vertical mints and derives the canonical assertion identifiers it needs.
No Protocol helper is added merely because one does not exist. Any such mechanism must be
deterministic where required, collision-resistant, unit-tested, documented, and independent
of asset-specific business semantics, and must obey Protocol's format constraints exactly.

APV-03 mints no assertion id, because it creates no claim — so no helper was written. The
ownership stands and is discharged by the slice that first needs one. APV-04 mints none
either: a case *references* claims, evidence, attestations and verifications by identifier;
it creates none. APV-05 mints none either, and deliberately constructs no
`CanonicalEvidence`: intake receives an evidence *reference*, or a record the caller
legitimately already holds, and never fabricates a canonical record identifier of its own.

### `U-4` — Fee model ownership

**Decision.** The vertical owns its own fee **assessment** model. APV-03, APV-04 and later
slices are not coupled to `runtime/monetization`, and implement no payment processing, no
payment provider integration and no settlement. Later slices may emit auditable assessments and
events that a separate subsystem can bill from; the architecture must not foreclose that.

### `U-6` — Case persistence ownership

**Decision.** Persistence for `ProtocolizationCase` and every other vertical workflow
aggregate belongs to the vertical. No vertical workflow persistence port is placed in AOC
Protocol. Protocol remains substrate and never learns the case exists.

APV-04 discharges this: `ProtocolizationCaseRepository` is declared in
`packages/asset-protocolization/src/case/case-repository.ts` together with one
deterministic in-memory implementation. No database adapter, migration or schema was added — binding the
port to a store is an infrastructure decision for the composition layer. See
[`APV_04_PROTOCOLIZATION_CASE.md`](./APV_04_PROTOCOLIZATION_CASE.md#13-persistence).

APV-05 extends the same decision to evidence intake: `EvidenceIntakeRepository` is declared
in `packages/asset-protocolization/src/evidence/evidence-intake-repository.ts` with one
in-memory implementation, stores *receipts* rather than evidence, and adds no database, blob
store or upload infrastructure. See
[`APV_05_EVIDENCE_INTAKE.md`](./APV_05_EVIDENCE_INTAKE.md#13-persistence).

## Reading order for an implementer

1. `docs/architecture/sovereign-asset-core.md` — the frozen substrate and its invariants.
2. `docs/protocol/SOVEREIGNTY_CAPABILITIES.md` — the canonical eight and the invocation
   spine.
3. `APV_00_RECONNAISSANCE.md` §3 — the reuse map. **If you are about to define a type named
   `Evidence`, `Claim`, `Attestation`, `Verification` or `Proof`, stop and read it first.**
4. The ADR — what you may and may not own.
5. `APV_02_VERTICAL_PROTOCOL_CONTRACT.md` — what you must emit.
6. `APV_03_ASSET_PROFILE_FRAMEWORK.md` — how a profile states what an asset class requires.
7. `APV_04_PROTOCOLIZATION_CASE.md` — how one tenant's attempt under one pinned profile
   version is modelled, and why material presence is never truth.
8. `APV_05_EVIDENCE_INTAKE.md` — how evidence is received, structurally admitted,
   referenced, correlated and recorded over the life of a case, and why *received* is never
   *verified*.
9. `docs/constitution/ARCHITECTURAL-LAWS.md` — which mistakes fail the build.

## Workstream B

Tokenization governance (`TOKENIZE` as an AOC Enterprise capability) begins only after
GATE A4. It is deliberately not started, and no tokenization concept appears anywhere in
this workstream.
