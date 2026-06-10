import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeRatificationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-ratification-readiness.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('ratification readiness governance',()=>{
 it('validates the repository ratification readiness governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Ratification readiness scanner passed');});
 it('rejects missing readiness requirement',()=>{const f=createConstitutionalFixture();try{writeRatificationGovernance(f);f.write('docs/constitution/RATIFICATION-READINESS-POLICY.md',`# Ratification Readiness Policy\n\n**Constitution Version:** v1.0\n\n## Incomplete\n`);const r=f.run('check-ratification-readiness.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('RAT-V-003');}finally{f.cleanup();}});
});
