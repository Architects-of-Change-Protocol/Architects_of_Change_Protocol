#!/usr/bin/env node
import fs from 'node:fs';

const versioningPath = 'runtime/versioning.ts';
const transportPath = 'runtime/types/transport.ts';
const serverPath = 'runtime/api/server.ts';
const sdkPath = 'runtime/sdk/client.ts';
const matrixPath = 'COMPATIBILITY_MATRIX.md';

const requiredDocs = [
  'RELEASE_GOVERNANCE_MODEL.md',
  'SEMVER_POLICY.md',
  'COMPATIBILITY_MATRIX.md',
  'SDK_RUNTIME_COMPATIBILITY.md',
  'PLATFORM_EVOLUTION_GUIDANCE.md',
  'DEPRECATION_AND_LIFECYCLE_POLICY.md',
  'PACKAGE_RELEASE_DISCIPLINE.md'
];

const missing = requiredDocs.filter((f) => !fs.existsSync(f));
if (missing.length) {
  console.error('Missing governance docs:');
  missing.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

const versioning = fs.readFileSync(versioningPath, 'utf8');
for (const symbol of ['PLATFORM_VERSION', 'CONTRACTS_VERSION', 'RUNTIME_TRANSPORT_VERSION', 'MINIMUM_SUPPORTED_TRANSPORT_VERSION', 'SDK_COMPATIBILITY_VERSION']) {
  if (!versioning.includes(symbol)) {
    console.error(`Missing canonical version symbol: ${symbol}`);
    process.exit(1);
  }
}

const transport = fs.readFileSync(transportPath, 'utf8');
const server = fs.readFileSync(serverPath, 'utf8');
const sdk = fs.readFileSync(sdkPath, 'utf8');
const matrix = fs.readFileSync(matrixPath, 'utf8');

if (!transport.includes('runtimeVersion: PLATFORM_VERSION')) throw new Error('transport metadata is not sourcing PLATFORM_VERSION');
if (!server.includes('transportVersion: RUNTIME_TRANSPORT_VERSION')) throw new Error('handshake transportVersion not canonical');
if (!sdk.includes('classifyTransportCompatibility')) throw new Error('SDK compatibility classifier not in use');
if (!matrix.includes('SDK ↔ Runtime transport')) throw new Error('compatibility matrix missing required section');

console.log('Release governance checks passed.');
