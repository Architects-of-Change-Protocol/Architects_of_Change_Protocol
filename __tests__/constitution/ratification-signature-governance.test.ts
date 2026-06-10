import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeRatificationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-ratification-signatures.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('ratification signature governance',()=>{
 it('validates the repository ratification signature governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Ratification signature scanner passed');});
 it('rejects missing signature field',()=>{const f=createConstitutionalFixture();try{writeRatificationGovernance(f);f.write('docs/constitution/RATIFICATION-SIGNATURE-POLICY.md',`# Ratification Signature Policy\n\n**Constitution Version:** v1.0\n\n## Incomplete\n`);const r=f.run('check-ratification-signatures.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain('RAT-V-005');}finally{f.cleanup();}});
});
