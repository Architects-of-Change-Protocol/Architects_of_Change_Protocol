import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeRuntimeGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-runtime-evidence.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('runtime evidence governance',()=>{
 it('validates the repository runtime evidence governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Runtime evidence scanner passed');});
 it('rejects invalid evidence policy records',()=>{const f=createConstitutionalFixture();try{writeRuntimeGovernance(f);f.write('docs/constitution/RUNTIME-EVIDENCE-POLICY.md',`# Runtime Evidence Policy\n\n**Constitution Version:** v1.0\n\n## Evidence policy catalog\n\n| Evidence Policy ID | Evidence Type | Authority Class | Timestamp Required | Integrity Hash Required | Authority Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n| INVALID | Execution Evidence | Constitutional | Yes | Yes | Yes | AOC-AMD-0001 | Canonical |\n`);const r=f.run('check-runtime-evidence.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("RUN-V-004");}finally{f.cleanup();}});
});
