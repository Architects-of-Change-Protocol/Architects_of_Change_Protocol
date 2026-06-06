import { GovernanceSignature, RuntimeFederation, RuntimeTrustEdge, TrustBoundaryScope } from "@aoc-runtime/shared-types";

export interface TrustedSignerRecord {
  signerKeyId: string;
  runtimeId: string;
  organizationId: string;
  scopes: TrustBoundaryScope[];
  delegatedFromKeyId?: string;
  registeredAt: string;
  expiresAt?: string;
  revokedAt?: string;
}

export interface FederatedTrustEvaluation {
  trusted: boolean;
  trustedAuthorityPath: string[];
  rejectedAuthorityPath: string[];
  revokedIntermediaries: string[];
  trustScopeReasoning: string[];
  federationBoundaryReasoning: string[];
}

export class TrustRegistryRuntime {
  private readonly signers = new Map<string, TrustedSignerRecord>();

  constructor(private readonly federation: RuntimeFederation) {}

  registerSigner(record: TrustedSignerRecord): void { this.signers.set(record.signerKeyId, record); }
  revokeSigner(signerKeyId: string, revokedAt = new Date().toISOString()): void {
    const existing = this.signers.get(signerKeyId);
    if (existing) this.signers.set(signerKeyId, { ...existing, revokedAt });
  }

  evaluateSignatureTrust(signature: GovernanceSignature, scope?: TrustBoundaryScope, at = new Date().toISOString()): FederatedTrustEvaluation {
    const signer = this.signers.get(signature.keyId);
    const reasons: string[] = [];
    const boundary: string[] = [];
    const rejected: string[] = [];
    const revoked: string[] = [];
    if (!signer) return { trusted: false, trustedAuthorityPath: [], rejectedAuthorityPath: [signature.keyId], revokedIntermediaries: [], trustScopeReasoning: ["Signer not registered."], federationBoundaryReasoning: [] };
    if (signer.revokedAt && signer.revokedAt <= at) { revoked.push(signer.signerKeyId); rejected.push(signer.signerKeyId); reasons.push("Signer revoked."); }
    if (signer.expiresAt && signer.expiresAt < at) { rejected.push(signer.signerKeyId); reasons.push("Signer expired."); }
    if (scope && !this.scopeAllowed(signer.scopes, scope)) { rejected.push(signer.signerKeyId); reasons.push("Signer scope mismatch."); }

    const chain = this.resolveTrustChain(signature.signer.runtimeId, at);
    if (!chain.valid) {
      rejected.push(...chain.path);
      revoked.push(...chain.revokedIntermediaries);
      reasons.push(...chain.reasons);
    } else {
      boundary.push(`Federation ${this.federation.federationId} trust path accepted.`);
    }

    const trusted = rejected.length === 0 && revoked.length === 0;
    return { trusted, trustedAuthorityPath: trusted ? chain.path : [], rejectedAuthorityPath: [...new Set(rejected)], revokedIntermediaries: [...new Set(revoked)], trustScopeReasoning: reasons, federationBoundaryReasoning: boundary };
  }

  private resolveTrustChain(targetRuntimeId: string, at: string): { valid: boolean; path: string[]; revokedIntermediaries: string[]; reasons: string[] } {
    const roots = this.federation.nodes.filter((n) => !n.revokedAt && (!n.activeUntil || n.activeUntil >= at));
    const queue: Array<{ runtimeId: string; path: string[] }> = roots.map((r) => ({ runtimeId: r.runtimeId, path: [r.runtimeId] }));
    const visited = new Set<string>();
    const revokedIntermediaries: string[] = [];
    while (queue.length) {
      const cur = queue.shift()!;
      if (cur.runtimeId === targetRuntimeId) return { valid: true, path: cur.path, revokedIntermediaries, reasons: [] };
      if (visited.has(cur.runtimeId)) continue;
      visited.add(cur.runtimeId);
      for (const edge of this.federation.edges.filter((e) => e.fromRuntimeId === cur.runtimeId)) {
        if (!this.edgeActive(edge, at)) { if (edge.revokedAt) revokedIntermediaries.push(edge.edgeId); continue; }
        queue.push({ runtimeId: edge.toRuntimeId, path: [...cur.path, edge.toRuntimeId] });
      }
    }
    return { valid: false, path: [], revokedIntermediaries, reasons: ["No active federated trust path to runtime."] };
  }

  private edgeActive(edge: RuntimeTrustEdge, at: string): boolean {
    if (edge.revokedAt && edge.revokedAt <= at) return false;
    if (edge.expiresAt && edge.expiresAt < at) return false;
    return edge.issuedAt <= at;
  }

  private scopeAllowed(allowed: TrustBoundaryScope[], requested: TrustBoundaryScope): boolean {
    return allowed.some((scope) => scope.type === requested.type
      && (scope.organizationId === undefined || scope.organizationId === requested.organizationId)
      && (scope.workspaceId === undefined || scope.workspaceId === requested.workspaceId)
      && (scope.namespacePath === undefined || scope.namespacePath === requested.namespacePath)
      && (scope.machineId === undefined || scope.machineId === requested.machineId));
  }
}
