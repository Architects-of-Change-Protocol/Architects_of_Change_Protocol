export type ApiTier = 'free' | 'pro';

export type ApiKeyRecord = {
  apiKey: string;
  owner: string;
  tier: ApiTier;
};

export class InMemoryApiKeyStore {
  private readonly keys = new Map<string, ApiKeyRecord>();

  constructor(seed: ApiKeyRecord[] = []) {
    seed.forEach((entry) => this.keys.set(entry.apiKey, entry));
  }

  get(apiKey: string): ApiKeyRecord | undefined {
    return this.keys.get(apiKey);
  }

  add(record: ApiKeyRecord): void {
    this.keys.set(record.apiKey, record);
  }
}

export const DEFAULT_API_KEYS: ApiKeyRecord[] = [
  { apiKey: 'aoc_free_dev_key', owner: 'dev-free', tier: 'free' },
  { apiKey: 'aoc_pro_dev_key', owner: 'dev-pro', tier: 'pro' },
];
