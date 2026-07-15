# ADR — Canonical Agent Identity, Passport and Trust Architecture

| Field | Value |
|---|---|
| Status | Accepted |
| Decision owner | Founder / AOC Architecture Authority |
| Scope | AOC Protocol, AOC Enterprise, AOC Assurance and consuming products such as PMFreak |

## Context

AOC requires a clear separation between:

- sovereign identity;
- authentication;
- authorization;
- operational management;
- assurance;
- product-specific agent configuration.

A passport must not be interpreted as a universal certification of trust. A malicious, unassessed or
restricted agent may possess a valid identity while having no authorization to perform material actions.

The architecture must preserve the ability to:

- identify agents;
- attribute actions;
- revoke compromised identities;
- restrict capabilities;
- require assurance;
- block malicious actors;
- support self-sovereign implementations;
- provide managed and enterprise services commercially.

## Decision

### 1. AOC Protocol Core is the canonical authority for agent identity

AOC Protocol Core owns the canonical semantics and contracts for:

- Agent ID.
- Agent identity.
- Agent Passport.
- Passport versions.
- Issuers.
- Controllers.
- Trust domains.
- Claims.
- Attestations.
- Integrity proofs.
- Cryptographic binding.
- Capability declarations.
- Delegation.
- Execution grants.
- Passport expiration.
- Passport supersession.
- Passport revocation.
- Revocation verification.
- Evidence records.
- Verification rules.

AOC Protocol Core must support local, self-hosted and self-sovereign use without requiring a commercial
AOC subscription.

### 2. Agent ID is stable; passports are versioned

An agent receives a stable canonical identifier. Example:

```text
agent:aoc:<globally-unique-identifier>
```

The Agent ID remains stable across:

- model upgrades;
- passport renewals;
- capability changes;
- key rotation;
- deployment changes;
- policy changes.

Passports are immutable, versioned records. Example:

```text
Agent ID
  ├── Passport v1 — superseded
  ├── Passport v2 — revoked
  └── Passport v3 — active
```

### 3. A passport proves identity, not goodness

A valid passport means:

- the subject can be identified;
- the issuer can be identified;
- the integrity of the document can be verified;
- the current status can be evaluated;
- claims can be attributed;
- revocation can be checked.

A passport does not automatically mean:

- the agent is safe;
- the agent is trustworthy;
- the agent is authorized;
- the agent is assured;
- the agent is incident-free;
- the agent is permitted to execute material actions.

No interface may use a single ambiguous badge such as `AOC Verified` without indicating what exactly was
verified. UI and APIs must distinguish:

- Identity verified.
- Controller verified.
- Organization bound.
- Passport active.
- Assurance assessed.
- Capability authorized.
- Incident status.
- Execution permission.

### 4. Self-issued passports are allowed

AOC Protocol Core may support self-issued passports. Self-issued passports must be clearly identified:

```text
Issuer type: Self
Identity assurance: Unassessed
Organization binding: None
External assurance: None
```

Self-issued passports do not create an obligation for other systems to trust or authorize the agent.
Relying parties retain full authority to reject:

- self-issued passports;
- unknown issuers;
- unassessed agents;
- restricted agents;
- unsupported trust domains;
- agents without organization binding.

### 5. Authorization is separate from identity

The Agent Passport identifies the agent and declares relevant properties. It does not itself grant
unrestricted execution rights. Material actions require a separate authorization decision through:

- policies;
- entitlements;
- execution grants;
- scopes;
- tenant restrictions;
- environment restrictions;
- human approvals;
- temporal constraints;
- financial limits;
- data access limits.

Example:

```text
Passport:
  Agent is capable of deploying software.

Execution grant:
  Agent may deploy release 2.4.1 to staging before 18:00 UTC.
```

Possession or theft of a passport must not be sufficient to execute an action.

### 6. Passports must be cryptographically bound

Passports must be bound, as applicable, to:

- subject identity;
- public key;
- controller;
- issuer;
- runtime;
- deployment;
- environment;
- model version;
- capability set;
- trust domain.

A passport must not function as a reusable bearer document.

### 7. AOC Enterprise manages the organizational lifecycle

AOC Enterprise does not create a competing identity system. AOC Enterprise owns:

- product consumer registration;
- enterprise tenant registration;
- product installation;
- organization-agent linkage;
- tenant-agent linkage;
- service identities;
- credentials;
- policy assignment;
- environment assignment;
- entitlements;
- capability access;
- subscription state;
- consumption accounts;
- usage metering;
- managed lifecycle;
- administrative suspension;
- enterprise reporting;
- health reporting;
- support operations;
- credential rotation.

AOC Enterprise stores references to canonical Protocol identities and passports.

### 8. AOC Assurance evaluates trust

AOC Assurance owns:

- assurance profiles;
- evidence evaluation;
- control evaluation;
- assurance scoring;
- drift detection;
- continuous monitoring;
- independent review;
- incident review;
- risk classification;
- assurance reports;
- attestations;
- certification programs;
- high-impact-agent controls.

Assurance is not required for an identity to exist. A relying party may require a minimum assurance level
before granting access.

### 9. PMFreak owns product-specific configuration

PMFreak owns:

- the visible agent name;
- agent configuration;
- project assignment;
- PMO assignment;
- prompts;
- tools enabled within PMFreak;
- product workflows;
- product-specific permissions;
- operational history;
- recommendations;
- approvals;
- tasks;
- project context;
- product analytics.

