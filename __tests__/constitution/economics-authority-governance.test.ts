import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeEconomicsGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-economics-authorities.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('economics authority governance',()=>{
 it('validates the repository economics authority governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Economics authority scanner passed');});
 it('rejects invalid authority records',()=>{const f=createConstitutionalFixture();try{writeEconomicsGovernance(f);f.write('docs/constitution/ECONOMICS-AUTHORITIES.md',`# Economics Authorities\n\n**Constitution Version:** v1.0\n\n## Economic authority catalog\n\n| Economic Authority ID | Economic Authority Name | Authority Class | Owner | Rights Policy | Obligations Policy | Revocable | Challengeable | Creation Amendment | Retirement Amendment | Status |\n|---|---|---|---|---|---|---|---|---|---|---|\n| INVALID | Test | Constitutional | Constitution | ERP-0001 | EOP-0001 | Yes | Yes | AOC-AMD-0001 | Not scheduled | Canonical |\n`);const r=f.run('check-economics-authorities.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("ECO-V-001");}finally{f.cleanup();}});
});
