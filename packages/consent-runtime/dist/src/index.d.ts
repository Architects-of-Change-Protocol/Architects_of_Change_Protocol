import { CapabilityRef, ConsentGrant } from "@aoc-runtime/shared-types";
export interface ConsentQuery {
    actorId: string;
    capability: CapabilityRef;
    at?: string;
}
export declare function isGrantActive(grant: ConsentGrant, atIso: string): boolean;
export declare function isDelegatedGrant(grant: ConsentGrant): boolean;
export declare function isMachineConsent(grant: ConsentGrant): boolean;
//# sourceMappingURL=index.d.ts.map