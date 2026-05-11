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
export interface CapabilityRef {
    capabilityId: string;
    action: string;
    resource: string;
    scope: NamespaceRef;
}
export interface GovernanceScope {
    scopeId: string;
    namespace: NamespaceRef;
    allowedActorTypes: ActorType[];
}
export interface GovernancePolicy {
    policyId: string;
    version: string;
    scopeId: string;
    rules: Array<{
        condition: string;
        effect: "allow" | "deny";
    }>;
    updatedAt: string;
}
export interface ConsentGrant {
    grantId: string;
    subjectActorId: string;
    delegateActorId?: string;
    capability: CapabilityRef;
    issuedAt: string;
    expiresAt?: string;
    revokedAt?: string;
}
export interface PortableCognitionPackage {
    packageId: string;
    sourceOrganizationId: string;
    exportedAt: string;
    topology: CognitionTopology;
    governanceSnapshot: GovernanceSnapshot;
    auditContinuity: AuditContinuity;
}
export interface CognitionTopology {
    namespaces: NamespaceRef[];
    actorBindings: Array<{
        namespacePath: string;
        actorId: string;
    }>;
}
export interface GovernanceSnapshot {
    policies: GovernancePolicy[];
    capabilities: CapabilityRef[];
    consentGrants: ConsentGrant[];
}
export interface AuditEvent {
    eventId: string;
    eventType: string;
    actor: ActorRef;
    namespace: NamespaceRef;
    timestamp: string;
    payload: Record<string, unknown>;
}
export interface AuditContinuity {
    chainId: string;
    lastEventId: string;
    events: AuditEvent[];
}
//# sourceMappingURL=index.d.ts.map