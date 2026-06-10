import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeRuntimeGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-runtime-authorities.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('runtime authority governance',()=>{
 it('validates the repository runtime authority governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Runtime authority scanner passed');});
 it('rejects invalid authority records',()=>{const f=createConstitutionalFixture();try{writeRuntimeGovernance(f);f.write('docs/constitution/RUNTIME-AUTHORITIES.md',`# Runtime Authorities\n\n**Constitution Version:** v1.0\n\n## Runtime authority catalog\n\n| Runtime Authority ID | Runtime Authority Name | Authority Class | Owner | Execution Policy | Capability Policy | Revocable | Challengeable | Creation Amendment | Retirement Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|---|\n| INVALID | Test | Constitutional | Constitution | REP-0001 | RCP-0001 | Yes | Yes | AOC-AMD-0001 | Not scheduled | Canonical |\n`);const r=f.run('check-runtime-authorities.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("RUN-V-001");}finally{f.cleanup();}});
});
