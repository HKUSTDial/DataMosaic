import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

test('DocPilot build uses the DocMosaic API and logo paths', () => {
  const folder = mkdtempSync(join(tmpdir(), 'docmosaic-build-'));
  try {
    writeFileSync(join(folder, 'api.ts'), 'const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8008";');
    writeFileSync(join(folder, 'App.tsx'), '<img src="/docpilot-logo.png"/>');
    execFileSync(process.execPath, [fileURLToPath(new URL('../patch-docpilot-api.mjs', import.meta.url)), join(folder, 'api.ts')]);
    assert.match(readFileSync(join(folder, 'api.ts'), 'utf8'), /window\.location\.origin\}\/docmosaic/);
    assert.match(readFileSync(join(folder, 'App.tsx'), 'utf8'), /src="\/docmosaic\/docpilot-logo\.png"/);
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});
