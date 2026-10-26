import assert from 'node:assert/strict';
import test from 'node:test';
import http from 'node:http';
import { once } from 'node:events';
import { mkdtemp, readFile, rm, symlink, truncate, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const pluginRoot = fileURLToPath(new URL('../', import.meta.url));
const SERVER = path.join(pluginRoot, 'mcp/server.mjs');
const modelKey = 'fake-test-key-never-return-to-tools';

async function fixture(t, environment = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'docmosaic-plugin-'));
  const pdf = path.join(root, '报告.pdf');
  await writeFile(pdf, '%PDF-1.7\nfixture, not a real document\n');
  const sessions = new Map(), requests = [];
  const api = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const sessionId = url.searchParams.get('session_id');
      const buffers = [];
      for await (const chunk of req) buffers.push(chunk);
      const bytes = Buffer.concat(buffers);
      requests.push({ method: req.method, path: url.pathname });
      res.setHeader('Content-Type', 'application/json');
      if (url.pathname === '/api/files' && req.method === 'POST') {
        assert.match(req.headers['content-type'], /^multipart\/form-data; boundary=/);
        assert.ok(bytes.includes(Buffer.from('%PDF-')));
        const name = bytes.toString().match(/filename="([^"]+)"/)[1];
        const documents = sessions.get(sessionId) || [];
        documents.push({ name, doc_id: name.slice(0, -4), size: 40, processing_status: 'ready' });
        sessions.set(sessionId, documents);
        res.end(JSON.stringify({ uploaded: [name], files: documents }));
      } else if (url.pathname === '/api/files') {
        res.end(JSON.stringify({ files: sessions.get(sessionId) || [] }));
      } else if (url.pathname === '/api/chat/stream') {
        const body = JSON.parse(bytes);
        requests.at(-1).body = body;
        assert.equal(body.agent, 'default');
        assert.equal(body.config.api_key, modelKey);
        const question = body.messages[0].content;
        res.setHeader('Content-Type', 'application/x-ndjson');
        if (question === 'backend error') {
          res.end(JSON.stringify({ type: 'error', message: modelKey, artifacts: { run_id: 'failed-run' } }));
          return;
        }
        if (question === 'malformed') {
          res.end(`broken ${modelKey}`);
          return;
        }
        if (question === 'cancel') {
          res.write(JSON.stringify({ type: 'step', step_index: 0 }) + '\n');
          res.on('close', () => { api.cancelled = true; });
          return;
        }
        const document = sessions.get(body.session_id).find(file => file.name === body.selected_files[0]);
        const state = {
          candidate_answer: { supporting_evidence_ids: ['E1', 'missing', '__proto__'] },
          evidence_store: { E1: { node_id: 'node-1', page: 3, modality: 'table',
            content: '证据'.repeat(1200), provenance: { doc_id: document.doc_id } } },
          verification: { accepted: false, issues: ['fixture uncertainty'] },
        };
        if (question === 'unknown source') state.evidence_store.E1.provenance = {};
        if (question === 'invalid evidence') state.candidate_answer.supporting_evidence_ids = 'E1';
        const events = [
          { type: 'step', step_index: 0 },
          { type: 'delta', content: '答案：42', state,
            artifacts: { run_id: 'run-1', result_path: '/backend/results/run-1.json' } },
        ];
        if (question !== 'interrupted') events.push({ type: 'done', artifacts: { run_id: 'run-1' } });
        const output = Buffer.from(events.map(event => JSON.stringify(event)).join('\r\n'));
        // Split the multibyte answer, and omit the final newline to exercise both boundaries.
        const split = output.indexOf(Buffer.from('答案')) + 1;
        res.write(output.subarray(0, split));
        setTimeout(() => res.end(output.subarray(split)), 5);
      } else {
        res.writeHead(404).end();
      }
    } catch (error) {
      res.writeHead(500).end(JSON.stringify({ error: error.message }));
    }
  });
  api.listen(0, '127.0.0.1');
  await once(api, 'listening');
  const overrides = typeof environment === 'function' ? await environment(root) : environment;
  const transport = new StdioClientTransport({ command: process.execPath, args: [SERVER],
    cwd: root, env: Object.fromEntries(Object.entries({ ...process.env, DOCMOSAIC_ENV_FILE: '',
      DOCMOSAIC_WORKSPACE_ROOT: root, DOCPILOT_URL: `http://127.0.0.1:${api.address().port}`,
      DOCPILOT_MODEL: 'fixture-model', DOCPILOT_API_KEY: modelKey, ...overrides })
      .filter(([, value]) => value !== undefined)), stderr: 'pipe' });
  let stderr = '';
  transport.stderr.on('data', chunk => { stderr += chunk; });
  const client = new Client({ name: 'docmosaic-test', version: '1.0.0' });
  t.after(async () => {
    await client.close();
    api.closeAllConnections();
    await new Promise(resolve => api.close(resolve));
    await rm(root, { recursive: true, force: true });
    assert.ok(!stderr.includes(modelKey));
  });
  await client.connect(transport);
  return { client, root, pdf, sessions, requests, api, async call(name, args, options) {
    const result = await client.callTool({ name, arguments: args }, undefined, { timeout: 10_000, ...options });
    assert.ok(!JSON.stringify(result).includes(modelKey), 'Credential leaked through a tool result');
    return result;
  } };
}

