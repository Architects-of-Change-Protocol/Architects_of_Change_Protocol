export type CanonicalId = string;
export type UtcDateTime = string;

export interface ResourceRef {
  readonly kind: string;
  readonly id: CanonicalId;
  readonly tenantId?: CanonicalId;
  readonly attributes?: Readonly<Record<string, string>>;
}

export interface DelegationMetadata {
  readonly delegator: CanonicalId;
  readonly chainDepth: number;
  readonly maxDepth: number;
  readonly allowedReDelegation: boolean;
}

export interface Constraint {
  readonly name: string;
  readonly operator: 'eq' | 'in' | 'lt' | 'lte' | 'gt' | 'gte' | 'regex';
  readonly value: string | number | boolean | readonly string[];
}

export interface ProofMetadata {
  readonly proofType: 'jwt' | 'mTLS' | 'detached-signature' | 'custom';
  readonly proofRef?: string;
  readonly issuedAt: UtcDateTime;
}

export interface CapabilityToken {
  readonly schemaVersion: '1.0.0';
  readonly tokenId: CanonicalId;
  readonly issuer: CanonicalId;
  readonly subject: CanonicalId;
  readonly resource: ResourceRef;
  readonly scope: readonly string[];
  readonly constraints?: readonly Constraint[];
  readonly delegation?: DelegationMetadata;
  readonly expiresAt: UtcDateTime;
  readonly notBefore?: UtcDateTime;
  readonly revocationRefs?: readonly string[];
  readonly proof: ProofMetadata;
  readonly attenuationOf?: CanonicalId;
  readonly attenuationPath?: readonly CanonicalId[];
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
