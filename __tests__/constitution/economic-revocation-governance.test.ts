import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeEconomicsGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-economic-revocation.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('economic revocation governance',()=>{
 it('validates the repository economic revocation governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Economics revocation scanner passed');});
 it('rejects invalid revocation records',()=>{const f=createConstitutionalFixture();try{writeEconomicsGovernance(f);f.write('docs/constitution/ECONOMIC-REVOCATION-POLICY.md',`# Economic Revocation Policy\n\n**Constitution Version:** v1.0\n\n## Revocation authority registry\n\n| Economic Authority ID | Revocable | Valid Causes | Revocation Authority | Evidence Required | Decision Reference Required | Amendment | Status |\n|---|---|---|---|---|---|---|---|\n| INVALID | Yes | Fraud | Constitution | Required | Required | AOC-AMD-0001 | Active |\n`);const r=f.run('check-economic-revocation.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("ECO-V-008");}finally{f.cleanup();}});
});
