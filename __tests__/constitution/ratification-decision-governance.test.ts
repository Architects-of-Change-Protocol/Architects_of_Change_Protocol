import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeRatificationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-ratification-decisions.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('ratification decision governance',()=>{
 it('validates the repository ratification decision governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Ratification decision scanner passed');});
 it('rejects missing decision field',()=>{const f=createConstitutionalFixture();try{writeRatificationGovernance(f);f.write('docs/constitution/RATIFICATION-DECISION-POLICY.md',`# Ratification Decision Policy\n\n**Constitution Version:** v1.0\n\n## Incomplete\n`);const r=f.run('check-ratification-decisions.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('RAT-V-004');}finally{f.cleanup();}});
});
