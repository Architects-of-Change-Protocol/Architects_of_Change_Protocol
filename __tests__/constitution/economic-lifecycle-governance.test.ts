import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeEconomicsGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-economic-lifecycle.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('economic lifecycle governance',()=>{
 it('validates the repository economic lifecycle governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Economics lifecycle scanner passed');});
 it('rejects invalid lifecycle records',()=>{const f=createConstitutionalFixture();try{writeEconomicsGovernance(f);f.write('docs/constitution/ECONOMIC-LIFECYCLE.md',`# Economic Lifecycle\n\n**Constitution Version:** v1.0\n\n## Lifecycle transition ledger\n\n| Transition ID | Economic Authority ID | From | To | Authorized By | Evidence | Amendment | Effective Date |\n|---|---|---|---|---|---|---|---|\n| ETRANS-0001 | ECO-0001 | Created | Retired | Constitution | evidence | AOC-AMD-0001 | 2026-01-01 |\n`);const r=f.run('check-economic-lifecycle.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("ECO-V-008");}finally{f.cleanup();}});
});
