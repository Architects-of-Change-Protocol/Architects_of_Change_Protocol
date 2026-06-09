import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeConsensusGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-consensus-thresholds.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('consensus threshold governance',()=>{
 it('validates the repository consensus thresholds',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Consensus threshold scanner passed');});
 it('rejects consensus referencing undefined threshold policy',()=>{const f=createConstitutionalFixture();try{writeConsensusGovernance(f);f.write('docs/constitution/CONSENSUS-AUTHORITIES.md',f.read('docs/constitution/CONSENSUS-AUTHORITIES.md').replace('CTP-0001','CTP-9999'));const r=f.run('check-consensus-thresholds.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("CNS-V-002 consensus references threshold policy 'CTP-9999'");}finally{f.cleanup();}});
});
