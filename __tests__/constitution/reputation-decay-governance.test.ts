import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeReputationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-reputation-decay.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('reputation decay governance',()=>{
 it('validates the repository reputation decay policies',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Reputation decay scanner passed');});
 it('rejects decay policies missing required fields',()=>{const f=createConstitutionalFixture();try{writeReputationGovernance(f);const p=`${f.root}/docs/constitution/REPUTATION-DECAY-POLICY.md`;f.write('docs/constitution/REPUTATION-DECAY-POLICY.md',readFileSync(p,'utf8').replace('| RDP-0001 |','| RDP-XXXX |'));const r=f.run('check-reputation-decay.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('REP-V-007');}finally{f.cleanup();}});
});
