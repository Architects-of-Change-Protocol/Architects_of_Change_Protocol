import { CapabilityRef, ConsentGrant, GovernanceSignature, SignedConsentGrant } from "@aoc-runtime/shared-types";
import { ConsentProvider } from "@aoc-runtime/provider-interfaces";
import { signPayload, stableHash, verifyPayloadSignature } from "../../../crypto";

export interface ConsentQuery {
  actorId: string;
  capability: CapabilityRef;
  at?: string;
  machineActorId?: string;
}

export interface ConsentDecision {
  allowed: boolean;
  reason: "allowed" | "denied" | "no_grant" | "expired" | "revoked";
  grant?: ConsentGrant;
  reasons: string[];
}

export function isGrantActive(grant: ConsentGrant, atIso: string): boolean {
  if (grant.revokedAt && grant.revokedAt <= atIso) return false;
  if (grant.expiresAt && grant.expiresAt <= atIso) return false;
  return grant.issuedAt <= atIso;
}

export function isDelegatedGrant(grant: ConsentGrant): boolean {
  return Boolean(grant.delegateActorId);
}

export function isMachineConsent(grant: ConsentGrant): boolean {
  return grant.subjectActorId.startsWith("machine:") || (grant.delegateActorId?.startsWith("machine:") ?? false);
}

export class ConsentRuntime {
  constructor(private readonly provider: ConsentProvider) {}

  async evaluate(query: ConsentQuery): Promise<ConsentDecision> {
    const at = query.at ?? new Date().toISOString();
    const grants = await this.provider.getActiveGrants(query.actorId, query.capability);
    if (grants.length === 0) return { allowed: false, reason: "no_grant", reasons: ["No consent grants found."] };

    const revoked = grants.find((grant) => grant.revokedAt && grant.revokedAt <= at);
    if (revoked) return { allowed: false, reason: "revoked", grant: revoked, reasons: ["Consent was revoked."] };

    const expired = grants.find((grant) => grant.expiresAt && grant.expiresAt <= at);
    if (expired) return { allowed: false, reason: "expired", grant: expired, reasons: ["Consent is expired."] };

    const active = grants.find((grant) => isGrantActive(grant, at));
    if (!active) return { allowed: false, reason: "denied", reasons: ["No active consent grant at evaluation time."] };

    if (query.machineActorId && !(active.subjectActorId === query.machineActorId || active.delegateActorId === query.machineActorId)) {
      return { allowed: false, reason: "denied", grant: active, reasons: ["Machine consent binding mismatch."] };
    }

    return { allowed: true, reason: "allowed", grant: active, reasons: ["Active consent grant validated."] };
  }

  signGrant(grant: ConsentGrant, privateKey: string, signer: GovernanceSignature["signer"], runtimeSource: string): SignedConsentGrant<ConsentGrant> {
    const grantHash = stableHash(grant);
    const issuerSignature = signPayload({ grantHash, grant }, privateKey, signer, { runtimeSource, timestamp: new Date().toISOString() });
    return { grant, grantHash, issuerSignature };
  }

  verifySignedGrant(signedGrant: SignedConsentGrant<ConsentGrant>): boolean {
    if (stableHash(signedGrant.grant) !== signedGrant.grantHash) return false;
    if (!verifyPayloadSignature({ grantHash: signedGrant.grantHash, grant: signedGrant.grant }, signedGrant.issuerSignature)) return false;
    if (signedGrant.delegatedSignature && !verifyPayloadSignature({ grantHash: signedGrant.grantHash, grant: signedGrant.grant, delegated: true }, signedGrant.delegatedSignature)) return false;
    if (signedGrant.revocationSignature && !verifyPayloadSignature({ grantHash: signedGrant.grantHash, grant: signedGrant.grant, revokedAt: signedGrant.grant.revokedAt }, signedGrant.revocationSignature)) return false;
    return true;
  }
}
