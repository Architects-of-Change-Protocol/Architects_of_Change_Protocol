import {
  classifyMemory,
  inferRetentionClass,
  inferDecayEligibility,
  inferCompressionEligibility,
  createMemoryMetadata,
  MEMORY_CATEGORIES
} from '../memoryTaxonomy';

describe('memory taxonomy engine', () => {
  it('includes all canonical categories', () => {
    expect(MEMORY_CATEGORIES).toEqual([
      'RAW_INTERACTION',
      'OPERATIONAL_SIGNAL',
      'DECISION',
      'APPROVAL',
      'POLICY',
      'IDENTITY',
      'PERMISSION',
      'EXECUTIVE_SYNTHESIS',
      'RELATIONSHIP_SIGNAL',
      'RISK_SIGNAL',
      'TRANSIENT_CONTEXT',
      'EMOTIONAL_CONTEXT',
      'AI_GENERATED_ARTIFACT',
      'COMPLIANCE_RECORD',
      'AUDIT_EVENT'
    ]);
  });

  it('classifies deterministically from explicit signals and tags', () => {
    const categories = classifyMemory({
      actorType: 'ai',
      approved: true,
      decisionRecorded: true,
      policyRelated: true,
      tags: ['runtime telemetry', 'executive summary', 'risk', 'audit trail']
    });

    expect(categories).toEqual(
      expect.arrayContaining([
        'RAW_INTERACTION',
        'AI_GENERATED_ARTIFACT',
        'APPROVAL',
        'DECISION',
        'POLICY',
        'OPERATIONAL_SIGNAL',
        'EXECUTIVE_SYNTHESIS',
        'RISK_SIGNAL',
        'AUDIT_EVENT'
      ])
    );
  });

  it('infers retention, decay, and compression from categories', () => {
    const categories = ['RAW_INTERACTION', 'POLICY', 'DECISION'] as const;
    expect(inferRetentionClass(categories)).toBe('GOVERNED');
    expect(inferDecayEligibility(categories)).toBe(false);
    expect(inferCompressionEligibility(categories)).toBe(true);
  });

  it('creates metadata defaults with governance-aware flags', () => {
    const now = new Date('2026-05-11T00:00:00Z');
    const metadata = createMemoryMetadata(['AUDIT_EVENT'], now);

    expect(metadata.createdAt).toBe('2026-05-11T00:00:00.000Z');
    expect(metadata.lastReferencedAt).toBe('2026-05-11T00:00:00.000Z');
    expect(metadata.retentionClass).toBe('PERMANENT');
    expect(metadata.governanceCriticality).toBe('CRITICAL');
    expect(metadata.decayEligible).toBe(false);
    expect(metadata.compressible).toBe(false);
    expect(metadata.auditRequired).toBe(true);
  });
});
