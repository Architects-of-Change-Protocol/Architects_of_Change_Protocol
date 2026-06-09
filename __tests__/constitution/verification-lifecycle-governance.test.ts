import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeVerificationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-verification-lifecycle.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('verification lifecycle governance',()=>{
 it('validates the repository verification lifecycle',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Verification lifecycle scanner passed');});
 it('rejects invalid lifecycle transitions',()=>{const f=createConstitutionalFixture();try{writeVerificationGovernance(f);const p=`${f.root}/docs/constitution/VERIFICATION-LIFECYCLE.md`;f.write('docs/constitution/VERIFICATION-LIFECYCLE.md',readFileSync(p,'utf8').replace('Proposed | Pending Verification','Proposed | Verified'));const r=f.run('check-verification-lifecycle.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('VER-V-005');}finally{f.cleanup();}});
});
