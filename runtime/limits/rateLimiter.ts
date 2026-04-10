import type { ApiTier } from '../auth/apiKeys';

export type RateLimitDecision = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

type WindowCounter = {
  count: number;
  resetAt: number;
};

export class InMemoryRateLimiter {
  private readonly windows = new Map<string, WindowCounter>();

  private readonly limits: Record<ApiTier, number>;

  constructor(limits?: Partial<Record<ApiTier, number>>) {
    this.limits = {
      free: limits?.free ?? 100,
      pro: limits?.pro ?? 1000,
    };
  }

  check(apiKey: string, tier: ApiTier, nowMs = Date.now()): RateLimitDecision {
    const limit = this.limits[tier];
    const current = this.windows.get(apiKey);

    if (current === undefined || nowMs >= current.resetAt) {
      const resetAt = nowMs + 60_000;
      this.windows.set(apiKey, { count: 1, resetAt });
      return {
        allowed: true,
        limit,
        remaining: limit - 1,
        resetAt,
      };
    }

    if (current.count >= limit) {
      return {
        allowed: false,
        limit,
        remaining: 0,
        resetAt: current.resetAt,
      };
    }

    current.count += 1;
    return {
      allowed: true,
      limit,
      remaining: limit - current.count,
      resetAt: current.resetAt,
    };
  }
}
