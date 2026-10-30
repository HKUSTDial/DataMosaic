import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

// Exercise Vite itself: both prefixes, query strings and binary uploads must pass
// through to the independent engine instead of the portal's SPA fallback.
test('ontology proxy preserves prefixes, query strings and multipart bodies', async () => {
  const upstream = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ path: request.url, method: request.method,
      contentType: request.headers['content-type'], body: Buffer.concat(chunks).toString('base64') }));
  });
  upstream.listen(0, '127.0.0.1');
  await once(upstream, 'listening');
  const address = upstream.address();
  const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', '0'], {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    env: { ...process.env, ONTOLOGY_URL: `http://127.0.0.1:${address.port}`, NO_COLOR: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  const url = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Vite startup timeout: ${output}`)), 20000);
    vite.stdout.on('data', data => {
      output += data;
      const match = output.match(/http:\/\/127\.0\.0\.1:\d+/);
      if (match) { clearTimeout(timeout); resolve(match[0]); }
    });
    vite.stderr.on('data', data => { output += data; });
    vite.once('exit', code => { clearTimeout(timeout); reject(new Error(`Vite exited ${code}: ${output}`)); });
    vite.once('error', reject);
  }).catch(async error => {
    vite.kill(); upstream.closeAllConnections(); upstream.close(); throw error;
  });
  try {
    for (const prefix of ['/ontomosaic-db/api', '/ontomosaic-text2sql/api', '/ontology/api']) {
      const path = `${prefix}/databases?offset=20&name=with%20space`;
      const result = await (await fetch(url + path)).json();
      assert.equal(result.path, path);
      assert.equal(result.method, 'GET');
    }
    const body = new Uint8Array([0, 1, 2, 127, 128, 255]);
    const form = new FormData();
    form.append('file', new Blob([body]), 'sample.sqlite');
    const result = await (await fetch(url + '/ontomosaic-db/api/databases/upload',
      { method: 'POST', body: form })).json();
    assert.equal(result.method, 'POST');
    assert.match(result.contentType, /^multipart\/form-data; boundary=/);
    assert.ok(Buffer.from(result.body, 'base64').includes(Buffer.from(body)));
    assert.match(await (await fetch(url + '/ontomosaic-db')).text(), /id="root"/);
  } finally {
    vite.kill();
    await once(vite, 'exit');
    upstream.closeAllConnections();
    await new Promise(resolve => upstream.close(resolve));
  }
});
