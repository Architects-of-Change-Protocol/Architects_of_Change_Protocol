import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeReputationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-reputation-lifecycle.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('reputation lifecycle governance',()=>{
 it('validates the repository reputation lifecycle',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Reputation lifecycle scanner passed');});
 it('rejects invalid lifecycle transitions',()=>{const f=createConstitutionalFixture();try{writeReputationGovernance(f);const p=`${f.root}/docs/constitution/REPUTATION-LIFECYCLE.md`;f.write('docs/constitution/REPUTATION-LIFECYCLE.md',readFileSync(p,'utf8').replace('Proposed | Pending Source Evaluation','Proposed | Active'));const r=f.run('check-reputation-lifecycle.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('REP-V-006');}finally{f.cleanup();}});
});
