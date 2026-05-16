import { execSync } from 'node:child_process';
execSync('npx tsc --pretty false --noEmit -p examples/sdk/tsconfig.json', { stdio: 'inherit' });
console.log('SDK examples compile check passed.');
