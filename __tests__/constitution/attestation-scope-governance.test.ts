import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeAttestationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-attestation-scope.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('attestation scope governance',()=>{
 it('validates the repository attestation scope policy',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Attestation scope scanner passed');});
 it('rejects scope policy missing valid scopes',()=>{const f=createConstitutionalFixture();try{writeAttestationGovernance(f);f.write('docs/constitution/ATTESTATION-SCOPE-POLICY.md',`# Attestation Scope Policy\n\n**Constitution Version:** v1.0\n\n## Scope registry\n\n| Scope Policy ID | Attestation Class | Valid Scopes | Subject Requirements | Duration Requirements | Authority Requirements | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n| ASP-0001 | Constitutional | | Required | Required | Required | AOC-AMD-0001 | Active |\n`);const r=f.run('check-attestation-scope.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('ATT-V-004 ASP-0001 is missing Valid Scopes');}finally{f.cleanup();}});
});
