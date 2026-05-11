import { AuditContinuity, CognitionTopology, GovernanceSnapshot, PortableCognitionIntegrity, PortableCognitionPackage, SignedAuditEvent, SignedAuthorizationDecision, SignedConsentGrant } from "@aoc-runtime/shared-types";
import { stableHash, verifyPayloadSignature } from "../../../crypto";

export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
}

export interface PortableCognitionPackageWithIntegrity extends PortableCognitionPackage {
  integrity?: PortableCognitionIntegrity;
}

export function computePortableIntegrity(pkg: PortableCognitionPackage): PortableCognitionIntegrity {
  const topologyHash = stableHash(pkg.topology);
  const governanceSnapshotHash = stableHash(pkg.governanceSnapshot);
  const auditContinuityHash = stableHash(pkg.auditContinuity);
  const packageHash = stableHash(pkg);
  const provenanceHash = stableHash({ packageId: pkg.packageId, sourceOrganizationId: pkg.sourceOrganizationId, exportedAt: pkg.exportedAt });
  return { packageHash, governanceSnapshotHash, auditContinuityHash, topologyHash, provenanceHash };
}

export function validatePortablePackage(pkg: PortableCognitionPackageWithIntegrity): ImportValidationResult {
  const errors: string[] = [];
  if (!pkg.packageId) errors.push("missing_package_id");
  if (!pkg.sourceOrganizationId) errors.push("missing_source_organization_id");
  if (!pkg.topology.namespaces.length) errors.push("empty_topology");
  if (pkg.integrity) {
    const computed = computePortableIntegrity(pkg);
    if (computed.packageHash !== pkg.integrity.packageHash) errors.push("package_hash_mismatch");
    if (computed.governanceSnapshotHash !== pkg.integrity.governanceSnapshotHash) errors.push("governance_hash_mismatch");
    if (computed.auditContinuityHash !== pkg.integrity.auditContinuityHash) errors.push("audit_hash_mismatch");
    if (computed.topologyHash !== pkg.integrity.topologyHash) errors.push("topology_hash_mismatch");
  }
  return { valid: errors.length === 0, errors };
}

export class IntegrityVerificationRuntime {
  verifyAuthorizationDecision<T>(decision: SignedAuthorizationDecision<T>): boolean {
    return verifyPayloadSignature({ decisionHash: decision.decisionHash, evaluationHash: decision.evaluationHash, decision: decision.decision }, decision.signature);
  }

  verifyConsentGrant<T>(grant: SignedConsentGrant<T>): boolean {
    return verifyPayloadSignature({ grantHash: grant.grantHash, grant: grant.grant }, grant.issuerSignature);
  }

  verifyAuditChain<T>(events: SignedAuditEvent<T>[]): boolean {
    return events.every((event, index) => {
      const previous = index === 0 ? undefined : events[index - 1];
      const previousHash = previous?.eventHash;
      if (event.chainPosition !== index) return false;
      if (event.previousEventHash !== previousHash) return false;
      const computedHash = stableHash({ chainId: event.chainId, chainPosition: event.chainPosition, previousEventHash: event.previousEventHash, event: event.event });
      if (computedHash !== event.eventHash) return false;
      return verifyPayloadSignature({ eventHash: event.eventHash, event: event.event }, event.signature);
    });
  }

  verifyExportIntegrity(pkg: PortableCognitionPackageWithIntegrity): boolean {
    if (!pkg.integrity) return false;
    return validatePortablePackage(pkg).valid;
  }
}

export type ExportPackageModel = PortableCognitionPackage;
export type TopologyModel = CognitionTopology;
export type GovernanceSnapshotModel = GovernanceSnapshot;
export type AuditContinuityModel = AuditContinuity;
