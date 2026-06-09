import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeConsensusGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-consensus-expiration.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('consensus expiration governance',()=>{
 it('validates the repository consensus expiration policies',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Consensus expiration scanner passed');});
 it('rejects consensus referencing undefined expiration policy',()=>{const f=createConstitutionalFixture();try{writeConsensusGovernance(f);f.write('docs/constitution/CONSENSUS-AUTHORITIES.md',f.read('docs/constitution/CONSENSUS-AUTHORITIES.md').replace('CXP-0001','CXP-9999'));const r=f.run('check-consensus-expiration.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("CNS-V-008 consensus references expiration policy 'CXP-9999'");}finally{f.cleanup();}});
});
