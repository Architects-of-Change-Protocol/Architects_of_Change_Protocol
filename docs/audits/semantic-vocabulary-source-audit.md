# Semantic Vocabulary Source Audit

Date: 2026-06-03

## Scope

This audit reviewed existing public and runtime vocabulary sources requested for the RFC-005 semantic vocabulary layer:

- `packages/protocol/src/claims`
- `packages/protocol/src/claims/proofs`
- `packages/protocol/src/claims/registries`
- `packages/protocol/src/claims/credentials`
- `packages/identity`
- `packages/shared-types`
- `runtime/trust`
- `runtime/governance`
- `runtime/attestations`
- `protocol/identity`
- `protocol/policy`
- `protocol/audit`
- RFC-004 and RFC-005
- A2-A6 source and compliance audits in `docs/audits`

## Audit purpose

The purpose of this audit is to identify vocabulary already present in the repository so the new canonical semantic vocabulary layer can reference shared concepts without adding runtime reasoning, scoring, verification, authorization, taxonomy resolution, ontology resolution, graph traversal, or AI classification behavior.

## Canonical RFC-005 trust-chain labels

The merged RFC-005 trust model establishes the constitutional chain:

1. Evidence
2. Assertion
3. Claim
4. Attestation
5. Verification
6. Standing
7. Capability
8. Authority
9. Decision
10. Credential

These labels describe trust artifacts and their placement in the model. They are vocabulary terms, not executable behavior.

## Claim classifications

`ClaimType` currently includes:

- `Identity`
- `Capability`
- `Authorization`
- `Certification`
- `Role`
- `Credential`
- `Governance`
- `Custom`

## Evidence classifications

`EvidenceType` currently includes:

- `Document`
- `Contract`
- `Certification`
- `BoardResolution`
- `AuditRecord`
- `Attestation`
- `AIOutput`
- `SystemRecord`
- `Custom`

RFC-004 and RFC-005 also use descriptive evidence labels such as record, artifact, observation, event, document, trace, proof, audit report, machine log, policy trace, governance record, direct evidence, indirect evidence, human-produced evidence, machine-produced evidence, digital evidence, and physical evidence.

## Attestation classifications

Canonical claim attestations currently include:

- `Human`
- `Organization`
- `System`
- `AI`
- `Remote`
- `Governance`

Runtime attestation labels currently include:

- `governance_decision`
- `capability_issued`
- `capability_used`
- `delegation_validated`
- `ai_execution`
- `remote_governance`
- `audit_snapshot`

## Verification and standing statuses

`VerificationStatus` currently includes:

- `Pending`
- `Verified`
- `Failed`

`StandingStatus` currently includes:

- `Draft`
- `Verified`
- `Active`
- `Expired`
- `Suspended`
- `Revoked`
- `Superseded`
- `Invalid`
- `NotYetActive`

## Capability names and decision reasons

The canonical claim layer names `CanonicalCapability` as a trust artifact. Shared runtime contracts also include capability decision reasons:

- `allowed`
- `denied`
- `missing_capability`
- `expired_capability`

Runtime governance names include machine capability envelopes, capability allow lists, capability provenance, capability attestations, and capability usage labels. These are runtime/governance terms and are not semantic vocabulary execution behavior.

## Authority names and statuses

`AuthorityStatus` currently includes:

- `Granted`
- `Suspended`
- `Revoked`
- `Expired`

Authority-related labels present in runtime and policy areas include authority profile, authority source, authorization decision, policy authority boundary, delegated authority, and protocol-recognized authority. The semantic vocabulary layer may name these concepts but must not derive authority.

## Decision names and statuses

`DecisionStatus` currently includes:

- `Proposed`
- `Approved`
- `Rejected`
- `Executed`
- `Cancelled`

Shared and runtime contracts also use decision labels such as:

- `allow`
- `deny`
- `conditional`
- `allowed`
- `denied`
- `approved`
- `rejected`
- `pending`
- `executed`
- `cancelled`

