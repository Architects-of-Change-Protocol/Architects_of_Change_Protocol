import { MarketMakerRegistry, type MarketMaker } from '../marketMakerRegistry';

function buildMarketMaker(overrides: Partial<MarketMaker> = {}): MarketMaker {
  return {
    id: 'hrkey-v1',
    name: 'HRKey',
    version: '1.0.0',
    capabilities: ['employment'],
    endpoint: 'https://registry.example/market-makers/hrkey-v1',
    publicKey: 'did:key:z6MkkExamplePublicKey',
    status: 'active',
    created_at: '2025-01-15T00:00:00Z',
    ...overrides
  };
}

describe('MarketMakerRegistry', () => {
  it('prevents duplicate registration', () => {
    const registry = new MarketMakerRegistry();
    registry.register(buildMarketMaker());

    expect(() => registry.register(buildMarketMaker())).toThrow(
      'Market maker hrkey-v1 is already registered.'
    );
  });

  it('returns immutable snapshots from get and list', () => {
    const registry = new MarketMakerRegistry();
    registry.register(buildMarketMaker());

    const record = registry.get('hrkey-v1');
    expect(record).not.toBeNull();
    expect(() => record!.capabilities.push('finance')).toThrow(TypeError);

    const listed = registry.list();
    expect(() => {
      listed[0].name = 'Tampered';
    }).toThrow(TypeError);

    expect(registry.get('hrkey-v1')).toEqual(buildMarketMaker());
    expect(registry.list()).toEqual([buildMarketMaker()]);
  });

  it('treats active market makers as trusted', () => {
    const registry = new MarketMakerRegistry();
    registry.register(buildMarketMaker({ status: 'active' }));

    expect(registry.getStatus('hrkey-v1')).toBe('active');
    expect(registry.isTrusted('hrkey-v1')).toBe(true);
  });

  it('treats deprecated market makers as untrusted', () => {
    const registry = new MarketMakerRegistry();
    registry.register(buildMarketMaker({ status: 'deprecated' }));

    expect(registry.getStatus('hrkey-v1')).toBe('deprecated');
    expect(registry.isTrusted('hrkey-v1')).toBe(false);
  });

  it('treats revoked market makers as untrusted', () => {
    const registry = new MarketMakerRegistry();
    registry.register(buildMarketMaker({ status: 'revoked' }));

    expect(registry.getStatus('hrkey-v1')).toBe('revoked');
    expect(registry.isTrusted('hrkey-v1')).toBe(false);
  });
});