function value(result) {
  assert.ok(!result.isError, JSON.stringify(result));
  return result.structuredContent;
}

async function uploaded(f) {
  return value(await f.call('upload_document', { path: f.pdf }));
}

test('real stdio discovery, upload, isolated sessions, answer and source evidence', async t => {
  const f = await fixture(t);
  const tools = await f.client.listTools();
  assert.deepEqual(tools.tools.map(tool => tool.name).sort(), ['ask_document', 'list_documents', 'upload_document']);
  const first = await uploaded(f), second = await uploaded(f);
  assert.notEqual(first.name, second.name);
  assert.notEqual(first.session_id, second.session_id);
  const list = value(await f.call('list_documents', { session_id: first.session_id }));
  assert.deepEqual(list.documents.map(file => file.name), [first.name]);
  const result = value(await f.call('ask_document', {
    session_id: first.session_id, files: [first.name], question: 'What does this table say?',
  }));
  assert.equal(result.answer, '答案：42');
  assert.equal(result.evidence[0].source_file, first.name);
  assert.equal(result.evidence[0].page, 3);
  assert.match(result.evidence[0].source_url, /#page=3$/);
  assert.equal(result.evidence[0].excerpt.length, 2000);
  assert.equal(result.evidence[0].excerpt_truncated, true);
  assert.deepEqual(result.unresolved_evidence_ids, ['missing', '__proto__']);
  assert.equal(result.evidence.length, 1);
  assert.equal(result.verification.accepted, false);
  assert.equal(result.artifacts.run_id, 'run-1');
  assert.equal(result.artifacts.result_path, '/backend/results/run-1.json');
  const chat = f.requests.find(request => request.path === '/api/chat/stream').body;
  assert.deepEqual(chat.selected_files, [first.name]);
  assert.equal(chat.session_id, first.session_id);
});

test('reject outside-root paths, symlink escapes, invalid and oversized PDFs before uploading', async t => {
  const f = await fixture(t);
  const outside = await mkdtemp(path.join(tmpdir(), 'docmosaic-outside-'));
  t.after(() => rm(outside, { recursive: true, force: true }));
  const external = path.join(outside, 'outside.pdf');
  await writeFile(external, '%PDF-1.7\n');
  const linked = path.join(f.root, 'linked.pdf');
  await symlink(external, linked);
  const invalid = path.join(f.root, 'invalid.pdf');
  await writeFile(invalid, 'not a PDF');
  const large = path.join(f.root, 'large.pdf');
  await writeFile(large, '%PDF-1.7\n');
  await truncate(large, 50 * 1024 * 1024 + 1);
  for (const file of [external, linked, invalid, large]) {
    assert.equal((await f.call('upload_document', { path: file })).isError, true);
  }
  assert.equal(f.requests.length, 0);
  assert.equal((await f.call('list_documents', { session_id: '../../default' })).isError, true);
});

test('missing, failed or parsing files cannot trigger an analysis', async t => {
  const f = await fixture(t);
  const doc = await uploaded(f);
  for (const status of ['processing', 'failed']) {
    f.sessions.get(doc.session_id)[0].processing_status = status;
    assert.equal((await f.call('ask_document', {
      session_id: doc.session_id, files: [doc.name], question: 'Question',
    })).isError, true);
  }
  assert.equal((await f.call('ask_document', {
    session_id: doc.session_id, files: [], question: 'Question',
  })).isError, true);
  assert.equal(f.requests.filter(request => request.path === '/api/chat/stream').length, 0);
});

test('backend errors, malformed data and premature EOF fail once without leaking upstream text', async t => {
  const f = await fixture(t);
  const doc = await uploaded(f);
  for (const question of ['backend error', 'malformed', 'interrupted']) {
    const result = await f.call('ask_document', { session_id: doc.session_id, files: [doc.name], question });
    assert.equal(result.isError, true);
    assert.equal(result.structuredContent.run.session_id, doc.session_id);
    assert.ok(result.structuredContent.run.conversation_id);
    if (question === 'backend error') assert.equal(result.structuredContent.run.artifacts.run_id, 'failed-run');
  }
  assert.equal(f.requests.filter(request => request.path === '/api/chat/stream').length, 3);
});

test('cancelling an MCP call closes the backend stream and leaves the server usable', async t => {
  const f = await fixture(t);
  const doc = await uploaded(f);
  const controller = new AbortController();
  const call = f.call('ask_document', { session_id: doc.session_id, files: [doc.name], question: 'cancel' }, { signal: controller.signal });
  const rejected = assert.rejects(call);
  await new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      if (f.requests.some(request => request.path === '/api/chat/stream')) { clearInterval(timer); resolve(); }
    }, 10);
    setTimeout(() => { clearInterval(timer); reject(new Error('Analysis did not start')); }, 3000).unref();
  });
  controller.abort();
  await rejected;
  for (let attempt = 0; attempt < 100 && !f.api.cancelled; attempt++) await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(f.api.cancelled, true);
  assert.equal(value(await f.call('list_documents', { session_id: doc.session_id })).documents.length, 1);
});

