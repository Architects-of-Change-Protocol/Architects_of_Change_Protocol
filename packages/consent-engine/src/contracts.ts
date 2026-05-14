export type CanonicalId = string;
export type UtcDateTime = string;

export interface ContextCondition {
  readonly key: string;
  readonly operator: 'eq' | 'neq' | 'in' | 'contains' | 'exists';
  readonly value?: string | number | boolean | readonly string[];
}

export interface ConsentGrant {
  readonly schemaVersion: '1.0.0';
  readonly grantId: CanonicalId;
  readonly grantor: CanonicalId;
  readonly grantee: CanonicalId;
  readonly purpose: string;
  readonly allowedOperations: readonly string[];
  readonly legalBasis: {
    readonly basisType: 'contract' | 'legitimate-interest' | 'consent' | 'public-task' | 'custom';
    readonly jurisdiction?: string;
    readonly reference?: string;
  };
  readonly contextualConditions?: readonly ContextCondition[];
  readonly policyRefs?: readonly CanonicalId[];
  readonly issuedAt: UtcDateTime;
  readonly expiresAt?: UtcDateTime;
  readonly revokedAt?: UtcDateTime;
  readonly revocationReason?: string;
  readonly extensions?: Readonly<Record<string, unknown>>;
}

export type PolicyDecisionOutcome = 'allow' | 'deny' | 'conditional';

export interface DecisionObligation {
  readonly type: string;
  readonly parameters?: Readonly<Record<string, string | number | boolean>>;
}

export interface PolicyDecisionContract {
  readonly schemaVersion: '1.0.0';
  readonly decisionId: CanonicalId;
  readonly outcome: PolicyDecisionOutcome;
  readonly obligations?: readonly DecisionObligation[];
  readonly reasoningMetadata: Readonly<Record<string, string | number | boolean>>;
  readonly policyRevisionIds: readonly CanonicalId[];
  readonly evaluationTraceRefs?: readonly string[];
  readonly riskScore?: {
    readonly value: number;
    readonly band: 'low' | 'medium' | 'high' | 'critical';
    readonly modelVersion?: string;
  };
  readonly evaluatedAt: UtcDateTime;
}

export const consentGrantSchemaExample = {
  $id: 'https://aoc.protocol/schemas/consent-grant/1-0-0',
  type: 'object',
  required: ['schemaVersion', 'grantId', 'grantor', 'grantee', 'purpose', 'allowedOperations', 'legalBasis', 'issuedAt'],
} as const;

export const policyDecisionSchemaExample = {
  $id: 'https://aoc.protocol/schemas/policy-decision/1-0-0',
  type: 'object',
  required: ['schemaVersion', 'decisionId', 'outcome', 'reasoningMetadata', 'policyRevisionIds', 'evaluatedAt'],
} as const;
