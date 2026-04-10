import {
  createAdapterRegistry,
  isAdapterOfficial,
  isAdapterUsable,
  isAdapterVerified,
  parseAdapterRecord,
  supportsOperation,
  supportsScopeType,
} from '../index';

const BASE_RECORD = {
  adapter_id: 'adapter-1',
  display_name: 'Adapter One',
  adapter_type: 'market_maker' as const,
  owner_did: 'did:web:aoc.example',
  marketMakerId: 'mm-1',
  supported_operations: ['store', 'execute'],
  supported_scope_types: ['field', 'content'] as const,
  endpoint_url: 'https://adapter.one/api',
  documentation_url: 'https://adapter.one/docs',
  status: 'declared' as const,
  registry_source: 'official_aoc' as const,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  metadata: { region: 'us' },
};

describe('adapter registry (optional layer)', () => {
  it('registers a valid adapter', () => {
    const registry = createAdapterRegistry();
    const result = registry.registerAdapter(BASE_RECORD);

    expect(result.adapter_id).toBe('adapter-1');
    expect(result.status).toBe('declared');
  });

  it('rejects duplicate adapter_id', () => {
    const registry = createAdapterRegistry();
    registry.registerAdapter(BASE_RECORD);

    expect(() => registry.registerAdapter(BASE_RECORD)).toThrow(/already registered/i);
  });

  it('fails invalid adapter payload', () => {
    expect(() =>
      parseAdapterRecord({
        ...BASE_RECORD,
        adapter_id: '',
      }),
    ).toThrow(/adapter_id/i);
  });

  it('gets adapter by id when present', () => {
    const registry = createAdapterRegistry();
    registry.registerAdapter(BASE_RECORD);

    const result = registry.getAdapterById('adapter-1');

    expect(result).not.toBeNull();
    expect(result?.display_name).toBe('Adapter One');
  });

  it('returns null when adapter is missing', () => {
    const registry = createAdapterRegistry();

    expect(registry.getAdapterById('missing')).toBeNull();
  });

  it('lists adapters without filters', () => {
    const registry = createAdapterRegistry();
    registry.registerAdapter(BASE_RECORD);
    registry.registerAdapter({
      ...BASE_RECORD,
      adapter_id: 'adapter-2',
      display_name: 'Adapter Two',
      adapter_type: 'executor',
      status: 'verified',
      registry_source: 'self_declared',
    });

    expect(registry.listAdapters()).toHaveLength(2);
  });

  it('lists adapters by status filter', () => {
    const registry = createAdapterRegistry();
    registry.registerAdapter(BASE_RECORD);
    registry.registerAdapter({
      ...BASE_RECORD,
      adapter_id: 'adapter-2',
      status: 'verified',
      adapter_type: 'executor',
    });

    const filtered = registry.listAdapters({ status: 'verified' });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].adapter_id).toBe('adapter-2');
  });

  it('lists adapters by adapter_type filter', () => {
    const registry = createAdapterRegistry();
    registry.registerAdapter(BASE_RECORD);
    registry.registerAdapter({
      ...BASE_RECORD,
      adapter_id: 'adapter-2',
      adapter_type: 'executor',
    });

    const filtered = registry.listAdapters({ adapter_type: 'market_maker' });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].adapter_id).toBe('adapter-1');
  });

  it('updates status from declared to verified', () => {
    const registry = createAdapterRegistry();
    registry.registerAdapter(BASE_RECORD);

    const updated = registry.updateAdapterStatus('adapter-1', 'verified');

    expect(updated.status).toBe('verified');
  });

  it('updates status from verified to revoked', () => {
    const registry = createAdapterRegistry();
    registry.registerAdapter({
      ...BASE_RECORD,
      status: 'verified',
    });

    const updated = registry.updateAdapterStatus('adapter-1', 'revoked');

    expect(updated.status).toBe('revoked');
  });

  it('fails invalid status transition', () => {
    const registry = createAdapterRegistry();
    registry.registerAdapter({
      ...BASE_RECORD,
      status: 'revoked',
    });

    expect(() => registry.updateAdapterStatus('adapter-1', 'verified')).toThrow(
      /invalid status transition/i,
    );
  });

  it('resolveAdapter returns null when missing', () => {
    const registry = createAdapterRegistry();

    expect(registry.resolveAdapter('not-found')).toBeNull();
  });

  it('policy helpers return expected values', () => {
    const revoked = parseAdapterRecord({
      ...BASE_RECORD,
      status: 'revoked',
      registry_source: 'self_declared',
    });

    const verified = parseAdapterRecord({
      ...BASE_RECORD,
      status: 'verified',
      registry_source: 'official_aoc',
    });

    expect(isAdapterUsable(revoked)).toBe(false);
    expect(isAdapterVerified(verified)).toBe(true);
    expect(isAdapterOfficial(verified)).toBe(true);
    expect(supportsOperation(verified, 'execute')).toBe(true);
    expect(supportsScopeType(verified, 'field')).toBe(true);
  });
});
