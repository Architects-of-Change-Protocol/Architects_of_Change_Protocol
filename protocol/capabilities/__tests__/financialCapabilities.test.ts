import {
  financialCapabilities,
  financialCapabilitiesById,
  getFinancialCapability,
  validateProtocolCapabilityDefinition
} from '..';

describe('financial capability namespace', () => {
  it('registers the canonical financial capabilities', () => {
    expect(financialCapabilities.map((capability) => capability.id)).toEqual([
      'financial.wallet.balance.read',
      'financial.wallet.tx.read',
      'financial.portfolio.snapshot.read',
      'financial.portfolio.aggregate.read',
      'financial.insight.read',
      'financial.insight.write'
    ]);
  });

  it('indexes registered capabilities by canonical id', () => {
    expect(financialCapabilitiesById['financial.insight.write']).toEqual({
      id: 'financial.insight.write',
      description:
        'Write or attach derived financial insights back into an authorized insight resource.',
      resource_type: 'insight',
      access_level: 'write',
      sensitivity_level: 'high',
      requires_user_consent: true
    });
  });

  it('retrieves a specific capability definition by id', () => {
    expect(getFinancialCapability('financial.wallet.balance.read').resource_type).toBe('wallet');
    expect(getFinancialCapability('financial.wallet.balance.read').access_level).toBe('read');
  });

  it('requires user consent for every registered financial capability', () => {
    expect(financialCapabilities.every((capability) => capability.requires_user_consent)).toBe(true);
  });

  it('validates the canonical schema fields', () => {
    for (const capability of financialCapabilities) {
      expect(() => validateProtocolCapabilityDefinition(capability)).not.toThrow();
    }
  });

  it('rejects malformed capability definitions', () => {
    expect(() =>
      validateProtocolCapabilityDefinition({
        id: 'Financial.wallet.balance.read',
        description: 'bad',
        resource_type: 'wallet',
        access_level: 'read',
        sensitivity_level: 'high',
        requires_user_consent: true
      } as any)
    ).toThrow('Capability definition id must be a lowercase dot-separated canonical identifier.');
  });
});
