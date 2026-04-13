import type { RuntimeEndpoint } from '../types/api-types';

export type MeteredRuntimeEndpoint = '/data/access' | '/payout/execute' | '/trust/verify';

export type UsageDecision = 'allow' | 'deny';

export type UsageRecord = {
  consumer_id: string;
  endpoint: MeteredRuntimeEndpoint;
  decision: UsageDecision;
  reason_code: string;
  used_at: string;
};

export type UsageSummaryQuery = {
  consumer_id: string;
  endpoint?: MeteredRuntimeEndpoint;
  from?: Date;
  to?: Date;
};

export type UsageSummaryItem = {
  endpoint: MeteredRuntimeEndpoint;
  count: number;
  allowed_count: number;
  denied_count: number;
  last_used_at?: string;
  unit_price: number;
  total_estimated_fee: number;
  reason_code_counts: Record<string, number>;
};

export type UsageSummaryResult = {
  consumer_id: string;
  from?: string;
  to?: string;
  endpoints: UsageSummaryItem[];
};

export function isMeteredEndpoint(endpoint: RuntimeEndpoint): endpoint is MeteredRuntimeEndpoint {
  return endpoint === '/data/access' || endpoint === '/payout/execute' || endpoint === '/trust/verify';
}
