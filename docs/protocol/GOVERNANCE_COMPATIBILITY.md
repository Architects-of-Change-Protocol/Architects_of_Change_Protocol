# Sovereign Governance Compatibility

The data model behind `AOC.GOVERNANCE_COMPATIBILITY`, published as
`@aoc/protocol/governance-compatibility`. The capability that runs it through the common invocation
and evidence spine is documented in [`SOVEREIGNTY_CAPABILITIES.md`](./SOVEREIGNTY_CAPABILITIES.md);
this page is about the handoff itself.

Governance Compatibility is the eighth and last of the canonical Sovereignty Capabilities, and it is
the one that says where Soberanía Protocol ends.

## What the handoff is

> **This stable governance resource refers to this sovereign subject, and this is the sovereign
> representation supplied together with the canonical machine-readable description of the semantics
> present in it.**

That sentence is the entire meaning of a `SovereignGovernanceHandoffV1`. It is enough for a governance
engine to *start*. It is deliberately not enough for the Protocol itself to *decide*.

```
governance compatible ≠ governed
handoff               ≠ decision
resource reference    ≠ grant
license terms         ≠ policy
claim                 ≠ authority
signature             ≠ authority
registrant            ≠ owner
issuer                ≠ owner
authority             ≠ decision
decision              ≠ enforcement
structural validity   ≠ policy sufficiency
```

The Protocol creates that boundary. It must never cross it.

## Where it sits

```
              SOBERANÍA PROTOCOL

              Sovereign Subject
                     │
                     ▼
            Portable Representation                (AOC.PORTABILITY)
                     │
                     ├─────────────► Semantic Descriptor   (AOC.INTEROPERABILITY)
                     │
                     ▼
             Canonical ResourceRef
                     │
                     ▼
          SovereignGovernanceHandoffV1
                     │
═════════════════════╪══════════════════════════════════════
                     │ Protocol ends
                     ▼
             External Governance
                     │
                     ▼
                   Policy
                     │
                     ▼
                  Decision
                     │
                     ▼
                Obligations
                     │
                     ▼
                   Grant
                     │
                     ▼
                Enforcement
```

Everything below the double line — policy, decision, obligations, grants, enforcement — belongs to an
external governance system: Soberanía Enterprise, an OPA or Cedar deployment, a cloud IAM, a DAO, or an
engine nobody has written yet. None of it exists in the Protocol, and none of it is adapted for here.

## The contract

```ts
export const SOVEREIGN_GOVERNANCE_HANDOFF_SCHEMA_VERSION =
  'aoc-sovereign-governance-handoff/1' as const;

export interface SovereignGovernanceHandoffV1 {
  readonly schemaVersion: typeof SOVEREIGN_GOVERNANCE_HANDOFF_SCHEMA_VERSION;
  readonly canonicalizationProfile: typeof CANONICAL_JSON_PROFILE;
  readonly subject: SovereignSubjectRef;
  readonly resource: ResourceRef;
  readonly representation: SovereigntyPortabilityBundleV1;
  readonly semantics: SovereigntyInteroperabilityDescriptorV1;
}
```

Exactly six fields, and why each one has to be there:

| Field | Answers |
| --- | --- |
| `schemaVersion` | what handoff contract this is |
| `canonicalizationProfile` | how its JSON representation is canonicalized |
| `subject` | which sovereign thing is involved |
| `resource` | what stable handle an external system should address |
| `representation` | what sovereign artifacts, assertions and standings travelled with it |
| `semantics` | what machine-readable concepts are present in that representation |

The envelope is **closed**. An unknown top-level field — `policy`, `decision`, `grant`, `owner`,
`authority`, `status`, `approval`, `governanceReady`, or anything else — makes the handoff invalid.
That is enforced by rejecting *any* unrecognized key rather than by maintaining a denylist of the
governance concepts somebody might try to add.

### Fields deliberately absent

- **`handoffId` / `governanceId` / `requestId`.** The handoff is a deterministic projection of an
  existing subject — not a new sovereign object, an access request, a workflow or a case. An id for it
  would have no owner and no lifecycle, and would make the same sovereign state project differently
  every time. The *execution* already has an identity: the SM-03 `invocationId`.
- **`generatedAt` / `preparedAt`.** The same determinism requirement. Same inputs, byte-identical
  canonical handoff. *When* a projection happened is recorded truthfully in the invocation evidence.
- **`handoffDigest` / `handoffHash`.** Integrity is a different mineral, reached by explicit
  composition: canonicalize the handoff, then hand the bytes to `AOC.INTEGRITY`.
