import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeConsensusGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-consensus-models.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('consensus model governance',()=>{
 it('validates the repository consensus models',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Consensus models scanner passed');});
 it('rejects consensus referencing undefined model',()=>{const f=createConstitutionalFixture();try{writeConsensusGovernance(f);f.write('docs/constitution/CONSENSUS-AUTHORITIES.md',f.read('docs/constitution/CONSENSUS-AUTHORITIES.md').replace('CMP-0001','CMP-9999'));const r=f.run('check-consensus-models.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("CNS-V-005 consensus references model 'CMP-9999'");}finally{f.cleanup();}});
});
