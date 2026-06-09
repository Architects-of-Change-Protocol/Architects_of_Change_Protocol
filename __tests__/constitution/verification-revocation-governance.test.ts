import { spawnSync } from 'node:child_process';
import { repositoryRoot } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-verification-revocation.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('verification revocation governance',()=>{
 it('validates the repository verification revocation authorities',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Verification revocation scanner passed');});
});
