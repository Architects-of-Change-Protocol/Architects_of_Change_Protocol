import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeConsensusGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-consensus-authorities.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('consensus authority governance',()=>{
 it('validates the repository consensus catalog',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Consensus authority scanner passed');});
 it('rejects unauthorized consensus creation',()=>{const f=createConstitutionalFixture();try{writeConsensusGovernance(f);const p=`${f.root}/docs/constitution/CONSENSUS-AUTHORITIES.md`;f.write('docs/constitution/CONSENSUS-AUTHORITIES.md',readFileSync(p,'utf8').replace('AOC-AMD-0001 | Not scheduled | Canonical |','AOC-AMD-9999 | Not scheduled | Canonical |'));const r=f.run('check-consensus-authorities.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("CNS-V-011 CNS-0001 creation amendment 'AOC-AMD-9999'");}finally{f.cleanup();}});
});
