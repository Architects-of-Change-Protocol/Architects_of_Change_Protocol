import { InMemoryApiKeyStore } from '../auth/apiKeys';
import { createRuntimeServer } from '../api/server';
import { assertRuntimeStartupSafety } from '../startupSafety';

describe('runtime startup safety assertions', () => {
  it('fails fast when production uses soft enforcement', () => {
    expect(() =>
      assertRuntimeStartupSafety({
        nodeEnv: 'production',
        capabilitySecret: 'super_secure_production_secret_value_123',
        enforcementMode: 'soft',
        apiKeySeededWithDefaults: false,
        apiKeys: [],
      })
    ).toThrow(/ENFORCEMENT_MODE must be strict/);
  });

  it('fails fast when production uses default capability secret', () => {
    expect(() =>
      assertRuntimeStartupSafety({
        nodeEnv: 'production',
        capabilitySecret: 'aoc_runtime_capability_secret',
        enforcementMode: 'strict',
        apiKeySeededWithDefaults: false,
        apiKeys: [],
      })
    ).toThrow(/default value/);
  });

  it('allows local startup with warnings in soft mode', () => {
    const result = assertRuntimeStartupSafety({
      nodeEnv: 'development',
      capabilitySecret: 'aoc_runtime_capability_secret',
      enforcementMode: 'soft',
      apiKeySeededWithDefaults: true,
      apiKeys: [],
    });

    expect(result.environment).toBe('development');
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('server constructor fails in production with default api keys', () => {
    const oldEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      expect(() => createRuntimeServer()).toThrow(/Default development API keys are forbidden/);
    } finally {
      process.env.NODE_ENV = oldEnv;
    }
  });

  it('server constructor allows production startup with explicit keys + strict mode', () => {
    const oldEnv = process.env.NODE_ENV;
    const oldMode = process.env.ENFORCEMENT_MODE;
    const oldSecret = process.env.AOC_CAPABILITY_SECRET;

    process.env.NODE_ENV = 'production';
    process.env.ENFORCEMENT_MODE = 'strict';
    process.env.AOC_CAPABILITY_SECRET = 'super_secure_production_secret_value_123';

    try {
      const apiKeyStore = new InMemoryApiKeyStore([{ apiKey: 'prod_key_1', owner: 'prod', tier: 'pro' }]);
      const server = createRuntimeServer({ apiKeyStore });
      server.close();
    } finally {
      process.env.NODE_ENV = oldEnv;
      process.env.ENFORCEMENT_MODE = oldMode;
      process.env.AOC_CAPABILITY_SECRET = oldSecret;
    }
  });
});
