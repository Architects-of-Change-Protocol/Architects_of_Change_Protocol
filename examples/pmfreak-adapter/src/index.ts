import { GovernanceRuntime } from "@aoc-runtime/governance-runtime";
import { CapabilityRuntime } from "@aoc-runtime/capability-runtime";
import { AuditProvider, CapabilityProvider, PolicyProvider } from "@aoc-runtime/provider-interfaces";
import { ActorRef, AuditEvent, GovernanceScope, NamespaceRef } from "@aoc-runtime/shared-types";

export interface SupabaseProviderBundle {
  capabilities: CapabilityProvider;
  policies: PolicyProvider;
  audit: AuditProvider;
}

export class PMFreakAocAdapter {
  private readonly governance: GovernanceRuntime;
  private readonly capability: CapabilityRuntime;

  constructor(private readonly providers: SupabaseProviderBundle) {
    this.governance = new GovernanceRuntime(providers.policies);
    this.capability = new CapabilityRuntime(providers.capabilities);
  }

  async evaluateAction(input: {
    actor: ActorRef;
    namespace: NamespaceRef;
    scope: GovernanceScope;
    action: string;
    resource: string;
  }): Promise<boolean> {
    const policyAllowed = await this.governance.evaluatePolicy(input, `action:${input.action}`);
    if (!policyAllowed) return false;
    const capabilityDecision = await this.capability.evaluate(input);
    return capabilityDecision.allowed;
  }

  async writeAudit(event: AuditEvent): Promise<void> {
    await this.providers.audit.append(event);
  }
}
