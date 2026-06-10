import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeGovernanceGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-governance-challenges.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('governance challenge governance',()=>{
 it('validates the repository governance challenges',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Governance challenge scanner passed');});
 it('rejects challenge with invalid grounds',()=>{const f=createConstitutionalFixture();try{writeGovernanceGovernance(f);f.write('docs/constitution/GOVERNANCE-CHALLENGE-POLICY.md',f.read('docs/constitution/GOVERNANCE-CHALLENGE-POLICY.md')+`\n| GCH-0001 | GOV-0001 | GMD-0001 | Invalid Reason | Evidence here | Constitution | DEC-0001 | Pending | AOC-AMD-0013 | Open |\n`);const r=f.run('check-governance-challenges.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("GOV-V-010");}finally{f.cleanup();}});
});
