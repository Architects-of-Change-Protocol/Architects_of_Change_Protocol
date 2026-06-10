import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeRatificationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-ratification-lifecycle.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('ratification lifecycle governance',()=>{
 it('validates the repository ratification lifecycle governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Ratification lifecycle scanner passed');});
 it('rejects missing lifecycle state',()=>{const f=createConstitutionalFixture();try{writeRatificationGovernance(f);f.write('docs/constitution/RATIFICATION-LIFECYCLE.md',`# Ratification Lifecycle\n\n**Constitution Version:** v1.0\n\n## States\n\nDraft\n`);const r=f.run('check-ratification-lifecycle.mjs');expect(r.status).toBe(1);}finally{f.cleanup();}});
});
