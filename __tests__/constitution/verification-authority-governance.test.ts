import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeVerificationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-verification-authorities.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('verification authority governance',()=>{
 it('validates the repository verification catalog',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Verification authority scanner passed');});
 it('rejects unauthorized verification creation',()=>{const f=createConstitutionalFixture();try{writeVerificationGovernance(f);const p=`${f.root}/docs/constitution/VERIFICATION-AUTHORITIES.md`;f.write('docs/constitution/VERIFICATION-AUTHORITIES.md',readFileSync(p,'utf8').replace('AOC-AMD-0001 | Not scheduled | Canonical |','AOC-AMD-9999 | Not scheduled | Canonical |'));const r=f.run('check-verification-authorities.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("VER-V-001 VER-0001 creation amendment 'AOC-AMD-9999'");}finally{f.cleanup();}});
});
