import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeFederationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-federation-authorities.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('federation authority governance',()=>{
 it('validates the repository federation catalog',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Federation authority scanner passed');});
 it('rejects unauthorized federation creation',()=>{const f=createConstitutionalFixture();try{writeFederationGovernance(f);const p=`${f.root}/docs/constitution/FEDERATION-AUTHORITIES.md`;f.write('docs/constitution/FEDERATION-AUTHORITIES.md',readFileSync(p,'utf8').replace('AOC-AMD-0001 | Not scheduled | Canonical |','AOC-AMD-9999 | Not scheduled | Canonical |'));const r=f.run('check-federation-authorities.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("FED-V-011 FED-0001 creation amendment 'AOC-AMD-9999'");}finally{f.cleanup();}});
});
