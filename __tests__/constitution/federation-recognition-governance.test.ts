import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeFederationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-federation-recognition.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('federation recognition governance',()=>{
 it('validates the repository federation recognition',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Federation recognition scanner passed');});
 it('rejects invalid recognition records',()=>{const f=createConstitutionalFixture();try{writeFederationGovernance(f);f.write('docs/constitution/FEDERATION-RECOGNITION-POLICY.md',`# Federation Recognition Policy\n\n**Constitution Version:** v1.0\n\n## Recognition registry\n\n| Recognition ID | Federation ID | Recognizing Authority | Recognized Authority | Evidence | Decision Reference | Status |\n|---|---|---|---|---|---|---|\n| INVALID | FED-0001 | Constitution | ExternalSystem | Evidence | DEC-0001 | Recognized |\n`);const r=f.run('check-federation-recognition.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("FED-V-002");}finally{f.cleanup();}});
});
