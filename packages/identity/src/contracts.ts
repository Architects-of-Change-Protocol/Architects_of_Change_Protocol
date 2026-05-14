export type CanonicalId = string;
export type UtcDateTime = string;

export type PrincipalType = 'human' | 'service' | 'agent' | 'workload';

export type ClaimValue = string | number | boolean | string[] | Record<string, unknown>;

export interface Claim {
  readonly name: string;
  readonly value: ClaimValue;
  readonly issuer: CanonicalId;
  readonly issuedAt: UtcDateTime;
  readonly expiresAt?: UtcDateTime;
  readonly confidence?: 'low' | 'medium' | 'high';
}

export interface TrustMetadata {
  readonly assuranceLevel: 'aal1' | 'aal2' | 'aal3' | 'custom';
  readonly verificationMethods: readonly string[];
  readonly trustFrameworks?: readonly string[];
  readonly attestedAt?: UtcDateTime;
  readonly attestedBy?: CanonicalId;
  readonly riskFlags?: readonly string[];
}

export interface TenantMetadata {
  readonly tenantId: CanonicalId;
  readonly organizationId: CanonicalId;
  readonly orgPath?: readonly CanonicalId[];
  readonly environment?: 'prod' | 'staging' | 'dev' | 'sandbox';
  readonly residencyRegion?: string;
}

export interface FederationMetadata {
  readonly federationId: CanonicalId;
  readonly homeRealm: string;
  readonly protocol: 'oidc' | 'saml' | 'scim' | 'custom';
  readonly externalSubject: string;
  readonly synchronizedAt?: UtcDateTime;
  readonly sourceOfTruth?: string;
}

export interface IdentityContract {
  readonly schemaVersion: '1.0.0';
  readonly id: CanonicalId;
  readonly deterministicKey?: string;
  readonly principalType: PrincipalType;
  readonly displayName?: string;
  readonly status: 'active' | 'suspended' | 'revoked';
  readonly createdAt: UtcDateTime;
  readonly updatedAt: UtcDateTime;
  readonly claims: readonly Claim[];
  readonly trust: TrustMetadata;
  readonly tenant: TenantMetadata;
  readonly federation?: FederationMetadata;
  readonly tags?: Readonly<Record<string, string>>;
  readonly extensions?: Readonly<Record<string, unknown>>;
}

export const identityContractSchemaExample = {
  $id: 'https://aoc.protocol/schemas/identity-contract/1-0-0',
  type: 'object',
  additionalProperties: false,
  required: ['schemaVersion', 'id', 'principalType', 'status', 'createdAt', 'updatedAt', 'claims', 'trust', 'tenant'],
  properties: {
    schemaVersion: { const: '1.0.0' },
    id: { type: 'string', minLength: 3 },
    deterministicKey: { type: 'string' },
    principalType: { enum: ['human', 'service', 'agent', 'workload'] },
    status: { enum: ['active', 'suspended', 'revoked'] },
    claims: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'value', 'issuer', 'issuedAt'],
      },
    },
  },
} as const;
