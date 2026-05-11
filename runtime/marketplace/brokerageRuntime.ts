import {
  BrokerageRequest,
  CapabilityExecutionAgreement,
  CapabilityLease,
  CapabilityMarketplace,
  CapabilityOffer,
  CapabilityProvider,
  ExecutionReputationRecord,
  ExplainableBrokerageDecision,
  MachineReputationProfile,
  PortableMarketContinuityExport,
} from './types';

export class CapabilityBrokerageRuntime {
  constructor(private readonly market: CapabilityMarketplace) {}

  publishProvider(provider: CapabilityProvider): void {
    this.market.providers.push(provider);
  }

  publishOffer(offer: CapabilityOffer): void {
    this.market.offers.push(offer);
  }

  route(request: BrokerageRequest): ExplainableBrokerageDecision {
    const candidateOffers = this.market.offers.filter((offer) => offer.capabilityId === request.capabilityId);
    const ranked = candidateOffers
      .map((offer) => ({ offer, provider: this.market.providers.find((p) => p.providerId === offer.providerId) }))
      .filter((row): row is { offer: CapabilityOffer; provider: CapabilityProvider } => Boolean(row.provider))
      .filter((row) => !row.provider.sovereignOptOut)
      .sort((a, b) => this.reputationScore(b.provider.providerId) - this.reputationScore(a.provider.providerId));

    for (const row of ranked) {
      const decision = this.evaluateRow(request, row.offer, row.provider);
      if (decision.allowed) return decision;
    }

    return {
      decisionId: `${request.requestId}:deny`,
      requestId: request.requestId,
      allowed: false,
      reasons: ['No eligible provider matched capability, consent, scope, federation, and budget constraints.'],
      trustPath: request.lineage,
      budgetEvaluation: { requested: request.maxBudget, offered: 0, consumerCeiling: request.consumer.budgetCeiling, pass: false },
      federationCompatibility: { pass: false, reason: 'No compatible federation route.' },
      consentEvaluation: { pass: false, requiredRef: request.requireConsentRef, providerSupportsRef: false, consumerAcceptsRef: false },
      constraintEvaluation: { pass: false, missingScopes: request.requiredScope, violatedConstraints: ['no-provider-match'] },
    };
  }

  createExecutionAgreement(decision: ExplainableBrokerageDecision): CapabilityExecutionAgreement | undefined {
    if (!decision.allowed || !decision.selectedOfferId || !decision.selectedProviderId) return undefined;
    const offer = this.market.offers.find((o) => o.offerId === decision.selectedOfferId);
    if (!offer) return undefined;
    const now = new Date().toISOString();
    const agreement: CapabilityExecutionAgreement = {
      agreementId: `${offer.offerId}:agreement:${this.market.agreements.length + 1}`,
      offerId: offer.offerId,
      providerId: offer.providerId,
      consumerId: decision.requestId,
      capabilityId: offer.capabilityId,
      scope: offer.scope,
      budgetLimit: offer.maxBudget,
      federationBoundary: 'enforced',
      delegationLineage: decision.trustPath,
      obligations: offer.obligations,
      behavioralConstraints: offer.constraints,
      expiresAt: offer.expiresAt,
      createdAt: now,
      revocable: true,
    };
    this.market.agreements.push(agreement);
    return agreement;
  }

  activateLease(agreementId: string): CapabilityLease | undefined {
    const agreement = this.market.agreements.find((item) => item.agreementId === agreementId);
    if (!agreement) return undefined;
    const lease: CapabilityLease = {
      leaseId: `${agreementId}:lease`,
      agreementId,
      status: 'active',
      startedAt: new Date().toISOString(),
      expiresAt: agreement.expiresAt,
    };
    this.market.leases.push(lease);
    return lease;
  }

  revokeLease(leaseId: string, reason: string): CapabilityLease | undefined {
    const lease = this.market.leases.find((item) => item.leaseId === leaseId);
    if (!lease) return undefined;
    lease.status = 'revoked';
    lease.revokedAt = new Date().toISOString();
    lease.revocationReason = reason;
    return lease;
  }

