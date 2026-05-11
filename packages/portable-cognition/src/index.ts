import { AuditContinuity, CognitionTopology, GovernanceSnapshot, PortableCognitionPackage } from "@aoc-runtime/shared-types";

export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePortablePackage(pkg: PortableCognitionPackage): ImportValidationResult {
  const errors: string[] = [];
  if (!pkg.packageId) errors.push("missing_package_id");
  if (!pkg.sourceOrganizationId) errors.push("missing_source_organization_id");
  if (!pkg.topology.namespaces.length) errors.push("empty_topology");
  return { valid: errors.length === 0, errors };
}

export type ExportPackageModel = PortableCognitionPackage;
export type TopologyModel = CognitionTopology;
export type GovernanceSnapshotModel = GovernanceSnapshot;
export type AuditContinuityModel = AuditContinuity;
