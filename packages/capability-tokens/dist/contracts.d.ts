/**
 * Compatibility facade.
 * Canonical semantic ownership lives in:
 * @aoc/protocol/contracts
 */
export type { CanonicalId, UtcDateTime, ResourceRef, Constraint, ProofMetadata, CapabilityToken, CapabilityGrant, Delegation as DelegationMetadata, } from '@aoc/protocol/contracts';
/**
 * Package-specific compatibility extension that can be composed with CapabilityToken.
 */
export interface CapabilityTokenExtensions {
    readonly attenuationOf?: string;
    readonly attenuationPath?: readonly string[];
    readonly extensions?: Readonly<Record<string, unknown>>;
}
export declare const capabilityTokenSchemaExample: {
    readonly $id: "https://aoc.protocol/schemas/capability-token/1-0-0";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["schemaVersion", "tokenId", "issuer", "subject", "resource", "scope", "expiresAt", "proof"];
    readonly properties: {
        readonly schemaVersion: {
            readonly const: "1.0.0";
        };
        readonly tokenId: {
            readonly type: "string";
        };
        readonly scope: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 3;
            };
        };
        readonly constraints: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly attenuationOf: {
            readonly type: "string";
        };
    };
};
//# sourceMappingURL=contracts.d.ts.map