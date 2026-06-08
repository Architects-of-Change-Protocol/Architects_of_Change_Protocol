import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeTrustGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-trust-authorities.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('trust authority governance',()=>{
 it('validates the repository trust catalog',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Trust authority scanner passed');});
 it('rejects unauthorized trust creation',()=>{const f=createConstitutionalFixture();try{writeTrustGovernance(f);const p=`${f.root}/docs/constitution/TRUST-AUTHORITIES.md`;f.write('docs/constitution/TRUST-AUTHORITIES.md',readFileSync(p,'utf8').replace('AOC-AMD-0001 | Not scheduled | Canonical |','AOC-AMD-9999 | Not scheduled | Canonical |'));const r=f.run('check-trust-authorities.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("TRS-V-001 TRS-0001 creation amendment 'AOC-AMD-9999'");}finally{f.cleanup();}});
});
