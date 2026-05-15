import { CapabilityRef, ConsentGrant, ConsentDecisionReason, ContractEvaluationEnvelope, GovernanceSignature, SignedConsentGrant } from "@aoc-runtime/shared-types";
import { ConsentProvider } from "@aoc-runtime/provider-interfaces";
export interface ConsentQuery {
    actorId: string;
    capability: CapabilityRef;
    at?: string;
    machineActorId?: string;
}
export interface ConsentDecision extends ContractEvaluationEnvelope<ConsentDecisionReason> {
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
    signGrant(grant: ConsentGrant, privateKey: string, signer: GovernanceSignature["signer"], runtimeSource: string): SignedConsentGrant<ConsentGrant>;
    verifySignedGrant(signedGrant: SignedConsentGrant<ConsentGrant>): boolean;
}
//# sourceMappingURL=index.d.ts.map