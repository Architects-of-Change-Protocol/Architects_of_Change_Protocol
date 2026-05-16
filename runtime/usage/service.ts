import type {
  MeteredRuntimeEndpoint,
  UsageDecision,
  UsageRecord,
  UsageSummaryItem,
  UsageSummaryQuery,
  UsageSummaryResult,
} from './types';
import { createInMemoryUsageRepository, type UsageRepository } from '../storage';

const UNIT_PRICES: Record<MeteredRuntimeEndpoint, number> = {
  '/data/access': 0.05,
  '/payout/execute': 0.25,
  '/trust/verify': 0,
};

type RecordUsageInput = {
  consumer_id: string;
  endpoint: MeteredRuntimeEndpoint;
  decision: UsageDecision;
  reason_code: string;
  usedAt?: Date;
};

export class InMemoryUsageService {
  constructor(private readonly repo: UsageRepository = createInMemoryUsageRepository()) {}

  recordUsage(input: RecordUsageInput): void {
    this.repo.appendUsageRecord({
      consumer_id: input.consumer_id,
      endpoint: input.endpoint,
      decision: input.decision,
      reason_code: input.reason_code,
      used_at: (input.usedAt ?? new Date()).toISOString(),
    });
  }

  getSummary(query: UsageSummaryQuery): UsageSummaryResult {
    const filtered = this.repo.listUsageRecords().filter((record) => {
      if (record.consumer_id !== query.consumer_id) {
        return false;
      }
      if (query.endpoint !== undefined && record.endpoint !== query.endpoint) {
        return false;
      }

      const usedAtTime = Date.parse(record.used_at);
      if (query.from !== undefined && usedAtTime < query.from.getTime()) {
        return false;
      }
      if (query.to !== undefined && usedAtTime > query.to.getTime()) {
        return false;
      }

      return true;
    });

    const byEndpoint = new Map<MeteredRuntimeEndpoint, UsageSummaryItem>();
    for (const record of filtered) {
      const existing = byEndpoint.get(record.endpoint) ?? {
        endpoint: record.endpoint,
        count: 0,
        allowed_count: 0,
        denied_count: 0,
        last_used_at: undefined,
        unit_price: UNIT_PRICES[record.endpoint],
        total_estimated_fee: 0,
        reason_code_counts: {},
      };

      existing.count += 1;
      existing.allowed_count += record.decision === 'allow' ? 1 : 0;
      existing.denied_count += record.decision === 'deny' ? 1 : 0;
      existing.reason_code_counts[record.reason_code] = (existing.reason_code_counts[record.reason_code] ?? 0) + 1;

      if (existing.last_used_at === undefined || Date.parse(record.used_at) > Date.parse(existing.last_used_at)) {
        existing.last_used_at = record.used_at;
      }

      existing.total_estimated_fee = Number((existing.count * existing.unit_price).toFixed(2));
      byEndpoint.set(record.endpoint, existing);
    }

    return {
      consumer_id: query.consumer_id,
      from: query.from?.toISOString(),
      to: query.to?.toISOString(),
      endpoints: [...byEndpoint.values()].sort((a, b) => a.endpoint.localeCompare(b.endpoint)),
    };
  }
}

export { UNIT_PRICES };


