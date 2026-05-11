import { CapabilityBrokerageRuntime } from '../brokerageRuntime';
import { CapabilityMarketplace } from '../types';

describe('CapabilityBrokerageRuntime', () => {
  it('routes explainably, creates agreements, and supports revocation + continuity export', () => {
    const market: CapabilityMarketplace = {
      providers: [
        {
          providerId: 'provider-enterprise-audit',
          runtimeId: 'runtime-enterprise',
          federationId: 'fed-alpha',
          capabilityIds: ['cap.audit'],
          consentPolicyRefs: ['consent.audit.v1'],
          executionRegions: ['us'],
        },
      ],
      offers: [
        {
          offerId: 'offer-audit-1',
          providerId: 'provider-enterprise-audit',
          capabilityId: 'cap.audit',
          scope: ['bounded-audit', 'trace-export'],
          maxBudget: 25,
          obligations: ['audit-log-preserved'],
          constraints: ['no-data-exfiltration'],
          expiresAt: '2027-01-01T00:00:00.000Z',
          revocable: true,
        },
      ],
      agreements: [],
      leases: [],
      reputations: [
        {
          profileId: 'rep-provider-enterprise-audit',
          providerId: 'provider-enterprise-audit',
          records: [],
          trustScore: { providerId: 'provider-enterprise-audit', score: 75, asOf: '2026-01-01T00:00:00.000Z', evidenceRefs: ['att:1'] },
          portabilityRef: 'portable://provider-enterprise-audit/v1',
          exposure: 'federated',
        },
      ],
    };

    const broker = new CapabilityBrokerageRuntime(market);
    const decision = broker.route({
      requestId: 'req-pmfreak-1',
      consumer: {
        consumerId: 'consumer-pmfreak',
        runtimeId: 'runtime-pmfreak',
        federationId: 'fed-alpha',
        budgetCeiling: 50,
        acceptedPolicyRefs: ['consent.audit.v1'],
      },
      capabilityId: 'cap.audit',
      requiredScope: ['bounded-audit'],
      maxBudget: 40,
      federationId: 'fed-alpha',
      requireConsentRef: 'consent.audit.v1',
      lineage: ['consumer-pmfreak', 'runtime-pmfreak'],
    });

    expect(decision.allowed).toBe(true);
    expect(decision.selectedProviderId).toBe('provider-enterprise-audit');
    expect(decision.trustPath).toContain('provider-enterprise-audit');

    const agreement = broker.createExecutionAgreement(decision);
    expect(agreement).toBeDefined();

    const lease = broker.activateLease(agreement!.agreementId);
    expect(lease?.status).toBe('active');

    const revoked = broker.revokeLease(lease!.leaseId, 'human-sovereign-override');
    expect(revoked?.status).toBe('revoked');

    broker.appendReputationRecord({
      recordId: 'rec-1',
      providerId: 'provider-enterprise-audit',
      consumerId: 'consumer-pmfreak',
      capabilityId: 'cap.audit',
      fulfilled: true,
      obligationsMet: 1,
      obligationsTotal: 1,
      escalationResolved: true,
      auditIntegrityScore: 100,
      recordedAt: '2026-05-01T00:00:00.000Z',
    });

    const exportBundle = broker.exportPortableContinuity('provider-enterprise-audit');
    expect(exportBundle?.agreements.length).toBe(1);
    expect(exportBundle?.leases.length).toBe(1);
    expect(exportBundle?.reputationProfile.trustScore.score).toBeGreaterThan(0);
  });
});
