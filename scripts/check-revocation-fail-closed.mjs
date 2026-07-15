#!/usr/bin/env node
// Architecture gate for the AOC-REVOCATION-00 sprint (docs/security/revocation/). Deterministic,
// no optional env vars, fails CI on any violation. Static-analysis backstop for invariants
// TypeScript's own type system cannot enforce (a required `checkRevocation` parameter already
// makes "forgot to pass revocation status" a compile error — this script catches things that
// only show up as source-text patterns).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const EXCLUDED_DIR_NAMES = new Set(['node_modules', 'dist', '.git', 'coverage', 'build']);

function listTsFiles(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (EXCLUDED_DIR_NAMES.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listTsFiles(full, out);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) && !entry.name.endsWith('.d.ts')) {
      out.push(full);
    }
  }
  return out;
}

const violations = [];

function relative(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

// --- Check 1: the optional-boolean-callback anti-pattern must never come back. -------------
// This was the actual production fail-open bug: `isRevoked?: (x) => boolean` on an evaluation
// options type, which real callers never populated. protocol/revocation/ defines the canonical
// mandatory RevocationCheckPort instead; nothing else may reintroduce the optional shape.
{
  const files = listTsFiles(ROOT);
  const pattern = /isRevoked\s*\?\s*:\s*\(/;
  for (const file of files) {
    if (relative(file).startsWith('protocol/revocation/')) continue;
    const text = fs.readFileSync(file, 'utf8');
    if (pattern.test(text)) {
      violations.push(
        `${relative(file)}: declares an optional \`isRevoked?: (...) => boolean\` field. ` +
          'Revocation checks must be mandatory RevocationCheckPort parameters (see protocol/revocation), never an optional boolean callback that callers can silently omit.'
      );
    }
  }
}

// --- Check 2: the literal "swallow the error, treat as clean" anti-pattern. -----------------
{
  const files = listTsFiles(ROOT);
  const suspiciousPatterns = [
    /catch\s*(\([^)]*\))?\s*\{\s*return\s+null\s*;?\s*\}/,
    /catch\s*(\([^)]*\))?\s*\{\s*return\s+false\s*;?\s*\}/,
    /\?\.\s*reason\s*\?\?\s*null/,
  ];
  for (const file of files) {
    const rel = relative(file);
    if (rel.includes('__tests__') || rel.endsWith('.test.ts')) continue; // test fixtures may name the anti-pattern in strings/comments
    const text = fs.readFileSync(file, 'utf8');
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(text) && /revok|isRevoked|revocation/i.test(text)) {
        violations.push(
          `${rel}: matches a fail-open error-swallowing pattern (${pattern}) in a file that also references revocation. ` +
            'An error/exception resolving revocation status must map to an explicit `unknown` RevocationStatus, never to null/false/undefined.'
        );
      }
    }
  }
}

// --- Check 3: containment endpoints must never be metered or priced (ADR §13). --------------
{
  const routesFile = path.join(ROOT, 'runtime/api/routes.ts');
  if (fs.existsSync(routesFile)) {
    const text = fs.readFileSync(routesFile, 'utf8');
    const containmentMatch = text.match(/CONTAINMENT_ENDPOINTS[^\[]*\[([^\]]*)\]/);
    const pricingMatch = text.match(/DEFAULT_PRICING_RULES[^\[]*\[([\s\S]*?)\n\];/);
    if (!containmentMatch) {
      violations.push('runtime/api/routes.ts: CONTAINMENT_ENDPOINTS list not found — billing-safety gate cannot verify ADR §13.');
    } else if (pricingMatch) {
      const containmentEndpoints = [...containmentMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
      const pricedResources = [...pricingMatch[1].matchAll(/resource:\s*'([^']+)'/g)].map((m) => m[1]);
      for (const endpoint of containmentEndpoints) {
        if (pricedResources.includes(endpoint)) {
          violations.push(
            `runtime/api/routes.ts: containment endpoint ${endpoint} appears in DEFAULT_PRICING_RULES. ` +
              'Security containment operations must never be blocked by billing/entitlement state (ADR §13).'
          );
        }
      }
    }
  }
}

// --- Check 4: material protocol evaluation entry points must require RevocationCheckPort. ---
// This is a redundant, human-readable backstop for what TypeScript already enforces structurally
// (checkRevocation is a required, non-optional parameter on these signatures) — it exists so a
// future refactor that widens the type back to optional fails CI even before `tsc` runs.
{
  const requiredSignatures = [
    { file: 'protocol/capability/capability-types.ts', pattern: /checkRevocation:\s*RevocationCheckPort/ },
    { file: 'protocol/consent/consent-types.ts', pattern: /checkRevocation:\s*RevocationCheckPort/ },
    { file: 'protocol/enforcement/enforcement-engine.ts', pattern: /checkRevocation:\s*RevocationCheckPort/ },
    { file: 'protocol/execution/execution-engine.ts', pattern: /checkRevocation:\s*RevocationCheckPort/ },
  ];
  for (const { file, pattern } of requiredSignatures) {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) {
      violations.push(`${file}: expected file not found — revocation gate is stale.`);
      continue;
    }
    const text = fs.readFileSync(full, 'utf8');
    if (!pattern.test(text)) {
      violations.push(`${file}: does not declare a mandatory \`checkRevocation: RevocationCheckPort\` parameter/field.`);
    }
  }
}

if (violations.length > 0) {
  console.error(`Revocation fail-closed gate failed with ${violations.length} violation(s):`);
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log('Revocation fail-closed gate passed.');
