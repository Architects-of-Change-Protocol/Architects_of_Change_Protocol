/**
 * Compatibility facade.
 * Canonical semantic ownership lives in:
 * @aoc/protocol/contracts
 */
export type {
  CanonicalId,
  UtcDateTime,
  ResourceRef,
  Constraint,
  ProofMetadata,
  CapabilityToken,
  CapabilityGrant,
  Delegation as DelegationMetadata,
} from '@aoc/protocol/contracts';

/**
 * Package-specific compatibility extension that can be composed with CapabilityToken.
 */
export interface CapabilityTokenExtensions {
  readonly attenuationOf?: string;
  readonly attenuationPath?: readonly string[];
  readonly extensions?: Readonly<Record<string, unknown>>;
}

export const capabilityTokenSchemaExample = {
  $id: 'https://aoc.protocol/schemas/capability-token/1-0-0',
  type: 'object',
  additionalProperties: false,
  required: ['schemaVersion', 'tokenId', 'issuer', 'subject', 'resource', 'scope', 'expiresAt', 'proof'],
  properties: {
    schemaVersion: { const: '1.0.0' },
    tokenId: { type: 'string' },
    scope: { type: 'array', items: { type: 'string', minLength: 3 } },
    constraints: { type: 'array', items: { type: 'object' } },
    attenuationOf: { type: 'string' },
  },
} as const;
