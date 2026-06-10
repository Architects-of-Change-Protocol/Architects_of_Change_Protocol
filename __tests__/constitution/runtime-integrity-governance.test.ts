import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeRuntimeGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-runtime-integrity.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('runtime integrity governance',()=>{
 it('validates the repository runtime integrity governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Runtime integrity scanner passed');});
 it('rejects invalid integrity policy records',()=>{const f=createConstitutionalFixture();try{writeRuntimeGovernance(f);f.write('docs/constitution/RUNTIME-INTEGRITY-POLICY.md',`# Runtime Integrity Policy\n\n**Constitution Version:** v1.0\n\n## Integrity policy catalog\n\n| Integrity Policy ID | Authority Class | Authenticity Required | Completeness Required | Traceability Required | Immutability Required | Verifiability Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n| INVALID | Constitutional | Yes | Yes | Yes | Yes | Yes | AOC-AMD-0001 | Canonical |\n`);const r=f.run('check-runtime-integrity.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("RUN-V-005");}finally{f.cleanup();}});
});
