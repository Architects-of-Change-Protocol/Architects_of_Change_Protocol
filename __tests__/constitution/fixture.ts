import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync, type SpawnSyncReturns } from 'node:child_process';

export const repositoryRoot = resolve(__dirname, '../..');

export type ConstitutionalFixture = {
  root: string;
  write(path: string, contents: string): void;
  read(path: string): string;
  run(script: string, args?: string[]): SpawnSyncReturns<string>;
  cleanup(): void;
};

export const createConstitutionalFixture = (): ConstitutionalFixture => {
  const root = mkdtempSync(join(tmpdir(), 'aoc-constitution-'));
  const write = (path: string, contents: string) => {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, contents);
  };

  write('package.json', JSON.stringify({ name: 'fixture-root', private: true, workspaces: ['packages/*', 'enterprise'] }));
  write('packages/protocol/package.json', JSON.stringify({
    name: '@aoc/protocol',
    exports: {
      './contracts': './dist/contracts/index.js',
      './runtime-registry': './dist/runtime-registry/index.js',
    },
  }));
  write('packages/protocol/src/contracts/index.ts', 'export type Contract = { id: string };\n');
  write('packages/protocol/src/runtime-registry/index.ts', 'export interface RegistryContract { resolve(token: string): unknown }\n');
  write('enterprise/package.json', JSON.stringify({
    name: '@aoc/enterprise',
    exports: { '.': './dist/index.js', './assurance': './dist/assurance/index.js' },
  }));
  write('enterprise/src/index.ts', "export * from './assurance';\n");
  write('enterprise/src/assurance/index.ts', 'export const assurance = true;\n');
  write('enterprise/src/assurance/runtime-adapter-bootstrap.ts', 'export class EnterpriseAssuranceRuntimeCompositionRoot {}\n');

  return {
    root,
    write,
    read: (path: string) => readFileSync(join(root, path), 'utf8'),
    run: (script, args = []) => spawnSync(process.execPath, [join(repositoryRoot, 'scripts', script), '--root', root, ...args], {
      cwd: repositoryRoot,
      encoding: 'utf8',
    }),
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
};

export const writeConstitutionalGovernance = (fixture: ConstitutionalFixture, options: {
  version?: string;
  amendmentId?: string;
  status?: 'Ratified' | 'Pending' | 'Rejected' | 'Superseded';
  affectedLaws?: string;
  affectedAuthorities?: string;
} = {}) => {
  const version = options.version ?? 'v1.0';
  const amendmentId = options.amendmentId ?? 'AOC-AMD-0001';
  const status = options.status ?? 'Ratified';
  const affectedLaws = options.affectedLaws ?? 'LAW-008';
  const affectedAuthorities = options.affectedAuthorities ?? 'Constitution';

  fixture.write('docs/constitution/CONSTITUTION.md', `# Constitution\n\n**Constitution Version:** ${version}\n`);
  fixture.write('docs/constitution/CONSTITUTION-VERSION-HISTORY.md', `# History\n\n| Version | Date | Amendments | Summary | Breaking Changes |\n|---|---|---|---|---|\n| ${version} | 2026-06-08 | ${amendmentId} | Test amendment | None |\n`);
  fixture.write('docs/constitution/AMENDMENT-PROCEDURE.md', '# Amendment Procedure\n');
  fixture.write('docs/constitution/AMENDMENT-CATALOG.md', `# Amendment Catalog\n\n**Constitution Version:** ${version}\n\n## ${amendmentId} — Test Amendment\n\n- **Amendment ID:** ${amendmentId}\n- **Title:** Test Amendment\n- **Author:** Test\n- **Date:** 2026-06-08\n- **Type:** Type C\n- **Version:** ${version}\n- **Affected Laws:** ${affectedLaws}\n- **Affected Authorities:** ${affectedAuthorities}\n- **Rationale:** Test governance.\n- **Risk Assessment:** Test risk.\n- **Migration Impact:** Test migration.\n- **Ratification Status:** ${status}\n`);

  const canonicalRows = [
    ['Protocol', 'packages/protocol/src', 'Protocol owner', 'Canonical'],
    ['Enterprise', 'enterprise/src', 'Enterprise owner', 'Canonical'],
    ['Compatibility audit', 'packages/audit-runtime/src', 'Compatibility owner', 'Deprecated'],
    ['Compatibility trust', 'packages/trust-registry-runtime/src', 'Compatibility owner', 'Deprecated'],
    ['runtime audit', 'runtime/audit', 'Compatibility owner', 'Deprecated'],
    ['runtime trust', 'runtime/trust', 'Compatibility owner', 'Deprecated'],
    ['runtime observability', 'runtime/observability.ts', 'Compatibility owner', 'Deprecated'],
    ['authorization-runtime', 'packages/authorization-runtime/src', 'Transitional owner', 'Transitional'],
    ['capability-runtime', 'packages/capability-runtime/src', 'Transitional owner', 'Transitional'],
    ['consent-runtime', 'packages/consent-runtime/src', 'Transitional owner', 'Transitional'],
    ['governance-runtime', 'packages/governance-runtime/src', 'Transitional owner', 'Transitional'],
    ['portable-cognition', 'packages/portable-cognition/src', 'Transitional owner', 'Transitional'],
    ['vault-runtime', 'packages/vault-runtime/src', 'Transitional owner', 'Transitional'],
    ['runtime governance', 'runtime/governance', 'Transitional owner', 'Transitional'],
    ['runtime marketplace', 'runtime/marketplace', 'Transitional owner', 'Transitional'],
    ['runtime monetization', 'runtime/monetization', 'Transitional owner', 'Transitional'],
    ['runtime payout', 'runtime/payout', 'Transitional owner', 'Transitional'],
    ['pmfreak-adapter', 'examples/pmfreak-adapter/src', 'Transitional owner', 'Transitional'],
    ['Constitution', 'docs/constitution', 'Constitution owner', 'Canonical'],
    ['bootstrap', 'enterprise/src/assurance/runtime-adapter-bootstrap.ts', 'Composition authority', 'Canonical'],
    ['resolver', 'enterprise/src/assurance/runtime-adapter-resolver.ts', 'Composition authority', 'Canonical'],
    ['engine', 'packages/protocol/src/runtime-registry/runtime-bootstrap-engine.ts', 'Composition authority', 'Canonical'],
    ['routes', 'runtime/api/routes.ts', 'Composition authority', 'Canonical'],
    ['server', 'runtime/api/server.ts', 'Composition authority', 'Canonical'],
    ['adapter', 'examples/pmfreak-adapter/src/index.ts', 'Composition authority', 'Transitional'],
    ['client', 'frontend/app/src/lib/runtimeClient.ts', 'Composition authority', 'Canonical'],
  ];
  const rows = canonicalRows.map(([authority, owner, purpose, authorityStatus]) => `| ${authority} | \`${owner}\` | ${purpose} | ${amendmentId} | Not scheduled | ${authorityStatus} |`).join('\n');
  fixture.write('docs/constitution/CONSTITUTIONAL-AUTHORITIES.md', `# Authorities\n\n**Constitution Version:** ${version}\n\n| Authority | Owner | Purpose | Creation Amendment | Retirement Amendment | Status |\n|---|---|---|---|---|---|\n${rows}\n`);
};

export const writeCapabilityGovernance = (fixture: ConstitutionalFixture, options: {
  version?: string;
  amendmentId?: string;
  capabilityRows?: string;
  assignmentRows?: string;
  transitionRows?: string;
} = {}) => {
  const version = options.version ?? 'v1.0';
  const amendmentId = options.amendmentId ?? 'AOC-AMD-0001';
  writeConstitutionalGovernance(fixture, {
    version,
    amendmentId,
    affectedAuthorities: 'Capability Authorities CAP-0001 through CAP-0004',
  });

  const capabilityRows = options.capabilityRows ?? [
    `| CAP-0001 | Amend Constitution | Constitutional | Constitution | No | No | ${amendmentId} | Not scheduled | Canonical |`,
    `| CAP-0002 | Create Policy | Governance | Constitution | Yes | Yes | ${amendmentId} | Not scheduled | Canonical |`,
    `| CAP-0003 | Issue Claims | Runtime | Protocol | Yes | Yes | ${amendmentId} | Not scheduled | Canonical |`,
    `| CAP-0004 | Read | Operational | Enterprise | Yes | Yes | ${amendmentId} | Not scheduled | Canonical |`,
  ].join('\n');
  const assignmentRows = options.assignmentRows ?? [
    `| CAA-0001 | CAP-0001 | Constitution | Constitution | Root | Ratified | ${amendmentId} |`,
    `| CAA-0002 | CAP-0002 | Constitution | Constitution | Root | Ratified | ${amendmentId} |`,
    `| CAA-0003 | CAP-0003 | Protocol | Constitution | Root | Ratified | ${amendmentId} |`,
    `| CAA-0004 | CAP-0004 | Enterprise | Constitution | Root | Ratified | ${amendmentId} |`,
  ].join('\n');
  const transitionRows = options.transitionRows ?? `| CAT-0001 | CAA-0001 | Proposed | Ratified | Constitution | ${amendmentId} |`;

  fixture.write('docs/constitution/CAPABILITY-CONSTITUTION.md', `# Capability Constitution\n\n**Constitution Version:** ${version}\n`);
  fixture.write('docs/constitution/CAPABILITY-LIFECYCLE.md', `# Capability Lifecycle\n\n**Constitution Version:** ${version}\n`);
  fixture.write('docs/constitution/CAPABILITY-DELEGATION-POLICY.md', `# Capability Delegation Policy\n\n**Constitution Version:** ${version}\n`);
  fixture.write('docs/constitution/CAPABILITY-REVOCATION-POLICY.md', `# Capability Revocation Policy\n\n**Constitution Version:** ${version}\n`);
  fixture.write('docs/constitution/CAPABILITY-VIOLATION-CATALOG.md', `# Capability Violations\n\n**Constitution Version:** ${version}\n`);
  fixture.write('docs/constitution/CAPABILITY-AUTHORITIES.md', `# Capability Authorities\n\n**Constitution Version:** ${version}\n\n## Capability catalog\n\n| Capability ID | Name | Capability Class | Owner | Delegable | Revocable | Creation Amendment | Retirement Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n${capabilityRows}\n\n## Capability authority assignments\n\n| Assignment ID | Capability ID | Holder | Granted By | Parent Assignment | Lifecycle State | Amendment |\n|---|---|---|---|---|---|---|\n${assignmentRows}\n\n## Capability lifecycle transition ledger\n\n| Transition ID | Assignment ID | From | To | Authorized By | Amendment |\n|---|---|---|---|---|---|\n${transitionRows}\n`);

  for (const document of [
    'CAPABILITY_RUNTIME_ARCHITECTURE.md',
    'CAPABILITY_DELEGATION_MODEL.md',
    'CAPABILITY_ATTENUATION_MODEL.md',
    'CAPABILITY_LINEAGE_MODEL.md',
    'CAPABILITY_REVOCATION_MODEL.md',
    'CAPABILITY_EXPLAINABILITY_TRACE.md',
    'CAPABILITY_CONSTRAINT_MODEL.md',
    'CAPABILITY_PUBLIC_INTERNAL_BOUNDARIES.md',
    'SOVEREIGN_EXECUTION_SEMANTICS.md',
    'CAPABILITY_EVOLUTION_ROADMAP.md',
  ]) fixture.write(document, `# ${document}\n`);
  fixture.write('runtime/capabilities/governance.ts', 'export function validateDelegation() {}\nexport function attenuateCapability() {}\nexport function evaluateCapabilityLineage() {}\n');
};

