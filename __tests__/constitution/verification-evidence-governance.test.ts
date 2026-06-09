import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeVerificationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-verification-evidence.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('verification evidence governance',()=>{
 it('validates the repository verification evidence',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Verification evidence scanner passed');});
 it('rejects missing integrity rules',()=>{const f=createConstitutionalFixture();try{writeVerificationGovernance(f);const p=`${f.root}/docs/constitution/VERIFICATION-EVIDENCE-POLICY.md`;f.write('docs/constitution/VERIFICATION-EVIDENCE-POLICY.md',readFileSync(p,'utf8').replace('No alterations permitted | Within 90 days','  | Within 90 days'));const r=f.run('check-verification-evidence.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('VER-V-008');}finally{f.cleanup();}});
});
