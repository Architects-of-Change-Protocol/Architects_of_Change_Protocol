import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeRuntimeGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-runtime-revocation.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('runtime revocation governance',()=>{
 it('validates the repository runtime revocation governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Runtime revocation scanner passed');});
 it('rejects invalid revocation causes',()=>{const f=createConstitutionalFixture();try{writeRuntimeGovernance(f);f.write('docs/constitution/RUNTIME-REVOCATION-POLICY.md',`# Runtime Revocation Policy\n\n**Constitution Version:** v1.0\n\n## Revocation authority registry\n\n| Runtime Authority ID | Revocable | Valid Causes | Revocation Authority | Evidence Required | Decision Reference Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n| RUN-0001 | Yes | Invalid Cause Type | Constitution | Required | Required | AOC-AMD-0001 | Active |\n`);const r=f.run('check-runtime-revocation.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("RUN-V-009");}finally{f.cleanup();}});
});
