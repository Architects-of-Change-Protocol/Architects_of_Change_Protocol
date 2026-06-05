import { ActorRef, CognitionBudget, DelegatedResourceGrant, ExecutionCostProfile, GovernancePolicy, GovernanceScope, GovernanceSignature, NamespaceRef, ResourceConstraintPolicy, ResourceLineageEntry, ResourceObligation, SignedAuthorizationDecision } from "@aoc-runtime/shared-types";
import { PolicyProvider } from "@aoc-runtime/provider-interfaces";
export interface GovernanceContext {
    actor: ActorRef;
    namespace: NamespaceRef;
    scope: GovernanceScope;
    machineActor?: ActorRef;
}
export interface GovernancePolicyState {
    scopeId: string;
    effectivePolicies: GovernancePolicy[];
    inheritedFrom: string[];
}
export interface GovernanceDecision {
    decision: "allow" | "deny" | "conditional";
    allowed: boolean;
    evaluatedScopeId: string;
    effectiveActor: ActorRef;
    reasons: string[];
    policySourceIds: string[];
    inheritedScopeChain: string[];
}
export declare class GovernanceRuntime {
    private readonly policies;
    constructor(policies: PolicyProvider);
    resolveActor(actor: ActorRef, machineActor?: ActorRef): ActorRef;
    private resolveScopeChain;
    policyState(scopeId: string): Promise<GovernancePolicyState>;
    evaluate(context: GovernanceContext, condition: string): Promise<GovernanceDecision>;
    signDecision(decision: GovernanceDecision, privateKey: string, signer: GovernanceSignature["signer"], runtimeSource: string): SignedAuthorizationDecision<GovernanceDecision>;
}
export interface ResourceAccountingInput {
    actionId: string;
    actor: ActorRef;
    scopeId: string;
    namespacePath: string;
    budgetId: string;
    costProfile: ExecutionCostProfile;
    parentEntryId?: string;
    delegatedGrantId?: string;
    timestamp?: string;
}
export interface ResourceAccountingDecision {
    allowed: boolean;
    reasons: string[];
    obligations: ResourceObligation[];
    lineageEntry?: ResourceLineageEntry;
}
export declare class ResourceAccountingRuntime {
    private readonly budgetState;
    private readonly grants;
    private readonly policies;
    private readonly lineage;
    constructor(config: {
        budgets: CognitionBudget[];
        grants?: DelegatedResourceGrant[];
        policies?: ResourceConstraintPolicy[];
    });
    accountExecution(input: ResourceAccountingInput): ResourceAccountingDecision;
    exportResourceContinuity(): {
        budgets: CognitionBudget[];
        delegatedGrants: DelegatedResourceGrant[];
        policies: ResourceConstraintPolicy[];
        lineage: ResourceLineageEntry[];
    };
    emergencyFreezeBudget(budgetId: string, revokedAt?: string): boolean;
    private createObligation;
}
export type ExecutionHealth = "Green" | "Yellow" | "Red";
export type ExecutionComplexity = "Low" | "Medium" | "High" | "Very High";
export type GovernanceBriefLogEventName = "Governance Brief Started" | "Governance Brief Completed" | "Governance Brief Failed";
export interface ProjectDiscoveryEvidenceSource {
    evidenceSourceId: string;
    title?: string;
    uri?: string;
    evidenceHash?: string;
    confidence?: number;
}
export interface ProjectDiscoveryItem {
    id: string;
    label: string;
    description?: string;
    category?: string;
    ownerId?: string;
    external?: boolean;
    severity?: "low" | "medium" | "high" | "critical";
    confidence?: number;
    status?: string;
    discoveryItemRefs?: string[];
    evidenceSourceRefs: string[];
}
export interface ProjectDiscoverySnapshot {
    projectId: string;
    workspaceId: string;
    discoveryVersion: number;
    evidenceSources: ProjectDiscoveryEvidenceSource[];
    stakeholders?: ProjectDiscoveryItem[];
    deliverables?: ProjectDiscoveryItem[];
    milestones?: ProjectDiscoveryItem[];
    dependencies?: ProjectDiscoveryItem[];
    risks?: ProjectDiscoveryItem[];
    assumptions?: ProjectDiscoveryItem[];
    unknowns?: ProjectDiscoveryItem[];
    approvals?: ProjectDiscoveryItem[];
    governanceRoles?: ProjectDiscoveryItem[];
    acceptanceCriteria?: ProjectDiscoveryItem[];
    operationalSupport?: ProjectDiscoveryItem[];
    technology?: ProjectDiscoveryItem[];
    traceabilityCoverage?: number;
    discoveryQuality?: number;
    generatedAt?: string;
}
export interface GovernanceTrace {
    discoveryItemRefs: string[];
    evidenceSourceRefs: string[];
    confidence: number;
}
export interface GovernanceFinding extends GovernanceTrace {
    title: string;
    description: string;
    severity: "positive" | "concern" | "critical" | "action";
}
export interface RecommendedGovernanceAction extends GovernanceTrace {
    action: string;
    rationale: string;
    priority: "low" | "medium" | "high" | "urgent";
}
export interface ProjectBootstrapBrief {
    id: string;
    projectId: string;
    workspaceId: string;
    discoveryVersion: number;
    briefVersion: number;
    executionHealth: ExecutionHealth;
    executionComplexity: ExecutionComplexity;
    confidenceScore: number;
    stakeholderPressureScore: number;
    dependencyPressureScore: number;
    riskPressureScore: number;
    unknownPressureScore: number;
    governanceSummary: string;
    recommendedActionsJson: RecommendedGovernanceAction[];
    criticalFindingsJson: GovernanceFinding[];
    positiveSignalsJson: GovernanceFinding[];
    concernsJson: GovernanceFinding[];
    generatedAt: string;
    createdAt: string;
    updatedAt: string;
}
export interface GovernanceBriefLogEvent {
    event: GovernanceBriefLogEventName;
    projectId: string;
    workspaceId: string;
    discoveryVersion: number;
    briefVersion?: number;
    health?: ExecutionHealth;
    confidence?: number;
    durationMs?: number;
    error?: string;
}
export interface GovernanceBriefLogger {
    log(event: GovernanceBriefLogEvent): void;
}
export interface BootstrapGovernanceBriefOptions {
    latestBriefVersion?: number;
    now?: string;
    idFactory?: () => string;
}
export interface ProjectBootstrapBriefRepository {
    save(brief: ProjectBootstrapBrief): Promise<void>;
    latest(projectId: string, workspaceId: string): Promise<ProjectBootstrapBrief | undefined>;
    history(projectId: string, workspaceId: string): Promise<ProjectBootstrapBrief[]>;
}
export interface ProjectReadAuthorization {
    canReadProject(projectId: string, workspaceId: string, actorId: string): Promise<boolean> | boolean;
}
export interface GetProjectBootstrapBriefRequest {
    projectId: string;
    workspaceId: string;
    actorId: string;
}
export interface GetProjectBootstrapBriefResponse {
    status: 200 | 403 | 404;
    brief?: ProjectBootstrapBrief;
    error?: string;
}
export declare class BootstrapGovernanceBriefEngine {
    private readonly logger?;
    constructor(logger?: GovernanceBriefLogger | undefined);
    generate(discovery: ProjectDiscoverySnapshot, options?: BootstrapGovernanceBriefOptions): ProjectBootstrapBrief;
}
export declare class InMemoryProjectBootstrapBriefRepository implements ProjectBootstrapBriefRepository {
    private readonly briefs;
    save(brief: ProjectBootstrapBrief): Promise<void>;
    latest(projectId: string, workspaceId: string): Promise<ProjectBootstrapBrief | undefined>;
    history(projectId: string, workspaceId: string): Promise<ProjectBootstrapBrief[]>;
}
export declare function getProjectBootstrapBrief(repository: ProjectBootstrapBriefRepository, authorization: ProjectReadAuthorization, request: GetProjectBootstrapBriefRequest): Promise<GetProjectBootstrapBriefResponse>;
export interface GovernanceSnapshotCard {
    health: ExecutionHealth;
    complexity: ExecutionComplexity;
    confidence: number;
    topConcerns: GovernanceFinding[];
    topActions: RecommendedGovernanceAction[];
    lastGenerated: string;
}
export declare function toGovernanceSnapshotCard(brief: ProjectBootstrapBrief): GovernanceSnapshotCard;
export declare function generateAndStoreProjectBootstrapBrief(repository: ProjectBootstrapBriefRepository, engine: BootstrapGovernanceBriefEngine, discovery: ProjectDiscoverySnapshot, options?: Omit<BootstrapGovernanceBriefOptions, "latestBriefVersion">): Promise<ProjectBootstrapBrief>;
//# sourceMappingURL=index.d.ts.map