- **`signature` / `proof`.** Likewise Verifiability. A consumer that wants proof signs the canonical
  serialization with the existing `signSovereignPayload`. No private key belongs in this mineral.
- **`ready` / `governanceReady` / `sufficient` / `complete`.** See
  [Structural validity is not policy sufficiency](#structural-validity-is-not-policy-sufficiency).
- **`consumerType` / `engine` / `vendor` / `governanceProvider`.** The handoff knows nothing about who
  consumes it. There is no consumer enum, because the set of governance systems is open.

## Reuse, not re-declaration

Every part of the handoff except the envelope itself is an existing Protocol contract:

| Part | Contract | Owner |
| --- | --- | --- |
| `subject` | `SovereignSubjectRef` | `@aoc/protocol/identity` (SM-02) |
| `resource` | `ResourceRef` | `@aoc/protocol/contracts` |
| `representation` | `SovereigntyPortabilityBundleV1` | `@aoc/protocol/portability` (SM-06) |
| `semantics` | `SovereigntyInteroperabilityDescriptorV1` | `@aoc/protocol/interoperability` (SM-07) |

There is no `GovernedSubject`, `GovernanceSubject`, `PolicySubject`, `GovernedResourceRef`,
`SovereignResource`, `PolicyResourceRef`, `GovernanceBundleV1` or `GovernanceCompatibilityDescriptor`.
A second model of one thing is exactly how two representations of that thing start to disagree.

### Portability is wrapped, never extended

`SovereigntyPortabilityBundleV1` still has its six fields — `schemaVersion`,
`canonicalizationProfile`, `subject`, `manifests`, `claims`, `standings` — and gains no `resource`,
`governance`, `policy` or `handoff` field. There is also no `governance-handoff` artifact *kind*, so a
handoff can never contain a representation that contains a handoff. Governance Compatibility wraps
Portability; it does not reach inside it.

### Interoperability is reused, never re-scanned

`semantics` is derived from the representation with SM-07's own pure descriptor helper. There is no
second semantic scanner here, and nothing re-reads `semanticRefs`, claim types or standing statuses on
its own.

Reusing those *contracts* is not hidden capability execution. `invokeSovereigntyCapability` is never
called from this mineral: preparing a handoff produces exactly one evidence record, not a hidden chain
of them, and composing minerals stays the caller's decision, visible in the caller's own evidence. A
caller may therefore prepare a handoff directly from a valid representation, without having run
Interoperability first.

## The resource projection

```ts
buildSovereignGovernanceResourceRef(subject, { tenantId })
// →
{
  kind: SOVEREIGN_GOVERNED_RESOURCE_KIND,   // 'aoc:sovereign-asset'
  id:   subject.sovereignAssetId,
  ...(tenantId supplied ? { tenantId } : {}),
}
```

### One kind for every subject

`SOVEREIGN_GOVERNED_RESOURCE_KIND` is `'aoc:sovereign-asset'`, for every subject there is. A byte
document, a physical painting, a plot of land, an external token, an autonomous agent, an API resource
and a subject from a system that does not exist yet all project onto exactly this kind, and differ only
in their data. Emitting `real-estate`, `music`, `token`, `api` or `agent` as the resource kind would
push Soberanía's asset taxonomy across the governance boundary and make every consumer branch on a
vocabulary the Protocol has no business owning. `subject.externalReference.namespace` is likewise
opaque: nothing branches on it.

The Asset Protocolization vertical froze the same value as `PROTOCOLIZED_RESOURCE_KIND` in APV-02, as
*temporarily* vertical-owned, stating that promotion to Protocol becomes appropriate as soon as a
second, generic producer of sovereign-resource references appears. Governance Compatibility is that
producer, so the constant now lives here and there is one authoritative definition rather than two.
The dependency direction is unchanged: **Asset Protocolization may consume Protocol, never the
reverse.**

### The id is the sovereignty anchor

`resource.id` is the `SovereignAssetId` — always, for every subject, with no fallback. It is never a
`manifestDigest`, a `ContentIdentity.digest`, an `externalReference.id`, a locator, a CID, a URL, a
provider id, a database id, a token contract address, a token id or a registry record id.

A subject can change provider, change locator, receive new bytes, receive a new manifest version and
move storage without ceasing to be the same sovereign subject. A grant or policy keyed to a content
digest or a provider id would bind governance to one transient representation and silently detach the
moment that representation changed. Governance has to address the thing, not the copy.

### No attributes in v1

`ResourceRef.attributes` is structurally **absent**, not empty, and a handoff carrying it is invalid.
It is the obvious place to smuggle `assetType`, `propertyType`, `mimeType`, `jurisdiction`,
`tokenStandard`, `classification`, `owner`, `license`, `riskScore` or a professional role into
governance, and every one of those facts already belongs to some other mineral's contract, where it is
validated, attributable and portable.

### Tenancy

`tenantId` is **optional**, because not every governance consumer is multi-tenant.

- Absent → the resource has no `tenantId` key at all. Not `undefined`, not `''`, not `'default'`.
- Supplied → it must be non-blank, and it is preserved exactly: not trimmed, not normalized, not
  lower-cased.
- Never inferred. Not from the subject namespace, the registrant, the issuer, an environment variable
  or an Enterprise tenant. The Protocol has no way to know whose tenancy a subject belongs to, and
  guessing would silently attach a sovereign subject to an organisation nobody named.

A specialized consumer may of course *require* one — Asset Protocolization does — and narrowing a
generic Protocol contract is exactly where that constraint belongs. Protocol does not inherit a
vertical's mandatory tenancy.

## Validation

```ts
validateSovereignGovernanceHandoffV1(value: unknown): {
  valid: boolean;
  reasons: readonly SovereignGovernanceCompatibilityReasonCode[];
}
isValidSovereignGovernanceHandoffV1(value: unknown): value is SovereignGovernanceHandoffV1
```

Pure, deterministic and non-mutating, over `unknown`, because a candidate handoff is exactly the kind
of document that has crossed an external trust boundary.

What it proves:

1. a supported handoff schema and canonicalization profile;
2. a canonical SM-02 subject;
3. a structurally valid SM-06 representation, checked with **SM-06's own** validator;
4. a governance resource that projects from that subject — right kind, right id, no attributes, a
   valid tenant if present;
5. a well-formed SM-07 descriptor that is **exactly** the canonical descriptor of the representation
   it travels with;
6. one subject shared by the envelope, the representation and the descriptor, under exact SM-02
   equality including `externalReference`.

Point 5 is load-bearing. A descriptor that is individually valid, about the same subject, but that
describes some *other* bundle — say `Origin` only, beside a representation that also carries a
derivation, a contested standing and licence terms — would hand a governance engine a materially
incomplete picture while looking entirely well-formed. It is rejected with
`GOVERNANCE_COMPATIBILITY_SEMANTICS_MISMATCH`.

Nothing is ever repaired. A resource pointing somewhere else is reported, never rewritten to agree
with the subject, because rewriting it would silently re-target whatever policy is keyed to it.

### Reason codes

Every code is structural, and named `GOVERNANCE_COMPATIBILITY_*`:

`INVALID_INPUT`, `UNSUPPORTED_OPERATION`, `SUBJECT_MISMATCH`, `INVALID_REPRESENTATION`,
`INVALID_HANDOFF`, `UNSUPPORTED_HANDOFF_SCHEMA`, `UNSUPPORTED_CANONICALIZATION_PROFILE`,
`INVALID_SUBJECT`, `INVALID_RESOURCE`, `RESOURCE_KIND_MISMATCH`, `RESOURCE_ID_MISMATCH`,
`RESOURCE_ATTRIBUTES_NOT_SUPPORTED`, `INVALID_TENANT_ID`, `INVALID_SEMANTICS`, `SEMANTICS_MISMATCH`.

There is deliberately no `ACCESS_DENIED`, `ACCESS_ALLOWED`, `POLICY_FAILED`, `AUTHORITY_MISSING`,
`APPROVAL_REQUIRED`, `LICENSE_FORBIDS` or `GRANT_REQUIRED`. Those are answers an external governance
system reaches after reading a handoff. A handoff that is structurally valid and that a policy would
nevertheless refuse is a perfectly ordinary state, and it has no reason code because nothing about it
is wrong.

## Structural validity is not policy sufficiency

A **valid** handoff may contain:

- zero claims;
- zero licence terms;
- unsigned artifacts;
- contested standings;
- a `Permission` and a `Restriction` over the same action;
- cryptographic proofs that do not hold;
- semantic requirements nobody in the receiving system has ever seen;
- no `tenantId`.

Every one of those is a legitimate sovereign state that governance may need to see *in order to*
decide. An external system may refuse such a handoff under policy. The Protocol must not refuse it
under structure — and it must not pre-approve it either.

This is why there is no `ready`, `governanceReady`, `readyForPolicy`, `sufficient`, `complete` or
`allEvidencePresent` flag anywhere. The Protocol cannot know whether every possible claim exists (it
has no global registry of manifests, claims or standings), and it cannot know what a policy it has
never seen requires.

### Licensing declares; governance interprets

Four separate concerns, in order:

| Stage | Owner | What it does |
| --- | --- | --- |
| Declaration | `AOC.LICENSING_TERMS` | records what an issuer says about a subject |
| Handoff | `AOC.GOVERNANCE_COMPATIBILITY` | carries that declaration, unchanged, to the boundary |
| Interpretation | external governance | decides what the declaration means for a request |
| Enforcement | Soberanía Enterprise / a provider | acts on that decision |

SM-10 performs none of the last two. A declared `Permission` does not become a grant or a scope, a
`Restriction` does not become a deny, and an `Obligation` acquires no
`pending`/`fulfilled`/`violated`/`waived` status. Contradictory clauses are carried verbatim: no
winner, no precedence, no `resolvedTerms`.

### Verifiability is not run, and is not hidden

A handoff may contain signed artifacts that have not been cryptographically verified — including ones
whose proofs do not hold. `prepare-governance-handoff` succeeds anyway, because it checks no
signature, resolves no key and binds no issuer.

That is not a gap being papered over. External governance may independently invoke `AOC.VERIFIABILITY`
over any artifact in the representation and get an honest `valid: false`. Those two facts are supposed
to be able to coexist; conflating them would make "handed to governance" silently read as
"cryptographically sound". For the same reason, a handoff never embeds an ephemeral verification
result: coupling it to one verification run would make the document's meaning depend on when it was
built.

### Contested claims travel

A `StandingStatus.Contested` standing stays in the representation, exactly as it was. Governance may
need the dispute state — it may be the entire reason a decision has to be made. The Protocol does not
remove it, weight it, resolve it or attach a warning verdict to it.

## What SM-10 never creates

The Protocol already defines `CanonicalCapability`, `CanonicalAuthority` and `CanonicalDecision`, and
Governance Compatibility auto-constructs **none** of them. Claims existing on a subject do not mean a
governance capability exists; a valid signature, a licence issuer and a manifest registrant are none of
them an authority; and an authority is not a decision. The trust chain

```
Evidence → Assertion → Claim → Attestation → Verification → Standing → Capability → Authority → Decision
```

must not be jumped from its left half to its right half, and this mineral does not jump it.

Nor does it create a `PolicyDecision` (`'allow' | 'deny' | 'conditional'`), a `ScopedAccessRequest`, a
`CapabilityToken`, a `CapabilityGrant`, a `ConsentGrant` or a `Delegation`. A handoff is object/state
context; an access request is an actor/action event; they are different concepts and neither implies
the other.

It is also **not** the legacy `protocol/policy` resource/evaluation model. Nothing here imports a
policy runtime, a PDP, a scoped-access evaluator or a decision engine, and no legacy runtime is
rewritten by SM-10.

## Evidence

Governance Compatibility uses the common SM-03 invocation and evidence spine, unchanged. A successful
prepare records exactly:

```
capability  completedAt  invocationId  outcome  requestedAt  schemaVersion  subject
```

plus an optional `correlationId`. The evidence carries **no** handoff, resource, representation,
descriptor, tenant, claim, standing, licence-terms, policy, authority or decision payload. That is a
privacy invariant, not a size optimisation: a representation may carry commercial terms,
principal-specific declarations, external identifiers, disputes and sensitive metadata, and evidence
has to stay safe to hand to someone who is not entitled to the payload. The result carries the
handoff; the evidence records the execution.

An invalid validation *candidate* is a **successful** execution with `validation.valid === false` — the
same pattern Integrity, Interoperability, Verifiability and Licensing & Terms already established. A
capability failure is reserved for a request that cannot be answered at all.

## Future Enterprise consumption

Conceptually, and **not implemented here**:

```
SovereignGovernanceHandoffV1
        ↓
 Soberanía Enterprise
        ↓
 resource resolution
        ↓
      request
        ↓
 authority / policy
        ↓
     decision
        ↓
   obligations
        ↓
      grant
        ↓
provider enforcement
        ↓
  usage evidence
        ↓
    revocation
```

None of that exists in the Protocol, and the strongest evidence that the handoff works is *not* "Soberanía
Enterprise can consume it" — it is that any external package consumer can read this generic public
contract. There is no `GovernanceAdapter`, `EnterpriseGovernanceAdapter` or `PolicyEngineAdapter` in
v1: the standardized handoff **is** the integration boundary. Mediated credentials, short-lived signed
URLs, provider keys, TTLs, revocation enforcement and log delivery are all Enterprise governed-access
concerns and appear nowhere in this mineral.
