import { capabilityTokens } from '../mockRuntimeData';
import { toAgentGovernanceSignals, toDelegationConsoleRows } from '../projections';

describe('capability delegation layer projections', () => {
  it('builds delegation console rows with scoped access', () => {
    const rows = toDelegationConsoleRows(capabilityTokens);
    expect(rows[0]).toMatchObject({
      capabilityId: 'cap_01_fcast_runtime',
      scopedAccess: ['ai.forecasting.runtime', 'read:behavioral_segments'],
      revocable: true
    });
  });

  it('builds AI governance signals by delegated agent', () => {
    const signals = toAgentGovernanceSignals(capabilityTokens);
    expect(signals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          agentId: 'agt_01',
          delegatedCapabilities: 1,
          runtimeAttestation: 'passed'
        })
      ])
    );
  });
});
