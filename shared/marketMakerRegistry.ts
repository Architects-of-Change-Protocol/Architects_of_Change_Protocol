import { validateMarketMakerId } from './marketMakerId';

export type MarketMakerStatus = 'active' | 'deprecated' | 'revoked';

export type MarketMaker = {
  id: string;
  name: string;
  version: string;
  capabilities: string[];
  endpoint?: string;
  publicKey?: string;
  status: MarketMakerStatus;
  created_at: string;
};

const ISO8601_UTC_PATTERN =
  /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$/;

function cloneMarketMaker(marketMaker: MarketMaker): MarketMaker {
  const capabilities = [...marketMaker.capabilities];
  const clone: MarketMaker = {
    ...marketMaker,
    capabilities
  };

  Object.freeze(capabilities);
  return Object.freeze(clone);
}

const TRUSTED_MARKET_MAKER_STATUSES = new Set<MarketMakerStatus>(['active']);

function validateMarketMaker(marketMaker: MarketMaker): void {
  if (!marketMaker || typeof marketMaker !== 'object') {
    throw new Error('Market maker registration must be an object.');
  }

  validateMarketMakerId(marketMaker.id, 'Market maker id');

  if (typeof marketMaker.name !== 'string' || marketMaker.name.trim() === '') {
    throw new Error('Market maker name must be a non-empty string.');
  }

  if (typeof marketMaker.version !== 'string' || marketMaker.version.trim() === '') {
    throw new Error('Market maker version must be a non-empty string.');
  }

  if (
    !Array.isArray(marketMaker.capabilities) ||
    marketMaker.capabilities.length === 0 ||
    marketMaker.capabilities.some(
      (capability) => typeof capability !== 'string' || capability.trim() === ''
    )
  ) {
    throw new Error('Market maker capabilities must be a non-empty array of strings.');
  }

  if (
    marketMaker.endpoint !== undefined &&
    (typeof marketMaker.endpoint !== 'string' || marketMaker.endpoint.trim() === '')
  ) {
    throw new Error('Market maker endpoint must be a non-empty string when provided.');
  }

  if (
    marketMaker.publicKey !== undefined &&
    (typeof marketMaker.publicKey !== 'string' || marketMaker.publicKey.trim() === '')
  ) {
    throw new Error('Market maker publicKey must be a non-empty string when provided.');
  }

  if (!['active', 'deprecated', 'revoked'].includes(marketMaker.status)) {
    throw new Error('Market maker status must be active, deprecated, or revoked.');
  }

  if (!ISO8601_UTC_PATTERN.test(marketMaker.created_at)) {
    throw new Error('Market maker created_at must be ISO 8601 UTC format.');
  }
}

export class MarketMakerRegistry {
  private readonly records = new Map<string, MarketMaker>();

  register(marketMaker: MarketMaker): void {
    validateMarketMaker(marketMaker);

    if (this.records.has(marketMaker.id)) {
      throw new Error(`Market maker ${marketMaker.id} is already registered.`);
    }

    this.records.set(marketMaker.id, cloneMarketMaker(marketMaker));
  }

  get(id: string): MarketMaker | null {
    const record = this.records.get(id);
    return record ? cloneMarketMaker(record) : null;
  }

  exists(id: string): boolean {
    return this.records.has(id);
  }

  getStatus(id: string): MarketMakerStatus | null {
    return this.records.get(id)?.status ?? null;
  }

  isTrusted(id: string): boolean {
    const status = this.getStatus(id);
    return status !== null && TRUSTED_MARKET_MAKER_STATUSES.has(status);
  }

  list(): MarketMaker[] {
    return [...this.records.values()].map((record) => cloneMarketMaker(record));
  }
}
