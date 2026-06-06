import type { AdapterLookupContext, VerificationKeyDescriptor, VerificationKeyResolver, VerificationProvider } from '@aoc/protocol/adapters';
import type { CanonicalClaim, CanonicalVerification } from '@aoc/protocol/claims';
export interface ClaimVerificationStrategy {
    verify(claim: CanonicalClaim, key: VerificationKeyDescriptor | undefined, context?: AdapterLookupContext): boolean | readonly string[] | Promise<boolean | readonly string[]>;
}
export declare class InMemoryVerificationKeyResolver implements VerificationKeyResolver {
    private readonly keys;
    register(key: VerificationKeyDescriptor): void;
    resolveVerificationKey(issuer: string): VerificationKeyDescriptor | undefined;
}
export declare class EnterpriseVerificationProvider implements VerificationProvider {
    private readonly keyResolver;
    private readonly strategy;
    private readonly verifier;
    constructor(keyResolver: VerificationKeyResolver, strategy: ClaimVerificationStrategy, verifier?: string);
    verifyClaim(claim: CanonicalClaim, context?: AdapterLookupContext): Promise<CanonicalVerification>;
}
//# sourceMappingURL=canonical-verification.d.ts.map