These are vocabulary labels only in the public semantic vocabulary layer; decision engines remain out of scope.

## Actor classifications

Actor/principal labels found across identity, credential, governance, and attestation sources include:

- `Human`
- `Organization`
- `System`
- `AI`
- `Runtime`
- `GovernanceBody`
- `CredentialIssuer`
- `Protocol`
- `External`
- `Principal`
- `Custom`
- `human`
- `service`
- `agent`
- `workload`
- machine actor
- AI actor
- governance body
- issuer
- subject
- attester
- verifier
- decision maker

The canonical vocabulary layer can provide labels for these classes, but it must not perform actor classification or entity resolution.

## Credential classifications

`CredentialType` currently includes:

- `IdentityCredential`
- `CapabilityCredential`
- `CertificationCredential`
- `AuthorizationCredential`
- `RoleCredential`
- `GovernanceCredential`
- `ProfessionalCredential`
- `OrganizationCredential`
- `SystemCredential`
- `Custom`

`CredentialFormat` currently includes:

- `JSON`
- `JWT`
- `VC`
- `LinkedData`
- `Document`
- `RegistryEntry`
- `Custom`

`CredentialStatus` currently includes:

- `Draft`
- `Issued`
- `Active`
- `Suspended`
- `Revoked`
- `Expired`
- `Superseded`
- `Archived`
- `Unknown`

Credential issuer and subject kind labels include human, organization, system, AI, runtime, governance body, credential issuer, protocol, external, principal, and custom variants.

## Proof classifications

`ProofType` currently includes:

- `HashProof`
- `SignatureProof`
- `AttestationProof`
- `IntegrityProof`
- `ChainProof`
- `CredentialProof`
- `AuditProof`
- `TraceProof`
- `Custom`

`ProofFormat` currently includes:

- `JSON`
- `JWT`
- `JWS`
- `VC`
- `Hash`
- `URI`
- `Custom`

`ProofStatus` currently includes:

- `Declared`
- `Observed`
- `Verified`
- `Invalid`
- `Unknown`

Runtime integrity proof labels include `local_hash`, `chained_hash`, and `replay_guard`.

## Registry classifications

`RegistryType` currently includes:

- `ClaimRegistry`
- `EvidenceRegistry`
- `AttestationRegistry`
- `ProofRegistry`
- `PrincipalRegistry`
- `CredentialRegistry`
- `PolicyRegistry`
- `AuthorityRegistry`
- `DecisionRegistry`
- `Custom`

`RegistryEntryType` currently includes:

- `Claim`
- `Evidence`
- `Assertion`
- `Attestation`
- `Verification`
- `Standing`
- `Capability`
- `Authority`
- `Decision`
- `Principal`
- `Proof`
- `Credential`
- `Policy`
- `Custom`

`RegistryAuthorityLevel` currently includes:

- `SelfDeclared`
- `OrganizationDeclared`
- `GovernanceDeclared`
- `ProtocolRecognized`
- `Federated`
- `External`
- `Unknown`

`RegistryEntryStatus` currently includes:

- `Active`
- `Deprecated`
- `Revoked`
- `Superseded`
- `Archived`
- `Unknown`

`RegistryLookupStatus` currently includes:

- `Found`
- `NotFound`
- `Ambiguous`
- `Unavailable`
- `Unauthorized`
- `Unknown`

## Governance and policy labels

Runtime governance and policy sources include semantic labels for runtime states, obligations, escalation paths, human review statuses, reason codes, policy traces, policy decisions, and audit hooks. These labels improve explainability, but behavior belongs to runtime or Enterprise layers, not to the public vocabulary contracts.

## Audit conclusion

The repository already contains a mature set of labels and classifications across claims, evidence, proofs, registries, credentials, identity, runtime trust, governance, attestation, policy, and audit layers. The missing piece is a portable public contract for describing and referencing those concepts. The canonical semantic vocabulary layer should therefore be limited to identifiers, terms, categories, vocabulary declarations, references, and descriptive profiles.