  appendReputationRecord(record: ExecutionReputationRecord): void {
    const profile = this.market.reputations.find((item) => item.providerId === record.providerId);
    if (!profile) return;
    profile.records.push(record);
    profile.trustScore = this.computeTrustScore(profile);
  }

  exportPortableContinuity(providerId: string): PortableMarketContinuityExport | undefined {
    const profile = this.market.reputations.find((item) => item.providerId === providerId);
    if (!profile) return undefined;
    return {
      exportedAt: new Date().toISOString(),
      providerId,
      reputationProfile: profile,
      agreements: this.market.agreements.filter((item) => item.providerId === providerId),
      leases: this.market.leases.filter((lease) =>
        this.market.agreements.some((agreement) => agreement.providerId === providerId && agreement.agreementId === lease.agreementId),
      ),
      trustRelationships: [profile.portabilityRef, ...profile.trustScore.evidenceRefs],
    };
  }

  private evaluateRow(request: BrokerageRequest, offer: CapabilityOffer, provider: CapabilityProvider): ExplainableBrokerageDecision {
    const missingScopes = request.requiredScope.filter((scope) => !offer.scope.includes(scope));
    const budgetPass = offer.maxBudget <= request.maxBudget && offer.maxBudget <= request.consumer.budgetCeiling;
    const federationPass = provider.federationId === request.federationId && provider.runtimeId !== request.consumer.runtimeId;
    const providerSupportsConsent = provider.consentPolicyRefs.includes(request.requireConsentRef);
    const consumerAcceptsConsent = request.consumer.acceptedPolicyRefs.includes(request.requireConsentRef);
    const consentPass = providerSupportsConsent && consumerAcceptsConsent;
    const allowed = missingScopes.length === 0 && budgetPass && federationPass && consentPass;

    return {
      decisionId: `${request.requestId}:${offer.offerId}`,
      requestId: request.requestId,
      selectedProviderId: allowed ? provider.providerId : undefined,
      selectedOfferId: allowed ? offer.offerId : undefined,
      allowed,
      reasons: allowed
        ? ['Provider satisfies consent, scope, trust, federation, and budget constraints.']
        : ['Provider rejected due to one or more constraint failures.'],
      trustPath: [...request.lineage, provider.providerId],
      budgetEvaluation: { requested: request.maxBudget, offered: offer.maxBudget, consumerCeiling: request.consumer.budgetCeiling, pass: budgetPass },
      federationCompatibility: { pass: federationPass, reason: federationPass ? 'Compatible federation boundary.' : 'Cross-federation boundary disallowed.' },
      consentEvaluation: {
        pass: consentPass,
        requiredRef: request.requireConsentRef,
        providerSupportsRef: providerSupportsConsent,
        consumerAcceptsRef: consumerAcceptsConsent,
      },
      constraintEvaluation: { pass: missingScopes.length === 0, missingScopes, violatedConstraints: allowed ? [] : offer.constraints },
    };
  }

  private reputationScore(providerId: string): number {
    return this.market.reputations.find((item) => item.providerId === providerId)?.trustScore.score ?? 0;
  }

  private computeTrustScore(profile: MachineReputationProfile) {
    const total = profile.records.length;
    if (!total) return { ...profile.trustScore, score: 0, asOf: new Date().toISOString() };
    const fulfilled = profile.records.filter((record) => record.fulfilled).length;
    const obligationRatio = profile.records.reduce((acc, record) => acc + record.obligationsMet / Math.max(1, record.obligationsTotal), 0) / total;
    const avgAudit = profile.records.reduce((acc, record) => acc + record.auditIntegrityScore, 0) / total;
    const score = Math.round((fulfilled / total) * 40 + obligationRatio * 30 + (avgAudit / 100) * 30);
    return { ...profile.trustScore, score: Math.max(0, Math.min(100, score)), asOf: new Date().toISOString() };
  }
}
