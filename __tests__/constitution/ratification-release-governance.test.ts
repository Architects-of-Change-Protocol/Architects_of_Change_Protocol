import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeRatificationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-ratification-release.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('ratification release governance',()=>{
 it('validates the repository ratification release governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Ratification release scanner passed');});
 it('rejects missing release field',()=>{const f=createConstitutionalFixture();try{writeRatificationGovernance(f);f.write('docs/constitution/RATIFICATION-RELEASE-POLICY.md',`# Ratification Release Policy\n\n**Constitution Version:** v1.0\n\n## Incomplete\n`);const r=f.run('check-ratification-release.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('RAT-V-006');}finally{f.cleanup();}});
});
