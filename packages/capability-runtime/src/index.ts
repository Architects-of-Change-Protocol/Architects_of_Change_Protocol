import { ActorRef, CapabilityRef, NamespaceRef } from "@aoc-runtime/shared-types";
import { CapabilityProvider } from "@aoc-runtime/provider-interfaces";

export interface CapabilityEvaluationInput {
  actor: ActorRef;
  namespace: NamespaceRef;
  action: string;
  resource: string;
  now?: string;
}

export type CapabilityDecisionReason =
  | "allowed"
  | "denied"
  | "missing_capability"
  | "expired_capability";

export interface CapabilityDecision {
  allowed: boolean;
  reason: CapabilityDecisionReason;
  matchedCapability?: CapabilityRef;
  inheritedFromNamespace?: string;
  reasons: string[];
}

export class CapabilityRuntime {
  constructor(private readonly provider: CapabilityProvider) {}

  private namespacePathIncludes(input: NamespaceRef, scope: NamespaceRef): boolean {
    return input.organizationId === scope.organizationId && input.path.startsWith(scope.path);
  }

  async evaluate(input: CapabilityEvaluationInput): Promise<CapabilityDecision> {
    const capabilities = await this.provider.resolve(input.actor, input.namespace);
    const nowIso = input.now ?? new Date().toISOString();

    const matched = capabilities.find((c) => {
      const expiresAt = (c as CapabilityRef & { expiresAt?: string }).expiresAt;
      if (expiresAt && expiresAt <= nowIso) return false;
      return c.action === input.action && c.resource === input.resource && this.namespacePathIncludes(input.namespace, c.scope);
    });

    if (!matched) {
      const existsButExpired = capabilities.some((c) => {
        const expiresAt = (c as CapabilityRef & { expiresAt?: string }).expiresAt;
        return Boolean(
          c.action === input.action &&
            c.resource === input.resource &&
            this.namespacePathIncludes(input.namespace, c.scope) &&
            expiresAt &&
            expiresAt <= nowIso
        );
      });

      if (existsButExpired) {
        return {
          allowed: false,
          reason: "expired_capability",
          reasons: ["Matching capability exists but is expired at evaluation time."]
        };
      }

      return { allowed: false, reason: "missing_capability", reasons: ["No matching capability grant."] };
    }

    return {
      allowed: true,
      matchedCapability: matched,
      reason: "allowed",
      inheritedFromNamespace: matched.scope.path !== input.namespace.path ? matched.scope.path : undefined,
      reasons: ["Capability grant matched action/resource and namespace restrictions."]
    };
  }
}
