export type ActorType = "human" | "machine" | "service";

export interface ActorRef {
  actorId: string;
  actorType: ActorType;
  organizationId: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface NamespaceRef {
  organizationId: string;
  workspaceId?: string;
  projectId?: string;
  path: string;
}

export type TrustBoundaryScopeType = "namespace" | "workspace" | "organization" | "machine";

export interface TrustBoundaryScope {
  type: TrustBoundaryScopeType;
  organizationId?: string;
  workspaceId?: string;
  namespacePath?: string;
  machineId?: string;
}

export interface RuntimeTrustNode {
  runtimeId: string;
  organizationId: string;
  runtimeType: "human-operated" | "machine" | "service";
  authorityKeyIds: string[];
  scopes: TrustBoundaryScope[];
  activeFrom: string;
  activeUntil?: string;
  revokedAt?: string;
}

export interface RuntimeTrustEdge {
  edgeId: string;
  fromRuntimeId: string;
  toRuntimeId: string;
  mode: "direct-trust" | "delegated-authority";
  scopes: TrustBoundaryScope[];
  delegatedKeyIds?: string[];
  delegatedBySigner?: string;
  issuedAt: string;
  expiresAt?: string;
  revokedAt?: string;
  reason?: string;
}

export interface RuntimeFederation {
  federationId: string;
  domain: string;
  nodes: RuntimeTrustNode[];
  edges: RuntimeTrustEdge[];
  metadata?: Record<string, string | number | boolean>;
}

export interface AuthorityTrustProfile {
  authorityId: string;
  runtimeId: string;
  signerKeyId: string;
  trustLevel: "trusted" | "delegated" | "revoked" | "expired";
  scopes: TrustBoundaryScope[];
  delegationChain?: string[];
  updatedAt: string;
}

export interface CapabilityRef { capabilityId: string; action: string; resource: string; scope: NamespaceRef; }
export interface GovernanceScope { scopeId: string; namespace: NamespaceRef; allowedActorTypes: ActorType[]; }
export interface GovernancePolicy { policyId: string; version: string; scopeId: string; rules: Array<{ condition: string; effect: "allow" | "deny" }>; updatedAt: string; }
export interface ConsentGrant { grantId: string; subjectActorId: string; delegateActorId?: string; capability: CapabilityRef; issuedAt: string; expiresAt?: string; revokedAt?: string; }

export interface PortableCognitionPackage {
  packageId: string;
  sourceOrganizationId: string;
  exportedAt: string;
  topology: CognitionTopology;
  governanceSnapshot: GovernanceSnapshot;
  auditContinuity: AuditContinuity;
  federation?: RuntimeFederation;
  authorityProfiles?: AuthorityTrustProfile[];
}

export interface CognitionTopology { namespaces: NamespaceRef[]; actorBindings: Array<{ namespacePath: string; actorId: string }>; }
export interface GovernanceSnapshot { policies: GovernancePolicy[]; capabilities: CapabilityRef[]; consentGrants: ConsentGrant[]; }

export interface AuditEvent { eventId: string; eventType: string; actor: ActorRef; namespace: NamespaceRef; timestamp: string; payload: Record<string, unknown>; }
export interface AuditContinuity { chainId: string; lastEventId: string; events: AuditEvent[]; }

export interface RuntimeAuthorityIdentity { authorityId: string; issuerId: string; runtimeId: string; algorithm: "ed25519"; publicKey: string; keyId: string; }
export interface GovernanceSignature { algorithm: "ed25519"; keyId: string; signer: RuntimeAuthorityIdentity; signature: string; signedAt: string; payloadHash: string; provenance: { runtimeSource: string; timestamp: string; chainPosition?: number; previousHash?: string; federationId?: string; trustPath?: string[]; delegatedBy?: string; }; }

export interface SignedAuthorizationDecision<TDecision = Record<string, unknown>> { decision: TDecision; decisionHash: string; evaluationHash: string; signature: GovernanceSignature; }
export interface SignedAuditEvent<TEvent = Record<string, unknown>> { event: TEvent; eventHash: string; previousEventHash?: string; chainPosition: number; chainId: string; signature: GovernanceSignature; }
export interface SignedConsentGrant<TGrant = Record<string, unknown>> { grant: TGrant; grantHash: string; issuerSignature: GovernanceSignature; delegatedSignature?: GovernanceSignature; revocationSignature?: GovernanceSignature; }

export interface PortableCognitionIntegrity {
  packageHash: string;
  governanceSnapshotHash: string;
  auditContinuityHash: string;
  topologyHash: string;
  provenanceHash: string;
  federationHash?: string;
  authorityProfilesHash?: string;
}
