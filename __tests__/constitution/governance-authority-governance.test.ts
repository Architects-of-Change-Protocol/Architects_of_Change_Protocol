import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeGovernanceGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-governance-authorities.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('governance authority governance',()=>{
 it('validates the repository governance catalog',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Governance authority scanner passed');});
 it('rejects unauthorized governance creation',()=>{const f=createConstitutionalFixture();try{writeGovernanceGovernance(f);const p=`${f.root}/docs/constitution/GOVERNANCE-AUTHORITIES.md`;f.write('docs/constitution/GOVERNANCE-AUTHORITIES.md',readFileSync(p,'utf8').replace('AOC-AMD-0001 | Not scheduled | Canonical |','AOC-AMD-9999 | Not scheduled | Canonical |'));const r=f.run('check-governance-authorities.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("GOV-V-014 GOV-0001 creation amendment 'AOC-AMD-9999'");}finally{f.cleanup();}});
});
