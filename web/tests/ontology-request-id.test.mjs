import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

test('training works without crypto.randomUUID on HTTP origins', async () => {
  const code = ts.transpileModule(readFileSync(new URL('../src/features/ontology/api.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const requests = [];
  const exports = {};
  runInNewContext(code, {
    exports,
    crypto: { getRandomValues: webcrypto.getRandomValues.bind(webcrypto) },
    fetch: async (url, init) => {
      requests.push({ url, body: JSON.parse(init.body) });
      return { ok: true, json: async () => ({ id: 'run' }) };
    },
  });
  await exports.api.train('input');
  await exports.api.train('input');
  assert.equal(requests.length, 2);
  for (const { url, body } of requests) {
    assert.equal(url, '/ontomosaic-db/api/sql-train');
    assert.equal(body.import_id, 'input');
    assert.match(body.request_id, /^[0-9a-f]{32}$/);
    assert.equal(body.mode, 'live');
    assert.equal(body.case_limit, 2);
  }
  assert.notEqual(requests[0].body.request_id, requests[1].body.request_id);
});
