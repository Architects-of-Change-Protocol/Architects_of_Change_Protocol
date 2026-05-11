import { ActorRef, AuditEvent, NamespaceRef } from "@aoc-runtime/shared-types";

export interface DecisionExplanation {
  decisionId: string;
  outcome: "allow" | "deny";
  evaluatedPolicies: string[];
  evaluatedCapabilities: string[];
  reason: string;
}

export interface GovernanceProvenance {
  scopeId: string;
  policyVersion: string;
  actor: ActorRef;
  namespace: NamespaceRef;
}

export interface Attribution {
  initiatingActor: ActorRef;
  effectiveActor: ActorRef;
}

export interface AuditContract {
  event: AuditEvent;
  attribution: Attribution;
  explanation?: DecisionExplanation;
  provenance?: GovernanceProvenance;
}
