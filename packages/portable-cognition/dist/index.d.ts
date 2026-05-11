import { AuditContinuity, CognitionTopology, GovernanceSnapshot, PortableCognitionPackage } from "@aoc-runtime/shared-types";
export interface ImportValidationResult {
    valid: boolean;
    errors: string[];
}
export declare function validatePortablePackage(pkg: PortableCognitionPackage): ImportValidationResult;
export type ExportPackageModel = PortableCognitionPackage;
export type TopologyModel = CognitionTopology;
export type GovernanceSnapshotModel = GovernanceSnapshot;
export type AuditContinuityModel = AuditContinuity;
//# sourceMappingURL=index.d.ts.map