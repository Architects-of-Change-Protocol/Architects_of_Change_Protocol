import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeReputationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-reputation-calculation.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('reputation calculation governance',()=>{
 it('validates the repository reputation calculation policies',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Reputation calculation scanner passed');});
 it('rejects calculation policies missing required fields',()=>{const f=createConstitutionalFixture();try{writeReputationGovernance(f);const p=`${f.root}/docs/constitution/REPUTATION-CALCULATION-POLICY.md`;f.write('docs/constitution/REPUTATION-CALCULATION-POLICY.md',readFileSync(p,'utf8').replace('| RCP-0001 |','| RCP-XXXX |'));const r=f.run('check-reputation-calculation.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('REP-V-003');}finally{f.cleanup();}});
});
