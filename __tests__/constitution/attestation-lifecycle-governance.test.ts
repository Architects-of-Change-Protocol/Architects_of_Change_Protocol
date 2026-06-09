import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeAttestationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-attestation-lifecycle.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('attestation lifecycle governance',()=>{
 it('validates the repository attestation lifecycle',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Attestation lifecycle scanner passed');});
 it('rejects invalid lifecycle transitions',()=>{const f=createConstitutionalFixture();try{writeAttestationGovernance(f);f.write('docs/constitution/ATTESTATION-LIFECYCLE.md',`# Attestation Lifecycle\n\n**Constitution Version:** v1.0\n\n## Attestation lifecycle transition ledger\n\n| Transition ID | Attestation ID | From | To | Authorized By | Evidence | Amendment | Effective Date |\n|---|---|---|---|---|---|---|---|\n| ALT-0001 | ATT-0001 | Proposed | Active | Constitution | Test | AOC-AMD-0001 | 2026-06-09 |\n`);const r=f.run('check-attestation-lifecycle.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("ATT-V-005 ALT-0001 invalid transition 'Proposed' → 'Active'");}finally{f.cleanup();}});
});
