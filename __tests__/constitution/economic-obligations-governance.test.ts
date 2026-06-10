import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeEconomicsGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-economic-obligations.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('economic obligations governance',()=>{
 it('validates the repository economic obligations governance',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Economics obligations scanner passed');});
 it('rejects invalid obligations records',()=>{const f=createConstitutionalFixture();try{writeEconomicsGovernance(f);f.write('docs/constitution/ECONOMIC-OBLIGATIONS-POLICY.md',`# Economic Obligations Policy\n\n**Constitution Version:** v1.0\n\n## Obligations policy catalog\n\n| Obligations Policy ID | Authority Class | Payment Obligations | Settlement Obligations | Treasury Obligations | Consumption Obligations | Federation Obligations | Amendment | Status |\n|---|---|---|---|---|---|---|---|---|\n| INVALID | Constitutional | Yes | Yes | Yes | Yes | Yes | AOC-AMD-0001 | Canonical |\n`);const r=f.run('check-economic-obligations.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("ECO-V-002");}finally{f.cleanup();}});
});
