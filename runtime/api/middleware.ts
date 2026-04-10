import { randomUUID } from 'crypto';
import type { IncomingHttpHeaders } from 'http';
import type { ApiResponse } from '../types/api-types';
import type { InMemoryApiKeyStore, ApiKeyRecord } from '../auth/apiKeys';
import type { InMemoryRateLimiter } from '../limits/rateLimiter';

export type RuntimeRequestContext = {
  requestId: string;
  apiKey: ApiKeyRecord;
};

export function createRequestId(): string {
  return randomUUID();
}

export function readApiKey(headers: IncomingHttpHeaders): string | undefined {
  const value = headers['x-api-key'];
  if (typeof value === 'string' && value.trim() !== '') {
    return value.trim();
  }
  return undefined;
}

export function authAndLimit(
  headers: IncomingHttpHeaders,
  apiKeyStore: InMemoryApiKeyStore,
  rateLimiter: InMemoryRateLimiter
): ApiResponse<RuntimeRequestContext> {
  const key = readApiKey(headers);
  if (key === undefined) {
    return {
      success: false,
      error: {
        code: 'AUTH_MISSING_API_KEY',
        message: 'Missing required x-api-key header.',
      },
    };
  }

  const record = apiKeyStore.get(key);
  if (record === undefined) {
    return {
      success: false,
      error: {
        code: 'AUTH_INVALID_API_KEY',
        message: 'Invalid API key.',
      },
    };
  }

  const limit = rateLimiter.check(record.apiKey, record.tier);
  if (!limit.allowed) {
    return {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded for tier ${record.tier}. Limit=${limit.limit}/min.`,
      },
    };
  }

  return {
    success: true,
    data: {
      requestId: createRequestId(),
      apiKey: record,
    },
  };
}
