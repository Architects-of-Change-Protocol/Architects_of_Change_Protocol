import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeRatificationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-ratification-amendment-lock.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('ratification amendment lock governance',()=>{
 it('validates the repository ratification amendment lock governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Ratification amendment lock scanner passed');});
 it('rejects missing amendment lock rule',()=>{const f=createConstitutionalFixture();try{writeRatificationGovernance(f);f.write('docs/constitution/RATIFICATION-AMENDMENT-LOCK-POLICY.md',`# Ratification Amendment Lock Policy\n\n**Constitution Version:** v1.0\n\n## Incomplete\n`);const r=f.run('check-ratification-amendment-lock.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('RAT-V-008');}finally{f.cleanup();}});
});
