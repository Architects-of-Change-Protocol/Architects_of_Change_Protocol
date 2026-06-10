import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeGovernanceGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-governance-revocation.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('governance revocation governance',()=>{
 it('validates the repository governance revocation authorities',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Governance revocation scanner passed');});
 it('rejects revocation authority with invalid amendment',()=>{const f=createConstitutionalFixture();try{writeGovernanceGovernance(f);f.write('docs/constitution/GOVERNANCE-REVOCATION-POLICY.md',f.read('docs/constitution/GOVERNANCE-REVOCATION-POLICY.md').replace('AOC-AMD-0001 | Active','AOC-AMD-9999 | Active'));const r=f.run('check-governance-revocation.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('GOV-V-014');}finally{f.cleanup();}});
});
