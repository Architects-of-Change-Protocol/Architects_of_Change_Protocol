import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  AdapterRegistry,
  AdapterTokens,
  AllAdapterTokens,
  RegistryValidationError,
  RuntimeBootstrapEngine,
  RuntimeBootstrapStatus,
  RuntimeProfileValidationMode,
  type AdapterRegistration,
  type RuntimeProfile,
} from '@aoc/protocol/runtime-registry';
import {
  bootstrapEnterpriseAssuranceRuntime,
  EnterpriseAssuranceRuntimeCompositionRoot,
  EnterpriseAssuranceRuntimeProfile,
} from '../../enterprise/src/assurance/runtime-adapter-bootstrap';
import {
  EnterpriseVerificationProvider,
  InMemoryVerificationKeyResolver,
} from '../../enterprise/src/assurance/verification';

const registration = (token: typeof AdapterTokens.AuditEventSink): AdapterRegistration => ({
  token,
  adapter: { recordAuditEvent: () => undefined },
  metadata: { source: 'runtime-bootstrap-test', version: '1.0.0' },
});

const profile = (validationMode: RuntimeProfile['validationMode']): RuntimeProfile => ({
  id: `test.${validationMode}`,
  name: `${validationMode} test profile`,
  requiredTokens: [AdapterTokens.AuditEventSink],
  optionalTokens: [AdapterTokens.PolicyDecisionProvider],
  allowDefaults: false,
  validationMode,
});

const verificationAdapters = () => {
  const verificationKeyResolver = new InMemoryVerificationKeyResolver();
  const verificationProvider = new EnterpriseVerificationProvider(
    verificationKeyResolver,
    { verify: () => true },
    'bootstrap-consolidation-test',
  );
  return { verificationKeyResolver, verificationProvider };
};

describe('PR-09 runtime bootstrap consolidation', () => {
  it('validates every canonical adapter token in strict mode', () => {
    expect(() => new RuntimeBootstrapEngine().bootstrap({
      profile: profile(RuntimeProfileValidationMode.Strict),
      registrations: [registration(AdapterTokens.AuditEventSink)],
    })).toThrow(RegistryValidationError);

    expect(AllAdapterTokens).toHaveLength(15);
  });

  it('validates only required profile tokens in profile mode', () => {
    const result = new RuntimeBootstrapEngine().bootstrap({
      profile: profile(RuntimeProfileValidationMode.Profile),
      registrations: [registration(AdapterTokens.AuditEventSink)],
    });

    expect(result.status).toBe(RuntimeBootstrapStatus.Ready);
    expect(result.requiredAdapters).toEqual([AdapterTokens.AuditEventSink]);
    expect(result.missingAdapters).toEqual([]);
    expect(result.registeredAdapters).toEqual([AdapterTokens.AuditEventSink]);
  });

  it('reports missing adapters without throwing in permissive mode', () => {
    const result = new RuntimeBootstrapEngine().bootstrap({
      profile: profile(RuntimeProfileValidationMode.Permissive),
    });

    expect(result.status).toBe(RuntimeBootstrapStatus.Degraded);
    expect(result.missingAdapters).toEqual([AdapterTokens.AuditEventSink]);
    expect(result.warnings).toEqual([
      'Runtime profile "test.permissive" is missing adapters: audit.sink',
    ]);
  });

  it('uses the shared engine and includes profile metadata in Enterprise Assurance composition', () => {
    const runtime = bootstrapEnterpriseAssuranceRuntime(
      new AdapterRegistry(),
      { adapters: verificationAdapters() },
    );

    expect(runtime.profile).toBe(EnterpriseAssuranceRuntimeProfile);
    expect(runtime.profile.id).toBe('enterprise.assurance');
    expect(runtime.validationMode).toBe(RuntimeProfileValidationMode.Profile);
    expect(runtime.status).toBe(RuntimeBootstrapStatus.Ready);
    expect(runtime.requiredAdapters).toEqual(EnterpriseAssuranceRuntimeProfile.requiredTokens);
    expect(runtime.resolvedContext).toBe(runtime.adapters);
    expect(runtime.startupReport.inventory).toHaveLength(8);
  });

  it('keeps implementation construction and typed resolution in the Enterprise composition root', () => {
    const runtime = new EnterpriseAssuranceRuntimeCompositionRoot().compose({
      adapters: verificationAdapters(),
    });
    const engineSource = readFileSync(resolve(
      process.cwd(),
      'packages/protocol/src/runtime-registry/runtime-bootstrap-engine.ts',
    ), 'utf8');

    expect(runtime.registry.resolve(AdapterTokens.AuditEventSink)).toBe(runtime.adapters.auditEventSink);
    expect(engineSource).not.toMatch(/enterprise|InMemory|VerificationProvider/);
  });
});
