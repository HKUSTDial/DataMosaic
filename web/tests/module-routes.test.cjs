const assert = require('node:assert/strict');
const http = require('node:http');
const net = require('node:net');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { test } = require('node:test');

test('module pages, API aliases and WebSockets use canonical paths', { timeout: 20000 }, async () => {
  const root = path.resolve(__dirname, '../..');
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'datamosaic-gateway-'));
  for (const name of ['doc', 'db', 'portal']) {
    fs.mkdirSync(path.join(folder, name));
    fs.writeFileSync(path.join(folder, name, 'index.html'), name === 'portal' ? '<div id="root"></div>' : `${name} frontend`);
  }
  const upstream = http.createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify({ target: request.headers['x-review-target'], path: request.url, method: request.method, body: Buffer.concat(chunks).toString('base64') }));
  });
  upstream.on('upgrade', (request, socket) => {
    const accept = crypto.createHash('sha1').update(request.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\nX-Review-Path: ${request.url}\r\nX-Review-Target: ${request.headers['x-review-target']}\r\n\r\n`);
    socket.on('error', () => {});
  });
  upstream.listen(0, '127.0.0.1');
  await once(upstream, 'listening');
  const reserve = net.createServer().listen(0, '127.0.0.1');
  await once(reserve, 'listening');
  const port = reserve.address().port;
  await new Promise(resolve => reserve.close(resolve));
  const preload = path.join(folder, 'proxy.cjs');
  fs.writeFileSync(preload, `
const Module = require('node:module');
const original = Module._load;
Module._load = function(request) {
  const value = original.apply(this, arguments);
  if (request !== 'http-proxy') return value;
  return { ...value, createProxyServer(...args) {
    const proxy = value.createProxyServer(...args);
    for (const method of ['web', 'ws']) {
      const forward = proxy[method].bind(proxy);
      proxy[method] = (request, destination, ...tail) => {
        const options = tail[tail.length - 1];
        request.headers['x-review-target'] = options.target;
        options.target = process.env.REVIEW_UPSTREAM.replace(/^http/, method === 'ws' ? 'ws' : 'http');
        return forward(request, destination, ...tail);
      };
    }
    return proxy;
  }};
};`);
  const child = spawn(process.execPath, ['--require', preload, path.join(root, 'web/local-server.cjs'), root, path.join(folder, 'doc'), path.join(folder, 'db'), path.join(folder, 'portal')], {
    env: { ...process.env, DATAMOSAIC_WEB_BIND: '127.0.0.1', DATAMOSAIC_WEB_PORT: String(port), ONTOLOGY_URL: 'http://127.0.0.1:8011', REVIEW_UPSTREAM: `http://127.0.0.1:${upstream.address().port}` },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stderr.on('data', data => output += data);
  try {
    await Promise.race([once(child.stdout, 'data'), once(child, 'exit').then(() => { throw Error(output); })]);
    const base = `http://127.0.0.1:${port}`;
    for (const url of ['/', '/research/', '/ontomosaic-doc', '/ontomosaic-doc/', '/ontomosaic-db', '/ontomosaic-enterprise', '/ontomosaic-enterprise/?tab=1', '/ontology/']) {
      assert.match(await (await fetch(base + url)).text(), /id="root"/);
    }
    assert.equal(await (await fetch(base + '/analyze/deep-link')).text(), 'doc frontend');
    assert.equal(await (await fetch(base + '/extract/deep-link')).text(), 'db frontend');
    for (const [url, destination] of [
      ['/docmosaic?tab=1', '/docmosaic/?tab=1'],
      ['/dbmosaic?tab=1', '/dbmosaic/?tab=1'],
      ['/analyze?tab=1', '/docmosaic/?tab=1'],
      ['/extract?tab=1', '/dbmosaic/?tab=1'],
      ['/analyze/deep%20link?tab=1', '/docmosaic/deep%20link?tab=1'],
      ['/extract/deep-link?tab=1', '/dbmosaic/deep-link?tab=1'],
    ]) {
      const redirect = await fetch(base + url, { redirect: 'manual' });
      assert.equal(redirect.status, 308);
      assert.equal(redirect.headers.get('location'), destination);
    }
    assert.equal(await (await fetch(base + '/docmosaic/deep-link')).text(), 'doc frontend');
    assert.equal(await (await fetch(base + '/dbmosaic/deep-link')).text(), 'db frontend');
    for (const [url, expected, target] of [
      ['/docmosaic/api/health?x=1', '/api/health?x=1', 'http://127.0.0.1:8008'],
      ['/docmosaic/uploads/a%20b.pdf?download=1', '/uploads/a%20b.pdf?download=1', 'http://127.0.0.1:8008'],
      ['/dbmosaic/api/upload', '/api/upload', 'http://127.0.0.1:5000'],
      ['/analyze/api/health?x=1', '/api/health?x=1', 'http://127.0.0.1:8008'],
      ['/analyze/uploads/a.pdf', '/uploads/a.pdf', 'http://127.0.0.1:8008'],
      ['/api/upload', '/api/upload', 'http://127.0.0.1:5000'],
      ['/platform/api/health', '/api/health', 'http://127.0.0.1:8001'],
      ['/ontomosaic-db/api/health', '/ontomosaic-db/api/health', 'http://127.0.0.1:8011'],
      ['/ontology/api/health', '/ontology/api/health', 'http://127.0.0.1:8011'],
    ]) {
      const body = Buffer.from([0, 1, 128, 255]);
      const result = await (await fetch(base + url, { method: 'POST', body })).json();
      assert.equal(result.path, expected);
      assert.equal(result.target, target);
      assert.equal(result.body, body.toString('base64'));
    }
    for (const socketPath of ['/dbmosaic/ws', '/extract/ws']) {
    await new Promise((resolve, reject) => {
      const request = http.request(base + socketPath, { headers: { Connection: 'Upgrade', Upgrade: 'websocket', 'Sec-WebSocket-Key': crypto.randomBytes(16).toString('base64'), 'Sec-WebSocket-Version': '13' } });
      request.on('error', reject);
      request.on('upgrade', (response, socket) => {
        assert.equal(response.headers['x-review-path'], '/');
        assert.equal(response.headers['x-review-target'], 'ws://127.0.0.1:8765');
        socket.destroy();
        resolve();
      });
      request.end();
    });
    }
  } finally {
    if (child.exitCode === null) { child.kill(); await once(child, 'exit'); }
    upstream.closeAllConnections();
    upstream.close();
    fs.rmSync(folder, { recursive: true, force: true });
  }
});