PMFreak stores references to:

- canonical Agent ID;
- active Passport ID;
- Passport version;
- assurance status;
- Enterprise tenant ID;
- assigned policy IDs.

PMFreak must not issue a parallel sovereign identity.

### 10. Recognition Runtime is not a canonical authority

Recognition Runtime must not independently own:

- Agent IDs;
- passports;
- claims;
- trust domains;
- revocation;
- identity authority;
- execution authorization.

Recognition Runtime may be retained only if re-scoped to a distinct PMFreak capability such as:

- performance reputation;
- operational recognition;
- product-specific contribution scoring;
- historical performance signals.

Any retained recognition score must reference the canonical AOC Agent ID. Recognition must not imply
verification or assurance.

### 11. Domain Policy Pack Runtime is not a parallel protocol

Domain Policy Pack Runtime may provide product or domain-specific policy bundles. It must not:

- present itself as AOC Core Protocol;
- create identity;
- issue passports;
- own revocation;
- create a parallel trust authority.

Its policies must be expressed through or adapted to the canonical AOC policy model.

### 12. Revocation is canonical and fail-closed

AOC Protocol is the canonical authority for passport and identity revocation. For material operations:

- revoked means block;
- unknown means block;
- timeout means block;
- authority mismatch means block;
- tenant mismatch means block;
- malformed status means block;
- unavailable registry means block or require human intervention.

A revocation lookup error must never be interpreted as "not revoked". Revocation must:

- invalidate affected passports;
- invalidate relevant delegations;
- invalidate execution grants;
- propagate to projections;
- preserve evidence;
- remain idempotent;
- be atomic or transactionally equivalent.

### 13. Security operations cannot be blocked by billing

The following operations must never be rejected solely because the tenant has insufficient balance:

- revoke identity;
- revoke passport;
- suspend agent;
- invalidate credential;
- invalidate execution grants;
- report a security incident;
- restrict compromised capabilities.

Consumption may be recorded and billed later. Security containment has priority over commercial
enforcement.

### 14. AOC Protocol Core remains open

AOC does not charge for the sovereign right to:

- implement the standard;
- generate an identity locally;
- issue a self-controlled passport;
- verify signatures locally;
- execute policies locally;
- manage local revocation;
- generate evidence locally;
- self-host the protocol.

### 15. Managed operations are commercial

AOC may charge for:

- hosted identity registry;
- managed passport issuance;
- managed key infrastructure;
- managed revocation distribution;
- verification APIs;
- managed evidence storage;
- global resolution;
- backups;
- observability;
- lifecycle automation;
- API usage;
- SLA;
- interoperability;
- operational support.

### 16. Enterprise and Assurance are commercial

AOC Enterprise may charge for organizational management. AOC Assurance may charge for evaluation,
monitoring, reporting and independent review.

The commercial principle is: **AOC does not charge for sovereignty. AOC charges for operating, governing
and assuring sovereignty at scale.**

## Consequences

### Positive

- Preserves the philosophical foundation of AOC.
- Prevents identity lock-in.
- Allows self-hosting.
- Creates a credible commercial managed-service model.
- Separates identity from authorization.
- Prevents malicious actors from treating passports as trust certificates.
- Supports interoperable third-party agents.
- Gives PMFreak a clean integration boundary.
- Creates recurring revenue through Enterprise and Assurance.
- Makes revocation and accountability first-class capabilities.

### Negative

- Requires clear UX to explain identity versus assurance.
- Requires a strong issuer and trust-domain model.
- Requires policies at relying-party level.
- Requires lifecycle and revocation infrastructure.
- Requires compatibility between self-issued and managed identities.
- Requires strict prevention of parallel identity implementations.

### Migration constraints

- Existing AOC primitives must be inventoried before extraction.
- Existing Agent ID and passport-like records must not be duplicated.
- Recognition Runtime cannot be migrated as canonical identity.
- Legacy IDs require a mapping strategy.
- Existing revocation paths must be made fail-closed first.
- Existing direct DB writes must be routed through the canonical service.
- Contracts must precede external runtime extraction.

### Rollback

If external extraction fails:

- retain the canonical in-process Protocol runtime;
- retain PMFreak ports;
- retain the in-process adapter;
- do not restore direct imports;
- do not restore ambiguous revocation semantics;
- do not reintroduce parallel identity authorities.

## Required follow-up decisions

- Canonical Agent ID format.
- Issuer hierarchy.
- Trust-domain model.
- Self-issued passport restrictions.
- Managed issuer requirements.
- Passport versioning rules.
- Expiration defaults.
- Key rotation process.
- Assurance tier taxonomy.
- Relying-party policy language.

## Related documents

- [`docs/rfcs/RFC-001-Identity-Layer.md`](../rfcs/RFC-001-Identity-Layer.md) — canonical Identity Layer
  RFC that this ADR's Agent Passport model extends into agent-specific trust and execution semantics.
- [`docs/architecture/aoc-layering.md`](aoc-layering.md) — Protocol / Enterprise / PMFreak layering that
  this ADR's ownership boundaries (§1, §7, §9) are built on.
- [`docs/governance/package-boundaries.md`](../governance/package-boundaries.md) — package-level
  enforcement of the same layering boundaries.