test('model configuration is required before model work', async t => {
  const f = await fixture(t, { DOCPILOT_MODEL: '' });
  const doc = await uploaded(f);
  const result = await f.call('ask_document', { session_id: doc.session_id, files: [doc.name], question: 'Question' });
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /DOCPILOT_MODEL/);
  assert.equal(f.requests.filter(request => request.path === '/api/chat/stream').length, 0);
});

test('unmapped sources stay unknown and invalid evidence IDs fail with run references', async t => {
  const f = await fixture(t);
  const doc = await uploaded(f);
  const args = { session_id: doc.session_id, files: [doc.name] };
  const result = value(await f.call('ask_document', { ...args, question: 'unknown source' }));
  assert.equal(result.evidence[0].source_file, null);
  assert.equal(result.evidence[0].source_url, null);
  const invalid = await f.call('ask_document', { ...args, question: 'invalid evidence' });
  assert.equal(invalid.isError, true);
  assert.equal(invalid.structuredContent.run.artifacts.run_id, 'run-1');
});

test('an explicitly selected env file supplies model configuration without exposing credentials', async t => {
  const f = await fixture(t, async root => {
    const file = path.join(root, 'model.env');
    await writeFile(file, `DOCPILOT_MODEL=env-file-model\nDOCPILOT_API_KEY=${modelKey}\n`);
    return { DOCMOSAIC_ENV_FILE: file, DOCPILOT_MODEL: undefined, DOCPILOT_API_KEY: undefined };
  });
  const doc = await uploaded(f);
  value(await f.call('ask_document', { session_id: doc.session_id, files: [doc.name], question: 'Question' }));
  assert.equal(f.requests.find(request => request.path === '/api/chat/stream').body.config.model, 'env-file-model');
});

test('bundle loads its own MCP entry and Skill without replacing host providers', async () => {
  const manifest = JSON.parse(await readFile(path.join(pluginRoot, 'package.json'), 'utf8'));
  assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml');
  const plugin = await import('../index.mjs');
  const registrations = [];
  plugin.apply({ plugin: (definition, config) => registrations.push({ definition, config }) });
  assert.equal(registrations.length, 2);
  assert.equal(registrations[0].config.command, process.execPath);
  assert.equal(registrations[0].config.serverName, 'docmosaic');
  assert.equal(registrations[0].config.args[0], SERVER);
  assert.equal(registrations[0].config.toolCallTimeoutMs, 3_600_000);
  assert.equal(registrations[1].config.includeDefaultRoots, false);
  assert.notEqual(registrations[1].config.providerName, 'filesystem');
  const skill = await readFile(path.join(registrations[1].config.customSkillDirs[0], 'docmosaic/SKILL.md'), 'utf8');
  assert.match(skill, /name: docmosaic/);
  assert.match(skill, /mcp__docmosaic__ask_document/);
});
