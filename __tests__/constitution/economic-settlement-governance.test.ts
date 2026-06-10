import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeEconomicsGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-economic-settlement.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('economic settlement governance',()=>{
 it('validates the repository economic settlement governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Economics settlement scanner passed');});
 it('rejects invalid settlement records',()=>{const f=createConstitutionalFixture();try{writeEconomicsGovernance(f);f.write('docs/constitution/ECONOMIC-SETTLEMENT-POLICY.md',`# Economic Settlement Policy\n\n**Constitution Version:** v1.0\n\n## Settlement policy catalog\n\n| Settlement Policy ID | Settlement Type | Authority Class | Parties Required | Evidence Required | Dispute Allowed | Revocation Allowed | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n| INVALID | Internal Settlement | Constitutional | Both parties | Yes | Yes | Yes | AOC-AMD-0001 | Canonical |\n`);const r=f.run('check-economic-settlement.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("ECO-V-005");}finally{f.cleanup();}});
});
