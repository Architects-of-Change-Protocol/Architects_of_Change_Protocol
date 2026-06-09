import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeReputationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-reputation-sources.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('reputation source governance',()=>{
 it('validates the repository reputation sources',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Reputation sources scanner passed');});
 it('rejects sources missing required fields',()=>{const f=createConstitutionalFixture();try{writeReputationGovernance(f);const p=`${f.root}/docs/constitution/REPUTATION-SOURCES-POLICY.md`;f.write('docs/constitution/REPUTATION-SOURCES-POLICY.md',readFileSync(p,'utf8').replace('| RSP-0001 |','| RSP-XXXX |'));const r=f.run('check-reputation-sources.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('REP-V-002');}finally{f.cleanup();}});
});