export const writePolicyGovernance = (fixture: ConstitutionalFixture, options: {
  version?: string;
  amendmentId?: string;
  policyRows?: string;
  inheritanceRows?: string;
  exceptionRows?: string;
  conflictRows?: string;
  lifecycleRows?: string;
} = {}) => {
  const version = options.version ?? 'v1.0';
  const amendmentId = options.amendmentId ?? 'AOC-AMD-0001';
  writeCapabilityGovernance(fixture, { version, amendmentId });

  const policyRows = options.policyRows ?? [
    `| POL-0001 | Constitutional Baseline | Constitutional | Constitution | CAP-0001–CAP-0004 | Integrity | Require | 10 | 100 | No | ${amendmentId} | Not scheduled | Canonical | Active |`,
    `| POL-0002 | Governance Control | Governance | Constitution | CAP-0002 | Governance | Require | 20 | 80 | No | ${amendmentId} | Not scheduled | Canonical | Active |`,
    `| POL-0003 | Runtime Evidence | Runtime | Protocol | CAP-0003 | Evidence | Require | 20 | 70 | No | ${amendmentId} | Not scheduled | Canonical | Active |`,
    `| POL-0004 | Operational Audit | Operational | Enterprise | CAP-0004 | Audit | Require | 20 | 60 | Yes | ${amendmentId} | Not scheduled | Canonical | Active |`,
  ].join('\n');
  const inheritanceRows = options.inheritanceRows ?? [
    `| PIN-0001 | POL-0001 | POL-0002 | Narrows | ${amendmentId} | Active |`,
    `| PIN-0002 | POL-0001 | POL-0003 | Narrows | ${amendmentId} | Active |`,
    `| PIN-0003 | POL-0001 | POL-0004 | Narrows | ${amendmentId} | Active |`,
  ].join('\n');
  const lifecycleRows = options.lifecycleRows ?? [1, 2, 3, 4].flatMap((id) => [
    `| PLT-${String(id * 2 - 1).padStart(4, '0')} | POL-${String(id).padStart(4, '0')} | Proposed | Ratified | ${amendmentId} | 2026-06-08 |`,
    `| PLT-${String(id * 2).padStart(4, '0')} | POL-${String(id).padStart(4, '0')} | Ratified | Active | ${amendmentId} | 2026-06-08 |`,
  ]).join('\n');

  fixture.write('docs/constitution/POLICY-CONSTITUTION.md', `# Policy Constitution\n\n**Constitution Version:** ${version}\n`);
  fixture.write('docs/constitution/POLICY-VIOLATION-CATALOG.md', `# Policy Violations\n\n**Constitution Version:** ${version}\n`);
  fixture.write('docs/constitution/POLICY-AUTHORITIES.md', `# Policy Authorities\n\n**Constitution Version:** ${version}\n\n## Policy catalog\n\n| Policy ID | Policy Name | Policy Class | Owner | Applies To Capability IDs | Rule Domain | Effect | Constraint Strength | Priority | Delegable | Creation Amendment | Retirement Amendment | Status | Lifecycle State |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|\n${policyRows}\n\n## Policy delegation records\n\n| Delegation ID | Policy ID | Grantor | Delegate | Scope | Expiration | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/POLICY-HIERARCHY.md', `# Policy Hierarchy\n\n**Constitution Version:** ${version}\n\n## Inheritance registry\n\n| Inheritance ID | Parent Policy | Child Policy | Relationship | Amendment | Status |\n|---|---|---|---|---|---|\n${inheritanceRows}\n`);
  fixture.write('docs/constitution/POLICY-EXCEPTION-POLICY.md', `# Policy Exceptions\n\n**Constitution Version:** ${version}\n\n## Exception registry\n\n| Exception ID | Type | Owner | Duration | Affected Policy | Replacement Constraint | Ratified Amendment | Effective Date | Expiration | Status |\n|---|---|---|---|---|---|---|---|---|---|\n${options.exceptionRows ?? ''}\n`);
  fixture.write('docs/constitution/POLICY-CONFLICT-RESOLUTION.md', `# Policy Conflicts\n\n**Constitution Version:** ${version}\n\n## Conflict registry\n\n| Conflict ID | Policy IDs | Capability IDs | Rule Domain | Winner | Resolution Basis | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n${options.conflictRows ?? ''}\n`);
  fixture.write('docs/constitution/POLICY-LIFECYCLE.md', `# Policy Lifecycle\n\n**Constitution Version:** ${version}\n\n## Lifecycle transition ledger\n\n| Transition ID | Policy ID | From | To | Amendment | Effective Date |\n|---|---|---|---|---|---|\n${lifecycleRows}\n`);
};

export const writeDecisionGovernance = (fixture: ConstitutionalFixture, options: {
  version?: string;
  amendmentId?: string;
  decisionRows?: string;
  lifecycleRows?: string;
  evidenceRows?: string;
  explanationRows?: string;
  appealRows?: string;
  revocationRows?: string;
} = {}) => {
  const version = options.version ?? 'v1.0';
  const amendmentId = options.amendmentId ?? 'AOC-AMD-0001';
  writePolicyGovernance(fixture, { version, amendmentId });

  const decisionRows = options.decisionRows ?? [
    `| DEC-0001 | Ratify Amendment | Constitutional | Constitution | EVID-0001 | POL-0001 | No | Yes | ${amendmentId} | Not scheduled | Canonical | Approved |`,
    `| DEC-0002 | Assign Capability | Governance | Constitution | EVID-0002 | POL-0002 | Yes | Yes | ${amendmentId} | Not scheduled | Canonical | Approved |`,
    `| DEC-0003 | Accept Claim | Runtime | Protocol | EVID-0003 | POL-0003 | Yes | Yes | ${amendmentId} | Not scheduled | Canonical | Approved |`,
    `| DEC-0004 | Audit Passed | Operational | Enterprise | EVID-0004 | POL-0004 | Yes | Yes | ${amendmentId} | Not scheduled | Canonical | Approved |`,
  ].join('\n');
  const lifecycleRows = options.lifecycleRows ?? [1, 2, 3, 4].flatMap((id) => [
    `| DLT-${String(id * 3 - 2).padStart(4, '0')} | DEC-${String(id).padStart(4, '0')} | Proposed | Pending Evidence | ${amendmentId} | 2026-06-08 |`,
    `| DLT-${String(id * 3 - 1).padStart(4, '0')} | DEC-${String(id).padStart(4, '0')} | Pending Evidence | Pending Review | ${amendmentId} | 2026-06-08 |`,
    `| DLT-${String(id * 3).padStart(4, '0')} | DEC-${String(id).padStart(4, '0')} | Pending Review | Approved | ${amendmentId} | 2026-06-08 |`,
  ]).join('\n');
  const evidenceRows = options.evidenceRows ?? [1, 2, 3, 4].map((id) => `| EVID-${String(id).padStart(4, '0')} | DEC-${String(id).padStart(4, '0')} | 1 verified record | Fixture source | Fixture traceability | Fixture integrity | ${amendmentId} | Active |`).join('\n');
  const explanationRows = options.explanationRows ?? [
    `| DEX-0001 | DEC-0001 | EVID-0001 | POL-0001 | CAP-0001 | Constitution → CAP-0001 | Approved | Fixture constitutional explanation. | ${amendmentId} | Complete |`,
    `| DEX-0002 | DEC-0002 | EVID-0002 | POL-0002 | CAP-0002 | Constitution → CAP-0002 | Approved | Fixture governance explanation. | ${amendmentId} | Complete |`,
    `| DEX-0003 | DEC-0003 | EVID-0003 | POL-0003 | CAP-0003 | Protocol → CAP-0003 | Approved | Fixture runtime explanation. | ${amendmentId} | Complete |`,
    `| DEX-0004 | DEC-0004 | EVID-0004 | POL-0004 | CAP-0004 | Enterprise → CAP-0004 | Approved | Fixture operational explanation. | ${amendmentId} | Complete |`,
  ].join('\n');

  fixture.write('docs/constitution/DECISION-CONSTITUTION.md', `# Decision Constitution\n\n**Constitution Version:** ${version}\n`);
  fixture.write('docs/constitution/DECISION-AUTHORITIES.md', `# Decision Authorities\n\n**Constitution Version:** ${version}\n\n## Decision catalog\n\n| Decision ID | Decision Name | Decision Class | Owner | Required Evidence | Required Policy Coverage | Appealable | Revocable | Creation Amendment | Retirement Amendment | Status | Lifecycle State |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n${decisionRows}\n`);
  fixture.write('docs/constitution/DECISION-LIFECYCLE.md', `# Decision Lifecycle\n\n**Constitution Version:** ${version}\n\n## Lifecycle transition ledger\n\n| Transition ID | Decision ID | From | To | Amendment | Effective Date |\n|---|---|---|---|---|---|\n${lifecycleRows}\n`);
  fixture.write('docs/constitution/DECISION-EVIDENCE-POLICY.md', `# Decision Evidence\n\n**Constitution Version:** ${version}\n\n## Evidence requirements registry\n\n| Evidence ID | Decision ID | Evidence Minimums | Evidence Sources | Evidence Traceability | Evidence Integrity | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n${evidenceRows}\n`);
  fixture.write('docs/constitution/DECISION-EXPLAINABILITY-POLICY.md', `# Decision Explainability\n\n**Constitution Version:** ${version}\n\n## Explanation registry\n\n| Explanation ID | Decision ID | Evidence Used | Policies Applied | Capabilities Used | Authority Chain | Outcome | Reasoning Summary | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|\n${explanationRows}\n`);
  fixture.write('docs/constitution/DECISION-APPEALS-POLICY.md', `# Decision Appeals\n\n**Constitution Version:** ${version}\n\n## Appeal registry\n\n| Appeal ID | Decision ID | Grounds | Evidence | Resolution | Amendment | Status |\n|---|---|---|---|---|---|---|\n${options.appealRows ?? ''}\n`);
  fixture.write('docs/constitution/DECISION-REVOCATION-POLICY.md', `# Decision Revocation\n\n**Constitution Version:** ${version}\n\n## Revocation registry\n\n| Revocation ID | Decision ID | Cause | Evidence | Revoked By | Amendment | Effective Date | Status |\n|---|---|---|---|---|---|---|---|\n${options.revocationRows ?? ''}\n`);
  fixture.write('docs/constitution/DECISION-VIOLATION-CATALOG.md', `# Decision Violations\n\n**Constitution Version:** ${version}\n`);
};

export const writeStandingGovernance = (fixture: ConstitutionalFixture, options: {
  version?: string;
  amendmentId?: string;
  standingRows?: string;
  eligibilityRows?: string;
  lifecycleRows?: string;
  delegationRows?: string;
  representationRows?: string;
  revocationRows?: string;
} = {}) => {
  const version = options.version ?? 'v1.0';
  const amendmentId = options.amendmentId ?? 'AOC-AMD-0001';
  writeDecisionGovernance(fixture, { version, amendmentId });
  const standingRows = options.standingRows ?? [
    `| STD-0001 | Constitution | Constitutional | Constitution | SEP-0001 | No | No | Yes | ${amendmentId} | Not scheduled | Canonical |`,
    `| STD-0002 | Decision Reviewer | Governance | Constitution | SEP-0002 | Yes | Yes | Yes | ${amendmentId} | Not scheduled | Canonical |`,
    `| STD-0003 | Claimant | Runtime | Protocol | SEP-0003 | No | Yes | Yes | ${amendmentId} | Not scheduled | Canonical |`,
    `| STD-0004 | Auditor | Operational | Enterprise | SEP-0004 | Yes | Yes | Yes | ${amendmentId} | Not scheduled | Canonical |`,
  ].join('\n');
  const eligibilityRows = options.eligibilityRows ?? [1, 2, 3, 4].map((id) => `| SEP-${String(id).padStart(4, '0')} | STD-${String(id).padStart(4, '0')} | Fixture requirements | Fixture disqualifiers | Fixture evidence | Fixture validation | Fixture renewal | ${amendmentId} | Active |`).join('\n');
  const lifecycleRows = options.lifecycleRows ?? [1, 2, 3, 4].flatMap((id) => [
    `| SLT-${String(id * 2 - 1).padStart(4, '0')} | STD-${String(id).padStart(4, '0')} | Proposed | Pending Validation | Constitution | ${amendmentId} | 2026-06-08 |`,
    `| SLT-${String(id * 2).padStart(4, '0')} | STD-${String(id).padStart(4, '0')} | Pending Validation | Active | Constitution | ${amendmentId} | 2026-06-08 |`,
  ]).join('\n');
  const delegationPermissions = [
    `| STD-0001 | Constitution | No | Prohibited | ${amendmentId} |`,
    `| STD-0002 | Decision Reviewer | Yes | Bounded | ${amendmentId} |`,
    `| STD-0003 | Claimant | No | Prohibited | ${amendmentId} |`,
    `| STD-0004 | Auditor | Yes | Bounded | ${amendmentId} |`,
  ].join('\n');
  const representationPermissions = [
    `| STD-0001 | Constitution | No | Prohibited | ${amendmentId} |`,
    `| STD-0002 | Decision Reviewer | Yes | Bounded | ${amendmentId} |`,
    `| STD-0003 | Claimant | Yes | Bounded | ${amendmentId} |`,
    `| STD-0004 | Auditor | Yes | Bounded | ${amendmentId} |`,
  ].join('\n');
  fixture.write('docs/constitution/STANDING-CONSTITUTION.md', `# Standing Constitution\n\n**Constitution Version:** ${version}\n`);
  fixture.write('docs/constitution/STANDING-AUTHORITIES.md', `# Standing Authorities\n\n**Constitution Version:** ${version}\n\n## Standing authority catalog\n\n| Standing ID | Standing Name | Standing Class | Owner | Eligibility Policy | Delegable | Representable | Revocable | Creation Amendment | Retirement Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|---|\n${standingRows}\n`);
  fixture.write('docs/constitution/STANDING-ELIGIBILITY-POLICY.md', `# Eligibility\n\n**Constitution Version:** ${version}\n\n## Eligibility policy registry\n\n| Eligibility Policy ID | Standing ID | Eligibility Requirements | Disqualifiers | Evidence Requirements | Validation Requirements | Renewal Requirements | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n${eligibilityRows}\n`);
  fixture.write('docs/constitution/STANDING-LIFECYCLE.md', `# Lifecycle\n\n**Constitution Version:** ${version}\n\n## Standing lifecycle transition ledger\n\n| Transition ID | Standing ID | From | To | Authorized By | Amendment | Effective Date |\n|---|---|---|---|---|---|---|\n${lifecycleRows}\n`);
  fixture.write('docs/constitution/STANDING-DELEGATION-POLICY.md', `# Delegation\n\n**Constitution Version:** ${version}\n\n## Delegation permissions\n\n| Standing ID | Standing Name | Delegable | Maximum Scope | Amendment |\n|---|---|---|---|---|\n${delegationPermissions}\n\n## Delegation registry\n\n| Delegation ID | Standing ID | Delegator | Delegate | Scope | Starts | Expires | Evidence | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|\n${options.delegationRows ?? ''}\n`);
  fixture.write('docs/constitution/STANDING-REPRESENTATION-POLICY.md', `# Representation\n\n**Constitution Version:** ${version}\n\n## Representation permissions\n\n| Standing ID | Standing Name | Representable | Permitted Form and Scope | Amendment |\n|---|---|---|---|---|\n${representationPermissions}\n\n## Representation registry\n\n| Representation ID | Standing ID | Principal | Representative | Form | Scope | Starts | Expires | Evidence | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|---|\n${options.representationRows ?? ''}\n`);
  fixture.write('docs/constitution/STANDING-REVOCATION-POLICY.md', `# Revocation\n\n**Constitution Version:** ${version}\n\n## Revocation registry\n\n| Revocation ID | Standing ID | Participant | Cause | Evidence | Revoked By | Amendment | Effective Date | Status |\n|---|---|---|---|---|---|---|---|---|\n${options.revocationRows ?? ''}\n`);
  fixture.write('docs/constitution/STANDING-VIOLATION-CATALOG.md', `# Violations\n\n**Constitution Version:** ${version}\n`);
};

export const writeClaimGovernance = (fixture: ConstitutionalFixture, options: {
  version?: string;
  amendmentId?: string;
  claimRows?: string;
  evidenceRows?: string;
  lifecycleRows?: string;
  disputeRows?: string;
  supersessionRows?: string;
  withdrawalRows?: string;
} = {}) => {
  const version = options.version ?? 'v1.0';
  const amendmentId = options.amendmentId ?? 'AOC-AMD-0001';
  writeStandingGovernance(fixture, { version, amendmentId });
  writeConstitutionalGovernance(fixture, { version, amendmentId, affectedAuthorities: 'Constitution; Claim Authorities; Claim Evidence; Claim Lifecycle' });
  const claimRows = options.claimRows ?? [
    `| CLM-0001 | Amendment Claim | Constitutional | Constitution | CEP-0001 | Yes | Yes | Yes | ${amendmentId} | Not scheduled | Canonical |`,
    `| CLM-0002 | Policy Violation Claim | Governance | Constitution | CEP-0002 | Yes | Yes | Yes | ${amendmentId} | Not scheduled | Canonical |`,
    `| CLM-0003 | Identity Claim | Runtime | Protocol | CEP-0003 | Yes | Yes | Yes | ${amendmentId} | Not scheduled | Canonical |`,
    `| CLM-0004 | Audit Claim | Operational | Enterprise | CEP-0004 | Yes | Yes | Yes | ${amendmentId} | Not scheduled | Canonical |`,
  ].join('\n');
  const evidenceRows = options.evidenceRows ?? [1,2,3,4].map((id) => `| CEP-${String(id).padStart(4,'0')} | CLM-${String(id).padStart(4,'0')} | Required fixture evidence | One fixture record | Fixture source | Fixture integrity | Fixture traceability | ${amendmentId} | Active |`).join('\n');
  const lifecycleRows = options.lifecycleRows ?? [1,2,3,4].flatMap((id) => [
    `| CLT-${String(id*3-2).padStart(4,'0')} | CLM-${String(id).padStart(4,'0')} | Draft | Submitted | Constitution | ${amendmentId} | 2026-06-08 |`,
    `| CLT-${String(id*3-1).padStart(4,'0')} | CLM-${String(id).padStart(4,'0')} | Submitted | Pending Review | Constitution | ${amendmentId} | 2026-06-08 |`,
    `| CLT-${String(id*3).padStart(4,'0')} | CLM-${String(id).padStart(4,'0')} | Pending Review | Accepted | Constitution | ${amendmentId} | 2026-06-08 |`,
  ]).join('\n');
  fixture.write('docs/constitution/CLAIM-CONSTITUTION.md', `# Claim Constitution\n\n**Constitution Version:** ${version}\n`);
  fixture.write('docs/constitution/CLAIM-AUTHORITIES.md', `# Claim Authorities\n\n**Constitution Version:** ${version}\n\n## Claim authority catalog\n\n| Claim ID | Claim Name | Claim Class | Owner | Evidence Policy | Disputable | Withdrawable | Supersedable | Creation Amendment | Retirement Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|---|\n${claimRows}\n`);
  fixture.write('docs/constitution/CLAIM-EVIDENCE-POLICY.md', `# Claim Evidence\n\n**Constitution Version:** ${version}\n\n## Evidence requirements registry\n\n| Evidence Policy ID | Claim ID | Required Evidence | Minimum Evidence | Allowed Sources | Integrity Rules | Traceability Rules | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n${evidenceRows}\n`);
  fixture.write('docs/constitution/CLAIM-LIFECYCLE.md', `# Claim Lifecycle\n\n**Constitution Version:** ${version}\n\n## Claim lifecycle transition ledger\n\n| Transition ID | Claim ID | From | To | Authorized By | Amendment | Effective Date |\n|---|---|---|---|---|---|---|\n${lifecycleRows}\n`);
  fixture.write('docs/constitution/CLAIM-DISPUTE-POLICY.md', `# Claim Disputes\n\n**Constitution Version:** ${version}\n\n## Dispute registry\n\n| Dispute ID | Claim ID | Grounds | Evidence | Initiator | Resolution | Decision Reference | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n${options.disputeRows ?? ''}\n`);
  fixture.write('docs/constitution/CLAIM-SUPERSESSION-POLICY.md', `# Claim Supersession\n\n**Constitution Version:** ${version}\n\n## Supersession registry\n\n| Supersession ID | Old Claim | New Claim | Same Subject | Reason | Evidence | Decision Reference | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n${options.supersessionRows ?? ''}\n`);
  fixture.write('docs/constitution/CLAIM-WITHDRAWAL-POLICY.md', `# Claim Withdrawal\n\n**Constitution Version:** ${version}\n\n## Withdrawal registry\n\n| Withdrawal ID | Claim ID | Requested By | Authority Basis | Authority Evidence | Reason | Decision Reference | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n${options.withdrawalRows ?? ''}\n`);
  fixture.write('docs/constitution/CLAIM-VIOLATION-CATALOG.md', `# Claim Violations\n\n**Constitution Version:** ${version}\n`);
};

export const writeTrustGovernance = (fixture: ConstitutionalFixture, options: {
  version?: string;
  amendmentId?: string;
  trustRows?: string;
  evidenceRows?: string;
  lifecycleRows?: string;
  issuanceRows?: string;
  decayRows?: string;
  revocationAuthorityRows?: string;
  revocationRows?: string;
} = {}) => {
  const version = options.version ?? 'v1.0';
  const amendmentId = options.amendmentId ?? 'AOC-AMD-0001';
  writeClaimGovernance(fixture, { version, amendmentId });
  writeConstitutionalGovernance(fixture, { version, amendmentId, affectedAuthorities: 'Constitution; Trust Authorities; Trust Evidence; Trust Lifecycle; Trust Confidence' });
  const definitions = [
    ['TRS-0001', 'Constitutional Integrity', 'Constitutional', 'Constitution', 'TEP-0001'],
    ['TRS-0002', 'Reviewer Trust', 'Governance', 'Constitution', 'TEP-0002'],
    ['TRS-0003', 'Identity Trust', 'Runtime', 'Protocol', 'TEP-0003'],
    ['TRS-0004', 'Audit Trust', 'Operational', 'Enterprise', 'TEP-0004'],
  ];
  const trustRows = options.trustRows ?? definitions.map(([id,name,kind,owner,evidence]) => `| ${id} | ${name} | ${kind} | ${owner} | ${evidence} | Yes | Yes | ${amendmentId} | Not scheduled | Canonical |`).join('\n');
  const evidenceRows = options.evidenceRows ?? definitions.map(([id,,, ,evidence]) => `| ${evidence} | ${id} | Fixture evidence | Primary 100% | Fixture integrity | Within 90 days | One record | Weighted fixture calculation | ${amendmentId} | Active |`).join('\n');
  const lifecycleRows = options.lifecycleRows ?? definitions.flatMap(([id,,,owner,evidence], index) => [
    `| TRT-${String(index * 2 + 1).padStart(4, '0')} | ${id} | Proposed | Pending Evaluation | ${owner} | Evaluation opened | ${amendmentId} | 2026-06-08 |`,
    `| TRT-${String(index * 2 + 2).padStart(4, '0')} | ${id} | Pending Evaluation | Active | ${owner} | ${evidence} satisfied | ${amendmentId} | 2026-06-08 |`,
  ]).join('\n');
  const issuanceRows = options.issuanceRows ?? definitions.map(([id,,,owner]) => `| ${id} | Required | Required | Required | ${owner} | No | Not applicable | Required | ${amendmentId} | Active |`).join('\n');
  const decayRows = options.decayRows ?? definitions.map(([id]) => `| ${id} | Yes | Time; Inactivity | Recalculate current confidence | Zero | Required | ${amendmentId} | Active |`).join('\n');
  const causes = 'Fraud; Evidence Failure; Identity Failure; Standing Failure; Constitutional Override; Governance Decision';
  const revocationAuthorityRows = options.revocationAuthorityRows ?? definitions.map(([id,,,owner]) => `| ${id} | Yes | ${causes} | ${owner} | Required | Required | ${amendmentId} | Active |`).join('\n');
  fixture.write('docs/constitution/TRUST-CONSTITUTION.md', `# Trust Constitution\n\n**Constitution Version:** ${version}\n`);
  fixture.write('docs/constitution/TRUST-AUTHORITIES.md', `# Trust Authorities\n\n**Constitution Version:** ${version}\n\n## Trust authority catalog\n\n| Trust ID | Trust Name | Trust Class | Owner | Evidence Policy | Decay Enabled | Revocable | Creation Amendment | Retirement Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|\n${trustRows}\n`);
  fixture.write('docs/constitution/TRUST-EVIDENCE-POLICY.md', `# Trust Evidence\n\n**Constitution Version:** ${version}\n\n## Trust evidence registry\n\n| Evidence Policy ID | Trust ID | Evidence Sources | Evidence Weight | Integrity Rules | Recency Rules | Minimum Evidence | Trust Calculation Basis | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|\n${evidenceRows}\n`);
  fixture.write('docs/constitution/TRUST-LIFECYCLE.md', `# Trust Lifecycle\n\n**Constitution Version:** ${version}\n\n## Trust lifecycle transition ledger\n\n| Transition ID | Trust ID | From | To | Authorized By | Evidence Evaluation | Amendment | Effective Date |\n|---|---|---|---|---|---|---|---|\n${lifecycleRows}\n`);
  fixture.write('docs/constitution/TRUST-ISSUANCE-POLICY.md', `# Trust Issuance\n\n**Constitution Version:** ${version}\n\n## Trust issuance requirements registry\n\n| Trust ID | Standing Requirement | Claim Requirement | Evidence Evaluation | Issuance Authority | Self-Issuable | Self-Issuance Authorization | Trust Record Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|\n${issuanceRows}\n`);
  fixture.write('docs/constitution/TRUST-DECAY-POLICY.md', `# Trust Decay\n\n**Constitution Version:** ${version}\n\n## Trust decay rules registry\n\n| Trust ID | Enabled | Trigger | Rule | Floor | Historical Preservation | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n${decayRows}\n`);
  fixture.write('docs/constitution/TRUST-REVOCATION-POLICY.md', `# Trust Revocation\n\n**Constitution Version:** ${version}\n\n## Trust revocation authority registry\n\n| Trust ID | Revocable | Valid Causes | Revocation Authority | Evidence Required | Decision Reference Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n${revocationAuthorityRows}\n\n## Trust revocation registry\n\n| Revocation ID | Trust ID | Subject | Cause | Evidence | Revoked By | Decision Reference | Amendment | Effective Date | Status |\n|---|---|---|---|---|---|---|---|---|---|\n${options.revocationRows ?? ''}\n`);
  fixture.write('docs/constitution/TRUST-VIOLATION-CATALOG.md', `# Trust Violations\n\n**Constitution Version:** ${version}\n`);
};

export const writeVerificationGovernance = (fixture: ConstitutionalFixture, options: {
  version?: string;
  amendmentId?: string;
} = {}) => {
  const version = options.version ?? 'v1.0';
  const amendmentId = options.amendmentId ?? 'AOC-AMD-0001';
  writeTrustGovernance(fixture, { version, amendmentId });
  writeConstitutionalGovernance(fixture, { version, amendmentId, affectedAuthorities: 'Constitution; Verification Authorities; Verification Evidence; Verification Lifecycle; Verification Methods' });

  const verDefs = [
    ['VER-0001', 'Constitution Verification', 'Constitutional', 'Constitution', 'VMP-0001', 'VEP-0001', 'VXP-0001'],
    ['VER-0002', 'Capability Verification', 'Governance', 'Constitution', 'VMP-0002', 'VEP-0002', 'VXP-0002'],
    ['VER-0003', 'Identity Verification', 'Runtime', 'Protocol', 'VMP-0003', 'VEP-0003', 'VXP-0003'],
    ['VER-0004', 'Audit Verification', 'Operational', 'Enterprise', 'VMP-0004', 'VEP-0004', 'VXP-0004'],
  ] as const;

  const verRows = verDefs.map(([id, name, cls, owner, method, evidence, expiration]) =>
    `| ${id} | ${name} | ${cls} | ${owner} | ${method} | ${evidence} | ${expiration} | Yes | ${amendmentId} | Not scheduled | Canonical |`
  ).join('\n');

  const evidenceRows = verDefs.map(([id,,,,,evidence]) =>
    `| ${evidence} | ${id} | Required fixture evidence | One fixture record | No alterations permitted | Within 90 days | One record verified | Subject identity traceable | ${amendmentId} | Active |`
  ).join('\n');

  const lifecycleRows = verDefs.flatMap(([id,,,owner], index) => [
    `| VLT-${String(index * 2 + 1).padStart(4, '0')} | ${id} | Proposed | Pending Verification | ${owner} | Review initiated | ${amendmentId} | 2026-06-09 |`,
    `| VLT-${String(index * 2 + 2).padStart(4, '0')} | ${id} | Pending Verification | Verified | ${owner} | ${`VEP-${String(index + 1).padStart(4, '0')}`} satisfied | ${amendmentId} | 2026-06-09 |`,
  ]).join('\n');

  const methodRows = [
    `| VMP-0001 | Constitutional Review | Independent evaluation of constitutional document integrity | Constitutional | ${amendmentId} | Active |`,
    `| VMP-0002 | Document Review | Structured review of governance artifacts | Governance | ${amendmentId} | Active |`,
    `| VMP-0003 | Witness Attestation | Attested confirmation by an authorized witness | Runtime | ${amendmentId} | Active |`,
    `| VMP-0004 | Cross-System Correlation | Correlation of evidence across independent system records | Operational | ${amendmentId} | Active |`,
  ].join('\n');

  const expirationRows = [
    `| VXP-0001 | Constitutional | Evidence Expiration; Time Limit | Verification becomes Expired; no new validation influence; historical record preserved | Yes | Required | ${amendmentId} | Active |`,
    `| VXP-0002 | Governance | Evidence Expiration; Time Limit | Verification becomes Expired; no new validation influence; historical record preserved | Yes | Required | ${amendmentId} | Active |`,
    `| VXP-0003 | Runtime | Evidence Expiration; Time Limit | Verification becomes Expired; no new validation influence; historical record preserved | Yes | Required | ${amendmentId} | Active |`,
    `| VXP-0004 | Operational | Evidence Expiration; Time Limit | Verification becomes Expired; no new validation influence; historical record preserved | Yes | Required | ${amendmentId} | Active |`,
  ].join('\n');

  const causes = 'Fraud; Evidence Failure; Method Failure; Constitutional Override; Governance Decision';
  const revocationAuthorityRows = verDefs.map(([id,,,owner]) =>
    `| ${id} | Yes | ${causes} | ${owner} | Required | Required | ${amendmentId} | Active |`
  ).join('\n');

  fixture.write('docs/constitution/VERIFICATION-CONSTITUTION.md', `# Verification Constitution\n\n**Constitution Version:** ${version}\n`);
  fixture.write('docs/constitution/VERIFICATION-AUTHORITIES.md', `# Verification Authorities\n\n**Constitution Version:** ${version}\n\n## Verification authority catalog\n\n| Verification ID | Verification Name | Verification Class | Owner | Verification Method | Evidence Policy | Expiration Policy | Revocable | Creation Amendment | Retirement Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|---|\n${verRows}\n`);
  fixture.write('docs/constitution/VERIFICATION-EVIDENCE-POLICY.md', `# Verification Evidence Policy\n\n**Constitution Version:** ${version}\n\n## Verification evidence registry\n\n| Evidence Policy ID | Verification ID | Required Evidence | Minimum Evidence | Integrity Rules | Freshness Rules | Verification Threshold | Traceability Rules | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|\n${evidenceRows}\n`);
  fixture.write('docs/constitution/VERIFICATION-LIFECYCLE.md', `# Verification Lifecycle\n\n**Constitution Version:** ${version}\n\n## Verification lifecycle transition ledger\n\n| Transition ID | Verification ID | From | To | Authorized By | Evidence Evaluation | Amendment | Effective Date |\n|---|---|---|---|---|---|---|---|\n${lifecycleRows}\n`);
  fixture.write('docs/constitution/VERIFICATION-METHOD-POLICY.md', `# Verification Method Policy\n\n**Constitution Version:** ${version}\n\n## Verification method catalog\n\n| Method ID | Method Name | Description | Applies To Classes | Amendment | Status |\n|---|---|---|---|---|---|\n${methodRows}\n`);
  fixture.write('docs/constitution/VERIFICATION-EXPIRATION-POLICY.md', `# Verification Expiration Policy\n\n**Constitution Version:** ${version}\n\n## Verification expiration policy catalog\n\n| Expiration Policy ID | Applies To Class | Valid Expiration Triggers | Expiration Semantics | Re-verification Permitted | Historical Preservation | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n${expirationRows}\n`);
  fixture.write('docs/constitution/VERIFICATION-REVOCATION-POLICY.md', `# Verification Revocation Policy\n\n**Constitution Version:** ${version}\n\n## Verification revocation authority registry\n\n| Verification ID | Revocable | Valid Causes | Revocation Authority | Evidence Required | Decision Reference Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n${revocationAuthorityRows}\n\n## Verification revocation registry\n\n| Revocation ID | Verification ID | Subject | Cause | Evidence | Revoked By | Decision Reference | Amendment | Effective Date | Status |\n|---|---|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/VERIFICATION-VIOLATION-CATALOG.md', `# Verification Violations\n\n**Constitution Version:** ${version}\n`);
};

export const writeAttestationGovernance = (fixture: ConstitutionalFixture, options: {
  version?: string;
  amendmentId?: string;
} = {}) => {
  const version = options.version ?? 'v1.0';
  const amendmentId = options.amendmentId ?? 'AOC-AMD-0001';
  writeReputationGovernance(fixture, { version, amendmentId });
  writeConstitutionalGovernance(fixture, { version, amendmentId, affectedAuthorities: 'Constitution; Attestation Authorities ATT-0001 through ATT-0004' });

  const attDefs = [
    ['ATT-0001', 'Constitution Validity Attestation', 'Constitutional', 'Constitution', 'AEP-0001', 'AWP-0001', 'AXP-0001'],
    ['ATT-0002', 'Amendment Attestation', 'Governance', 'Constitution', 'AEP-0002', 'AWP-0002', 'AXP-0002'],
    ['ATT-0003', 'Identity Attestation', 'Runtime', 'Protocol', 'AEP-0003', 'AWP-0003', 'AXP-0003'],
    ['ATT-0004', 'Audit Attestation', 'Operational', 'Enterprise', 'AEP-0004', 'AWP-0004', 'AXP-0004'],
  ] as const;

  const attRows = attDefs.map(([id, name, cls, owner, eligibility, weight, expiration]) =>
    `| ${id} | ${name} | ${cls} | ${owner} | ${eligibility} | ${weight} | ${expiration} | Yes | Yes | ${amendmentId} | Not scheduled | Canonical |`
  ).join('\n');

  const eligibilityRows = attDefs.map(([,, cls]) =>
    `| AEP-${attDefs.findIndex(d => d[2] === cls) + 1 < 10 ? '000' + (attDefs.findIndex(d => d[2] === cls) + 1) : '00' + (attDefs.findIndex(d => d[2] === cls) + 1)} | ${cls} | Active standing required | None | Optional | None | Required | Fixture role | ${amendmentId} | Active |`
  ).join('\n');

  const scopeRows = [
    `| ASP-0001 | Constitutional | Constitution Scope | Required | Amendment-bounded | Required | ${amendmentId} | Active |`,
    `| ASP-0002 | Governance | Policy Scope; Decision Scope | Required | Amendment-bounded | Required | ${amendmentId} | Active |`,
    `| ASP-0003 | Runtime | Claim Scope; Verification Scope | Required | Time-bounded | Required | ${amendmentId} | Active |`,
    `| ASP-0004 | Operational | Claim Scope; Decision Scope | Required | Time-bounded | Required | ${amendmentId} | Active |`,
  ].join('\n');

  const weightRows = [
    `| AWP-0001 | Constitutional | Constitutional Weight | Constitutional Weight | Single attestation | Required for constitutional decisions | ${amendmentId} | Active |`,
    `| AWP-0002 | Governance | Governance Weight | Governance Weight | Multiple attestations | Required for governance decisions | ${amendmentId} | Active |`,
    `| AWP-0003 | Runtime | Advisory Weight | Consensus Weight | Aggregation per threshold | Advisory unless required | ${amendmentId} | Active |`,
    `| AWP-0004 | Operational | Advisory Weight | Advisory Weight | Advisory only | Informational only | ${amendmentId} | Active |`,
  ].join('\n');

  const expirationRows = [
    `| AXP-0001 | Constitutional | Time Limit; Constitutional Override | Attestation becomes Expired | Yes | Preserved permanently | ${amendmentId} | Active |`,
    `| AXP-0002 | Governance | Time Limit; Standing Revocation | Attestation becomes Expired | Yes | Preserved permanently | ${amendmentId} | Active |`,
    `| AXP-0003 | Runtime | Time Limit; Trust Decay; Verification Expiration | Attestation becomes Expired | Yes | Preserved permanently | ${amendmentId} | Active |`,
    `| AXP-0004 | Operational | Time Limit; Reputation Revocation | Attestation becomes Expired | Yes | Preserved permanently | ${amendmentId} | Active |`,
  ].join('\n');

  const causes = 'Fraud; Standing Failure; Constitutional Override; Governance Decision';
  const revocationAuthorityRows = attDefs.map(([id,,,owner]) =>
    `| ${id} | Yes | ${causes} | ${owner} | Required | Required | ${amendmentId} | Active |`
  ).join('\n');

  const eligibilityRowsIndexed = attDefs.map(([,, cls,], index) =>
    `| AEP-${String(index + 1).padStart(4, '0')} | ${cls} | Active standing required | None | Optional | None | Required | Fixture role | ${amendmentId} | Active |`
  ).join('\n');

  fixture.write('docs/constitution/ATTESTATION-CONSTITUTION.md', `# Attestation Constitution\n\n**Constitution Version:** ${version}\n`);
  fixture.write('docs/constitution/ATTESTATION-AUTHORITIES.md', `# Attestation Authorities\n\n**Constitution Version:** ${version}\n\n## Attestation authority catalog\n\n| Attestation ID | Attestation Name | Attestation Class | Owner | Eligibility Policy | Weight Policy | Expiration Policy | Revocable | Disputable | Creation Amendment | Retirement Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n${attRows}\n`);
  fixture.write('docs/constitution/ATTESTATION-SCOPE-POLICY.md', `# Attestation Scope Policy\n\n**Constitution Version:** ${version}\n\n## Scope registry\n\n| Scope Policy ID | Attestation Class | Valid Scopes | Subject Requirements | Duration Requirements | Authority Requirements | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n${scopeRows}\n`);
  fixture.write('docs/constitution/ATTESTATION-ELIGIBILITY-POLICY.md', `# Attestation Eligibility Policy\n\n**Constitution Version:** ${version}\n\n## Eligibility policy registry\n\n| Eligibility Policy ID | Attestation Class | Standing Requirement | Trust Threshold | Verification Required | Reputation Threshold | Authority Requirement | Constitutional Role | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|\n${eligibilityRowsIndexed}\n`);
  fixture.write('docs/constitution/ATTESTATION-LIFECYCLE.md', `# Attestation Lifecycle\n\n**Constitution Version:** ${version}\n\n## Attestation lifecycle transition ledger\n\n| Transition ID | Attestation ID | From | To | Authorized By | Evidence | Amendment | Effective Date |\n|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/ATTESTATION-WEIGHT-POLICY.md', `# Attestation Weight Policy\n\n**Constitution Version:** ${version}\n\n## Weight policy registry\n\n| Weight Policy ID | Attestation Class | Default Weight Level | Maximum Weight Level | Aggregation Rule | Decision Influence Rule | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n${weightRows}\n`);
  fixture.write('docs/constitution/ATTESTATION-EXPIRATION-POLICY.md', `# Attestation Expiration Policy\n\n**Constitution Version:** ${version}\n\n## Expiration policy catalog\n\n| Expiration Policy ID | Attestation Class | Valid Expiration Triggers | Expiration Semantics | Re-attestation Permitted | Historical Preservation | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n${expirationRows}\n`);
  fixture.write('docs/constitution/ATTESTATION-REVOCATION-POLICY.md', `# Attestation Revocation Policy\n\n**Constitution Version:** ${version}\n\n## Revocation authority registry\n\n| Attestation ID | Revocable | Valid Causes | Revocation Authority | Evidence Required | Decision Reference Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n${revocationAuthorityRows}\n\n## Revocation registry\n\n| Revocation ID | Attestation ID | Subject | Cause | Evidence | Revoked By | Decision Reference | Amendment | Effective Date | Status |\n|---|---|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/ATTESTATION-DISPUTE-POLICY.md', `# Attestation Dispute Policy\n\n**Constitution Version:** ${version}\n\n## Dispute registry\n\n| Dispute ID | Attestation ID | Grounds | Evidence | Initiator | Resolution | Decision Reference | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/ATTESTATION-VIOLATION-CATALOG.md', `# Attestation Violations\n\n**Constitution Version:** ${version}\n`);
};

export const writeReputationGovernance = (fixture: ConstitutionalFixture, options: {
  version?: string;
  amendmentId?: string;
} = {}) => {
  const version = options.version ?? 'v1.0';
  const amendmentId = options.amendmentId ?? 'AOC-AMD-0001';
  writeVerificationGovernance(fixture, { version, amendmentId });
  writeConstitutionalGovernance(fixture, { version, amendmentId, affectedAuthorities: 'Constitution; Reputation Authorities; Reputation Sources; Reputation Lifecycle; Reputation Calculation' });

  const repDefs = [
    ['REP-0001', 'Constitutional Stewardship Reputation', 'Constitutional', 'Constitution', 'RSP-0001', 'RCP-0001', 'RDP-0001'],
    ['REP-0002', 'Reviewer Reputation', 'Governance', 'Constitution', 'RSP-0002', 'RCP-0002', 'RDP-0002'],
    ['REP-0003', 'Claimant Reputation', 'Runtime', 'Protocol', 'RSP-0003', 'RCP-0003', 'RDP-0003'],
    ['REP-0004', 'Audit Reputation', 'Operational', 'Enterprise', 'RSP-0004', 'RCP-0004', 'RDP-0004'],
  ] as const;

  const repRows = repDefs.map(([id, name, cls, owner, src, calc, decay]) =>
    `| ${id} | ${name} | ${cls} | ${owner} | ${src} | ${calc} | ${decay} | Yes | Yes | Yes | ${amendmentId} | Not scheduled | Canonical |`
  ).join('\n');

  const sourceRows = repDefs.map(([,, cls,, src]) =>
    `| ${src} | ${cls} | Standing History; Claim Outcomes | Recency-weighted | Within 90 days | Traceable to authority | Authority-traceable | At least two source categories required | ${amendmentId} | Active |`
  ).join('\n');

  const calcRows = repDefs.map(([,, cls,,, calc]) =>
    `| ${calc} | ${cls} | Source-weighted aggregate | Recency-weighted | Rolling 90-day window | Minimum 0.0; Maximum 1.0; Confidence interval required | Reduces score proportionally | Corrections replace current score | May be presented as decision input; may not override requirements | ${amendmentId} | Active |`
  ).join('\n');

  const decayRows = repDefs.map(([,, cls,,,,decay]) =>
    `| ${decay} | ${cls} | Time; Inactivity | Linear decay of 0.05 per 30-day period | Floor of 0.0 when sources expire | Yes | All historical records preserved permanently | ${amendmentId} | Active |`
  ).join('\n');

  const lifecycleRows = repDefs.flatMap(([id,,, owner], index) => [
    `| RLT-${String(index * 2 + 1).padStart(4, '0')} | ${id} | Proposed | Pending Source Evaluation | ${owner} | Review initiated | ${amendmentId} | 2026-06-09 |`,
    `| RLT-${String(index * 2 + 2).padStart(4, '0')} | ${id} | Pending Source Evaluation | Active | ${owner} | RSP-${String(index + 1).padStart(4, '0')} satisfied | ${amendmentId} | 2026-06-09 |`,
  ]).join('\n');

  const causes = 'Fraud; Source Integrity Failure; Standing Failure; Constitutional Override; Governance Decision';
  const revocationAuthorityRows = repDefs.map(([id,,, owner]) =>
    `| ${id} | Yes | ${causes} | ${owner} | Required | Required | ${amendmentId} | Active |`
  ).join('\n');

  fixture.write('docs/constitution/REPUTATION-CONSTITUTION.md', `# Reputation Constitution\n\n**Constitution Version:** ${version}\n`);
  fixture.write('docs/constitution/REPUTATION-AUTHORITIES.md', `# Reputation Authorities\n\n**Constitution Version:** ${version}\n\n## Reputation authority catalog\n\n| Reputation ID | Reputation Name | Reputation Class | Owner | Source Policy | Calculation Policy | Decay Policy | Disputable | Correctable | Revocable | Creation Amendment | Retirement Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|\n${repRows}\n`);
  fixture.write('docs/constitution/REPUTATION-SOURCES-POLICY.md', `# Reputation Sources Policy\n\n**Constitution Version:** ${version}\n\n## Reputation sources registry\n\n| Source Policy ID | Reputation Class | Allowed Sources | Source Weight | Source Freshness | Source Integrity | Source Traceability | Minimum Source Coverage | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|\n${sourceRows}\n`);
  fixture.write('docs/constitution/REPUTATION-LIFECYCLE.md', `# Reputation Lifecycle\n\n**Constitution Version:** ${version}\n\n## Reputation lifecycle transition ledger\n\n| Transition ID | Reputation ID | From | To | Authorized By | Source Evaluation | Amendment | Effective Date |\n|---|---|---|---|---|---|---|---|\n${lifecycleRows}\n`);
  fixture.write('docs/constitution/REPUTATION-CALCULATION-POLICY.md', `# Reputation Calculation Policy\n\n**Constitution Version:** ${version}\n\n## Reputation calculation registry\n\n| Calculation Policy ID | Reputation Class | Calculation Basis | Weighting Method | Aggregation Window | Confidence Bounds | Negative Event Treatment | Correction Treatment | Decision Influence Rule | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|---|\n${calcRows}\n`);
  fixture.write('docs/constitution/REPUTATION-DECAY-POLICY.md', `# Reputation Decay Policy\n\n**Constitution Version:** ${version}\n\n## Reputation decay policy catalog\n\n| Decay Policy ID | Reputation Class | Decay Triggers | Decay Rate | Floor | Re-evaluation Permitted | Historical Preservation | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n${decayRows}\n`);
  fixture.write('docs/constitution/REPUTATION-DISPUTE-POLICY.md', `# Reputation Dispute Policy\n\n**Constitution Version:** ${version}\n\n## Reputation dispute registry\n\n| Dispute ID | Reputation ID | Grounds | Evidence | Initiator | Decision Reference | Resolution | Status |\n|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/REPUTATION-CORRECTION-POLICY.md', `# Reputation Correction Policy\n\n**Constitution Version:** ${version}\n\n## Reputation correction registry\n\n| Correction ID | Reputation ID | Correction Cause | Prior Value | Corrected Value | Reason | Evidence | Decision Reference | Amendment | Effective Date | Status |\n|---|---|---|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/REPUTATION-REVOCATION-POLICY.md', `# Reputation Revocation Policy\n\n**Constitution Version:** ${version}\n\n## Reputation revocation authority registry\n\n| Reputation ID | Revocable | Valid Causes | Revocation Authority | Evidence Required | Decision Reference Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n${revocationAuthorityRows}\n\n## Reputation revocation registry\n\n| Revocation ID | Reputation ID | Subject | Cause | Evidence | Revoked By | Decision Reference | Amendment | Effective Date | Status |\n|---|---|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/REPUTATION-VIOLATION-CATALOG.md', `# Reputation Violations\n\n**Constitution Version:** ${version}\n`);
};

export const writeConsensusGovernance = (fixture: ConstitutionalFixture, options: {
  version?: string;
  amendmentId?: string;
} = {}) => {
  const version = options.version ?? 'v1.0';
  const amendmentId = options.amendmentId ?? 'AOC-AMD-0001';
  writeAttestationGovernance(fixture, { version, amendmentId });
  writeConstitutionalGovernance(fixture, { version, amendmentId, affectedAuthorities: 'Constitution; Consensus Authorities CNS-0001 through CNS-0004' });

  const cnsDefs = [
    ['CNS-0001', 'Constitution Consensus', 'Constitutional', 'Constitution', 'CMP-0001', 'CTP-0001', 'CXP-0001'],
    ['CNS-0002', 'Governance Proposal Consensus', 'Governance', 'Constitution', 'CMP-0002', 'CTP-0002', 'CXP-0002'],
    ['CNS-0003', 'Claim Consensus', 'Runtime', 'Protocol', 'CMP-0003', 'CTP-0003', 'CXP-0003'],
    ['CNS-0004', 'Audit Consensus', 'Operational', 'Enterprise', 'CMP-0004', 'CTP-0004', 'CXP-0004'],
  ] as const;

  const cnsRows = cnsDefs.map(([id, name, cls, owner, model, threshold, expiration]) =>
    `| ${id} | ${name} | ${cls} | ${owner} | ${model} | ${threshold} | ${expiration} | Yes | Yes | ${amendmentId} | Not scheduled | Canonical |`
  ).join('\n');

  const modelRows = [
    `| CMP-0001 | Constitutional | Constitutional Consensus | Unanimous agreement required | Equal weight per eligible actor | All eligible constitutional actors | ${amendmentId} | Active |`,
    `| CMP-0002 | Governance | Supermajority Consensus | Two-thirds or greater agreement | Equal weight per eligible actor | Minimum three eligible governance actors | ${amendmentId} | Active |`,
    `| CMP-0003 | Runtime | Simple Majority Consensus | Greater than fifty percent agreement | Reputation-weighted per actor | Minimum two eligible runtime actors | ${amendmentId} | Active |`,
    `| CMP-0004 | Operational | Weighted Consensus | Weighted aggregate meeting threshold | Trust-weighted per actor | Minimum two eligible operational actors | ${amendmentId} | Active |`,
  ].join('\n');

  const thresholdRows = [
    `| CTP-0001 | Constitutional | 100% | All eligible constitutional actors | One per eligible actor | Full constitutional standing | Full verification required | Full trust required | Full reputation required | ${amendmentId} | Active |`,
    `| CTP-0002 | Governance | 66% | Minimum three eligible governance actors | One per participating actor | Governance-level standing | Verification encouraged | Trust required | Reputation required | ${amendmentId} | Active |`,
    `| CTP-0003 | Runtime | 51% | Minimum two eligible runtime actors | One per participating actor | Active standing required | Verification optional | Trust required | Reputation recommended | ${amendmentId} | Active |`,
    `| CTP-0004 | Operational | 75% | Minimum two eligible operational actors | One per participating actor | Active standing required | Verification recommended | Trust recommended | Reputation recommended | ${amendmentId} | Active |`,
  ].join('\n');

  const expirationRows = [
    `| CXP-0001 | Constitutional | Attestation Expiration; Constitutional Override | Consensus becomes Expired | Yes | Preserved permanently | ${amendmentId} | Active |`,
    `| CXP-0002 | Governance | Attestation Expiration; Standing Revocation; Governance Decision | Consensus becomes Expired | Yes | Preserved permanently | ${amendmentId} | Active |`,
    `| CXP-0003 | Runtime | Attestation Expiration; Trust Decay; Verification Expiration; Standing Revocation; Threshold Failure | Consensus becomes Expired | Yes | Preserved permanently | ${amendmentId} | Active |`,
    `| CXP-0004 | Operational | Attestation Expiration; Trust Decay; Governance Decision; Constitutional Override | Consensus becomes Expired | Yes | Preserved permanently | ${amendmentId} | Active |`,
  ].join('\n');

  const causes = 'Fraud; Threshold Failure; Invalid Attestations; Standing Failure; Constitutional Override; Governance Decision';
  const revocationAuthorityRows = cnsDefs.map(([id,,, owner]) =>
    `| ${id} | Yes | ${causes} | ${owner} | Required | Required | ${amendmentId} | Active |`
  ).join('\n');

  const recomputationRows = [
    `| CRC-0001 | Attestation Change | Runtime | An attestation contributing to consensus has been added, expired, or revoked | Recompute consensus threshold | ${amendmentId} | Active |`,
    `| CRC-0002 | Verification Change | Runtime | An underlying verification signal has changed or expired | Recompute consensus where verification coverage is required | ${amendmentId} | Active |`,
    `| CRC-0003 | Trust Change | Runtime | An underlying trust signal has decayed, changed, or been revoked | Recompute consensus where trust coverage is required | ${amendmentId} | Active |`,
    `| CRC-0004 | Standing Change | Governance | A participating actor standing has changed | Recompute consensus with updated eligible participant set | ${amendmentId} | Active |`,
  ].join('\n');

  fixture.write('docs/constitution/CONSENSUS-CONSTITUTION.md', `# Consensus Constitution\n\n**Constitution Version:** ${version}\n`);
  fixture.write('docs/constitution/CONSENSUS-AUTHORITIES.md', `# Consensus Authorities\n\n**Constitution Version:** ${version}\n\n## Consensus authority catalog\n\n| Consensus ID | Consensus Name | Consensus Class | Owner | Consensus Model | Threshold Policy | Expiration Policy | Revocable | Disputable | Creation Amendment | Retirement Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n${cnsRows}\n`);
  fixture.write('docs/constitution/CONSENSUS-MODELS-POLICY.md', `# Consensus Models Policy\n\n**Constitution Version:** ${version}\n\n## Consensus models registry\n\n| Model Policy ID | Consensus Class | Model Name | Aggregation Method | Weighting | Minimum Participants | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n${modelRows}\n`);
  fixture.write('docs/constitution/CONSENSUS-THRESHOLD-POLICY.md', `# Consensus Threshold Policy\n\n**Constitution Version:** ${version}\n\n## Threshold policy catalog\n\n| Threshold Policy ID | Consensus Class | Minimum Threshold | Minimum Participants | Minimum Attestations | Minimum Standing Coverage | Minimum Verification Coverage | Minimum Trust Coverage | Minimum Reputation Coverage | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|---|\n${thresholdRows}\n`);
  fixture.write('docs/constitution/CONSENSUS-LIFECYCLE.md', `# Consensus Lifecycle\n\n**Constitution Version:** ${version}\n\n## Consensus lifecycle transition ledger\n\n| Transition ID | Consensus ID | From | To | Authorized By | Evidence | Amendment | Effective Date |\n|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/CONSENSUS-EXPIRATION-POLICY.md', `# Consensus Expiration Policy\n\n**Constitution Version:** ${version}\n\n## Expiration policy catalog\n\n| Expiration Policy ID | Consensus Class | Valid Expiration Triggers | Expiration Semantics | Recomputation Permitted | Historical Preservation | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n${expirationRows}\n`);
  fixture.write('docs/constitution/CONSENSUS-REVOCATION-POLICY.md', `# Consensus Revocation Policy\n\n**Constitution Version:** ${version}\n\n## Revocation authority registry\n\n| Consensus ID | Revocable | Valid Causes | Revocation Authority | Evidence Required | Decision Reference Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n${revocationAuthorityRows}\n\n## Revocation registry\n\n| Revocation ID | Consensus ID | Subject | Cause | Evidence | Revoked By | Decision Reference | Amendment | Effective Date | Status |\n|---|---|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/CONSENSUS-DISPUTE-POLICY.md', `# Consensus Dispute Policy\n\n**Constitution Version:** ${version}\n\n## Dispute registry\n\n| Dispute ID | Consensus ID | Grounds | Evidence | Initiator | Resolution | Decision Reference | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/CONSENSUS-RECOMPUTATION-POLICY.md', `# Consensus Recomputation Policy\n\n**Constitution Version:** ${version}\n\n## Recomputation trigger catalog\n\n| Trigger ID | Trigger Name | Trigger Class | Description | Required Action | Amendment | Status |\n|---|---|---|---|---|---|---|\n${recomputationRows}\n`);
  fixture.write('docs/constitution/CONSENSUS-VIOLATION-CATALOG.md', `# Consensus Violations\n\n**Constitution Version:** ${version}\n`);
};

export const writeGovernanceGovernance = (fixture: ConstitutionalFixture, options: {
  version?: string;
  amendmentId?: string;
} = {}) => {
  const version = options.version ?? 'v1.0';
  const amendmentId = options.amendmentId ?? 'AOC-AMD-0001';
  writeConsensusGovernance(fixture, { version, amendmentId });
  writeConstitutionalGovernance(fixture, { version, amendmentId, affectedAuthorities: 'Constitution; Governance Authorities GOV-0001 through GOV-0017' });

  const govDefs = [
    ['GOV-0001', 'Constitutional Amendment Governance', 'Constitutional', 'Constitution'],
    ['GOV-0002', 'Constitutional Authority Governance', 'Constitutional', 'Constitution'],
    ['GOV-0003', 'Constitutional Interpretation Governance', 'Constitutional', 'Constitution'],
    ['GOV-0004', 'Protocol Law Governance', 'Protocol', 'Protocol'],
  ] as const;

  const govRows = govDefs.map(([id, name, cls, owner]) =>
    `| ${id} | ${name} | ${cls} | ${owner} | GPP-0001 | GMP-0001 | GMD-0001 | GOP-0001 | Yes | Yes | Yes | ${amendmentId} | Not scheduled | Canonical |`
  ).join('\n');

  const proposalRows = [
    `| GPP-0001 | Constitutional | Constitutional standing | Yes | Constitutional evidence | ${amendmentId} | Active |`,
    `| GPP-0002 | Protocol | Protocol standing | Yes | Protocol evidence | ${amendmentId} | Active |`,
    `| GPP-0003 | Runtime | Runtime standing | Yes | Runtime evidence | ${amendmentId} | Active |`,
    `| GPP-0004 | Operational | Operational standing | Yes | Operational evidence | ${amendmentId} | Active |`,
  ].join('\n');

  const motionRows = [
    `| GMP-0001 | Constitutional | Constitutional Motion | Unanimous | Yes | ${amendmentId} | Active |`,
    `| GMP-0002 | Protocol | Authority Motion; Policy Motion | Supermajority | Yes | ${amendmentId} | Active |`,
    `| GMP-0003 | Runtime | Runtime Motion | Simple Majority | Yes | ${amendmentId} | Active |`,
    `| GMP-0004 | Operational | Operational Motion | Simple Majority | Yes | ${amendmentId} | Active |`,
  ].join('\n');

  const mandateRows = [
    `| GMD-0001 | Constitutional | Constitutional authority only | Yes | Yes | ${amendmentId} | Active |`,
    `| GMD-0002 | Protocol | Protocol authority only | Yes | Yes | ${amendmentId} | Active |`,
    `| GMD-0003 | Runtime | Runtime authority only | Yes | Yes | ${amendmentId} | Active |`,
    `| GMD-0004 | Operational | Operational authority only | Yes | Yes | ${amendmentId} | Active |`,
  ].join('\n');

  const outcomeRows = [
    `| GOP-0001 | Constitutional | Approved; Rejected; Modified; Invalidated | Yes | Constitutional evidence | ${amendmentId} | Active |`,
    `| GOP-0002 | Protocol | Approved; Rejected; Modified; Deferred | Yes | Protocol evidence | ${amendmentId} | Active |`,
    `| GOP-0003 | Runtime | Approved; Rejected; Modified; Deferred; Superseded | Yes | Runtime evidence | ${amendmentId} | Active |`,
    `| GOP-0004 | Operational | Approved; Rejected; Modified; Deferred; Superseded | Yes | Operational evidence | ${amendmentId} | Active |`,
  ].join('\n');

  const expirationRows = [
    `| GXP-0001 | Constitutional | Time Limit; Constitutional Override; Governance Decision | Mandate becomes Expired | Preserved permanently | ${amendmentId} | Active |`,
    `| GXP-0002 | Protocol | Time Limit; Policy Change; Constitutional Override; Governance Decision | Mandate becomes Expired | Preserved permanently | ${amendmentId} | Active |`,
    `| GXP-0003 | Runtime | Time Limit; Consensus Expiration; Standing Revocation; Policy Change; Governance Decision | Mandate becomes Expired | Preserved permanently | ${amendmentId} | Active |`,
    `| GXP-0004 | Operational | Time Limit; Consensus Expiration; Mandate Expiration; Standing Revocation; Governance Decision | Mandate becomes Expired | Preserved permanently | ${amendmentId} | Active |`,
  ].join('\n');

  const revocationRows = govDefs.map(([id,,, owner]) =>
    `| ${id} | Yes | Fraud; Invalid Consensus; Constitutional Override; Governance Decision | ${owner} | Required | Required | ${amendmentId} | Active |`
  ).join('\n');

  fixture.write('docs/constitution/GOVERNANCE-CONSTITUTION.md', `# Governance Constitution\n\n**Constitution Version:** ${version}\n`);
  fixture.write('docs/constitution/GOVERNANCE-AUTHORITIES.md', `# Governance Authorities\n\n**Constitution Version:** ${version}\n\n## Governance authority catalog\n\n| Governance ID | Governance Name | Governance Class | Owner | Proposal Policy | Motion Policy | Mandate Policy | Outcome Policy | Consensus Required | Revocable | Disputable | Creation Amendment | Retirement Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|\n${govRows}\n`);
  fixture.write('docs/constitution/GOVERNANCE-PROPOSAL-POLICY.md', `# Governance Proposal Policy\n\n**Constitution Version:** ${version}\n\n## Proposal policy catalog\n\n| Proposal Policy ID | Governance Class | Minimum Standing | Consensus Required | Evidence Required | Amendment | Status |\n|---|---|---|---|---|---|---|\n${proposalRows}\n`);
  fixture.write('docs/constitution/GOVERNANCE-MOTION-POLICY.md', `# Governance Motion Policy\n\n**Constitution Version:** ${version}\n\n## Motion policy catalog\n\n| Motion Policy ID | Governance Class | Motion Types Allowed | Consensus Threshold | Decision Required | Amendment | Status |\n|---|---|---|---|---|---|---|\n${motionRows}\n`);
  fixture.write('docs/constitution/GOVERNANCE-MANDATE-POLICY.md', `# Governance Mandate Policy\n\n**Constitution Version:** ${version}\n\n## Mandate policy catalog\n\n| Mandate Policy ID | Governance Class | Authority Scope | Expiration Required | Decision Required | Amendment | Status |\n|---|---|---|---|---|---|---|\n${mandateRows}\n`);
  fixture.write('docs/constitution/GOVERNANCE-OUTCOME-POLICY.md', `# Governance Outcome Policy\n\n**Constitution Version:** ${version}\n\n## Outcome policy catalog\n\n| Outcome Policy ID | Governance Class | Outcome Types Allowed | Decision Required | Evidence Required | Amendment | Status |\n|---|---|---|---|---|---|---|\n${outcomeRows}\n`);
  fixture.write('docs/constitution/GOVERNANCE-LIFECYCLE.md', `# Governance Lifecycle\n\n**Constitution Version:** ${version}\n\n## Governance lifecycle transition ledger\n\n| Transition ID | Governance ID | From | To | Authorized By | Evidence | Amendment | Effective Date |\n|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/GOVERNANCE-CHALLENGE-POLICY.md', `# Governance Challenge Policy\n\n**Constitution Version:** ${version}\n\n## Challenge registry\n\n| Challenge ID | Governance ID | Target ID | Grounds | Evidence | Initiator | Decision Reference | Resolution | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/GOVERNANCE-EXPIRATION-POLICY.md', `# Governance Expiration Policy\n\n**Constitution Version:** ${version}\n\n## Expiration policy catalog\n\n| Expiration Policy ID | Governance Class | Valid Expiration Triggers | Expiration Semantics | Historical Preservation | Amendment | Status |\n|---|---|---|---|---|---|---|\n${expirationRows}\n`);
  fixture.write('docs/constitution/GOVERNANCE-REVOCATION-POLICY.md', `# Governance Revocation Policy\n\n**Constitution Version:** ${version}\n\n## Revocation authority registry\n\n| Governance ID | Revocable | Valid Causes | Revocation Authority | Evidence Required | Decision Reference Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n${revocationRows}\n\n## Revocation registry\n\n| Revocation ID | Governance ID | Target ID | Cause | Evidence | Revoked By | Decision Reference | Amendment | Effective Date | Status |\n|---|---|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/GOVERNANCE-VIOLATION-CATALOG.md', `# Governance Violations\n\n**Constitution Version:** ${version}\n`);
};

export const writeVotingGovernance = (fixture: ConstitutionalFixture, options: {
  version?: string;
  amendmentId?: string;
} = {}) => {
  const version = options.version ?? 'v1.0';
  const amendmentId = options.amendmentId ?? 'AOC-AMD-0001';
  writeGovernanceGovernance(fixture, { version, amendmentId });
  writeConstitutionalGovernance(fixture, { version, amendmentId, affectedAuthorities: 'Constitution; Voting Authorities VOT-0001 through VOT-0015' });

  const votDefs = [
    ['VOT-0001', 'Constitutional Amendment Voting', 'Constitutional', 'Constitution', 'VEL-0001', 'VWT-0001', 'No', 'VEX-0001'],
    ['VOT-0002', 'Constitutional Authority Voting', 'Constitutional', 'Constitution', 'VEL-0001', 'VWT-0001', 'No', 'VEX-0001'],
    ['VOT-0003', 'Constitutional Interpretation Voting', 'Constitutional', 'Constitution', 'VEL-0001', 'VWT-0001', 'No', 'VEX-0001'],
    ['VOT-0004', 'Policy Voting', 'Governance', 'Constitution', 'VEL-0002', 'VWT-0002', 'Yes', 'VEX-0002'],
    ['VOT-0005', 'Capability Voting', 'Governance', 'Constitution', 'VEL-0002', 'VWT-0002', 'Yes', 'VEX-0002'],
    ['VOT-0006', 'Governance Proposal Voting', 'Governance', 'Constitution', 'VEL-0002', 'VWT-0002', 'Yes', 'VEX-0002'],
    ['VOT-0007', 'Governance Mandate Voting', 'Governance', 'Constitution', 'VEL-0002', 'VWT-0002', 'Yes', 'VEX-0002'],
    ['VOT-0008', 'Claim Voting', 'Runtime', 'Protocol', 'VEL-0003', 'VWT-0003', 'Yes', 'VEX-0003'],
    ['VOT-0009', 'Trust Voting', 'Runtime', 'Protocol', 'VEL-0003', 'VWT-0003', 'Yes', 'VEX-0003'],
    ['VOT-0010', 'Verification Voting', 'Runtime', 'Protocol', 'VEL-0003', 'VWT-0003', 'Yes', 'VEX-0003'],
    ['VOT-0011', 'Reputation Voting', 'Runtime', 'Protocol', 'VEL-0003', 'VWT-0003', 'Yes', 'VEX-0003'],
    ['VOT-0012', 'Consensus Voting', 'Runtime', 'Protocol', 'VEL-0003', 'VWT-0003', 'Yes', 'VEX-0003'],
    ['VOT-0013', 'Audit Voting', 'Operational', 'Enterprise', 'VEL-0004', 'VWT-0004', 'Yes', 'VEX-0004'],
    ['VOT-0014', 'Assurance Voting', 'Operational', 'Enterprise', 'VEL-0004', 'VWT-0004', 'Yes', 'VEX-0004'],
    ['VOT-0015', 'Compliance Voting', 'Operational', 'Enterprise', 'VEL-0004', 'VWT-0004', 'Yes', 'VEX-0004'],
  ] as const;

  const votRows = votDefs.map(([id, name, cls, owner, eligibility, weight, delegation, expiration]) =>
    `| ${id} | ${name} | ${cls} | ${owner} | ${eligibility} | ${weight} | ${delegation} | ${expiration} | Yes | Yes | ${amendmentId} | Not scheduled | Canonical |`
  ).join('\n');

  const eligibilityRows = [
    `| VEL-0001 | Constitutional | Active constitutional standing | Full trust required | Required | Full reputation required | Constitutional role required | Required | ${amendmentId} | Active |`,
    `| VEL-0002 | Governance | Active governance standing | Trust required | Verification encouraged | Reputation required | None | None | ${amendmentId} | Active |`,
    `| VEL-0003 | Runtime | Active standing required | Trust required | Verification optional | Reputation recommended | None | None | ${amendmentId} | Active |`,
    `| VEL-0004 | Operational | Active standing required | Trust recommended | Verification recommended | Reputation recommended | None | None | ${amendmentId} | Active |`,
  ].join('\n');

  const weightRows = [
    `| VWT-0001 | Constitutional | Constitutional Weight | Equal weight per eligible constitutional actor | 1.0 | 1.0 | No normalization; equal weight enforced | Revoked on standing or eligibility failure | ${amendmentId} | Active |`,
    `| VWT-0002 | Governance | Standing Weight | Standing-level weight per eligible governance actor | 0.1 | 1.0 | Normalized to eligible participant pool | Revoked on standing or eligibility failure | ${amendmentId} | Active |`,
    `| VWT-0003 | Runtime | Reputation Weight | Reputation-score weight per eligible runtime actor | 0.0 | 1.0 | Normalized to sum of eligible weights | Revoked on reputation revocation or eligibility failure | ${amendmentId} | Active |`,
    `| VWT-0004 | Operational | Trust Weight | Trust-score weight per eligible operational actor | 0.0 | 1.0 | Normalized to sum of eligible weights | Revoked on trust revocation or eligibility failure | ${amendmentId} | Active |`,
  ].join('\n');

  const delegationPermissions = [
    `| Constitutional | No | Prohibited | N/A | ${amendmentId} |`,
    `| Governance | Yes | Bounded to single motion | Required | ${amendmentId} |`,
    `| Runtime | Yes | Bounded to single motion | Required | ${amendmentId} |`,
    `| Operational | Yes | Bounded to single motion | Required | ${amendmentId} |`,
  ].join('\n');

  const motionRows = [
    `| VMN-0001 | Constitutional | VOT-0001; VOT-0002; VOT-0003 | Until unanimous | Unanimous consent required | Unanimous approval required | Yes | ${amendmentId} | Active |`,
    `| VMN-0002 | Governance | VOT-0004; VOT-0005; VOT-0006; VOT-0007 | Time-bounded | Supermajority threshold | Supermajority approval required | Yes | ${amendmentId} | Active |`,
    `| VMN-0003 | Runtime | VOT-0008; VOT-0009; VOT-0010; VOT-0011; VOT-0012 | Time-bounded | Majority threshold | Simple majority approval required | Yes | ${amendmentId} | Active |`,
    `| VMN-0004 | Operational | VOT-0013; VOT-0014; VOT-0015 | Time-bounded | Majority threshold | Simple majority approval required | Yes | ${amendmentId} | Active |`,
  ].join('\n');

  const expirationRows = [
    `| VEX-0001 | Constitutional | Time Limit; Standing Revocation; Constitutional Override; Governance Decision | Vote becomes Expired; no influence on governance outcomes; historical record preserved | Yes | Preserved permanently | ${amendmentId} | Active |`,
    `| VEX-0002 | Governance | Time Limit; Standing Revocation; Governance Expiration; Constitutional Override; Governance Decision | Vote becomes Expired; no influence on governance outcomes; historical record preserved | Yes | Preserved permanently | ${amendmentId} | Active |`,
    `| VEX-0003 | Runtime | Time Limit; Standing Revocation; Consensus Expiration; Constitutional Override; Governance Decision | Vote becomes Expired; no influence on governance outcomes; historical record preserved | Yes | Preserved permanently | ${amendmentId} | Active |`,
    `| VEX-0004 | Operational | Time Limit; Standing Revocation; Governance Expiration; Constitutional Override; Governance Decision | Vote becomes Expired; no influence on governance outcomes; historical record preserved | Yes | Preserved permanently | ${amendmentId} | Active |`,
  ].join('\n');

  const revocationAuthorityRows = [
    `| VOT-0001 | Yes | Fraud; Eligibility Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | ${amendmentId} | Active |`,
    `| VOT-0004 | Yes | Fraud; Eligibility Failure; Delegation Abuse; Evidence Failure; Constitutional Override; Governance Decision | Constitution | Required | Required | ${amendmentId} | Active |`,
    `| VOT-0008 | Yes | Fraud; Eligibility Failure; Delegation Abuse; Evidence Failure; Constitutional Override; Governance Decision | Protocol | Required | Required | ${amendmentId} | Active |`,
    `| VOT-0013 | Yes | Fraud; Eligibility Failure; Delegation Abuse; Evidence Failure; Constitutional Override; Governance Decision | Enterprise | Required | Required | ${amendmentId} | Active |`,
  ].join('\n');

  fixture.write('docs/constitution/VOTING-CONSTITUTION.md', `# Voting Constitution\n\n**Constitution Version:** ${version}\n`);
  fixture.write('docs/constitution/VOTING-AUTHORITIES.md', `# Voting Authorities\n\n**Constitution Version:** ${version}\n\n## Voting authority catalog\n\n| Voting ID | Voting Name | Voting Class | Owner | Eligibility Policy | Weight Policy | Delegation Allowed | Expiration Policy | Revocable | Challengeable | Creation Amendment | Retirement Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|\n${votRows}\n`);
  fixture.write('docs/constitution/VOTING-ELIGIBILITY-POLICY.md', `# Voting Eligibility Policy\n\n**Constitution Version:** ${version}\n\n## Eligibility policy catalog\n\n| Eligibility Policy ID | Voting Class | Standing Requirement | Trust Requirement | Verification Required | Reputation Threshold | Governance Role Required | Authority Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|\n${eligibilityRows}\n`);
  fixture.write('docs/constitution/VOTING-WEIGHT-POLICY.md', `# Voting Weight Policy\n\n**Constitution Version:** ${version}\n\n## Weight policy catalog\n\n| Weight Policy ID | Voting Class | Weight Model | Calculation Basis | Minimum Threshold | Maximum Threshold | Normalization Rule | Revocation Rule | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|\n${weightRows}\n`);
  fixture.write('docs/constitution/VOTING-DELEGATION-POLICY.md', `# Voting Delegation Policy\n\n**Constitution Version:** ${version}\n\n## Delegation permission catalog\n\n| Voting Class | Delegation Allowed | Maximum Scope | Expiration Required | Amendment |\n|---|---|---|---|---|\n${delegationPermissions}\n\n## Delegation registry\n\n| Delegation ID | Delegator | Delegate | Voting Authority | Scope | Expiration | Status | Amendment |\n|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/VOTING-MOTION-POLICY.md', `# Voting Motion Policy\n\n**Constitution Version:** ${version}\n\n## Motion policy catalog\n\n| Motion Policy ID | Voting Class | Eligible Voting Authorities | Open Duration | Close Rule | Outcome Rule | Decision Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n${motionRows}\n`);
  fixture.write('docs/constitution/VOTING-LIFECYCLE.md', `# Voting Lifecycle\n\n**Constitution Version:** ${version}\n\n## Voting lifecycle transition ledger\n\n| Transition ID | Voting ID | From | To | Authorized By | Evidence | Amendment | Effective Date |\n|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/VOTING-EXPIRATION-POLICY.md', `# Voting Expiration Policy\n\n**Constitution Version:** ${version}\n\n## Expiration policy catalog\n\n| Expiration Policy ID | Voting Class | Valid Expiration Triggers | Expiration Semantics | Resubmission Permitted | Historical Preservation | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n${expirationRows}\n`);
  fixture.write('docs/constitution/VOTING-CHALLENGE-POLICY.md', `# Voting Challenge Policy\n\n**Constitution Version:** ${version}\n\n## Challenge registry\n\n| Challenge ID | Voting ID | Grounds | Evidence | Initiator | Decision Reference | Resolution | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/VOTING-REVOCATION-POLICY.md', `# Voting Revocation Policy\n\n**Constitution Version:** ${version}\n\n## Revocation authority registry\n\n| Voting ID | Revocable | Valid Causes | Revocation Authority | Evidence Required | Decision Reference Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n${revocationAuthorityRows}\n\n## Revocation registry\n\n| Revocation ID | Voting ID | Subject | Cause | Evidence | Revoked By | Decision Reference | Amendment | Effective Date | Status |\n|---|---|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/VOTING-VIOLATION-CATALOG.md', `# Voting Violations\n\n**Constitution Version:** ${version}\n`);
};

export const writeFederationGovernance = (fixture: ConstitutionalFixture, options: {
  version?: string;
  amendmentId?: string;
} = {}) => {
  const version = options.version ?? 'v1.0';
  const amendmentId = options.amendmentId ?? 'AOC-AMD-0001';
  writeVotingGovernance(fixture, { version, amendmentId });
  writeConstitutionalGovernance(fixture, { version, amendmentId, affectedAuthorities: 'Constitution; Federation Authorities FED-0001 through FED-0015' });

  const fedDefs = [
    ['FED-0001', 'Constitutional Federation', 'Constitutional', 'Constitution', 'FRP-0001', 'FTP-0001', 'No'],
    ['FED-0002', 'Authority Federation', 'Constitutional', 'Constitution', 'FRP-0001', 'FTP-0001', 'No'],
    ['FED-0003', 'Capability Federation', 'Governance', 'Constitution', 'FRP-0002', 'FTP-0002', 'Yes'],
    ['FED-0004', 'Policy Federation', 'Governance', 'Constitution', 'FRP-0002', 'FTP-0002', 'Yes'],
    ['FED-0005', 'Claim Federation', 'Runtime', 'Protocol', 'FRP-0003', 'FTP-0003', 'Yes'],
    ['FED-0006', 'Trust Federation', 'Runtime', 'Protocol', 'FRP-0003', 'FTP-0003', 'Yes'],
    ['FED-0007', 'Verification Federation', 'Runtime', 'Protocol', 'FRP-0003', 'FTP-0003', 'Yes'],
    ['FED-0008', 'Reputation Federation', 'Runtime', 'Protocol', 'FRP-0003', 'FTP-0003', 'Yes'],
    ['FED-0009', 'Attestation Federation', 'Runtime', 'Protocol', 'FRP-0003', 'FTP-0003', 'Yes'],
    ['FED-0010', 'Consensus Federation', 'Runtime', 'Protocol', 'FRP-0003', 'FTP-0003', 'Yes'],
    ['FED-0011', 'Governance Federation', 'Governance', 'Constitution', 'FRP-0002', 'FTP-0002', 'Yes'],
    ['FED-0012', 'Voting Federation', 'Governance', 'Constitution', 'FRP-0002', 'FTP-0002', 'Yes'],
    ['FED-0013', 'Audit Federation', 'Operational', 'Enterprise', 'FRP-0004', 'FTP-0004', 'Yes'],
    ['FED-0014', 'Assurance Federation', 'Operational', 'Enterprise', 'FRP-0004', 'FTP-0004', 'Yes'],
    ['FED-0015', 'Compliance Federation', 'Operational', 'Enterprise', 'FRP-0004', 'FTP-0004', 'Yes'],
  ] as const;

  const fedRows = fedDefs.map(([id, name, cls, owner, recPolicy, trustPolicy, delegation]) =>
    `| ${id} | ${name} | ${cls} | ${owner} | ${recPolicy} | ${trustPolicy} | ${delegation} | Yes | Yes | ${amendmentId} | Not scheduled | Canonical |`
  ).join('\n');

  const recognitionPolicyRows = [
    `| FRP-0001 | Constitutional | Constitutional authority evidence | Yes | Yes | Yes | ${amendmentId} | Active |`,
    `| FRP-0002 | Governance | Governance authority evidence | No | Yes | Yes | ${amendmentId} | Active |`,
    `| FRP-0003 | Runtime | Runtime authority evidence | No | Yes | Yes | ${amendmentId} | Active |`,
    `| FRP-0004 | Operational | Operational evidence | No | Yes | Yes | ${amendmentId} | Active |`,
  ].join('\n');

  const trustPolicyRows = [
    `| FTP-0001 | Constitutional | Constitutional Trust | Constitutional Trust | Yes | Constitutional evidence | No | ${amendmentId} | Active |`,
    `| FTP-0002 | Governance | Conditional Trust | Operational Trust | Yes | Governance evidence | Yes | ${amendmentId} | Active |`,
    `| FTP-0003 | Runtime | Limited Trust | Operational Trust | Yes | Runtime evidence | Yes | ${amendmentId} | Active |`,
    `| FTP-0004 | Operational | Limited Trust | Conditional Trust | Yes | Operational evidence | Yes | ${amendmentId} | Active |`,
  ].join('\n');

  const delegationPolicyRows = [
    `| FDP-0001 | Constitutional | No | N/A | N/A | N/A | N/A | ${amendmentId} | Active |`,
    `| FDP-0002 | Governance | Yes | Governance scope only | Yes | Yes | Required | ${amendmentId} | Active |`,
    `| FDP-0003 | Runtime | Yes | Runtime scope only | Yes | Yes | Required | ${amendmentId} | Active |`,
    `| FDP-0004 | Operational | Yes | Operational scope only | Yes | Yes | Required | ${amendmentId} | Active |`,
  ].join('\n');

  const capabilityPolicyRows = [
    `| FCP-0001 | Constitutional | No | No | No | Yes | Constitutional evidence | ${amendmentId} | Active |`,
    `| FCP-0002 | Governance | Yes | Yes | Yes | Yes | Governance evidence | ${amendmentId} | Active |`,
    `| FCP-0003 | Runtime | Yes | Yes | Yes | Yes | Runtime evidence | ${amendmentId} | Active |`,
    `| FCP-0004 | Operational | Yes | Yes | Yes | Yes | Operational evidence | ${amendmentId} | Active |`,
  ].join('\n');

  const governancePolicyRows = [
    `| FGP-0001 | Constitutional | No | Yes | No | Yes | ${amendmentId} | Active |`,
    `| FGP-0002 | Governance | Yes | Yes | Yes | Yes | ${amendmentId} | Active |`,
    `| FGP-0003 | Runtime | Yes | Yes | No | Yes | ${amendmentId} | Active |`,
    `| FGP-0004 | Operational | Yes | No | No | Yes | ${amendmentId} | Active |`,
  ].join('\n');

  const revocationAuthorityRows = [
    `| FED-0001 | Yes | Fraud; Constitutional Violation; Sovereignty Violation; Constitutional Override; Federated Decision | Constitution | Required | Required | ${amendmentId} | Active |`,
    `| FED-0002 | Yes | Fraud; Constitutional Violation; Sovereignty Violation; Constitutional Override; Federated Decision | Constitution | Required | Required | ${amendmentId} | Active |`,
    `| FED-0003 | Yes | Fraud; Trust Failure; Governance Failure; Constitutional Violation; Sovereignty Violation; Evidence Failure; Constitutional Override; Federated Decision | Constitution | Required | Required | ${amendmentId} | Active |`,
    `| FED-0005 | Yes | Fraud; Trust Failure; Governance Failure; Constitutional Violation; Sovereignty Violation; Evidence Failure; Constitutional Override; Federated Decision | Protocol | Required | Required | ${amendmentId} | Active |`,
    `| FED-0013 | Yes | Fraud; Trust Failure; Governance Failure; Constitutional Violation; Sovereignty Violation; Evidence Failure; Constitutional Override; Federated Decision | Enterprise | Required | Required | ${amendmentId} | Active |`,
  ].join('\n');

  fixture.write('docs/constitution/FEDERATION-CONSTITUTION.md', `# Federation Constitution\n\n**Constitution Version:** ${version}\n`);
  fixture.write('docs/constitution/FEDERATION-AUTHORITIES.md', `# Federation Authorities\n\n**Constitution Version:** ${version}\n\n## Federation authority catalog\n\n| Federation ID | Federation Name | Federation Class | Owner | Recognition Policy | Trust Policy | Delegation Allowed | Revocable | Challengeable | Creation Amendment | Retirement Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n${fedRows}\n`);
  fixture.write('docs/constitution/FEDERATION-RECOGNITION-POLICY.md', `# Federation Recognition Policy\n\n**Constitution Version:** ${version}\n\n## Recognition policy catalog\n\n| Recognition Policy ID | Federation Class | Minimum Evidence | Mutual Recognition Required | Challenge Allowed | Revocation Allowed | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n${recognitionPolicyRows}\n\n## Recognition registry\n\n| Recognition ID | Federation ID | Recognizing Authority | Recognized Authority | Evidence | Decision Reference | Status |\n|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/FEDERATION-TRUST-POLICY.md', `# Federation Trust Policy\n\n**Constitution Version:** ${version}\n\n## Trust policy catalog\n\n| Trust Policy ID | Federation Class | Minimum Trust Level | Maximum Trust Level | Conditions Required | Evidence Required | Decay Allowed | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n${trustPolicyRows}\n\n## Trust registry\n\n| Trust Record ID | Federation ID | Source Constitution | Target Constitution | Trust Level | Conditions | Evidence | Decision Reference | Effective Date | Status |\n|---|---|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/FEDERATION-DELEGATION-POLICY.md', `# Federation Delegation Policy\n\n**Constitution Version:** ${version}\n\n## Delegation policy catalog\n\n| Delegation Policy ID | Federation Class | Delegation Allowed | Maximum Scope | Expiration Required | Revocation Allowed | Evidence Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n${delegationPolicyRows}\n\n## Delegation registry\n\n| Delegation ID | Source Constitution | Target Constitution | Delegated Authority | Scope | Expiration | Revocation Rule | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/FEDERATION-CAPABILITY-POLICY.md', `# Federation Capability Policy\n\n**Constitution Version:** ${version}\n\n## Capability policy catalog\n\n| Capability Policy ID | Federation Class | Sharing Allowed | Borrowing Allowed | Federation Allowed | Recognition Allowed | Evidence Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n${capabilityPolicyRows}\n\n## Capability sharing registry\n\n| Sharing ID | Federation ID | Source Constitution | Target Constitution | Capability | Mode | Scope | Expiration | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/FEDERATION-GOVERNANCE-POLICY.md', `# Federation Governance Policy\n\n**Constitution Version:** ${version}\n\n## Governance policy catalog\n\n| Governance Policy ID | Federation Class | Federated Motion Allowed | Federated Consensus Required | Federated Mandate Allowed | Sovereignty Override Prohibited | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n${governancePolicyRows}\n\n## Federated governance registry\n\n| Governance Record ID | Federation ID | Motion Reference | Consensus Reference | Mandate Reference | Outcome Reference | Participating Sovereigns | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/FEDERATION-LIFECYCLE.md', `# Federation Lifecycle\n\n**Constitution Version:** ${version}\n\n## Federation lifecycle transition ledger\n\n| Transition ID | Federation ID | From | To | Authorized By | Evidence | Amendment | Effective Date |\n|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/FEDERATION-CHALLENGE-POLICY.md', `# Federation Challenge Policy\n\n**Constitution Version:** ${version}\n\n## Challenge registry\n\n| Challenge ID | Federation ID | Grounds | Evidence | Initiator | Decision Reference | Resolution | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/FEDERATION-REVOCATION-POLICY.md', `# Federation Revocation Policy\n\n**Constitution Version:** ${version}\n\n## Revocation authority registry\n\n| Federation ID | Revocable | Valid Causes | Revocation Authority | Evidence Required | Decision Reference Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n${revocationAuthorityRows}\n\n## Revocation registry\n\n| Revocation ID | Federation ID | Cause | Evidence | Revoked By | Decision Reference | Amendment | Effective Date | Status |\n|---|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/FEDERATION-VIOLATION-CATALOG.md', `# Federation Violations\n\n**Constitution Version:** ${version}\n`);
};

export const writeEconomicsGovernance = (fixture: ConstitutionalFixture, options: {
  version?: string;
  amendmentId?: string;
} = {}) => {
  const version = options.version ?? 'v1.0';
  const amendmentId = options.amendmentId ?? 'AOC-AMD-0001';
  writeFederationGovernance(fixture, { version, amendmentId });
  writeConstitutionalGovernance(fixture, { version, amendmentId, affectedAuthorities: 'Constitution; Federation Authorities FED-0001 through FED-0015; Economic Authorities ECO-0001 through ECO-0015' });

  const ecoDefs = [
    ['ECO-0001', 'Economic Rights Authority', 'Constitutional', 'Constitution', 'ERP-0001', 'EOP-0001'],
    ['ECO-0002', 'Economic Obligations Authority', 'Constitutional', 'Constitution', 'ERP-0001', 'EOP-0001'],
    ['ECO-0003', 'Asset Authority', 'Governance', 'Constitution', 'ERP-0002', 'EOP-0002'],
    ['ECO-0004', 'Consumption Authority', 'Governance', 'Protocol', 'ERP-0002', 'EOP-0002'],
    ['ECO-0005', 'Settlement Authority', 'Governance', 'Protocol', 'ERP-0003', 'EOP-0003'],
    ['ECO-0006', 'Treasury Authority', 'Constitutional', 'Constitution', 'ERP-0001', 'EOP-0001'],
    ['ECO-0007', 'Valuation Authority', 'Governance', 'Protocol', 'ERP-0002', 'EOP-0002'],
    ['ECO-0008', 'Federation Economics Authority', 'Governance', 'Constitution', 'ERP-0002', 'EOP-0002'],
    ['ECO-0009', 'GCU Authority', 'Constitutional', 'Constitution', 'ERP-0001', 'EOP-0001'],
    ['ECO-0010', 'SCU Authority', 'Constitutional', 'Constitution', 'ERP-0001', 'EOP-0001'],
    ['ECO-0011', 'Economic Audit Authority', 'Operational', 'Enterprise', 'ERP-0004', 'EOP-0004'],
    ['ECO-0012', 'Economic Assurance Authority', 'Operational', 'Enterprise', 'ERP-0004', 'EOP-0004'],
    ['ECO-0013', 'Economic Compliance Authority', 'Operational', 'Enterprise', 'ERP-0004', 'EOP-0004'],
    ['ECO-0014', 'Economic Governance Authority', 'Governance', 'Constitution', 'ERP-0002', 'EOP-0002'],
    ['ECO-0015', 'Economic Runtime Authority', 'Runtime', 'Protocol', 'ERP-0003', 'EOP-0003'],
  ] as const;

  const ecoRows = ecoDefs.map(([id, name, cls, owner, rightsPolicy, obligationsPolicy]) =>
    `| ${id} | ${name} | ${cls} | ${owner} | ${rightsPolicy} | ${obligationsPolicy} | Yes | Yes | ${amendmentId} | Not scheduled | Canonical |`
  ).join('\n');

  const rightsRows = [
    `| ERP-0001 | Constitutional | Yes | Yes | Yes | Yes | Yes | Yes | ${amendmentId} | Canonical |`,
    `| ERP-0002 | Governance | Yes | Yes | Yes | No | No | Yes | ${amendmentId} | Canonical |`,
    `| ERP-0003 | Runtime | Yes | Yes | No | Yes | No | No | ${amendmentId} | Canonical |`,
    `| ERP-0004 | Operational | Yes | No | No | No | No | No | ${amendmentId} | Canonical |`,
  ].join('\n');

  const obligationsRows = [
    `| EOP-0001 | Constitutional | Yes | Yes | Yes | Yes | Yes | ${amendmentId} | Canonical |`,
    `| EOP-0002 | Governance | No | Yes | No | Yes | Yes | ${amendmentId} | Canonical |`,
    `| EOP-0003 | Runtime | No | Yes | No | Yes | No | ${amendmentId} | Canonical |`,
    `| EOP-0004 | Operational | No | No | No | Yes | No | ${amendmentId} | Canonical |`,
  ].join('\n');

  const assetRows = [
    `| EAC-0001 | Capability Asset | CAPABILITY-CONSTITUTION.md | Constitution | No | Yes | Yes | ${amendmentId} | Canonical |`,
    `| EAC-0002 | Authority Asset | CONSTITUTIONAL-AUTHORITIES.md | Constitution | No | Yes | Yes | ${amendmentId} | Canonical |`,
    `| EAC-0003 | Policy Asset | POLICY-CONSTITUTION.md | Constitution | No | Yes | Yes | ${amendmentId} | Canonical |`,
    `| EAC-0004 | Trust Asset | TRUST-CONSTITUTION.md | Constitution | No | Yes | Yes | ${amendmentId} | Canonical |`,
    `| EAC-0005 | Verification Asset | VERIFICATION-CONSTITUTION.md | Constitution | No | Yes | Yes | ${amendmentId} | Canonical |`,
    `| EAC-0006 | Reputation Asset | REPUTATION-CONSTITUTION.md | Constitution | No | Yes | Yes | ${amendmentId} | Canonical |`,
    `| EAC-0007 | Federation Asset | FEDERATION-CONSTITUTION.md | Constitution | No | Yes | Yes | ${amendmentId} | Canonical |`,
    `| EAC-0008 | Economic Asset | ECONOMICS-CONSTITUTION.md | Constitution | No | Yes | Yes | ${amendmentId} | Canonical |`,
  ].join('\n');

  const consumptionRows = [
    `| ECP-0001 | Constitutional | GCU consumption | Constitutional budget | Constitutional rights | Yes | Yes | ${amendmentId} | Canonical |`,
    `| ECP-0002 | Governance | Governance activity | Governance budget | Governance rights | Yes | Yes | ${amendmentId} | Canonical |`,
    `| ECP-0003 | Runtime | SCU consumption | Protocol budget | Runtime rights | Yes | Yes | ${amendmentId} | Canonical |`,
    `| ECP-0004 | Operational | Operational consumption | Operational budget | Operational rights | Yes | Yes | ${amendmentId} | Canonical |`,
  ].join('\n');

  const settlementRows = [
    `| ESP-0001 | Internal Settlement | Constitutional | Both parties | Yes | Yes | Yes | ${amendmentId} | Canonical |`,
    `| ESP-0002 | Federated Settlement | Governance | Both sovereign parties | Yes | Yes | Yes | ${amendmentId} | Canonical |`,
    `| ESP-0003 | Consumption Settlement | Runtime | Consuming authority | Yes | Yes | Yes | ${amendmentId} | Canonical |`,
    `| ESP-0004 | Treasury Settlement | Constitutional | Treasury authority | Yes | Yes | Yes | ${amendmentId} | Canonical |`,
    `| ESP-0005 | Governance Settlement | Governance | Governance authority | Yes | Yes | Yes | ${amendmentId} | Canonical |`,
  ].join('\n');

  const treasuryRows = [
    `| ETP-0001 | Constitutional | Yes | Yes | Yes | Yes | Yes | Yes | ${amendmentId} | Canonical |`,
    `| ETP-0002 | Governance | Yes | Yes | Yes | Yes | No | Yes | ${amendmentId} | Canonical |`,
    `| ETP-0003 | Runtime | Yes | No | No | Yes | No | Yes | ${amendmentId} | Canonical |`,
    `| ETP-0004 | Operational | Yes | No | No | Yes | No | No | ${amendmentId} | Canonical |`,
  ].join('\n');

  const valuationRows = [
    `| EVM-0001 | Consumption Value | Runtime | Consumption accounting | No | Yes | Yes | ${amendmentId} | Canonical |`,
    `| EVM-0002 | Capability Value | Governance | Capability assignment | Yes | No | Yes | ${amendmentId} | Canonical |`,
    `| EVM-0003 | Governance Value | Governance | Governance activity | Yes | No | Yes | ${amendmentId} | Canonical |`,
    `| EVM-0004 | Federation Value | Governance | Federation relationships | Yes | Yes | Yes | ${amendmentId} | Canonical |`,
    `| EVM-0005 | Assurance Value | Operational | Assurance records | Yes | No | Yes | ${amendmentId} | Canonical |`,
    `| EVM-0006 | Economic Value | Constitutional | Composite economic signal | Yes | Yes | Yes | ${amendmentId} | Canonical |`,
  ].join('\n');

  const revocationRows = [
    `| ECO-0001 | Yes | Fraud; Invalid Right; Constitutional Override; Governance Decision | Constitution | Required | Required | ${amendmentId} | Active |`,
    `| ECO-0002 | Yes | Fraud; Invalid Obligation; Constitutional Override; Governance Decision | Constitution | Required | Required | ${amendmentId} | Active |`,
    `| ECO-0009 | Yes | Fraud; Invalid Right; Constitutional Override | Constitution | Required | Required | ${amendmentId} | Active |`,
    `| ECO-0010 | Yes | Fraud; Invalid Right; Constitutional Override | Constitution | Required | Required | ${amendmentId} | Active |`,
    `| ECO-0006 | Yes | Fraud; Invalid Right; Treasury Violation; Constitutional Override; Governance Decision | Constitution | Required | Required | ${amendmentId} | Active |`,
  ].join('\n');

  fixture.write('docs/constitution/ECONOMICS-CONSTITUTION.md', `# Economics Constitution\n\n**Constitution Version:** ${version}\n`);
  fixture.write('docs/constitution/ECONOMICS-AUTHORITIES.md', `# Economics Authorities\n\n**Constitution Version:** ${version}\n\n## Economic authority catalog\n\n| Economic Authority ID | Economic Authority Name | Authority Class | Owner | Rights Policy | Obligations Policy | Revocable | Challengeable | Creation Amendment | Retirement Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|---|\n${ecoRows}\n`);
  fixture.write('docs/constitution/ECONOMIC-RIGHTS-POLICY.md', `# Economic Rights Policy\n\n**Constitution Version:** ${version}\n\n## Rights policy catalog\n\n| Rights Policy ID | Authority Class | Access Rights | Consumption Rights | Transfer Rights | Settlement Rights | Treasury Rights | Federation Rights | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|\n${rightsRows}\n\n## Rights registry\n\n| Right ID | Owner | Scope | Source | Expiration | Revocation Rule | Status |\n|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/ECONOMIC-OBLIGATIONS-POLICY.md', `# Economic Obligations Policy\n\n**Constitution Version:** ${version}\n\n## Obligations policy catalog\n\n| Obligations Policy ID | Authority Class | Payment Obligations | Settlement Obligations | Treasury Obligations | Consumption Obligations | Federation Obligations | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n${obligationsRows}\n\n## Obligations registry\n\n| Obligation ID | Holder | Type | Scope | Source | Expiration | Revocation Rule | Status |\n|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/ECONOMIC-ASSET-POLICY.md', `# Economic Asset Policy\n\n**Constitution Version:** ${version}\n\nAssets are constitutional abstractions, not accounting records.\n\n## Asset class catalog\n\n| Asset Class ID | Asset Class | Constitutional Source | Owner | Delegation Allowed | Revocable | Challengeable | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n${assetRows}\n\n## Asset registry\n\n| Asset ID | Asset Class | Owner | Scope | Source Authority | Valuation Policy | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/ECONOMIC-CONSUMPTION-POLICY.md', `# Economic Consumption Policy\n\n**Constitution Version:** ${version}\n\n## GCU and SCU definitions\n\n**GCU (Governance Compute Unit)** is the constitutional unit of measurement for governance activity.\n\n**SCU (Sovereign Compute Unit)** is the constitutional unit of measurement for sovereign system activity.\n\n## Consumption policy catalog\n\n| Consumption Policy ID | Authority Class | Consumption Events | Consumption Limits | Consumption Rights | Accounting Required | Auditing Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n${consumptionRows}\n\n## Consumption registry\n\n| Consumption ID | Economic Authority ID | Consumption Policy | GCU Units | SCU Units | Authorized By | Evidence | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/ECONOMIC-SETTLEMENT-POLICY.md', `# Economic Settlement Policy\n\n**Constitution Version:** ${version}\n\n## Settlement policy catalog\n\n| Settlement Policy ID | Settlement Type | Authority Class | Parties Required | Evidence Required | Dispute Allowed | Revocation Allowed | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n${settlementRows}\n\n## Settlement registry\n\n| Settlement ID | Settlement Type | Settlement Policy | Initiating Authority | Counterparty Authority | GCU Amount | SCU Amount | Evidence | Decision Reference | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/ECONOMIC-TREASURY-POLICY.md', `# Economic Treasury Policy\n\n**Constitution Version:** ${version}\n\n## Treasury policy catalog\n\n| Treasury Policy ID | Authority Class | Allocation Governed | Reserve Governed | Distribution Governed | Consumption Funding | Federation Funding | Sustainability Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|\n${treasuryRows}\n\n## Treasury registry\n\n| Treasury Record ID | Treasury Authority ID | Policy | Allocation Source | Reserve Amount (GCU) | Reserve Amount (SCU) | Distribution Target | Evidence | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/ECONOMIC-VALUATION-POLICY.md', `# Economic Valuation Policy\n\n**Constitution Version:** ${version}\n\nValuation ≠ Market Price.\n\n## Valuation model catalog\n\n| Valuation Model ID | Model Name | Authority Class | Basis | GCU Denominated | SCU Denominated | Evidence Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n${valuationRows}\n\n## Valuation registry\n\n| Valuation ID | Economic Authority ID | Valuation Model | Computed Value | Evidence | Amendment | Status |\n|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/ECONOMIC-LIFECYCLE.md', `# Economic Lifecycle\n\n**Constitution Version:** ${version}\n\n## Lifecycle transition ledger\n\n| Transition ID | Economic Authority ID | From | To | Authorized By | Evidence | Amendment | Effective Date |\n|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/ECONOMIC-CHALLENGE-POLICY.md', `# Economic Challenge Policy\n\n**Constitution Version:** ${version}\n\n## Challenge registry\n\n| Challenge ID | Economic Authority ID | Grounds | Evidence | Initiator | Decision Reference | Resolution | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/ECONOMIC-REVOCATION-POLICY.md', `# Economic Revocation Policy\n\n**Constitution Version:** ${version}\n\n## Revocation authority registry\n\n| Economic Authority ID | Revocable | Valid Causes | Revocation Authority | Evidence Required | Decision Reference Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n${revocationRows}\n\n## Revocation registry\n\n| Revocation ID | Economic Authority ID | Cause | Evidence | Revoked By | Decision Reference | Amendment | Effective Date | Status |\n|---|---|---|---|---|---|---|---|---|\n`);
  fixture.write('docs/constitution/ECONOMIC-VIOLATION-CATALOG.md', `# Economic Violation Catalog\n\n**Constitution Version:** ${version}\n`);
};
