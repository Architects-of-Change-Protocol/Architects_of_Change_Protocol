import type { CapabilityTokenV1 } from '../capability';
import type { ConsentObjectV1 } from '../consent';
import type { ConsentUsageRegistry } from '../protocol/capabilities';
import type { NonceRegistry } from '../capability/registries/NonceRegistry';
import type { RevocationRegistry } from '../capability/registries/RevocationRegistry';
import type { MarketMakerRegistry } from '../shared/marketMakerRegistry';
import type { CapabilityAccessRequest } from '../enforcement';

export type AIInterpreterRequest = {
  capability: CapabilityTokenV1;
  consent?: ConsentObjectV1;
  action: string;
  resource: string;
  paymentContext?: {
    paid: boolean;
  };
  input: {
    query: string;
    context?: Record<string, unknown>;
  };
  now?: string;
};

export type AIInterpreterResponse = {
  allowed: boolean;
  result?: {
    interpretation: string;
    metadata?: Record<string, unknown>;
  };
  error?: {
    code: string;
    message: string;
  };
  usage: {
    usageCount: number;
  };
  payment?: {
    required: boolean;
    amount?: number;
    currency?: string;
  };
};

export type InterpreterResolvedResource = {
  key: string;
  data: unknown;
};

export type InterpreterDependencies = {
  registries?: {
    nonceRegistry?: NonceRegistry;
    revocationRegistry?: RevocationRegistry;
    consentUsageRegistry?: ConsentUsageRegistry;
  };
  marketMakerRegistry?: Pick<MarketMakerRegistry, 'exists' | 'getStatus'>;
  hooks?: CapabilityAccessRequest['hooks'];
};
