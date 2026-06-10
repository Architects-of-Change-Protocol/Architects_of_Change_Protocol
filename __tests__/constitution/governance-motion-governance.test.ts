import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeGovernanceGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-governance-motions.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('governance motion governance',()=>{
 it('validates the repository governance motion policies',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Governance motion scanner passed');});
 it('rejects motion policy with invalid amendment',()=>{const f=createConstitutionalFixture();try{writeGovernanceGovernance(f);f.write('docs/constitution/GOVERNANCE-MOTION-POLICY.md',f.read('docs/constitution/GOVERNANCE-MOTION-POLICY.md').replace('AOC-AMD-0001 | Active','AOC-AMD-9999 | Active'));const r=f.run('check-governance-motions.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('GOV-V-014');}finally{f.cleanup();}});
});
