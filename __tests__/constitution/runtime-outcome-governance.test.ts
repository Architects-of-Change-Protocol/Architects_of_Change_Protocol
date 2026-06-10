import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeRuntimeGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-runtime-outcomes.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('runtime outcome governance',()=>{
 it('validates the repository runtime outcome governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Runtime outcomes scanner passed');});
 it('rejects invalid outcome policy records',()=>{const f=createConstitutionalFixture();try{writeRuntimeGovernance(f);f.write('docs/constitution/RUNTIME-OUTCOME-POLICY.md',`# Runtime Outcome Policy\n\n**Constitution Version:** v1.0\n\n## Outcome policy catalog\n\n| Outcome Policy ID | Authority Class | Evidence Required | Decision Reference Required | Audit Required | Revocation Allowed | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n| INVALID | Constitutional | Yes | Yes | Yes | Yes | AOC-AMD-0001 | Canonical |\n`);const r=f.run('check-runtime-outcomes.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("RUN-V-008");}finally{f.cleanup();}});
});
