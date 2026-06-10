import { spawnSync } from 'node:child_process';
import { createConstitutionalFixture, repositoryRoot, writeFederationGovernance } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-federation-lifecycle.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('federation lifecycle governance',()=>{
 it('validates the repository federation lifecycle',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Federation lifecycle scanner passed');});
 it('rejects invalid lifecycle transition',()=>{const f=createConstitutionalFixture();try{writeFederationGovernance(f);f.write('docs/constitution/FEDERATION-LIFECYCLE.md',`# Federation Lifecycle\n\n**Constitution Version:** v1.0\n\n## Federation lifecycle transition ledger\n\n| Transition ID | Federation ID | From | To | Authorized By | Evidence | Amendment | Effective Date |\n|---|---|---|---|---|---|---|---|\n| FLC-0001 | FED-0001 | Retired | Observed | Constitution | test | AOC-AMD-0001 | 2026-06-10 |\n`);const r=f.run('check-federation-lifecycle.mjs');expect(r.status).toBe(1);expect(r.stderr).toContain("FED-V-008");}finally{f.cleanup();}});
});
