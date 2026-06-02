import type { CanonicalCapabilityId, CanonicalClaimId, CanonicalStandingId } from './primitives';
export interface CanonicalCapability {
    readonly id: CanonicalCapabilityId;
    readonly name: string;
    readonly description?: string;
    readonly claimRefs: readonly CanonicalClaimId[];
    readonly standingRefs: readonly CanonicalStandingId[];
}
//# sourceMappingURL=capability.d.ts.map