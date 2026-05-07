export type ActorType = 'human' | 'organization' | 'brand' | 'app' | 'ai_agent';

export type Actor = {
  id: string;
  type: ActorType;
  organizationId?: string;
  brandId?: string;
  metadata?: Record<string, unknown>;
};

export type Resource = {
  id: string;
  type: string;
  ownerActorId?: string;
  ownerOrganizationId?: string;
  brandId?: string;
  category?: string;
  dataClassification?: string;
  metadata?: Record<string, unknown>;
};

export type ScopedPermission = {
  action: string;
  category?: string;
  purpose?: string;
  allowedBrands?: string[];
  allowedActions?: string[];
  frequency?: {
    maxCount: number;
    windowSeconds: number;
  };
  expiresAt?: string;
  dataClassification?: string;
  metadata?: Record<string, unknown>;
};

export type AccessContext = {
  runtime?: {
    module?: string;
    path?: string;
    method?: string;
    transport?: string;
  };
  request?: {
    requestId?: string;
    ip?: string;
    userAgent?: string;
    headers?: Record<string, string | string[] | undefined>;
  };
  environment?: {
    environmentName?: string;
    region?: string;
    adapterId?: string;
  };
  temporal?: {
    now?: string;
    timezone?: string;
  };
  metadata?: Record<string, unknown>;
};

export type PolicyDecision = {
  allow: boolean;
  reason: string;
  obligations?: string[];
  traceId: string;
  evaluatedPolicies: string[];
};

export type PolicyEvaluationInput = {
  actor: Actor;
  resource: Resource;
  action: string;
  permission: ScopedPermission;
  context?: AccessContext;
};
