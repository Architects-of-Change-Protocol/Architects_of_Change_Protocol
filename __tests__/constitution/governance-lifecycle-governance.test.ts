import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeGovernanceGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-governance-lifecycle.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('governance lifecycle governance',()=>{
 it('validates the repository governance lifecycle',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Governance lifecycle scanner passed');});
 it('rejects invalid lifecycle transition',()=>{const f=createConstitutionalFixture();try{writeGovernanceGovernance(f);f.write('docs/constitution/GOVERNANCE-LIFECYCLE.md',f.read('docs/constitution/GOVERNANCE-LIFECYCLE.md')+`\n| TRN-0001 | GOV-0001 | Retired | Active | Constitution | Test | AOC-AMD-0013 | 2026-06-10 |\n`);const r=f.run('check-governance-lifecycle.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("GOV-V-009");}finally{f.cleanup();}});
});
