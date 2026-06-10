import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeRatificationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-ratification-authorities.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('ratification authority governance',()=>{
 it('validates the repository ratification authority governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Ratification authority scanner passed');});
 it('rejects invalid authority records',()=>{const f=createConstitutionalFixture();try{writeRatificationGovernance(f);f.write('docs/constitution/RATIFICATION-AUTHORITIES.md',`# Ratification Authorities\n\n**Constitution Version:** v1.0\n\n## Ratification authority catalog\n\n| Ratification Authority ID | Ratification Authority Name | Authority Class | Owner | Amendment | Status |\n|---|---|---|---|---|---|\n| INVALID | Test | Constitutional | Constitution | AOC-AMD-0001 | Canonical |\n`);const r=f.run('check-ratification-authorities.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('RAT-V-001');}finally{f.cleanup();}});
});
