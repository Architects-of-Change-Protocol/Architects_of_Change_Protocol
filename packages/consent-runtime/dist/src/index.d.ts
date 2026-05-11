import { CapabilityRef, ConsentGrant } from "@aoc-runtime/shared-types";
import { ConsentProvider } from "@aoc-runtime/provider-interfaces";
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
export declare function isGrantActive(grant: ConsentGrant, atIso: string): boolean;
export declare function isDelegatedGrant(grant: ConsentGrant): boolean;
export declare function isMachineConsent(grant: ConsentGrant): boolean;
export declare class ConsentRuntime {
    private readonly provider;
    constructor(provider: ConsentProvider);
    evaluate(query: ConsentQuery): Promise<ConsentDecision>;
}
//# sourceMappingURL=index.d.ts.map