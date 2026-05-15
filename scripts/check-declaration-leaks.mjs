import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const root='packages/protocol/dist';
const bad=['/src/','../src','packages/'];
const files=[];
const walk=d=>{for(const e of readdirSync(d)){const p=join(d,e);statSync(p).isDirectory()?walk(p):files.push(p)}};
walk(root);
for(const file of files.filter(f=>f.endsWith('.d.ts'))){const t=readFileSync(file,'utf8');for(const b of bad){if(t.includes(b)){console.error(`Declaration leak ${b} in ${file}`);process.exit(1);}}}
