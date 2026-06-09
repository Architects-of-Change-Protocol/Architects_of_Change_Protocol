import { spawnSync } from 'node:child_process';
import { repositoryRoot } from './fixture';
const run=()=>spawnSync(process.execPath,['scripts/check-verification-expiration.mjs'],{cwd:repositoryRoot,encoding:'utf8'});
describe('verification expiration governance',()=>{
 it('validates the repository verification expiration policies',()=>{const r=run();expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('Verification expiration scanner passed');});
});
