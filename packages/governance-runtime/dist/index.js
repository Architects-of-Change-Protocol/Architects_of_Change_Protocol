"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryProjectBootstrapBriefRepository = exports.BootstrapGovernanceBriefEngine = exports.ResourceAccountingRuntime = exports.GovernanceRuntime = void 0;
exports.getProjectBootstrapBrief = getProjectBootstrapBrief;
exports.toGovernanceSnapshotCard = toGovernanceSnapshotCard;
exports.generateAndStoreProjectBootstrapBrief = generateAndStoreProjectBootstrapBrief;
const crypto_1 = require("@aoc-runtime/crypto");
class GovernanceRuntime {
    constructor(policies) {
        this.policies = policies;
    }
    resolveActor(actor, machineActor) {
        return machineActor ?? actor;
    }
    async resolveScopeChain(scopeId) {
        const chain = [scopeId];
        if (!this.policies.getParentScopeId)
            return chain;
        let current = scopeId;
        const guard = new Set(chain);
        while (true) {
            const parent = await this.policies.getParentScopeId(current);
            if (!parent || guard.has(parent))
                break;
            chain.push(parent);
            guard.add(parent);
            current = parent;
        }
        return chain;
    }
    async policyState(scopeId) {
        const scopeChain = await this.resolveScopeChain(scopeId);
        const inheritedFrom = scopeChain.slice(1);
        const policySets = await Promise.all(scopeChain.map((id) => this.policies.getPolicies(id)));
        return { scopeId, effectivePolicies: policySets.flat(), inheritedFrom };
    }
    async evaluate(context, condition) {
        const state = await this.policyState(context.scope.scopeId);
        const effectiveActor = this.resolveActor(context.actor, context.machineActor);
        const matchingRules = state.effectivePolicies.flatMap((policy) => policy.rules
            .filter((rule) => rule.condition === condition)
            .map((rule) => ({ policyId: policy.policyId, effect: rule.effect })));
        const denied = matchingRules.filter((rule) => rule.effect === "deny");
        if (denied.length > 0) {
            return {
                decision: "deny",
                allowed: false,
                evaluatedScopeId: context.scope.scopeId,
                effectiveActor,
                reasons: [`Denied by ${denied.length} governance rule(s) for condition ${condition}.`],
                policySourceIds: denied.map((d) => d.policyId),
                inheritedScopeChain: state.inheritedFrom
            };
        }
        const allowed = matchingRules.filter((rule) => rule.effect === "allow");
        if (allowed.length > 0) {
            return {
                decision: "allow",
                allowed: true,
                evaluatedScopeId: context.scope.scopeId,
                effectiveActor,
                reasons: [`Allowed by ${allowed.length} governance rule(s) for condition ${condition}.`],
                policySourceIds: allowed.map((a) => a.policyId),
                inheritedScopeChain: state.inheritedFrom
            };
        }
        return {
            decision: "conditional",
            allowed: false,
            evaluatedScopeId: context.scope.scopeId,
            effectiveActor,
            reasons: [`No explicit governance rule matched condition ${condition}.`],
            policySourceIds: [],
            inheritedScopeChain: state.inheritedFrom
        };
    }
    signDecision(decision, privateKey, signer, runtimeSource) {
        const decisionHash = (0, crypto_1.stableHash)(decision);
        const evaluationHash = (0, crypto_1.stableHash)({ decisionHash, runtimeSource, scope: decision.evaluatedScopeId });
        const signaturePayload = { decisionHash, evaluationHash, decision };
        const signature = (0, crypto_1.signPayload)(signaturePayload, privateKey, signer, { runtimeSource, timestamp: new Date().toISOString() });
        return { decision, decisionHash, evaluationHash, signature };
    }
}
exports.GovernanceRuntime = GovernanceRuntime;
class ResourceAccountingRuntime {
    constructor(config) {
        this.budgetState = new Map();
        this.grants = new Map();
        this.policies = new Map();
        this.lineage = [];
        config.budgets.forEach((budget) => this.budgetState.set(budget.budgetId, { ...budget, consumed: { ...budget.consumed } }));
        config.grants?.forEach((grant) => this.grants.set(grant.grantId, grant));
        config.policies?.forEach((policy) => this.policies.set(policy.scopeId, policy));
    }
    accountExecution(input) {
        const budget = this.budgetState.get(input.budgetId);
        if (!budget)
            return { allowed: false, reasons: [`Unknown budget ${input.budgetId}.`], obligations: [] };
        if (budget.revokedAt)
            return { allowed: false, reasons: [`Budget ${budget.budgetId} revoked at ${budget.revokedAt}.`], obligations: [] };
        const consumed = {
            executionUnits: input.costProfile.executionUnits,
            computeUnits: input.costProfile.computeUnits,
            escalationUnits: input.costProfile.escalationUnits ?? 0,
            memoryGrowthMb: input.costProfile.memoryGrowthMb ?? 0,
            delegationUnits: input.costProfile.delegationUnits ?? 0
        };
        const policy = this.policies.get(input.scopeId);
        const reasons = [];
        const obligations = [];
        const next = {
            executionUnits: (budget.consumed?.executionUnits ?? 0) + consumed.executionUnits,
            computeUnits: (budget.consumed?.computeUnits ?? 0) + consumed.computeUnits,
            escalationUnits: (budget.consumed?.escalationUnits ?? 0) + consumed.escalationUnits,
            memoryGrowthMb: (budget.consumed?.memoryGrowthMb ?? 0) + consumed.memoryGrowthMb,
            delegationUnits: (budget.consumed?.delegationUnits ?? 0) + consumed.delegationUnits
        };
        const exhausted = next.executionUnits > budget.executionUnits || next.computeUnits > budget.computeUnits || next.escalationUnits > budget.escalationUnits || next.memoryGrowthMb > budget.memoryGrowthMb || next.delegationUnits > budget.delegationUnits;
        if (exhausted)
            reasons.push(`Budget ${budget.budgetId} exhausted by requested execution.`);
        if (policy) {
            if (next.executionUnits > policy.executionCeiling)
                reasons.push(`Scope ${input.scopeId} exceeds execution ceiling ${policy.executionCeiling}.`);
            if (next.escalationUnits > policy.escalationLimit)
                reasons.push(`Scope ${input.scopeId} exceeds escalation limit ${policy.escalationLimit}.`);
            const threshold = (policy.exhaustionThresholdPercent / 100) * budget.executionUnits;
            if (next.executionUnits >= threshold) {
                obligations.push(this.createObligation(input, "budget-warning", `Execution consumption reached ${next.executionUnits}/${budget.executionUnits} (${policy.exhaustionThresholdPercent}% threshold).`));
            }
        }
        if (consumed.escalationUnits > 0)
            obligations.push(this.createObligation(input, "escalation-cost", `Escalation cost recorded: ${consumed.escalationUnits} units.`));
        if (consumed.memoryGrowthMb > 0)
            obligations.push(this.createObligation(input, "memory-growth", `Memory growth recorded: ${consumed.memoryGrowthMb} MB.`));
        if (input.delegatedGrantId)
            obligations.push(this.createObligation(input, "delegation-cost", `Delegated execution consumed against grant ${input.delegatedGrantId}.`));
        if (input.delegatedGrantId) {
            const grant = this.grants.get(input.delegatedGrantId);
            if (!grant || grant.revokedAt)
                reasons.push(`Delegated resource grant ${input.delegatedGrantId} is unavailable.`);
            if (grant && (consumed.executionUnits > grant.maxExecutionUnits || consumed.computeUnits > grant.maxComputeUnits || consumed.escalationUnits > grant.maxEscalationUnits || consumed.memoryGrowthMb > grant.maxMemoryGrowthMb)) {
                reasons.push(`Execution exceeds delegated resource ceilings for grant ${input.delegatedGrantId}.`);
            }
        }
        const allowed = reasons.length === 0;
        if (!allowed)
            return { allowed, reasons, obligations };
        budget.consumed = next;
        const lineageEntry = {
            entryId: `${input.actionId}:resource-lineage`,
            actionId: input.actionId,
            namespacePath: input.namespacePath,
            actorId: input.actor.actorId,
            budgetId: budget.budgetId,
            delegatedGrantId: input.delegatedGrantId,
            parentEntryId: input.parentEntryId,
            costProfileId: input.costProfile.costProfileId,
            consumed,
            obligations,
            timestamp: input.timestamp ?? new Date().toISOString()
        };
        this.lineage.push(lineageEntry);
        return { allowed, reasons, obligations, lineageEntry };
    }
    exportResourceContinuity() {
        return {
            budgets: Array.from(this.budgetState.values()),
            delegatedGrants: Array.from(this.grants.values()),
            policies: Array.from(this.policies.values()),
            lineage: [...this.lineage]
        };
    }
    emergencyFreezeBudget(budgetId, revokedAt = new Date().toISOString()) {
        const budget = this.budgetState.get(budgetId);
        if (!budget)
            return false;
        budget.revokedAt = revokedAt;
        return true;
    }
    createObligation(input, obligationType, detail) {
        return {
            obligationId: `${input.actionId}:${obligationType}`,
            obligationType,
            actorId: input.actor.actorId,
            scopeId: input.scopeId,
            status: "pending",
            detail,
            issuedAt: input.timestamp ?? new Date().toISOString()
        };
    }
}
exports.ResourceAccountingRuntime = ResourceAccountingRuntime;
const clampScore = (score) => Math.max(0, Math.min(100, Math.round(score)));
const average = (values) => values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
const itemConfidence = (item) => item.confidence === undefined ? 65 : clampScore(item.confidence);
const evidenceRefs = (items) => Array.from(new Set(items.flatMap((item) => item.evidenceSourceRefs)));
const itemRefs = (items) => items.map((item) => item.id);
const trace = (items) => ({ discoveryItemRefs: itemRefs(items), evidenceSourceRefs: evidenceRefs(items), confidence: clampScore(average(items.map(itemConfidence))) });
const hasItems = (items) => Array.isArray(items) && items.length > 0;
function defaultBriefId(projectId, discoveryVersion, briefVersion) {
    return `${projectId}:discovery-${discoveryVersion}:brief-${briefVersion}`;
}
function pressureFromCount(count, breakpoints) {
    const sorted = [...breakpoints].sort((a, b) => a[0] - b[0]);
    for (let index = 0; index < sorted.length; index += 1) {
        const [limit, score] = sorted[index];
        if (count <= limit)
            return score;
    }
    return sorted[sorted.length - 1]?.[1] ?? 0;
}
function deriveStakeholderPressure(discovery) {
    const stakeholders = discovery.stakeholders ?? [];
    const externalCount = stakeholders.filter((item) => item.external).length;
    const approvalCount = discovery.approvals?.length ?? 0;
    return clampScore(pressureFromCount(stakeholders.length, [[0, 80], [3, 20], [8, 45], [15, 75], [40, 95]]) + externalCount * 5 + approvalCount * 4);
}
function deriveDependencyPressure(discovery) {
    const dependencies = discovery.dependencies ?? [];
    const externalCount = dependencies.filter((item) => item.external).length;
    const criticalCount = dependencies.filter((item) => item.severity === "critical" || item.severity === "high").length;
    return clampScore(pressureFromCount(dependencies.length, [[0, 10], [2, 30], [5, 55], [10, 80], [25, 95]]) + externalCount * 8 + criticalCount * 10);
}
function deriveRiskPressure(discovery) {
    const risks = discovery.risks ?? [];
    const severityWeight = risks.reduce((sum, risk) => sum + ({ low: 4, medium: 8, high: 16, critical: 24 }[risk.severity ?? "medium"]), 0);
    const confidenceFactor = average(risks.map(itemConfidence)) / 100;
    return clampScore(pressureFromCount(risks.length, [[0, 5], [2, 25], [5, 50], [10, 75], [20, 90]]) + severityWeight * Math.max(0.5, confidenceFactor));
}
function deriveUnknownPressure(discovery) {
    const unknowns = discovery.unknowns ?? [];
    const missingAcceptance = hasItems(discovery.acceptanceCriteria) ? 0 : 18;
    const missingSupport = hasItems(discovery.operationalSupport) ? 0 : 14;
    const missingSponsor = discovery.governanceRoles?.some((role) => /sponsor/i.test(role.label)) ? 0 : 18;
    return clampScore(pressureFromCount(unknowns.length, [[0, 5], [2, 25], [5, 50], [10, 75], [20, 90]]) + missingAcceptance + missingSupport + missingSponsor);
}
function deriveComplexity(discovery, stakeholderPressure, dependencyPressure, riskPressure) {
    const coordinationSignals = (discovery.stakeholders?.length ?? 0) + (discovery.dependencies?.length ?? 0) + (discovery.approvals?.length ?? 0) + (discovery.technology?.length ?? 0);
    const score = clampScore((stakeholderPressure * 0.35) + (dependencyPressure * 0.3) + (riskPressure * 0.2) + Math.min(100, coordinationSignals * 4) * 0.15);
    if (score >= 85)
        return "Very High";
    if (score >= 65)
        return "High";
    if (score >= 30)
        return "Medium";
    return "Low";
}
function deriveHealth(dependencyPressure, riskPressure, unknownPressure, discovery) {
    const missingCriticalOwnership = !discovery.governanceRoles?.some((role) => /sponsor|owner|lead/i.test(role.label));
    const blockedRisk = discovery.risks?.some((risk) => risk.status === "blocked" || risk.severity === "critical") ?? false;
    if (unknownPressure >= 75 || riskPressure >= 80 || dependencyPressure >= 85 || (missingCriticalOwnership && unknownPressure >= 55) || blockedRisk)
        return "Red";
    if (unknownPressure >= 35 || riskPressure >= 35 || dependencyPressure >= 35 || missingCriticalOwnership)
        return "Yellow";
    return "Green";
}
function deriveConfidence(discovery) {
    const evidenceVolumeScore = pressureFromCount(discovery.evidenceSources.length, [[0, 20], [2, 35], [5, 60], [12, 82], [30, 95]]);
    const traceability = discovery.traceabilityCoverage ?? (evidenceRefs(allItems(discovery)).length > 0 ? 70 : 20);
    const inferredQuality = average(allItems(discovery).map(itemConfidence)) || 35;
    const quality = discovery.discoveryQuality ?? inferredQuality;
    const completenessSignals = [discovery.stakeholders, discovery.deliverables, discovery.dependencies, discovery.risks, discovery.unknowns].filter(hasItems).length;
    return clampScore(evidenceVolumeScore * 0.3 + traceability * 0.3 + quality * 0.25 + (completenessSignals / 5) * 100 * 0.15);
}
function allItems(discovery) {
    return [discovery.stakeholders, discovery.deliverables, discovery.milestones, discovery.dependencies, discovery.risks, discovery.assumptions, discovery.unknowns, discovery.approvals, discovery.governanceRoles, discovery.acceptanceCriteria, discovery.operationalSupport, discovery.technology].flatMap((items) => items ?? []);
}
function findingFromItem(item, severity, description) {
    return { title: item.label, description, severity, ...trace([item]) };
}
function fallbackTrace(discovery) {
    const fallbackRef = `project_discovery:${discovery.discoveryVersion}`;
    return {
        discoveryItemRefs: [fallbackRef],
        evidenceSourceRefs: discovery.evidenceSources.map((source) => source.evidenceSourceId).slice(0, 3),
        confidence: clampScore(discovery.discoveryQuality ?? 35)
    };
}
function firstAvailableTrace(discovery) {
    const firstItem = allItems(discovery).slice(0, 1);
    return hasItems(firstItem) ? trace(firstItem) : fallbackTrace(discovery);
}
function buildCriticalFindings(discovery) {
    return [
        ...(discovery.dependencies ?? []).filter((item) => item.severity === "critical" || /critical|licens|regulat|vendor|customer approval/i.test(`${item.label} ${item.description ?? ""}`)).map((item) => findingFromItem(item, "critical", `${item.label} is an execution dependency requiring active governance control.`)),
        ...(discovery.risks ?? []).filter((item) => item.severity === "critical" || item.status === "blocked").map((item) => findingFromItem(item, "critical", `${item.label} is a high-severity project risk in the discovery evidence.`)),
        ...(discovery.unknowns ?? []).filter((item) => /acceptance|sponsor|support|deployment|go-live|approval/i.test(`${item.label} ${item.description ?? ""}`)).map((item) => findingFromItem(item, "critical", `${item.label} remains unresolved and affects governance readiness.`))
    ].slice(0, 5);
}
function buildPositiveSignals(discovery) {
    const signals = [];
    if (hasItems(discovery.governanceRoles))
        signals.push({ title: "Governance roles identified", description: "Discovery contains named governance ownership or decision roles.", severity: "positive", ...trace(discovery.governanceRoles) });
    if (hasItems(discovery.deliverables))
        signals.push({ title: "Deliverables documented", description: "Discovery contains structured delivery outputs for execution planning.", severity: "positive", ...trace(discovery.deliverables) });
    if (hasItems(discovery.milestones))
        signals.push({ title: "Milestones documented", description: "Discovery contains milestone evidence that can anchor execution cadence.", severity: "positive", ...trace(discovery.milestones) });
    if (hasItems(discovery.dependencies))
        signals.push({ title: "Dependencies documented", description: "Execution dependencies are visible rather than implicit.", severity: "positive", ...trace(discovery.dependencies) });
    if (hasItems(discovery.acceptanceCriteria))
        signals.push({ title: "Acceptance criteria detected", description: "Acceptance criteria were found in available discovery evidence.", severity: "positive", ...trace(discovery.acceptanceCriteria) });
    return signals.slice(0, 5);
}
function buildConcerns(discovery) {
    const concerns = [];
    if (!discovery.governanceRoles?.some((role) => /sponsor/i.test(role.label)))
        concerns.push({ title: "Project sponsor not detected", description: "Discovery did not identify a project sponsor, creating an ownership concern.", severity: "concern", ...(hasItems(discovery.governanceRoles) ? trace(discovery.governanceRoles) : fallbackTrace(discovery)) });
    if (!hasItems(discovery.acceptanceCriteria))
        concerns.push({ title: "Acceptance criteria not detected", description: "Discovery did not locate acceptance criteria in available evidence.", severity: "concern", ...firstAvailableTrace(discovery) });
    if (!hasItems(discovery.operationalSupport))
        concerns.push({ title: "Operational support model undefined", description: "Discovery did not locate post-deployment support ownership or transition details.", severity: "concern", ...firstAvailableTrace(discovery) });
    concerns.push(...(discovery.unknowns ?? []).slice(0, 4).map((item) => findingFromItem(item, "concern", `${item.label} is unresolved in project discovery.`)));
    concerns.push(...(discovery.dependencies ?? []).filter((item) => item.external).slice(0, 3).map((item) => findingFromItem(item, "concern", `${item.label} relies on an external party or factor.`)));
    return concerns.slice(0, 7);
}
function buildRecommendedActions(discovery, concerns, criticalFindings) {
    const actions = [];
    const addAction = (action, rationale, priority, source) => {
        if (!actions.some((existing) => existing.action === action))
            actions.push({ action, rationale, priority, ...source });
    };
    criticalFindings.forEach((finding) => addAction(`Resolve governance path for ${finding.title}.`, finding.description, "urgent", finding));
    if (!discovery.governanceRoles?.some((role) => /sponsor/i.test(role.label)))
        addAction("Validate project sponsor ownership.", "Sponsor ownership was not detected in discovery evidence.", "high", firstAvailableTrace(discovery));
    if (!hasItems(discovery.acceptanceCriteria))
        addAction("Confirm acceptance criteria and acceptance owner.", "Acceptance criteria were not detected in discovery evidence.", "high", firstAvailableTrace(discovery));
    if (!hasItems(discovery.operationalSupport))
        addAction("Define support transition plan.", "Operational support ownership was not detected in discovery evidence.", "medium", firstAvailableTrace(discovery));
    (discovery.dependencies ?? []).filter((item) => item.external).slice(0, 2).forEach((item) => addAction(`Confirm ${item.label} schedule and owner.`, `${item.label} is an external dependency in discovery evidence.`, item.severity === "critical" ? "urgent" : "high", trace([item])));
    concerns.slice(0, 2).forEach((concern) => addAction(`Close concern: ${concern.title}.`, concern.description, "medium", concern));
    if (actions.length < 3 && hasItems(discovery.stakeholders))
        addAction("Confirm stakeholder decision cadence.", "Stakeholders were identified and should have an explicit governance cadence.", "medium", trace(discovery.stakeholders));
    if (actions.length < 3 && hasItems(discovery.deliverables))
        addAction("Validate ownership for documented deliverables.", "Deliverables were detected and should have accountable owners before execution proceeds.", "medium", trace(discovery.deliverables));
    if (actions.length < 3 && hasItems(discovery.milestones))
        addAction("Confirm milestone acceptance gates.", "Milestones were detected and should be tied to acceptance or governance checkpoints.", "medium", trace(discovery.milestones));
    if (actions.length < 3)
        addAction("Review discovery evidence with the project manager.", "Available discovery evidence should be validated before relying on the bootstrap governance assessment.", "medium", fallbackTrace(discovery));
    return actions.slice(0, 7);
}
function buildSummary(brief) {
    const concernText = brief.concernsJson.slice(0, 2).map((concern) => concern.title.toLowerCase()).join(" and ");
    const positiveText = brief.positiveSignalsJson.slice(0, 2).map((signal) => signal.title.toLowerCase()).join(" and ");
    const pressureText = `Stakeholder, dependency, risk, and unknown pressure scores are ${brief.stakeholderPressureScore}, ${brief.dependencyPressureScore}, ${brief.riskPressureScore}, and ${brief.unknownPressureScore}.`;
    const base = `Current governance readiness is assessed as ${brief.executionHealth} with ${brief.executionComplexity} execution complexity and ${brief.confidenceScore}% confidence. ${positiveText ? `Positive signals include ${positiveText}. ` : ""}${concernText ? `Primary concerns include ${concernText}. ` : ""}${pressureText} Recommended action should focus on the traceable gaps and dependencies identified in discovery evidence.`;
    return base.split(/\s+/).slice(0, 250).join(" ");
}
class BootstrapGovernanceBriefEngine {
    constructor(logger) {
        this.logger = logger;
    }
    generate(discovery, options = {}) {
        const startedAt = Date.now();
        const briefVersion = (options.latestBriefVersion ?? 0) + 1;
        this.logger?.log({ event: "Governance Brief Started", projectId: discovery.projectId, workspaceId: discovery.workspaceId, discoveryVersion: discovery.discoveryVersion, briefVersion });
        try {
            const now = options.now ?? new Date().toISOString();
            const stakeholderPressureScore = deriveStakeholderPressure(discovery);
            const dependencyPressureScore = deriveDependencyPressure(discovery);
            const riskPressureScore = deriveRiskPressure(discovery);
            const unknownPressureScore = deriveUnknownPressure(discovery);
            const executionComplexity = deriveComplexity(discovery, stakeholderPressureScore, dependencyPressureScore, riskPressureScore);
            const executionHealth = deriveHealth(dependencyPressureScore, riskPressureScore, unknownPressureScore, discovery);
            const confidenceScore = deriveConfidence(discovery);
            const criticalFindingsJson = buildCriticalFindings(discovery);
            const positiveSignalsJson = buildPositiveSignals(discovery);
            const concernsJson = buildConcerns(discovery);
            const recommendedActionsJson = buildRecommendedActions(discovery, concernsJson, criticalFindingsJson);
            const briefWithoutSummary = {
                id: options.idFactory?.() ?? defaultBriefId(discovery.projectId, discovery.discoveryVersion, briefVersion),
                projectId: discovery.projectId,
                workspaceId: discovery.workspaceId,
                discoveryVersion: discovery.discoveryVersion,
                briefVersion,
                executionHealth,
                executionComplexity,
                confidenceScore,
                stakeholderPressureScore,
                dependencyPressureScore,
                riskPressureScore,
                unknownPressureScore,
                recommendedActionsJson,
                criticalFindingsJson,
                positiveSignalsJson,
                concernsJson,
                generatedAt: now,
                createdAt: now,
                updatedAt: now
            };
            const brief = { ...briefWithoutSummary, governanceSummary: buildSummary(briefWithoutSummary) };
            this.logger?.log({ event: "Governance Brief Completed", projectId: discovery.projectId, workspaceId: discovery.workspaceId, discoveryVersion: discovery.discoveryVersion, briefVersion, health: executionHealth, confidence: confidenceScore, durationMs: Date.now() - startedAt });
            return brief;
        }
        catch (error) {
            this.logger?.log({ event: "Governance Brief Failed", projectId: discovery.projectId, workspaceId: discovery.workspaceId, discoveryVersion: discovery.discoveryVersion, briefVersion, durationMs: Date.now() - startedAt, error: error instanceof Error ? error.message : String(error) });
            throw error;
        }
    }
}
exports.BootstrapGovernanceBriefEngine = BootstrapGovernanceBriefEngine;
class InMemoryProjectBootstrapBriefRepository {
    constructor() {
        this.briefs = [];
    }
    async save(brief) {
        if (this.briefs.some((existing) => existing.workspaceId === brief.workspaceId && existing.projectId === brief.projectId && existing.briefVersion === brief.briefVersion)) {
            throw new Error(`Brief version ${brief.briefVersion} already exists for project ${brief.projectId} in workspace ${brief.workspaceId}.`);
        }
        this.briefs.push(brief);
    }
    async latest(projectId, workspaceId) {
        return this.briefs.filter((brief) => brief.projectId === projectId && brief.workspaceId === workspaceId).sort((a, b) => b.briefVersion - a.briefVersion)[0];
    }
    async history(projectId, workspaceId) {
        return this.briefs.filter((brief) => brief.projectId === projectId && brief.workspaceId === workspaceId).sort((a, b) => a.briefVersion - b.briefVersion);
    }
}
exports.InMemoryProjectBootstrapBriefRepository = InMemoryProjectBootstrapBriefRepository;
async function getProjectBootstrapBrief(repository, authorization, request) {
    const allowed = await authorization.canReadProject(request.projectId, request.workspaceId, request.actorId);
    if (!allowed)
        return { status: 403, error: "Project read access is required." };
    const brief = await repository.latest(request.projectId, request.workspaceId);
    if (!brief)
        return { status: 404, error: "Project bootstrap brief was not found." };
    return { status: 200, brief };
}
function toGovernanceSnapshotCard(brief) {
    return {
        health: brief.executionHealth,
        complexity: brief.executionComplexity,
        confidence: brief.confidenceScore,
        topConcerns: brief.concernsJson.slice(0, 3),
        topActions: brief.recommendedActionsJson.slice(0, 3),
        lastGenerated: brief.generatedAt
    };
}
async function generateAndStoreProjectBootstrapBrief(repository, engine, discovery, options = {}) {
    const latest = await repository.latest(discovery.projectId, discovery.workspaceId);
    const brief = engine.generate(discovery, { ...options, latestBriefVersion: latest?.briefVersion ?? 0 });
    await repository.save(brief);
    return brief;
}
