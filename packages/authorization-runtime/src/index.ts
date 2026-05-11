import { AuditRuntime } from "@aoc-runtime/audit-runtime";
import { CapabilityRuntime } from "@aoc-runtime/capability-runtime";
import { ConsentRuntime } from "@aoc-runtime/consent-runtime";
import { GovernanceRuntime } from "@aoc-runtime/governance-runtime";
import { ActorRef, GovernanceScope, NamespaceRef } from "@aoc-runtime/shared-types";

export interface AuthorizationInput {
  actor: ActorRef;
  namespace: NamespaceRef;
  scope: GovernanceScope;
  action: string;
  resource: string;
  machineActor?: ActorRef;
  at?: string;
}

export interface AuthorizationDecision {
  decision: "allow" | "deny";
  allowed: boolean;
  failedStage?: "governance" | "capability" | "consent";
  reasoningChain: string[];
  provenance: Record<string, unknown>;
  explainability: Record<string, unknown>;
}

export class AuthorizationRuntime {
  constructor(
    private readonly governance: GovernanceRuntime,
    private readonly capability: CapabilityRuntime,
    private readonly consent: ConsentRuntime,
    private readonly audit: AuditRuntime
  ) {}

  async evaluate(input: AuthorizationInput): Promise<AuthorizationDecision> {
    const governance = await this.governance.evaluate(input, `action:${input.action}`);
    if (!governance.allowed) {
      return this.audit.finalizeDecision({
        decision: "deny", allowed: false, failedStage: "governance", reasoningChain: governance.reasons,
        provenance: { policySource: governance.policySourceIds, inheritedScopeChain: governance.inheritedScopeChain },
        explainability: { governance }
      });
    }

    const capability = await this.capability.evaluate(input);
    if (!capability.allowed || !capability.matchedCapability) {
      return this.audit.finalizeDecision({
        decision: "deny", allowed: false, failedStage: "capability", reasoningChain: capability.reasons,
        provenance: { capabilitySource: capability.matchedCapability?.capabilityId, inheritedCapabilitySource: capability.inheritedFromNamespace },
        explainability: { governance, capability }
      });
    }

    const consent = await this.consent.evaluate({
      actorId: input.actor.actorId,
      capability: capability.matchedCapability,
      at: input.at,
      machineActorId: input.machineActor?.actorId
    });

    if (!consent.allowed) {
      return this.audit.finalizeDecision({
        decision: "deny", allowed: false, failedStage: "consent", reasoningChain: consent.reasons,
        provenance: { consentSource: consent.grant?.grantId },
        explainability: { governance, capability, consent }
      });
    }

    return this.audit.finalizeDecision({
      decision: "allow", allowed: true,
      reasoningChain: [...governance.reasons, ...capability.reasons, ...consent.reasons],
      provenance: {
        policySource: governance.policySourceIds,
        capabilitySource: capability.matchedCapability.capabilityId,
        consentSource: consent.grant?.grantId,
        inheritedScopeChain: governance.inheritedScopeChain,
        inheritedCapabilitySource: capability.inheritedFromNamespace
      },
      explainability: { governance, capability, consent }
    });
  }
}
