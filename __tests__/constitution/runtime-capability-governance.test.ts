import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeRuntimeGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-runtime-capabilities.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('runtime capability governance',()=>{
 it('validates the repository runtime capability governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Runtime capabilities scanner passed');});
 it('rejects invalid capability policy records',()=>{const f=createConstitutionalFixture();try{writeRuntimeGovernance(f);f.write('docs/constitution/RUNTIME-CAPABILITY-POLICY.md',`# Runtime Capability Policy\n\n**Constitution Version:** v1.0\n\n## Capability policy catalog\n\n| Capability Policy ID | Authority Class | Invocation Governed | Limits Governed | Dependencies Governed | Consumption Governed | Completion Governed | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n| INVALID | Constitutional | Yes | Yes | Yes | Yes | Yes | AOC-AMD-0001 | Canonical |\n`);const r=f.run('check-runtime-capabilities.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("RUN-V-002");}finally{f.cleanup();}});
});
