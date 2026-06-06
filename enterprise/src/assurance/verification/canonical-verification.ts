import type {
  AdapterLookupContext,
  VerificationKeyDescriptor,
  VerificationKeyResolver,
  VerificationProvider,
} from '@aoc/protocol/adapters';
import type { CanonicalClaim, CanonicalVerification } from '@aoc/protocol/claims';

export interface ClaimVerificationStrategy {
  verify(
    claim: CanonicalClaim,
    key: VerificationKeyDescriptor | undefined,
    context?: AdapterLookupContext,
  ): boolean | readonly string[] | Promise<boolean | readonly string[]>;
}

export class InMemoryVerificationKeyResolver implements VerificationKeyResolver {
  private readonly keys = new Map<string, VerificationKeyDescriptor>();

  register(key: VerificationKeyDescriptor): void {
    this.keys.set(`${key.issuer}:${key.keyId}`, key);
    this.keys.set(key.issuer, key);
  }

  resolveVerificationKey(issuer: string): VerificationKeyDescriptor | undefined {
    return this.keys.get(issuer);
  }
}

export class EnterpriseVerificationProvider implements VerificationProvider {
  constructor(
    private readonly keyResolver: VerificationKeyResolver,
    private readonly strategy: ClaimVerificationStrategy,
    private readonly verifier: string = 'aoc-enterprise:assurance',
  ) {}

  async verifyClaim(claim: CanonicalClaim, context?: AdapterLookupContext): Promise<CanonicalVerification> {
    const issuer = typeof claim.issuer === 'string' ? claim.issuer : claim.issuer.id;
    const key = await this.keyResolver.resolveVerificationKey(issuer, claim.proofRefs?.[0], context);
    const outcome = await this.strategy.verify(claim, key, context);
    const findings = typeof outcome === 'boolean' ? (outcome ? [] : ['Verification strategy rejected the claim.']) : [...outcome];
    const verifiedAt = (context?.requestedAt ?? new Date().toISOString()) as CanonicalVerification['verifiedAt'];

    return {
      id: `${claim.id}:verification:${verifiedAt}`,
      claimRef: claim.id,
      status: findings.length === 0 ? 'Verified' : 'Failed',
      verifier: this.verifier,
      verifiedAt,
      findings,
      credentialRefs: claim.credentialRefs,
      proofRefs: claim.proofRefs,
      registryRefs: claim.registryRefs,
      semanticRefs: claim.semanticRefs,
      confidence: findings.length === 0 ? 1 : 0,
    };
  }
}
