export type * from './primitives';
export * from './claim-enums';
export * from './references';
export * from './proofs';
export * from './registries';
export type * from './evidence';
export type * from './assertion';
export type * from './claim';
export type * from './attestation';
export type * from './verification';
export type * from './standing';
export type * from './capability';
export type * from './authority';
export type * from './decision';
/**
 * @deprecated Use CanonicalClaim from @aoc/protocol/claims.
 * This legacy minimal shape is retained temporarily for backwards compatibility.
 * It is not RFC-005 canonical.
 */
export interface LegacyClaim {
    readonly type: string;
    readonly value: string | number | boolean;
}
/**
 * @deprecated Use CanonicalClaim from @aoc/protocol/claims.
 * This legacy minimal shape is retained temporarily for backwards compatibility.
 * It is not RFC-005 canonical.
 */
export type Claim = LegacyClaim;
//# sourceMappingURL=index.d.ts.map